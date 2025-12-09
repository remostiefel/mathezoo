import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../authService";
import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import {
    homeworkSets,
    homeworkTasks,
    analyzeStudentsRequestSchema,
    generateThemesRequestSchema,
    generateHomeworkRequestSchema
} from "@shared/schema";
import { homeworkAnalyzer } from "../homeworkAnalyzer";
import { homeworkThemeRecommender } from "../homeworkThemeRecommender";
import { generateHomeworkPDF, generateHomeworkSolutionPDF } from "../homeworkPdfGenerator";
import { worksheetGenerator } from "../worksheetGenerator";
import { type ErrorType, ERROR_TYPE_LABELS } from "../lib/error-constants";
import { getErrorLabel } from "../lib/route-helpers";

const router = Router();

/**
 * POST /api/homework/analyze
 * Analysiert Schülerleistungen und erstellt diagnostische Berichte
 */
router.post("/analyze", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const teacherId = (req.session as any).userId;

        console.log('🔍 Homework analyze request from user:', teacherId);
        console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

        // Validate request body
        const validation = analyzeStudentsRequestSchema.safeParse(req.body);
        if (!validation.success) {
            console.error('❌ Validation failed:', validation.error.errors);
            return res.status(400).json({
                message: "Invalid request",
                errors: validation.error.errors
            });
        }

        const { studentIds, sessionCount, minTaskCount } = validation.data;
        console.log('✅ Validated data:', { studentIds, sessionCount, minTaskCount });

        // Verify teacher has access to these students
        const teacher = await storage.getUser(teacherId);
        console.log('👤 Teacher info:', { id: teacher?.id, role: teacher?.role, username: teacher?.username });

        if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
            console.error('🚫 Access denied - invalid role:', teacher?.role);
            return res.status(403).json({ message: "Forbidden: Only teachers can analyze students" });
        }

        // Get teacher's students to verify access
        const teacherStudents = await storage.getStudentsByTeacherId(teacherId);
        const teacherStudentIds = new Set(teacherStudents.map(s => s.id));
        console.log('👥 Teacher has access to students:', Array.from(teacherStudentIds));

        // Verify all requested students belong to this teacher (unless admin)
        if (teacher.role !== 'admin') {
            const unauthorizedStudents = studentIds.filter(id => !teacherStudentIds.has(id));
            if (unauthorizedStudents.length > 0) {
                console.error('🚫 Unauthorized students:', unauthorizedStudents);
                return res.status(403).json({
                    message: "Forbidden: You can only analyze students in your class",
                    unauthorizedStudents,
                });
            }
        }

        console.log('📊 Starting analysis for students:', studentIds);

        const reports = await homeworkAnalyzer.analyzeStudents(studentIds, {
            sessionCount,
            minTaskCount,
        });

        console.log('✅ Analysis complete. Generated reports:', reports.length);

        // Check if any reports were generated
        if (reports.length === 0) {
            console.warn('⚠️ No reports generated - students may not have enough data');
            return res.status(400).json({
                message: "Keine ausreichenden Daten für Analyse. Schüler müssen mindestens 20 Aufgaben gelöst haben.",
                reports: [],
                aggregate: {
                    commonErrors: [],
                    averageSuccessRate: 0,
                    studentsNeedingSupport: [],
                }
            });
        }

        const aggregate = homeworkAnalyzer.aggregateReports(reports);

        res.json({
            success: true,
            reports,
            aggregate,
        });
    } catch (error) {
        console.error("❌ Error analyzing students:", error);
        console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
        res.status(500).json({
            message: "Failed to analyze students",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * POST /api/homework/themes
 * Generiert didaktisch fundierte Themenvorschläge
 */
router.post("/themes", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const teacherId = (req.session as any).userId;

        // Validate request body
        const validation = generateThemesRequestSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Invalid request",
                errors: validation.error.errors
            });
        }

        const { diagnosticReports, maxThemes, minRelevanceScore } = validation.data;

        const teacher = await storage.getUser(teacherId);
        if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden: Only teachers can generate themes" });
        }

        // KORRIGIERT: Reduziere minRelevanceScore auf 10 statt 30
        // Dies stellt sicher dass auch bei wenigen Fehlern Themen generiert werden
        const themes = homeworkThemeRecommender.generateThemes(diagnosticReports, {
            maxThemes,
            minRelevanceScore: minRelevanceScore || 10, // Gesenkt von 30 auf 10
        });

        console.log(`Generated ${themes.length} themes with relevance >= ${minRelevanceScore || 10}`);

        res.json({
            success: true,
            themes,
        });
    } catch (error) {
        console.error("Error generating themes:", error);
        res.status(500).json({ message: "Failed to generate themes" });
    }
});

/**
 * GET /api/homework/:homeworkSetId/preview
 * Zeigt PDF-Preview im Browser (kein Download)
 */
router.get("/:homeworkSetId/preview", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const teacherId = (req.session as any).userId;
        const { homeworkSetId } = req.params;
        const { type = 'tasks' } = req.query; // 'tasks' or 'solutions'

        const teacher = await storage.getUser(teacherId);
        if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden: Only teachers can preview homework" });
        }

        // Get homework set from database
        const homeworkSet = await storage.getHomeworkSet(homeworkSetId);
        if (!homeworkSet) {
            return res.status(404).json({ message: "Homework set not found" });
        }

        // Verify teacher owns this homework set
        if (homeworkSet.teacherId !== teacherId && teacher.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: You don't have access to this homework set" });
        }

        // Get student names
        const studentIds = Array.isArray(homeworkSet.studentIds)
            ? homeworkSet.studentIds
            : JSON.parse(homeworkSet.studentIds as string);
        const students = await Promise.all(studentIds.map((id: string) => storage.getUser(id)));
        const studentNames = students
            .filter(s => s)
            .map(s => s!.firstName)
            .join(', ');

        // Get tasks from database instead of regenerating
        const tasks = await db.query.homeworkTasks.findMany({
            where: eq(homeworkTasks.homeworkSetId, homeworkSetId),
            orderBy: [homeworkTasks.displayOrder],
        });

        // Reconstruct worksheetSet from tasks
        const worksheetsMap = new Map();

        tasks.forEach(task => {
            const worksheetNumber = task.worksheetNumber || 1;
            if (!worksheetsMap.has(worksheetNumber)) {
                worksheetsMap.set(worksheetNumber, {
                    id: `worksheet-${worksheetNumber}`,
                    number: worksheetNumber,
                    title: `Arbeitsblatt ${worksheetNumber}`,
                    sections: new Map(),
                    totalTasks: 0,
                    estimatedTime: 0,
                    difficultyLevel: 'medium' as const,
                });
            }

            const worksheet = worksheetsMap.get(worksheetNumber);
            const sectionKey = task.packageId || 'default';

            if (!worksheet.sections.has(sectionKey)) {
                worksheet.sections.set(sectionKey, {
                    id: sectionKey,
                    title: task.sectionTitle || 'Aufgaben',
                    description: '',
                    pattern: task.packageId || 'constant_sum', // Use packageId as pattern if available, else default
                    tasks: [],
                    reflectionQuestion: task.reflectionQuestion || '',
                    learningGoal: '',
                    expectedInsight: '',
                });
            }

            const section = worksheet.sections.get(sectionKey);
            section.tasks.push({
                taskType: task.taskType,
                operation: task.operation,
                number1: task.number1,
                number2: task.number2,
                correctAnswer: task.correctAnswer,
                placeholderPosition: task.placeholderPosition || 'end',
            });

            worksheet.totalTasks++;
        });

        // Convert maps to arrays
        const worksheets = Array.from(worksheetsMap.values()).map(ws => ({
            ...ws,
            sections: Array.from(ws.sections.values()),
            estimatedTime: Math.ceil(ws.totalTasks * 1.5),
        }));

        const worksheetSet = {
            homeworkSetId: homeworkSet.id,
            title: homeworkSet.title,
            description: homeworkSet.description || 'Operative Päckchen nach Wittmann',
            worksheets,
            includeSolutions: homeworkSet.includesSolutions ?? false,
            metadata: {
                themes: [],
                totalTasks: tasks.length,
                estimatedTotalTime: Math.ceil(tasks.length * 1.5),
            },
        };

        // Generate HTML with download button
        const pdfHtml = type === 'solutions'
            ? generateHomeworkSolutionPDF(worksheetSet, studentNames)
            : generateHomeworkPDF(worksheetSet, studentNames);

        // Add download button to HTML
        const htmlWithDownloadButton = pdfHtml.replace(
            '</body>',
            `
  <div style="position: fixed; top: 20px; right: 20px; z-index: 9999;">
    <button onclick="window.print()" style="
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    ">
      🖨️ Als PDF drucken/speichern
    </button>
  </div>
  <style>
    @media print {
      button { display: none !important; }
    }
  </style>
</body>
      `
        );

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(htmlWithDownloadButton);

    } catch (error) {
        console.error("Error generating homework preview:", error);
        res.status(500).json({ message: "Failed to generate preview" });
    }
});

/**
 * POST /api/homework/generate
 * Generiert komplette Hausaufgaben-Sets mit operativen Päckchen
 */
router.post("/generate", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const teacherId = (req.session as any).userId;

        // Validate request body
        const validation = generateHomeworkRequestSchema.safeParse(req.body);
        if (!validation.success) {
            console.error('❌ Homework generation validation failed:', validation.error.errors);
            return res.status(400).json({
                message: "Invalid request",
                errors: validation.error.errors,
                received: req.body
            });
        }

        const {
            studentIds,
            themes,
            worksheetCount,
            tasksPerWorksheet,
            includeSolutions,
            title,
            description,
            dueAt,
        } = validation.data;

        // Ensure themes is an array (even if empty, we'll use defaults)
        const themesToUse = Array.isArray(themes) && themes.length > 0
            ? themes
            : [{
                id: 'theme_default_practice',
                name: 'Gemischtes Training',
                competencyGoals: ['Festigung Grundrechenarten'],
                addressedErrors: [],
                numberRange: 20,
                difficulty: 'medium' as const,
                priority: 'medium' as const,
                relevanceScore: 100
            }];

        const teacher = await storage.getUser(teacherId);
        if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden: Only teachers can generate homework" });
        }

        // Get teacher's students to verify access
        const teacherStudents = await storage.getStudentsByTeacherId(teacherId);
        const teacherStudentIds = new Set(teacherStudents.map(s => s.id));

        // Verify all requested students belong to this teacher (unless admin)
        if (teacher.role !== 'admin') {
            const unauthorizedStudents = studentIds.filter(id => !teacherStudentIds.has(id));
            if (unauthorizedStudents.length > 0) {
                return res.status(403).json({
                    message: "Forbidden: You can only assign homework to students in your class",
                    unauthorizedStudents,
                });
            }
        }

        console.log('📝 Generating homework with themes:', themesToUse.map(t => t.name));

        // Generate worksheet set
        const worksheetSet = await worksheetGenerator.generate({
            themes: themesToUse,
            worksheetCount,
            tasksPerWorksheet,
            includeSolutions,
            title,
            description,
            // Pass studentId for failed task integration
            studentId: studentIds[0], // Nutze ersten Schüler für personalisierte Fehleraufgaben
            includeFailedTasks: true,
        });

        // Save to database
        const [homeworkSet] = await db.insert(homeworkSets).values({
            teacherId,
            studentIds: JSON.stringify(studentIds),
            title,
            description: worksheetSet.description,
            themes: JSON.stringify(themesToUse.map(t => ({
                themeId: t.id,
                themeName: t.name,
                competencyFocus: t.competencyGoals,
                errorTypes: t.addressedErrors,
                priority: t.priority,
            }))),
            worksheetCount,
            includesSolutions: includeSolutions,
            difficultyLevel: 'adaptive',
            tasksPerWorksheet,
            numberRange: themesToUse[0]?.numberRange || 20,
            status: 'generated',
            dueAt: dueAt ? new Date(dueAt) : null,
            metadata: JSON.stringify({
                generationSettings: { worksheetCount, tasksPerWorksheet, includeSolutions },
                totalTasks: worksheetSet.metadata.totalTasks,
                estimatedTime: worksheetSet.metadata.estimatedTotalTime,
            }),
        }).returning();

        console.log('✅ Homework set created:', homeworkSet.id);

        // Convert and save tasks
        const tasks = worksheetGenerator.convertToHomeworkTasks(worksheetSet, homeworkSet.id);
        await db.insert(homeworkTasks).values(tasks);

        res.json({
            success: true,
            homeworkSet,
            worksheetSet,
            tasksCount: tasks.length,
        });
    } catch (error) {
        console.error("Error generating homework:", error);
        res.status(500).json({ message: "Failed to generate homework" });
    }
});

/**
 * GET /api/homework/sets
 * Liste alle Hausaufgaben-Sets des Lehrers
 */
router.get("/sets", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const teacherId = (req.session as any).userId;

        const teacher = await storage.getUser(teacherId);
        if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden: Only teachers can view homework sets" });
        }

        const sets = await db.query.homeworkSets.findMany({
            where: eq(homeworkSets.teacherId, teacherId),
            orderBy: [desc(homeworkSets.createdAt)],
        });

        res.json({
            success: true,
            sets,
        });
    } catch (error) {
        console.error("Error fetching homework sets:", error);
        res.status(500).json({ message: "Failed to fetch homework sets" });
    }
});

/**
 * GET /api/homework/sets/:id
 * Details eines Hausaufgaben-Sets inkl. Tasks
 */
router.get("/sets/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const teacherId = (req.session as any).userId;
        const { id } = req.params;

        const teacher = await storage.getUser(teacherId);
        if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden: Only teachers can view homework sets" });
        }

        const homeworkSet = await db.query.homeworkSets.findFirst({
            where: and(
                eq(homeworkSets.id, id),
                eq(homeworkSets.teacherId, teacherId)
            ),
        });

        if (!homeworkSet) {
            return res.status(404).json({ message: "Homework set not found" });
        }

        const tasks = await db.query.homeworkTasks.findMany({
            where: eq(homeworkTasks.homeworkSetId, id),
            orderBy: [homeworkTasks.displayOrder],
        });

        res.json({
            success: true,
            homeworkSet,
            tasks,
        });
    } catch (error) {
        console.error("Error fetching homework set:", error);
        res.status(500).json({ message: "Failed to fetch homework set" });
    }
});

export default router;
