// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  mazes;
  solutions;
  userIdCounter;
  mazeIdCounter;
  solutionIdCounter;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.mazes = /* @__PURE__ */ new Map();
    this.solutions = /* @__PURE__ */ new Map();
    this.userIdCounter = 1;
    this.mazeIdCounter = 1;
    this.solutionIdCounter = 1;
  }
  // User methods (kept for compatibility)
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Maze methods
  async getAllMazes() {
    return Array.from(this.mazes.values());
  }
  async getMaze(id) {
    return this.mazes.get(id);
  }
  async createMaze(insertMaze) {
    const id = this.mazeIdCounter++;
    const maze = { ...insertMaze, id };
    this.mazes.set(id, maze);
    return maze;
  }
  // Solution methods
  async getSolutionsByMazeId(mazeId) {
    return Array.from(this.solutions.values()).filter(
      (solution) => solution.mazeId === mazeId
    );
  }
  async createSolution(insertSolution) {
    const id = this.solutionIdCounter++;
    const solution = { ...insertSolution, id };
    this.solutions.set(id, solution);
    return solution;
  }
};
var storage = new MemStorage();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/mazes", async (req, res) => {
    try {
      const mazes = await storage.getAllMazes();
      res.json(mazes);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve mazes" });
    }
  });
  app2.get("/api/mazes/:id", async (req, res) => {
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
  app2.post("/api/mazes", async (req, res) => {
    try {
      const newMaze = await storage.createMaze(req.body);
      res.status(201).json(newMaze);
    } catch (error) {
      res.status(400).json({ message: "Failed to create maze" });
    }
  });
  app2.get("/api/mazes/:mazeId/solutions", async (req, res) => {
    try {
      const solutions = await storage.getSolutionsByMazeId(parseInt(req.params.mazeId));
      res.json(solutions);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve solutions" });
    }
  });
  app2.post("/api/solutions", async (req, res) => {
    try {
      const newSolution = await storage.createSolution(req.body);
      res.status(201).json(newSolution);
    } catch (error) {
      res.status(400).json({ message: "Failed to create solution" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
