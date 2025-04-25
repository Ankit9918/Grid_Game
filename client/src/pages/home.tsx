import { useState } from "react";
import GameGrid from "@/components/GameGrid";
import ControlPanel from "@/components/ControlPanel";
import HelpModal from "@/components/HelpModal";
import { useMaze } from "@/hooks/use-maze";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const maze = useMaze();

  return (
    <div className="min-h-screen font-main text-wooden-800 relative overflow-x-hidden">
      {/* Header */}
      <header className="w-full p-4 bg-gradient-to-r from-forest/80 to-wooden/80 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="font-fantasy text-3xl md:text-4xl text-parchment drop-shadow-md">
            <i className="fas fa-dragon mr-2 text-golden animate-pulse"></i>
            Enchanted Maze Explorer
          </h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-2 rounded-full bg-parchment text-forest hover:bg-golden transition-colors">
            <i className="fas fa-question text-xl"></i>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GameGrid maze={maze} />
        <ControlPanel maze={maze} />
      </main>

      {/* Help Modal */}
      <HelpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Script for Font Awesome */}
      <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.0.0/css/all.css" rel="stylesheet" />
    </div>
  );
}
