import { Router } from "express";
import { storage } from "../storage";
import { authService, isAuthenticated } from "../authService";
import { loginSchema } from "@shared/schema";

const router = Router();

// Login route
router.post("/login", async (req, res) => {
    try {
        const { username, password } = loginSchema.parse(req.body);

        const user = await authService.authenticate(username, password);

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Store user ID in session
        (req.session as any).userId = user.id;

        // Don't send password to client
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error("Login error:", error);
        res.status(400).json({ message: "Login failed" });
    }
});

// Logout route
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
    });
});

// Get current authenticated user
router.get("/user", isAuthenticated, async (req, res) => {
    try {
        const userId = (req.session as any).userId;
        const user = await storage.getUser(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Don't send password to client
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
    }
});

export default router;
