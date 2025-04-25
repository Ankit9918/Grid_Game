import { useEffect, useRef } from "react";
import { MazeState, CellType } from "@/hooks/use-maze";

interface GameGridProps {
  maze: MazeState;
}

const GameGrid: React.FC<GameGridProps> = ({ maze }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const cellSize = 500 / maze.size;

  // Draw the optimal path
  useEffect(() => {
    if (!svgRef.current || !maze.optimalPath || !maze.showOptimalPath) return;
    
    const pathElement = svgRef.current.querySelector('#optimal-path');
    if (!pathElement) return;

    // Convert optimal path coordinates to SVG path
    if (maze.optimalPath.length > 0) {
      const pathD = maze.optimalPath.map((point, i) => {
        const x = (point.col + 0.5) * cellSize;
        const y = (point.row + 0.5) * cellSize;
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      }).join(' ');
      
      pathElement.setAttribute('d', pathD);
      pathElement.classList.remove('hidden');
    } else {
      pathElement.classList.add('hidden');
    }
  }, [maze.optimalPath, maze.showOptimalPath, maze.size, cellSize]);

  // Render policy arrows if enabled
  const renderPolicyArrows = (row: number, col: number) => {
    if (!maze.showPolicy || !maze.policy) return null;
    
    const policy = maze.policy[row]?.[col];
    if (!policy) return null;
    
    // Arrow directions based on policy
    const arrows: Record<string, string> = {
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→',
      'none': '•'
    };
    
    // Adjust text size based on grid size
    const textSize = maze.size <= 8 ? 'text-lg' : 
                    maze.size <= 12 ? 'text-md' : 
                    maze.size <= 15 ? 'text-sm' : 'text-xs';
    
    return (
      <div className={`absolute inset-0 flex items-center justify-center text-magic font-bold ${textSize} z-20`}>
        {arrows[policy]}
      </div>
    );
  };

  // Render state values if enabled
  const renderStateValues = (row: number, col: number) => {
    if (!maze.showStateValues || !maze.stateValues) return null;
    
    const value = maze.stateValues[row]?.[col];
    if (value === undefined) return null;
    
    // Adjust font size based on grid size
    const fontSize = maze.size <= 10 ? 'text-xs' : 'text-[0.6rem]';
    
    return (
      <div className={`absolute inset-0 flex items-center justify-center ${fontSize} font-semibold z-10 text-forest`}>
        {value.toFixed(2)}
      </div>
    );
  };

  // Calculate grid container size to maintain square aspect ratio
  const gridSize = "min(500px, 70vh)";

  return (
    <section className="parchment rounded-2xl p-6 lg:col-span-8 relative overflow-hidden">
      <h2 className="font-fantasy text-2xl mb-4 text-forest flex items-center">
        <i className="fas fa-map-marked-alt mr-2 text-magic"></i>
        Enchanted Realm
      </h2>
      
      {/* Game Grid Container */}
      <div className="relative flex items-center justify-center mx-auto" style={{ width: gridSize, height: gridSize }}>
        {/* SVG Overlay for paths and animations */}
        <svg 
          ref={svgRef}
          className="absolute inset-0 w-full h-full z-10" 
          preserveAspectRatio="xMidYMid meet"
          viewBox={`0 0 ${500} ${500}`}
        >
          <path 
            id="optimal-path" 
            className={maze.showOptimalPath ? "" : "hidden"} 
            stroke="hsl(var(--magic))" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeDasharray="8 4" 
            strokeLinejoin="round" 
            fill="none"
          ></path>
        </svg>
        
        {/* Maze Grid */}
        <div 
          className={`grid gap-1 w-full h-full border-4 border-wooden rounded-lg overflow-hidden aspect-square`}
          style={{ 
            gridTemplateColumns: `repeat(${maze.size}, 1fr)`,
            gridTemplateRows: `repeat(${maze.size}, 1fr)`
          }}
        >
          {maze.grid.map((row, rowIndex) => 
            row.map((cell, colIndex) => {
              // Determine cell background class based on type
              let bgClass = "bg-path";
              if (cell === CellType.START) bgClass = "bg-start";
              else if (cell === CellType.GOAL) bgClass = "bg-goal animate-glow";
              else if (cell === CellType.OBSTACLE) bgClass = "bg-obstacle shadow-md";
              
              // Check if this cell is the current agent position
              const isAgentPos = maze.agentPosition && 
                maze.agentPosition.row === rowIndex && 
                maze.agentPosition.col === colIndex;
              
              return (
                <div 
                  key={`${rowIndex}-${colIndex}`}
                  className={`cell ${bgClass} rounded flex items-center justify-center relative`}
                  onClick={() => maze.toggleCell(rowIndex, colIndex)}
                >
                  {cell === CellType.OBSTACLE && (
                    <svg className="w-2/3 h-2/3 mx-auto opacity-70" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M16,13V11H13V8H11V11H8V13H11V16H13V13H16Z" />
                    </svg>
                  )}
                  
                  {isAgentPos && (
                    <div className="agent absolute inset-0 flex items-center justify-center z-30">
                      <svg 
                        className={`${maze.size <= 10 ? 'w-3/4 h-3/4' : 'w-2/3 h-2/3'}`} 
                        viewBox="0 0 24 24"
                      >
                        <path fill="hsl(var(--magic))" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M15,11V13H17V15H15V17H13V15H11V17H9V15H7V13H9V11H7V9H9V7H11V9H13V7H15V9H17V11H15Z" />
                      </svg>
                    </div>
                  )}
                  
                  {cell === CellType.GOAL && (
                    <svg 
                      className={`${maze.size <= 10 ? 'w-3/4 h-3/4' : 'w-2/3 h-2/3'}`} 
                      viewBox="0 0 24 24"
                    >
                      <path fill="currentColor" d="M5,4H19A3,3 0 0,1 22,7V13H20V7A1,1 0 0,0 19,6H5A1,1 0 0,0 4,7V19A1,1 0 0,0 5,20H9V22H5A3,3 0 0,1 2,19V7A3,3 0 0,1 5,4M18,14H20V17H23V19H20V22H18V19H15V17H18V14M9,11H13.5A1.5,1.5 0 0,1 15,12.5A1.5,1.5 0 0,1 13.5,14H11V16H9V11M11,12V13H13.5A0.5,0.5 0 0,0 14,12.5A0.5,0.5 0 0,0 13.5,12H11Z" />
                    </svg>
                  )}
                  
                  {renderStateValues(rowIndex, colIndex)}
                  {renderPolicyArrows(rowIndex, colIndex)}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Status Display */}
      <div className="mt-4 p-3 bg-forest/10 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <span className="w-4 h-4 bg-start rounded-full mr-2"></span>
            <span>Start</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-goal rounded-full mr-2"></span>
            <span>Goal</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-obstacle rounded-full mr-2"></span>
            <span>Obstacle</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-path rounded-full mr-2"></span>
            <span>Path</span>
          </div>
          <div className="ml-auto text-sm italic">
            <i className="fas fa-calculator text-magic mr-1"></i>
            {maze.statusMessage}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameGrid;
