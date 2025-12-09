
import { Router } from "express";
import { learningPathSimulator } from "./learningPathSimulator";
import { representationSimulator } from "./representationSimulator";

const router = Router();

/**
 * GET /api/simulation/perfect-path
 * 
 * Simuliert einen perfekten Lernweg durch das System
 */
router.get("/perfect-path", async (req, res) => {
  try {
    const numTasks = parseInt(req.query.numTasks as string) || 100;
    
    console.log(`Simulating perfect learning path with ${numTasks} tasks...`);
    
    const result = learningPathSimulator.simulatePerfectPath(numTasks);
    const report = learningPathSimulator.generateReport(result);
    
    res.json({
      result,
      report,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error simulating learning path:", error);
    res.status(500).json({ 
      error: "Failed to simulate learning path",
      details: error.message 
    });
  }
});

/**
 * GET /api/simulation/progressive-mastery
 * 
 * Analysiert wie viele Aufgaben für 1, 2, 3, ... N Kompetenzen nötig sind
 */
router.get("/progressive-mastery", async (req, res) => {
  try {
    console.log("Analyzing progressive mastery path...");
    
    // Simuliere mit genug Aufgaben, um alle Kompetenzen zu meistern
    const maxTasks = 5000;
    const result = learningPathSimulator.simulatePerfectPath(maxTasks);
    
    // Erstelle Progressive Liste
    const progressiveData: Array<{
      competenciesMastered: number;
      tasksRequired: number;
      competencyName: string;
      taskNumber: number;
    }> = [];
    
    // Sortiere Milestones nach Aufgabennummer
    const sortedMilestones = [...result.milestones].sort((a, b) => a.taskNumber - b.taskNumber);
    
    sortedMilestones.forEach((milestone, index) => {
      progressiveData.push({
        competenciesMastered: index + 1,
        tasksRequired: milestone.taskNumber,
        competencyName: milestone.competencyName,
        taskNumber: milestone.taskNumber
      });
    });
    
    // Berechne Statistiken
    const totalCompetencies = sortedMilestones.length;
    const tasksForAll = totalCompetencies > 0 
      ? sortedMilestones[sortedMilestones.length - 1].taskNumber 
      : 0;
    
    const averageTasksPerCompetency = totalCompetencies > 0
      ? tasksForAll / totalCompetencies
      : 0;
    
    res.json({
      progressiveData,
      summary: {
        totalCompetencies,
        tasksForAllCompetencies: tasksForAll,
        averageTasksPerCompetency: averageTasksPerCompetency.toFixed(1)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error analyzing progressive mastery:", error);
    res.status(500).json({ 
      error: "Failed to analyze progressive mastery",
      details: error.message 
    });
  }
});

/**
 * GET /api/simulation/debug-mastery
 * 
 * Debug-Endpoint um zu sehen wie sich gemeisterte Kompetenzen über Zeit entwickeln
 * KORRIGIERT: Verwendet jetzt EINEN kontinuierlichen Durchlauf statt mehrere separate!
 */
router.get("/debug-mastery", async (req, res) => {
  try {
    const checkpoints = [100, 200, 300, 400, 500, 600, 700, 800, 1000, 1500, 2000];
    
    console.log("Analyzing competency progression with checkpoints...");
    
    // KORREKTUR: Verwende einen kontinuierlichen Durchlauf!
    const results = learningPathSimulator.simulatePerfectPathWithCheckpoints(checkpoints);
    
    // Log für Debugging
    for (const result of results) {
      console.log(`After ${result.numTasks} tasks: ${result.competenciesMastered} competencies mastered (${result.milestones} total milestones)`);
    }
    
    res.json({
      results,
      explanation: "Diese Daten stammen aus EINEM kontinuierlichen Durchlauf, daher nimmt die Anzahl gemeisterter Kompetenzen monoton zu.",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error debugging mastery:", error);
    res.status(500).json({ 
      error: "Failed to debug mastery",
      details: error.message 
    });
  }
});

/**
 * GET /api/simulation/representation-path
 * 
 * Simuliert einen perfekten Lernweg durch das Repräsentationssystem
 * mit Fokus auf Single-Rep Tests und progressive Mastery
 */
router.get("/representation-path", async (req, res) => {
  try {
    const numTasks = parseInt(req.query.numTasks as string) || 100;
    
    console.log(`Simulating representation learning path with ${numTasks} tasks...`);
    
    const result = representationSimulator.simulatePerfectPath(numTasks);
    const report = representationSimulator.generateReport(result);
    
    res.json({
      result,
      report,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error simulating representation path:", error);
    res.status(500).json({ 
      error: "Failed to simulate representation path",
      details: error.message 
    });
  }
});

export default router;
