import { Grid, Cell, CellType } from '@/hooks/use-maze';

// Possible actions
const ACTIONS = ['up', 'right', 'down', 'left', 'none'];
type Action = typeof ACTIONS[number];

// Action to delta mappings
const DELTAS: Record<Action, [number, number]> = {
  'up': [-1, 0],
  'right': [0, 1],
  'down': [1, 0],
  'left': [0, -1],
  'none': [0, 0],
};

// Get next state given current state and action
function getNextState(grid: Grid, row: number, col: number, action: Action): Cell {
  const [dr, dc] = DELTAS[action];
  const newRow = row + dr;
  const newCol = col + dc;
  
  // Check if move is valid
  if (
    newRow >= 0 && newRow < grid.length &&
    newCol >= 0 && newCol < grid[0].length &&
    grid[newRow][newCol] !== CellType.OBSTACLE
  ) {
    return { row: newRow, col: newCol };
  }
  
  // If invalid, stay in place
  return { row, col };
}

// Get reward for being in a state
function getReward(grid: Grid, row: number, col: number): number {
  if (grid[row][col] === CellType.GOAL) {
    return 1; // Goal state has positive reward
  }
  return -0.01; // Small negative reward for each step to encourage shortest path
}

// Run value iteration algorithm for MDP
export function runMDP(
  grid: Grid, 
  start: Cell, 
  goal: Cell, 
  discountFactor: number, 
  convergenceThreshold: number
): { values: number[][], iterations: number } {
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Initialize value function with zeros
  let values: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(0));
  
  // Set an upper bound on iterations to prevent infinite loops
  const maxIterations = 1000;
  let iterations = 0;
  let delta = Infinity;
  
  // Run value iteration until convergence or max iterations
  while (delta > convergenceThreshold && iterations < maxIterations) {
    delta = 0;
    const newValues = Array(rows).fill(0).map(() => Array(cols).fill(0));
    
    // Update each state
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Skip obstacle cells
        if (grid[row][col] === CellType.OBSTACLE) {
          newValues[row][col] = 0;
          continue;
        }
        
        // If this is the goal state, set to reward and continue
        if (grid[row][col] === CellType.GOAL) {
          newValues[row][col] = getReward(grid, row, col);
          continue;
        }
        
        // Find max value over all actions (Bellman equation)
        let maxActionValue = -Infinity;
        
        for (const action of ACTIONS) {
          const nextState = getNextState(grid, row, col, action);
          const reward = getReward(grid, row, col);
          const nextValue = values[nextState.row][nextState.col];
          
          // Calculate value using Bellman equation
          const actionValue = reward + (discountFactor * nextValue);
          maxActionValue = Math.max(maxActionValue, actionValue);
        }
        
        // Update the value
        newValues[row][col] = maxActionValue;
        
        // Track maximum change
        delta = Math.max(delta, Math.abs(newValues[row][col] - values[row][col]));
      }
    }
    
    // Update values for next iteration
    values = newValues;
    iterations++;
  }
  
  return { values, iterations };
}

// Extract optimal policy from value function
export function extractPolicy(
  values: number[][], 
  grid: Grid, 
  discountFactor: number
): string[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const policy: string[][] = Array(rows).fill('none').map(() => Array(cols).fill('none'));
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Skip obstacles
      if (grid[row][col] === CellType.OBSTACLE) {
        continue;
      }
      
      // If goal state, no action needed
      if (grid[row][col] === CellType.GOAL) {
        policy[row][col] = 'none';
        continue;
      }
      
      // Find action with maximum expected value
      let maxActionValue = -Infinity;
      let bestAction = 'none';
      
      for (const action of ACTIONS) {
        const nextState = getNextState(grid, row, col, action);
        const reward = getReward(grid, row, col);
        const nextValue = values[nextState.row][nextState.col];
        
        const actionValue = reward + (discountFactor * nextValue);
        
        if (actionValue > maxActionValue) {
          maxActionValue = actionValue;
          bestAction = action;
        }
      }
      
      policy[row][col] = bestAction;
    }
  }
  
  return policy;
}

// Find optimal path using policy
export function getOptimalPath(
  policy: string[][], 
  start: Cell, 
  goal: Cell
): Cell[] {
  const path: Cell[] = [{ row: start.row, col: start.col }];
  const maxSteps = policy.length * policy[0].length; // Avoid infinite loops
  
  let currentPos = { ...start };
  let steps = 0;
  
  // Follow policy until goal is reached or max steps taken
  while (steps < maxSteps) {
    if (currentPos.row === goal.row && currentPos.col === goal.col) {
      break; // Reached goal
    }
    
    const action = policy[currentPos.row][currentPos.col];
    const [dr, dc] = DELTAS[action as Action];
    
    // Move to next state
    currentPos = {
      row: currentPos.row + dr,
      col: currentPos.col + dc
    };
    
    path.push({ ...currentPos });
    steps++;
  }
  
  return path;
}
