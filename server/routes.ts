import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for mazes
  app.get("/api/mazes", async (req, res) => {
    try {
      const mazes = await storage.getAllMazes();
      res.json(mazes);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve mazes" });
    }
  });

  app.get("/api/mazes/:id", async (req, res) => {
    try {
      const maze = await storage.getMaze(parseInt(req.params.id));
      if (!maze) {
        return res.status(404).json({ message: "Maze not found" });
      }
      res.json(maze);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve maze" });
    }
  });

  app.post("/api/mazes", async (req, res) => {
    try {
      const newMaze = await storage.createMaze(req.body);
      res.status(201).json(newMaze);
    } catch (error) {
      res.status(400).json({ message: "Failed to create maze" });
    }
  });

  // API routes for solutions
  app.get("/api/mazes/:mazeId/solutions", async (req, res) => {
    try {
      const solutions = await storage.getSolutionsByMazeId(parseInt(req.params.mazeId));
      res.json(solutions);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve solutions" });
    }
  });

  app.post("/api/solutions", async (req, res) => {
    try {
      const newSolution = await storage.createSolution(req.body);
      res.status(201).json(newSolution);
    } catch (error) {
      res.status(400).json({ message: "Failed to create solution" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
