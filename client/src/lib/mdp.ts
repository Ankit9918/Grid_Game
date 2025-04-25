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
  // Validate inputs
  if (!grid || grid.length === 0 || !grid[0]) {
    console.error("Invalid grid in getNextState");
    return { row, col };
  }
  
  // Check if current position is valid
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
    console.error(`Invalid current position [${row},${col}] in getNextState`);
    return { row: 0, col: 0 };
  }
  
  // Get movement deltas
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
  // Validate inputs
  if (!grid || grid.length === 0 || !grid[0]) {
    console.error("Invalid grid in getReward");
    return -0.01;
  }
  
  // Check if position is valid
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
    console.error(`Invalid position [${row},${col}] in getReward`);
    return -0.01;
  }
  
  if (grid[row][col] === CellType.GOAL) {
    return 1; // Goal state has positive reward
  }
  
  // Larger penalty for obstacle cells
  if (grid[row][col] === CellType.OBSTACLE) {
    return -0.5;
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
  
  // Check if goal is accessible
  if (grid[goal.row][goal.col] !== CellType.GOAL) {
    throw new Error("Goal position is not marked as a goal in the grid");
  }
  
  // Initialize value function with zeros
  let values: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(0));
  
  // Set obstacle values to a large negative value to ensure they are avoided
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] === CellType.OBSTACLE) {
        values[row][col] = -100; // Very negative value for obstacles
      }
    }
  }
  
  // Set an upper bound on iterations to prevent infinite loops
  const maxIterations = 1000;
  let iterations = 0;
  let delta = Infinity;
  
  // Run value iteration until convergence or max iterations
  while (delta > convergenceThreshold && iterations < maxIterations) {
    delta = 0;
    const newValues = Array(rows).fill(0).map(() => Array(cols).fill(0));
    
    // Copy obstacle values to new values array (keep obstacles negative)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (grid[row][col] === CellType.OBSTACLE) {
          newValues[row][col] = -100;
        }
      }
    }
    
    // Update each state
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Skip obstacle cells - preserve their negative values
        if (grid[row][col] === CellType.OBSTACLE) {
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
          try {
            const nextState = getNextState(grid, row, col, action);
            
            // Explicitly skip actions that lead to obstacles
            if (grid[nextState.row][nextState.col] === CellType.OBSTACLE) {
              continue;
            }
            
            const reward = getReward(grid, row, col);
            const nextValue = values[nextState.row][nextState.col];
            
            // Calculate value using Bellman equation
            const actionValue = reward + (discountFactor * nextValue);
            maxActionValue = Math.max(maxActionValue, actionValue);
          } catch (error) {
            console.warn(`Error calculating action value for [${row},${col}], action ${action}:`, error);
            continue;
          }
        }
        
        // Handle case where no valid actions were found
        if (maxActionValue === -Infinity) {
          maxActionValue = -1; // Assign a default negative value
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
  
  // Check if solution was found (value iteration converged)
  if (iterations >= maxIterations && delta > convergenceThreshold) {
    throw new Error("Value iteration did not converge, maze may not be solvable");
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
  const policy: string[][] = Array(rows).fill(0).map(() => Array(cols).fill('none'));
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Skip obstacles
      if (grid[row][col] === CellType.OBSTACLE) {
        policy[row][col] = 'none';
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
      let hasValidAction = false;
      
      for (const action of ACTIONS) {
        try {
          // Make sure we're not considering "none" when finding best direction
          if (action === 'none' && hasValidAction) continue;
          
          const nextState = getNextState(grid, row, col, action);
          
          // Skip if next state is an obstacle
          if (grid[nextState.row][nextState.col] === CellType.OBSTACLE) {
            continue;
          }
          
          // Skip if next state is the same as current state (meaning it was invalid)
          if (nextState.row === row && nextState.col === col && action !== 'none') {
            continue;
          }
          
          const reward = getReward(grid, row, col);
          
          // Ensure the next state value exists
          if (values[nextState.row] === undefined || values[nextState.row][nextState.col] === undefined) {
            continue;
          }
          
          const nextValue = values[nextState.row][nextState.col];
          
          // Skip if next state has a very negative value (likely an obstacle)
          if (nextValue < -50) {
            continue;
          }
          
          const actionValue = reward + (discountFactor * nextValue);
          
          if (actionValue > maxActionValue) {
            maxActionValue = actionValue;
            bestAction = action;
            hasValidAction = true;
          }
        } catch (error) {
          console.warn(`Error calculating policy for [${row},${col}], action ${action}:`, error);
          continue;
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
  goal: Cell,
  grid?: Grid // Optional grid for obstacle checking
): Cell[] {
  // Validate inputs
  if (!policy || policy.length === 0 || !policy[0] || policy[0].length === 0) {
    console.error("Invalid policy grid provided to getOptimalPath");
    return []; // Return empty path
  }
  
  const rows = policy.length;
  const cols = policy[0].length;
  
  // Validate start and goal positions
  if (start.row < 0 || start.row >= rows || start.col < 0 || start.col >= cols ||
      goal.row < 0 || goal.row >= rows || goal.col < 0 || goal.col >= cols) {
    console.error("Start or goal position is outside the grid boundaries");
    return []; // Return empty path
  }
  
  const path: Cell[] = [{ row: start.row, col: start.col }];
  const maxSteps = rows * cols * 2; // Allow for a longer path (just in case)
  
  let currentPos = { ...start };
  let steps = 0;
  let visitedPositions = new Set<string>();
  
  // Mark start as visited
  visitedPositions.add(`${start.row},${start.col}`);
  
  // Follow policy until goal is reached or max steps taken
  while (steps < maxSteps) {
    // Check if we've reached the goal
    if (currentPos.row === goal.row && currentPos.col === goal.col) {
      break; // Reached goal
    }
    
    try {
      // Get action from policy
      const action = policy[currentPos.row][currentPos.col];
      
      // If no action or invalid action, break the loop
      if (!action || !DELTAS[action as Action]) {
        console.warn(`Invalid action "${action}" at position [${currentPos.row},${currentPos.col}]`);
        break;
      }
      
      const [dr, dc] = DELTAS[action as Action];
      
      // Calculate next position
      const nextPos = {
        row: currentPos.row + dr,
        col: currentPos.col + dc
      };
      
      // Validate next position
      if (nextPos.row < 0 || nextPos.row >= rows || 
          nextPos.col < 0 || nextPos.col >= cols) {
        console.warn(`Next position [${nextPos.row},${nextPos.col}] is outside grid boundaries`);
        break;
      }
      
      // Check if next position is an obstacle (if grid is provided)
      if (grid && grid[nextPos.row][nextPos.col] === CellType.OBSTACLE) {
        console.warn(`Next position [${nextPos.row},${nextPos.col}] is an obstacle, stopping path`);
        break;
      }
      
      // Check for cycles in the path (avoid infinite loops)
      const posKey = `${nextPos.row},${nextPos.col}`;
      if (visitedPositions.has(posKey)) {
        console.warn("Cycle detected in path, breaking to avoid infinite loop");
        break;
      }
      
      // Update current position and mark as visited
      currentPos = nextPos;
      visitedPositions.add(posKey);
      path.push({ ...currentPos });
      
    } catch (error) {
      console.error("Error following policy path:", error);
      break;
    }
    
    steps++;
  }
  
  // If we didn't reach the goal, but ran out of steps
  if (currentPos.row !== goal.row || currentPos.col !== goal.col) {
    console.warn(`Could not find path to goal after ${steps} steps`);
  }
  
  return path;
}
