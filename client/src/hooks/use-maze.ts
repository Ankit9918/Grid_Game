import { useState, useCallback, useEffect } from 'react';
import { runMDP, getOptimalPath, extractPolicy } from '@/lib/mdp';

export enum CellType {
  EMPTY = 0,
  START = 1,
  GOAL = 2,
  OBSTACLE = 3
}

export interface Cell {
  row: number;
  col: number;
}

export type Grid = CellType[][];
export type StateValues = number[][];
export type Policy = string[][];

export interface MazeState {
  // Grid state
  grid: Grid;
  size: number;
  obstacleDensity: number;
  startPosition: Cell;
  goalPosition: Cell;
  agentPosition: Cell | null;
  
  // MDP parameters
  discountFactor: number;
  convergenceThreshold: number;
  animationSpeed: number;
  
  // Computation results
  stateValues: StateValues | null;
  policy: Policy | null;
  optimalPath: Cell[] | null;
  iterations: number;
  
  // Display options
  showOptimalPath: boolean;
  showStateValues: boolean;
  showPolicy: boolean;
  
  // Status
  isSolving: boolean;
  isAnimating: boolean;
  statusMessage: string;
  
  // Actions
  setSize: (size: number) => void;
  setObstacleDensity: (density: number) => void;
  setDiscountFactor: (factor: number) => void;
  setConvergenceThreshold: (threshold: number) => void;
  setAnimationSpeed: (speed: number) => void;
  setShowOptimalPath: (show: boolean) => void;
  setShowStateValues: (show: boolean) => void;
  setShowPolicy: (show: boolean) => void;
  generateMaze: () => void;
  solveMaze: () => void;
  resetSolution: () => void;
  animateAgent: () => void;
  toggleCell: (row: number, col: number) => void;
}

export function useMaze(): MazeState {
  // Grid configuration
  const [size, setSize] = useState<number>(5);
  const [obstacleDensity, setObstacleDensity] = useState<number>(25);
  const [grid, setGrid] = useState<Grid>([]);
  const [startPosition, setStartPosition] = useState<Cell>({ row: 0, col: 0 });
  const [goalPosition, setGoalPosition] = useState<Cell>({ row: 0, col: 0 });
  const [agentPosition, setAgentPosition] = useState<Cell | null>(null);
  
  // MDP parameters
  const [discountFactor, setDiscountFactor] = useState<number>(0.9);
  const [convergenceThreshold, setConvergenceThreshold] = useState<number>(0.001);
  const [animationSpeed, setAnimationSpeed] = useState<number>(3);
  
  // Computation results
  const [stateValues, setStateValues] = useState<StateValues | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [optimalPath, setOptimalPath] = useState<Cell[] | null>(null);
  const [iterations, setIterations] = useState<number>(0);
  
  // Display options
  const [showOptimalPath, setShowOptimalPath] = useState<boolean>(true);
  const [showStateValues, setShowStateValues] = useState<boolean>(false);
  const [showPolicy, setShowPolicy] = useState<boolean>(false);
  
  // Status
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Generate a maze to begin");
  
  // Generate initial maze on component mount
  useEffect(() => {
    generateMaze();
  }, []);
  
  // Create a new random maze
  const generateMaze = useCallback(() => {
    // Reset solution and status
    resetSolution();
    
    // Create empty grid
    const newGrid: Grid = Array(size).fill(0).map(() => Array(size).fill(CellType.EMPTY));
    
    // Place start at top-left corner
    const start: Cell = { row: 0, col: 0 };
    newGrid[start.row][start.col] = CellType.START;
    
    // Place goal at bottom-right corner
    const goal: Cell = { row: size - 1, col: size - 1 };
    newGrid[goal.row][goal.col] = CellType.GOAL;
    
    // Place random obstacles based on density
    const totalCells = size * size;
    const obstacleCount = Math.floor((totalCells - 2) * (obstacleDensity / 100));
    let placedObstacles = 0;
    
    while (placedObstacles < obstacleCount) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      
      // Skip start and goal positions
      if ((row === start.row && col === start.col) || 
          (row === goal.row && col === goal.col)) {
        continue;
      }
      
      // If cell is empty, place obstacle
      if (newGrid[row][col] === CellType.EMPTY) {
        newGrid[row][col] = CellType.OBSTACLE;
        placedObstacles++;
      }
    }
    
    // Update state
    setGrid(newGrid);
    setStartPosition(start);
    setGoalPosition(goal);
    setAgentPosition({ ...start });
    setStatusMessage("Maze generated. Click 'Solve Maze' to find the optimal path");
  }, [size, obstacleDensity]);
  
  // Toggle cell between empty and obstacle
  const toggleCell = useCallback((row: number, col: number) => {
    // Don't allow toggling start or goal
    if ((row === startPosition.row && col === startPosition.col) ||
        (row === goalPosition.row && col === goalPosition.col)) {
      return;
    }
    
    // Toggle between empty and obstacle
    setGrid(prevGrid => {
      const newGrid = [...prevGrid.map(r => [...r])];
      newGrid[row][col] = newGrid[row][col] === CellType.EMPTY 
        ? CellType.OBSTACLE 
        : CellType.EMPTY;
      return newGrid;
    });
    
    // Reset solution when grid changes
    resetSolution();
  }, [startPosition, goalPosition]);
  
  // Solve maze using MDP
  const solveMaze = useCallback(async () => {
    setIsSolving(true);
    setStatusMessage("Running value iteration...");
    
    // Small delay to allow state update to render
    await new Promise(resolve => setTimeout(resolve, 10));
    
    try {
      // Run MDP value iteration
      const { values, iterations: iters } = runMDP(
        grid, 
        startPosition, 
        goalPosition, 
        discountFactor, 
        convergenceThreshold
      );
      
      // Extract policy from value function
      const policyMap = extractPolicy(values, grid, discountFactor);
      
      // Get optimal path
      const path = getOptimalPath(policyMap, startPosition, goalPosition);
      
      // Update state
      setStateValues(values);
      setPolicy(policyMap);
      setOptimalPath(path);
      setIterations(iters);
      setStatusMessage(`Value iteration: converged after ${iters} steps`);
    } catch (error) {
      setStatusMessage("Error: Could not find solution. Try reducing obstacles.");
      console.error("Error solving maze:", error);
    } finally {
      setIsSolving(false);
    }
  }, [grid, startPosition, goalPosition, discountFactor, convergenceThreshold]);
  
  // Reset current solution
  const resetSolution = useCallback(() => {
    setStateValues(null);
    setPolicy(null);
    setOptimalPath(null);
    setIterations(0);
    setAgentPosition(startPosition ? { ...startPosition } : { row: 0, col: 0 });
    setStatusMessage("Solution reset. Generate a new maze or solve again.");
  }, [startPosition]);
  
  // Animate agent along optimal path
  const animateAgent = useCallback(async () => {
    if (!optimalPath || optimalPath.length === 0 || isAnimating) return;
    
    setIsAnimating(true);
    
    // Make sure we have a valid start position
    const validStart = startPosition ? { ...startPosition } : { row: 0, col: 0 };
    setAgentPosition(validStart);
    
    // Small delay before starting animation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Calculate delay based on animation speed (range: 800ms to 100ms)
    const delay = 900 - (animationSpeed * 160);
    
    try {
      // Animate through each step in the path
      for (let i = 0; i < optimalPath.length; i++) {
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (optimalPath[i]) {
          setAgentPosition(optimalPath[i]);
          // Update status message
          setStatusMessage(`Step ${i + 1} of ${optimalPath.length}`);
        }
      }
      
      setStatusMessage(`Reached goal in ${optimalPath.length} steps!`);
    } catch (error) {
      console.error("Error animating agent:", error);
      setStatusMessage("Animation encountered an error");
    } finally {
      setIsAnimating(false);
    }
  }, [optimalPath, animationSpeed, isAnimating, startPosition]);
  
  return {
    // Grid state
    grid,
    size,
    obstacleDensity,
    startPosition,
    goalPosition,
    agentPosition,
    
    // MDP parameters
    discountFactor,
    convergenceThreshold,
    animationSpeed,
    
    // Computation results
    stateValues,
    policy,
    optimalPath,
    iterations,
    
    // Display options
    showOptimalPath,
    showStateValues,
    showPolicy,
    
    // Status
    isSolving,
    isAnimating,
    statusMessage,
    
    // Actions
    setSize,
    setObstacleDensity,
    setDiscountFactor,
    setConvergenceThreshold,
    setAnimationSpeed,
    setShowOptimalPath,
    setShowStateValues,
    setShowPolicy,
    generateMaze,
    solveMaze,
    resetSolution,
    animateAgent,
    toggleCell,
  };
}
