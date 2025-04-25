interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="parchment rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-fantasy text-2xl text-forest">How to Play</h2>
            <button onClick={onClose} className="text-wooden hover:text-forest transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-fantasy text-xl text-magic mb-2">Game Overview</h3>
              <p>Welcome to the Enchanted Maze Explorer! This game combines beautiful visuals with powerful algorithms to help you navigate through mystical mazes.</p>
            </div>
            
            <div>
              <h3 className="font-fantasy text-xl text-magic mb-2">How to Play</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Configure your maze size and obstacle density using the controls</li>
                <li>Click "Generate New Maze" to create a random maze</li>
                <li>Adjust algorithm parameters to change how the maze is solved</li>
                <li>Click "Solve Maze" to run the value iteration algorithm</li>
                <li>Click "Animate Solution" to watch the character follow the optimal path</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-fantasy text-xl text-magic mb-2">What is MDP?</h3>
              <p>A Markov Decision Process (MDP) is a mathematical framework for modeling decision-making. In this game, it helps find the optimal path through the maze by calculating which moves maximize the expected reward.</p>
            </div>
            
            <div>
              <h3 className="font-fantasy text-xl text-magic mb-2">Value Iteration</h3>
              <p>The algorithm calculates a "value" for each cell, representing how good it is to be in that cell. The higher the value, the better. These values are updated iteratively until they converge, revealing the optimal path.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
