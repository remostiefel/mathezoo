import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../authService";
import { analyticsEngine } from "../analyticsEngine";

const router = Router();

// Get cognitive profile
router.get("/profile/:userId", isAuthenticated, async (req: Request, res: Response) => {
    const profile = await storage.getCognitiveProfile(req.params.userId);
    if (!profile) {
        return res.status(404).send("Profile not found");
    }

    res.json(profile);
});

// Problem Statistics endpoints
router.get("/problem-statistics", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const userId = (req.session as any).userId;
        const user = await storage.getUser(userId);

        if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const allStats = await storage.getAllProblemStatistics();
        res.json(allStats);
    } catch (error) {
        console.error("Error fetching problem statistics:", error);
        res.status(500).json({ message: "Failed to fetch problem statistics" });
    }
});

router.get("/problem-statistics/detailed", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const userId = (req.session as any).userId;
        const user = await storage.getUser(userId);

        if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const allStats = await storage.getAllProblemStatistics();

        // Group by operation and number range for better visualization
        const grouped = {
            addition_ZR20: allStats.filter(s => s.operation === '+' && s.numberRange === 20),
            subtraction_ZR20: allStats.filter(s => s.operation === '-' && s.numberRange === 20),
            addition_ZR100: allStats.filter(s => s.operation === '+' && s.numberRange === 100),
            subtraction_ZR100: allStats.filter(s => s.operation === '-' && s.numberRange === 100),
        };

        // Calculate summary statistics
        const summary = {
            totalProblems: allStats.length,
            totalAttempts: allStats.reduce((sum, s) => sum + s.totalAttempts, 0),
            averageSuccessRate: allStats.length > 0
                ? allStats.reduce((sum, s) => sum + s.successRate, 0) / allStats.length
                : 0,
            averageTime: allStats.length > 0
                ? allStats.reduce((sum, s) => sum + s.averageTime, 0) / allStats.length
                : 0,
            slowestProblems: [...allStats]
                .filter(s => s.averageTime > 0)
                .sort((a, b) => b.averageTime - a.averageTime)
                .slice(0, 10)
                .map(s => ({
                    problem: `${s.number1} ${s.operation} ${s.number2}`,
                    averageTime: s.averageTime,
                    successRate: s.successRate,
                    totalAttempts: s.totalAttempts,
                })),
            mostDifficultProblems: [...allStats]
                .filter(s => s.totalAttempts >= 5)
                .sort((a, b) => a.successRate - b.successRate)
                .slice(0, 10)
                .map(s => ({
                    problem: `${s.number1} ${s.operation} ${s.number2}`,
                    successRate: s.successRate,
                    averageTime: s.averageTime,
                    totalAttempts: s.totalAttempts,
                })),
        };

        res.json({ summary, grouped, allStats });
    } catch (error) {
        console.error("Error fetching detailed problem statistics:", error);
        res.status(500).json({ message: "Failed to fetch detailed problem statistics" });
    }
});

// Get student analytics (for teacher dashboard)
router.get("/analytics/student/:studentId", async (req: any, res: Response) => {
    try {
        const teacherId = (req.session as any)?.userId; // Use optional chaining
        const { studentId } = req.params;

        // Verify student and teacher exist first (fail fast)
        const [student, teacher] = await Promise.all([
            storage.getUser(studentId),
            teacherId ? storage.getUser(teacherId) : Promise.resolve(null) // Handle case where teacherId might be undefined
        ]);

        if (!student || !teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
            return res.status(403).send("Forbidden");
        }

        // OPTIMIZED: Only after verification, parallel queries for student data
        const [sessions, profile] = await Promise.all([
            storage.getSessionsByUserId(studentId),
            storage.getCognitiveProfile(studentId)
        ]);

        const tasks = (await Promise.all(
            sessions.map(s => storage.getTasksBySessionId(s.id))
        )).flat();

        // Generate analytics
        const analytics = await analyticsEngine.generateStudentAnalytics(
            student,
            tasks,
            profile,
            sessions
        );

        res.json(analytics);
    } catch (error) {
        console.error("Error getting student analytics:", error);
        res.status(500).send("Internal server error");
    }
});

// Get class analytics (for teacher dashboard)
router.get("/analytics/class", async (req: any, res: Response) => {
    try {
        const teacherId = (req.session as any)?.userId; // Use optional chaining
        const teacher = teacherId ? await storage.getUser(teacherId) : null;

        if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
            return res.status(403).send("Forbidden");
        }

        const students = await storage.getStudentsByTeacherId(teacherId);

        // Get analytics for all students
        const allStudentAnalytics = await Promise.all(
            students.map(async (student: any) => {
                const sessions = await storage.getSessionsByUserId(student.id);
                const tasks = (await Promise.all(
                    sessions.map(s => storage.getTasksBySessionId(s.id))
                )).flat();
                const profile = await storage.getCognitiveProfile(student.id);

                return analyticsEngine.generateStudentAnalytics(
                    student,
                    tasks,
                    profile,
                    sessions
                );
            })
        );

        // Generate class-wide metrics
        const classMetrics = await analyticsEngine.generateClassAnalytics(
            students,
            allStudentAnalytics
        );

        res.json({
            students: allStudentAnalytics,
            classMetrics,
        });
    } catch (error) {
        console.error("Error getting class analytics:", error);
        res.status(500).send("Internal server error");
    }
});

export default router;
