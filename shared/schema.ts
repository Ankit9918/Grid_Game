import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Maze configuration
export const mazes = pgTable("mazes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  size: integer("size").notNull(),
  obstacleDensity: integer("obstacle_density").notNull(),
  gridData: text("grid_data").notNull(), // JSON string of grid
  createdAt: integer("created_at").notNull(),
});

export const insertMazeSchema = createInsertSchema(mazes).pick({
  name: true,
  size: true,
  obstacleDensity: true,
  gridData: true,
  createdAt: true,
});

// MDP solution record
export const solutions = pgTable("solutions", {
  id: serial("id").primaryKey(),
  mazeId: integer("maze_id").notNull(),
  discountFactor: text("discount_factor").notNull(),
  iterations: integer("iterations").notNull(),
  stateValuesData: text("state_values_data").notNull(), // JSON string of values
  policyData: text("policy_data").notNull(), // JSON string of policy
  optimalPathData: text("optimal_path_data").notNull(), // JSON string of path
  solvedAt: integer("solved_at").notNull(),
});

export const insertSolutionSchema = createInsertSchema(solutions).pick({
  mazeId: true,
  discountFactor: true,
  iterations: true,
  stateValuesData: true,
  policyData: true,
  optimalPathData: true,
  solvedAt: true,
});

export type InsertMaze = z.infer<typeof insertMazeSchema>;
export type Maze = typeof mazes.$inferSelect;

export type InsertSolution = z.infer<typeof insertSolutionSchema>;
export type Solution = typeof solutions.$inferSelect;

// Keep existing User schema for compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
