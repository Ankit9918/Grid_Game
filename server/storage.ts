import { users, type User, type InsertUser } from "@shared/schema";
import { 
  Maze, InsertMaze, 
  Solution, InsertSolution 
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // User operations (kept for compatibility)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Maze operations
  getAllMazes(): Promise<Maze[]>;
  getMaze(id: number): Promise<Maze | undefined>;
  createMaze(maze: InsertMaze): Promise<Maze>;
  
  // Solution operations
  getSolutionsByMazeId(mazeId: number): Promise<Solution[]>;
  createSolution(solution: InsertSolution): Promise<Solution>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mazes: Map<number, Maze>;
  private solutions: Map<number, Solution>;
  private userIdCounter: number;
  private mazeIdCounter: number;
  private solutionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.mazes = new Map();
    this.solutions = new Map();
    this.userIdCounter = 1;
    this.mazeIdCounter = 1;
    this.solutionIdCounter = 1;
  }

  // User methods (kept for compatibility)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Maze methods
  async getAllMazes(): Promise<Maze[]> {
    return Array.from(this.mazes.values());
  }
  
  async getMaze(id: number): Promise<Maze | undefined> {
    return this.mazes.get(id);
  }
  
  async createMaze(insertMaze: InsertMaze): Promise<Maze> {
    const id = this.mazeIdCounter++;
    const maze: Maze = { ...insertMaze, id };
    this.mazes.set(id, maze);
    return maze;
  }
  
  // Solution methods
  async getSolutionsByMazeId(mazeId: number): Promise<Solution[]> {
    return Array.from(this.solutions.values()).filter(
      (solution) => solution.mazeId === mazeId
    );
  }
  
  async createSolution(insertSolution: InsertSolution): Promise<Solution> {
    const id = this.solutionIdCounter++;
    const solution: Solution = { ...insertSolution, id };
    this.solutions.set(id, solution);
    return solution;
  }
}

export const storage = new MemStorage();
