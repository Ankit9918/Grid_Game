import { useState } from "react";
import { MazeState } from "@/hooks/use-maze";

interface ControlPanelProps {
  maze: MazeState;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ maze }) => {
  // Local state for active visualization
  const [activeView, setActiveView] = useState<string>("optimal-path");

  // Handle visualization toggle
  const handleViewToggle = (viewType: string) => {
    setActiveView(viewType);
    
    // Update maze state based on active view
    maze.setShowOptimalPath(viewType === "optimal-path");
    maze.setShowStateValues(viewType === "state-values");
    maze.setShowPolicy(viewType === "policy-arrows");
  };
  
  // Format animation speed text
  const getSpeedText = (value: number) => {
    const speeds = ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'];
    return speeds[value - 1];
  };

  return (
    <section className="wood-panel rounded-2xl p-5 lg:col-span-4 flex flex-col">
      <h2 className="font-fantasy text-2xl mb-4 text-parchment flex items-center">
        <i className="fas fa-cogs mr-2 text-golden"></i>
        Wizard's Controls
      </h2>
      
      {/* Maze Generation Controls */}
      <div className="bg-parchment/90 rounded-lg p-4 mb-4">
        <h3 className="font-fantasy text-lg mb-2 text-forest">Maze Configuration</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="grid-size">
              Grid Size: <span>{maze.size}x{maze.size}</span>
            </label>
            <input 
              type="range" 
              id="grid-size" 
              min="3" 
              max="10" 
              value={maze.size} 
              onChange={(e) => maze.setSize(parseInt(e.target.value))}
              className="w-full h-2 bg-wooden/20 rounded-lg appearance-none cursor-pointer accent-magic"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="obstacle-density">
              Obstacle Density: <span>{maze.obstacleDensity}%</span>
            </label>
            <input 
              type="range" 
              id="obstacle-density" 
              min="0" 
              max="50" 
              value={maze.obstacleDensity} 
              onChange={(e) => maze.setObstacleDensity(parseInt(e.target.value))}
              className="w-full h-2 bg-wooden/20 rounded-lg appearance-none cursor-pointer accent-magic"
            />
          </div>
          
          <button 
            onClick={maze.generateMaze}
            className="w-full py-2 px-4 bg-forest text-parchment rounded-lg hover:bg-forest/80 transition-colors flex items-center justify-center"
          >
            <i className="fas fa-dice mr-2"></i>
            Generate New Maze
          </button>
        </div>
      </div>
      
      {/* Algorithm Controls */}
      <div className="bg-parchment/90 rounded-lg p-4 mb-4">
        <h3 className="font-fantasy text-lg mb-2 text-forest">Algorithm Settings</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="discount-factor">
              Discount Factor (γ): <span>{maze.discountFactor.toFixed(2)}</span>
            </label>
            <input 
              type="range" 
              id="discount-factor" 
              min="0.5" 
              max="0.99" 
              step="0.01" 
              value={maze.discountFactor}
              onChange={(e) => maze.setDiscountFactor(parseFloat(e.target.value))} 
              className="w-full h-2 bg-wooden/20 rounded-lg appearance-none cursor-pointer accent-magic"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="convergence-threshold">
              Convergence Threshold: <span>{maze.convergenceThreshold.toFixed(4)}</span>
            </label>
            <input 
              type="range" 
              id="convergence-threshold" 
              min="0.0001" 
              max="0.01" 
              step="0.0001" 
              value={maze.convergenceThreshold}
              onChange={(e) => maze.setConvergenceThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-wooden/20 rounded-lg appearance-none cursor-pointer accent-magic"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={maze.solveMaze}
              disabled={maze.isSolving}
              className="flex-1 py-2 px-4 bg-magic text-parchment rounded-lg hover:bg-magic/80 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <i className="fas fa-calculator mr-2"></i>
              Solve Maze
            </button>
            
            <button 
              onClick={maze.resetSolution}
              className="flex-1 py-2 px-4 bg-wooden text-parchment rounded-lg hover:bg-wooden/80 transition-colors flex items-center justify-center"
            >
              <i className="fas fa-undo mr-2"></i>
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Visualization Controls */}
      <div className="bg-parchment/90 rounded-lg p-4 mb-4">
        <h3 className="font-fantasy text-lg mb-2 text-forest">Visualization</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="animation-speed">
              Animation Speed: <span>{getSpeedText(maze.animationSpeed)}</span>
            </label>
            <input 
              type="range" 
              id="animation-speed" 
              min="1" 
              max="5" 
              value={maze.animationSpeed}
              onChange={(e) => maze.setAnimationSpeed(parseInt(e.target.value))}
              className="w-full h-2 bg-wooden/20 rounded-lg appearance-none cursor-pointer accent-magic"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              className={`py-1 px-3 ${activeView === "optimal-path" ? "bg-forest text-parchment" : "bg-wooden/50 text-wooden-800"} rounded-lg hover:bg-forest/80 transition-colors text-xs flex items-center`}
              onClick={() => handleViewToggle("optimal-path")}
            >
              <i className="fas fa-route mr-1"></i>
              Optimal Path
            </button>
            
            <button 
              className={`py-1 px-3 ${activeView === "state-values" ? "bg-forest text-parchment" : "bg-wooden/50 text-wooden-800"} rounded-lg hover:bg-wooden/40 transition-colors text-xs flex items-center`}
              onClick={() => handleViewToggle("state-values")}
            >
              <i className="fas fa-table mr-1"></i>
              State Values
            </button>
            
            <button 
              className={`py-1 px-3 ${activeView === "policy-arrows" ? "bg-forest text-parchment" : "bg-wooden/50 text-wooden-800"} rounded-lg hover:bg-wooden/40 transition-colors text-xs flex items-center`}
              onClick={() => handleViewToggle("policy-arrows")}
            >
              <i className="fas fa-compass mr-1"></i>
              Policy Arrows
            </button>
          </div>
          
          <button 
            onClick={maze.animateAgent}
            disabled={!maze.optimalPath || maze.optimalPath.length === 0 || maze.isAnimating}
            className="w-full py-2 px-4 bg-golden text-wooden-800 rounded-lg hover:bg-golden/80 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            <i className="fas fa-play mr-2"></i>
            Animate Solution
          </button>
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-parchment/90 rounded-lg p-4 mt-auto">
        <h3 className="font-fantasy text-lg mb-2 text-forest">Game Facts</h3>
        <ul className="text-sm space-y-1">
          <li className="flex items-start">
            <i className="fas fa-info-circle text-magic mt-1 mr-2"></i>
            <span>This game uses <span className="font-semibold">Markov Decision Process (MDP)</span> to find the optimal path</span>
          </li>
          <li className="flex items-start">
            <i className="fas fa-info-circle text-magic mt-1 mr-2"></i>
            <span>The <span className="font-semibold">Bellman Equation</span> is used to calculate the utility of each state</span>
          </li>
          <li className="flex items-start">
            <i className="fas fa-info-circle text-magic mt-1 mr-2"></i>
            <span>Lower discount factors (γ) make the agent prioritize short-term rewards</span>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default ControlPanel;
