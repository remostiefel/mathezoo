import { Router } from "express";
import { storage } from "../storage";
import { authService, isAuthenticated } from "../authService";

const router = Router();

// Get students for a teacher | Admin
router.get("/students", isAuthenticated, async (req, res) => {
    const userId = (req.session as any).userId;
    console.log('GET /api/students - userId:', userId);
    const user = await storage.getUser(userId);
    console.log('GET /api/students - user:', user);

    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
        console.log('GET /api/students - Forbidden. User role:', user?.role);
        return res.status(403).send("Forbidden");
    }

    // Get students from teacher's classes
    console.log('GET /api/students - Fetching students for teacher:', userId);
    const students = await storage.getStudentsByTeacherId(userId);
    console.log('GET /api/students - Found students:', students.length);

    // Don't send passwords to client
    const studentsWithoutPasswords = students.map(student => {
        const { password: _, ...studentWithoutPassword } = student;
        return studentWithoutPassword;
    });

    res.json(studentsWithoutPasswords);
});

// Get all classes (for dropdown in student creation)
router.get("/classes", isAuthenticated, async (req, res) => {
    try {
        const userId = (req.session as any).userId;
        const user = await storage.getUser(userId);

        if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const allClasses = await storage.getAllClasses();
        res.json(allClasses);
    } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json({ message: "Failed to fetch classes" });
    }
});

// Create new class
router.post("/classes", isAuthenticated, async (req, res) => {
    try {
        const userId = (req.session as any).userId;
        const user = await storage.getUser(userId);

        if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden: Only teachers can create classes" });
        }

        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ message: "Class name is required" });
        }

        // Check if class with this name already exists
        const existingClass = await storage.getClassByName(name.trim());
        if (existingClass) {
            return res.status(400).json({ message: "A class with this name already exists" });
        }

        const newClass = await storage.createClass({
            name: name.trim(),
            teacherId: userId,
        });

        res.json(newClass);
    } catch (error) {
        console.error("Error creating class:", error);
        res.status(500).json({ message: "Failed to create class" });
    }
});

// Create new student
router.post("/students", isAuthenticated, async (req, res) => {
    try {
        const userId = (req.session as any).userId;
        const user = await storage.getUser(userId);

        if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden: Only teachers can create students" });
        }

        const { username, password, firstName, lastName, classId } = req.body;

        // Validation
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return res.status(400).json({ message: "Username is required" });
        }

        if (!password || typeof password !== 'string' || password.length < 4) {
            return res.status(400).json({ message: "Password must be at least 4 characters" });
        }

        if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
            return res.status(400).json({ message: "First name is required" });
        }

        if (!classId || typeof classId !== 'string') {
            return res.status(400).json({ message: "Class is required" });
        }

        // Check if username already exists
        const existingUser = await storage.getUserByUsername(username.trim());
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Verify class exists and teacher has access
        const classData = await storage.getClass(classId);
        if (!classData) {
            return res.status(400).json({ message: "Class not found" });
        }

        // Create student using authService (handles password hashing)
        const newStudent = await authService.createUser({
            username: username.trim(),
            password: password,
            firstName: firstName.trim(),
            lastName: lastName?.trim() || undefined,
            role: 'student',
            classId: classId,
        });

        // Initialize learning progression for new student
        await storage.initializeProgressionForUser(newStudent.id);

        // Don't send password to client
        const { password: _, ...studentWithoutPassword } = newStudent;
        res.json(studentWithoutPassword);
    } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).json({ message: "Failed to create student" });
    }
});

// Create new teacher (admin only)
router.post("/teachers", isAuthenticated, async (req, res) => {
    try {
        const userId = (req.session as any).userId;
        const user = await storage.getUser(userId);

        // Only admins can create teachers
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only admins can create teachers" });
        }

        const { username, password, firstName, lastName, isAdmin } = req.body;

        // Validation
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return res.status(400).json({ message: "Username is required" });
        }

        if (!password || typeof password !== 'string' || password.length < 4) {
            return res.status(400).json({ message: "Password must be at least 4 characters" });
        }

        if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
            return res.status(400).json({ message: "First name is required" });
        }

        // Check if username already exists
        const existingUser = await storage.getUserByUsername(username.trim());
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Create teacher using authService (handles password hashing)
        // Role is 'admin' if isAdmin checkbox was checked, otherwise 'teacher'
        const newTeacher = await authService.createUser({
            username: username.trim(),
            password: password,
            firstName: firstName.trim(),
            lastName: lastName?.trim() || undefined,
            role: isAdmin ? 'admin' : 'teacher',
        });

        // Don't send password to client
        const { password: _, ...teacherWithoutPassword } = newTeacher;
        res.json(teacherWithoutPassword);
    } catch (error) {
        console.error("Error creating teacher:", error);
        res.status(500).json({ message: "Failed to create teacher" });
    }
});

export default router;
