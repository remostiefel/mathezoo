import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../authService";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { classifyLegacyError, classifyLegacyErrorSeverity, getErrorLabel } from "../lib/route-helpers";
import { ErrorType } from "../lib/error-constants";

const router = Router();

// Get detailed student statistics for teacher dashboard
router.get("/teacher/student-stats/:studentId", isAuthenticated, async (req, res) => {
    try {
        const userId = (req.session as any).userId;
        const user = await storage.getUser(userId);

        if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const { studentId } = req.params;

        // Verify student exists first (fail fast)
        const student = await storage.getUser(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // SECURITY CHECK: Ensure teacher owns this student
        if (user.role === 'teacher') {
            if (!student.classId) {
                return res.status(403).json({ message: "Forbidden: Student not assigned to a class" });
            }

            // Allow if primary teacher OR secondary teacher
            const isAuthorized = await storage.isTeacherOfClass(userId, student.classId);
            if (!isAuthorized) {
                return res.status(403).json({ message: "Forbidden: Student does not belong to your class" });
            }
        }

        // OPTIMIZED: Only after verification, parallel queries for student data
        const [allTasks, progression, cognitiveProfile, sessions] = await Promise.all([
            storage.getTasksByUserId(studentId),
            storage.getLearningProgression(studentId),
            storage.getCognitiveProfile(studentId),
            storage.getSessionsByUserId(studentId)
        ]);

        // Calculate statistics
        const totalTasks = allTasks.length;
        const correctTasks = allTasks.filter(t => t.isCorrect).length;
        const incorrectTasks = totalTasks - correctTasks;
        const successRate = totalTasks > 0 ? (correctTasks / totalTasks) * 100 : 0;

        // Error analysis
        const errorsByType: Record<string, number> = {};
        const errorDetails: Array<any> = [];

        // Strategy usage
        const strategyUsage: Record<string, number> = {};
        allTasks.forEach(task => {
            if (task.strategyUsed) {
                strategyUsage[task.strategyUsed] = (strategyUsage[task.strategyUsed] || 0) + 1;
            }

            if (!task.isCorrect) {
                const errorType = task.errorType || classifyLegacyError(task);
                errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;

                errorDetails.push({
                    operation: task.operation,
                    number1: task.number1,
                    number2: task.number2,
                    correctAnswer: task.correctAnswer,
                    studentAnswer: task.studentAnswer,
                    errorType: errorType,
                    errorSeverity: classifyLegacyErrorSeverity(task),
                    timeTaken: task.timeTaken,
                    createdAt: task.createdAt,
                    placeholderPosition: task.placeholderPosition
                });
            }
        });

        // Recent performance (last 10 tasks)
        const recentTasks = allTasks.slice(-10);
        const recentCorrect = recentTasks.filter(t => t.isCorrect).length;
        const recentSuccessRate = recentTasks.length > 0 ? (recentCorrect / recentTasks.length) * 100 : 0;

        // Average time per task
        const tasksWithTime = allTasks.filter(t => t.timeTaken && t.timeTaken > 0);
        const avgTimePerTask = tasksWithTime.length > 0
            ? tasksWithTime.reduce((sum, t) => sum + (t.timeTaken || 0), 0) / tasksWithTime.length
            : 0;

        const stats = {
            student: {
                id: student.id,
                username: student.username,
                firstName: student.firstName,
                lastName: student.lastName
            },
            overview: {
                totalTasks,
                correctTasks,
                incorrectTasks,
                successRate: Math.round(successRate * 10) / 10,
                recentSuccessRate: Math.round(recentSuccessRate * 10) / 10,
                avgTimePerTask: Math.round(avgTimePerTask * 10) / 10,
                currentStreak: progression?.currentStreak || 0,
                totalSessions: sessions.length
            },
            progression: {
                currentStage: progression?.currentStage || 1,
                totalTasksSolved: progression?.totalTasksSolved || 0,
                rml: progression?.rml || 0,
                cla: progression?.cla || 0,
                smi: progression?.smi || 0,
                tal: progression?.tal || 0,
                mca: progression?.mca || 0
            },
            errors: {
                byType: errorsByType,
                details: errorDetails,
                totalErrors: incorrectTasks
            },
            strategies: {
                usage: strategyUsage,
                preferredStrategy: Object.entries(strategyUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown'
            },
            cognitiveProfile: cognitiveProfile ? {
                strengths: cognitiveProfile.strengths,
                weaknesses: cognitiveProfile.weaknesses,
                strategyPreferences: cognitiveProfile.strategyPreferences,
                currentZPDLevel: cognitiveProfile.currentZPDLevel
            } : null,
            recentTasks: recentTasks.map(t => ({
                operation: t.operation,
                number1: t.number1,
                number2: t.number2,
                correctAnswer: t.correctAnswer,
                studentAnswer: t.studentAnswer,
                isCorrect: t.isCorrect,
                timeTaken: t.timeTaken,
                strategyUsed: t.strategyUsed,
                createdAt: t.createdAt
            }))
        };

        res.json(stats);
    } catch (error) {
        console.error("Error fetching student stats:", error);
        res.status(500).json({ message: "Failed to fetch student statistics" });
    }
});

// Get overview stats for all students
router.get("/teacher/students-overview", isAuthenticated, async (req, res) => {
    try {
        const userId = (req.session as any).userId;
        const user = await storage.getUser(userId);

        if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const students = await storage.getStudentsByTeacherId(userId);

        const studentsOverview = await Promise.all(students.map(async (student) => {
            const allTasks = await storage.getTasksByUserId(student.id);
            const progression = await storage.getLearningProgression(student.id);

            const totalTasks = allTasks.length;
            const correctTasks = allTasks.filter(t => t.isCorrect).length;
            const successRate = totalTasks > 0 ? (correctTasks / totalTasks) * 100 : 0;
            const errorCount = totalTasks - correctTasks;

            // Recent activity (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recentTasks = allTasks.filter(t =>
                t.createdAt && new Date(t.createdAt) > sevenDaysAgo
            );

            return {
                id: student.id,
                username: student.username,
                firstName: student.firstName,
                lastName: student.lastName,
                totalTasks,
                correctTasks,
                errorCount,
                successRate: Math.round(successRate * 10) / 10,
                currentStage: progression?.currentStage || 1,
                currentStreak: progression?.currentStreak || 0,
                recentActivity: recentTasks.length,
                lastActive: allTasks.length > 0 ? allTasks[allTasks.length - 1].createdAt : null
            };
        }));

        res.json(studentsOverview);
    } catch (error) {
        console.error("Error fetching students overview:", error);
        res.status(500).json({ message: "Failed to fetch students overview" });
    }
});

// Download homework PDF (moved from nested route)
router.get("/homework/:homeworkSetId/download", isAuthenticated, async (req, res) => {
    try {
        const teacherId = (req.session as any).userId;
        const { homeworkSetId } = req.params;
        const { type = 'tasks' } = req.query;

        const teacher = await storage.getUser(teacherId);
        if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const { homeworkSets, homeworkSetStudents } = await import('@shared/schema');
        const homeworkSet = await db.query.homeworkSets.findFirst({
            where: eq(homeworkSets.id, homeworkSetId),
        });

        if (!homeworkSet) {
            return res.status(404).json({ message: "Homework set not found" });
        }

        const studentAssignments = await db.query.homeworkSetStudents.findMany({
            where: eq(homeworkSetStudents.homeworkSetId, homeworkSetId),
            with: { student: true },
        });

        const students = studentAssignments
            .map(a => a.student)
            .filter(s => s);

        const studentName = students.length === 1
            ? `${students[0]!.firstName}${students[0]!.lastName ? '_' + students[0]!.lastName : ''}`
            : students
                .filter(s => s)
                .map(s => s!.firstName)
                .join('_');

        const now = new Date();
        const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const filename = type === 'solutions'
            ? `Hausaufgaben_Loesungen_${studentName}_${date}.pdf`
            : `Hausaufgaben_${studentName}_${date}.pdf`;

        const { generateHomeworkPDF, generateHomeworkSolutionPDF } = await import('../homeworkPdfGenerator');
        const { homeworkTasks } = await import('@shared/schema');

        const tasks = await db.query.homeworkTasks.findMany({
            where: eq(homeworkTasks.homeworkSetId, homeworkSetId),
            orderBy: [homeworkTasks.displayOrder],
        });

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
                    pattern: task.packageId || 'constant_sum',
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
            includeSolutions: homeworkSet.includesSolutions,
            metadata: {
                themes: [],
                totalTasks: tasks.length,
                estimatedTotalTime: 0,
            },
        };

        const displayName = students.length === 1
            ? `${students[0]!.firstName} ${students[0]!.lastName || ''}`.trim()
            : students.filter(s => s).map(s => s!.firstName).join(', ');

        const htmlContent = type === 'solutions'
            ? generateHomeworkSolutionPDF(worksheetSet, displayName)
            : generateHomeworkPDF(worksheetSet, displayName);

        const htmlWithAutoPrint = htmlContent.replace(
            '</body>',
            `
<script>
window.onload = function() {
  setTimeout(function() {
    window.print();
  }, 500);
};
</script>
</body>
    `
        );

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `inline; filename="${filename.replace('.pdf', '.html')}"`);
        res.setHeader('X-Filename', filename);
        res.send(htmlWithAutoPrint);
    } catch (error) {
        console.error("Error generating PDF download:", error);
        res.status(500).json({ message: "Failed to generate PDF download" });
    }
});


// Get pedagogical recommendation for student's error
router.get("/teacher/pedagogical-recommendation/:studentId", async (req: any, res) => {
    try {
        const teacherId = (req.session as any)?.userId;
        const { studentId } = req.params;
        const { errorType } = req.query;

        const teacher = await storage.getUser(teacherId);
        if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
            return res.status(403).send("Forbidden");
        }

        const student = await storage.getUser(studentId);
        if (!student) {
            return res.status(404).send("Student not found");
        }

        // SECURITY CHECK: Ensure teacher owns this student
        if (teacher.role === 'teacher') {
            if (!student.classId) {
                return res.status(403).send("Forbidden: Student not assigned to a class");
            }

            const isAuthorized = await storage.isTeacherOfClass(teacherId, student.classId);
            if (!isAuthorized) {
                return res.status(403).send("Forbidden: Student does not belong to your class");
            }
        }

        const { pedagogicalRecommendationEngine } = await import('../pedagogicalRecommendationEngine');
        const progression = await storage.getProgressionByUserId(studentId);
        const studentLevel = progression?.currentLevel || 1;

        const recommendation = pedagogicalRecommendationEngine.generatePedagogicalRecommendation(
            errorType as any,
            'moderate',
            studentLevel
        );

        // Simplified HTML response for recommendation
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Förderempfehlung: ${student.firstName}</title>
      </head>
      <body>
        <h1>Förderempfehlung für ${student.firstName}</h1>
        <p>Fehler: ${errorType}</p>
        <p>${JSON.stringify(recommendation)}</p>
      </body>
      </html>
    `);
    } catch (error) {
        console.error("Error getting recommendation:", error);
        res.status(500).send("Internal server error");
    }
});

// Download error report
router.get("/teacher/error-report/:studentId/download", isAuthenticated, async (req, res) => {
    try {
        const teacherId = (req.session as any).userId;
        const { studentId } = req.params;

        const teacher = await storage.getUser(teacherId);
        if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const student = await storage.getUser(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // SECURITY CHECK: Ensure teacher owns this student
        if (teacher.role === 'teacher') {
            if (!student.classId) {
                return res.status(403).json({ message: "Forbidden: Student not assigned to a class" });
            }
            const studentClass = await storage.getClass(student.classId);
            if (!studentClass || studentClass.teacherId !== teacherId) {
                return res.status(403).json({ message: "Forbidden: Student does not belong to your class" });
            }
        }

        const progression = await storage.getLearningProgression(studentId);
        const errorHistory = (progression?.errorHistory as any[]) || [];
        const errorPatterns = (progression?.errorPatterns as any) || {};

        const sortedErrors = [...errorHistory].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const reportData = {
            student: {
                id: student.id,
                username: student.username,
                firstName: student.firstName || undefined,
                lastName: student.lastName || undefined
            },
            errorHistory: sortedErrors,
            errorPatterns,
            summary: {
                totalErrors: errorHistory.length,
                recentErrors: 0,
                criticalPatterns: [],
                mostCommonErrors: []
            }
        };

        const { generateErrorReportHTML } = await import('../pdfErrorReport');
        const html = generateErrorReportHTML(reportData);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="Fehlerstatistik_${student.username}_${new Date().toISOString().split('T')[0]}.html"`);
        res.send(html);

    } catch (error) {
        console.error("Error generating error report download:", error);
        res.status(500).json({ message: "Failed to generate report" });
    }
});


// Download incorrect tasks as TXT
router.get("/teacher/incorrect-tasks/:studentId/download", isAuthenticated, async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const teacherId = (req.session as any).userId;
        const teacher = await storage.getUser(teacherId);

        if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const student = await storage.getUser(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // SECURITY CHECK: Ensure teacher owns this student
        if (teacher.role === 'teacher') {
            if (!student.classId) {
                return res.status(403).json({ message: "Forbidden: Student not assigned to a class" });
            }
            const studentClass = await storage.getClass(student.classId);
            if (!studentClass || studentClass.teacherId !== teacherId) {
                return res.status(403).json({ message: "Forbidden: Student does not belong to your class" });
            }
        }

        const tasks = await storage.getTasksByUserId(studentId);
        const incorrectTasks = tasks.filter(t => !t.isCorrect);

        let content = `Fehlerhafte Aufgaben für ${student.firstName} ${student.lastName || ''}\n`;
        content += `Erstellt am: ${new Date().toLocaleString()}\n\n`;

        incorrectTasks.forEach((task, index) => {
            content += `${index + 1}. ${task.number1} ${task.operation} ${task.number2} = ${task.studentAnswer} (Richtig: ${task.correctAnswer})\n`;
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="Fehler_${student.username}.txt"`);
        res.send(content);
    } catch (error) {
        console.error("Error downloading incorrect tasks:", error);
        res.status(500).json({ message: "Download failed" });
    }
});

// View Error Report JSON
router.get("/teacher/error-report/:studentId", isAuthenticated, async (req, res) => {
    try {
        const teacherId = (req.session as any).userId;
        const { studentId } = req.params;

        const teacher = await storage.getUser(teacherId);
        if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const student = await storage.getUser(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // SECURITY CHECK: Ensure teacher owns this student
        if (teacher.role === 'teacher') {
            if (!student.classId) {
                return res.status(403).json({ message: "Forbidden: Student not assigned to a class" });
            }
            const studentClass = await storage.getClass(student.classId);
            if (!studentClass || studentClass.teacherId !== teacherId) {
                return res.status(403).json({ message: "Forbidden: Student does not belong to your class" });
            }
        }

        const progression = await storage.getLearningProgression(studentId);
        res.json({
            progression,
            student: {
                id: student.id,
                username: student.username
            }
        });
    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({ message: "Failed" });
    }
});

// Download Mathemat documentation (public)
router.get("/documentation/download", async (req, res) => {
    try {
        const { generateMathematDocumentationHTML } = await import('../pdfDocumentation');
        const html = generateMathematDocumentationHTML();

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="Mathemat_Dokumentation_${new Date().toISOString().split('T')[0]}.html"`);
        res.send(html);
    } catch (error) {
        console.error("Error generating documentation:", error);
        res.status(500).json({ message: "Failed to generate documentation" });
    }
});

export default router;
