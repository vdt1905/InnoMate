import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Zap, Globe, Heart, Cpu, Leaf, GraduationCap, Wifi, Atom, Play, RotateCcw, Keyboard, Info } from 'lucide-react';

const SpaceTimelineExplorer = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [rocketPosition, setRocketPosition] = useState({ x: 50, y: 50 });
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [currentYear, setCurrentYear] = useState(2000);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const containerRef = useRef(null);

  const stations = [
    {
      id: 'internet-boom',
      year: 2000,
      title: 'Internet Revolution',
      icon: Globe,
      position: { x: 15, y: 20 },
      color: 'from-blue-400 to-cyan-400',
      glowColor: 'shadow-blue-400/50',
      description: 'The dawn of the digital age with widespread internet adoption and e-commerce.',
      achievements: [
        'First dot-com bubble and recovery',
        'Google search dominance',
        'Amazon reshapes commerce',
        'Napster transforms music',
        'Y2K drives tech upgrades'
      ]
    },
    {
      id: 'social-media',
      year: 2005,
      title: 'Social Networks',
      icon: Wifi,
      position: { x: 35, y: 80 },
      color: 'from-purple-400 to-pink-400',
      glowColor: 'shadow-purple-400/50',
      description: 'Social platforms revolutionized global communication and connection.',
      achievements: [
        'Facebook public launch',
        'YouTube video revolution',
        'Twitter microblogging',
        'MySpace dominance',
        'Web 2.0 user content'
      ]
    },
    {
      id: 'mobile-revolution',
      year: 2010,
      title: 'Mobile Era',
      icon: Zap,
      position: { x: 20, y: 60 },
      color: 'from-emerald-400 to-teal-400',
      glowColor: 'shadow-emerald-400/50',
      description: 'Smartphones transformed daily life and created mobile-first ecosystems.',
      achievements: [
        'iPhone App Store ecosystem',
        'Android market growth',
        'Instagram visual media',
        'Mobile-first internet',
        'Location services emerge'
      ]
    },
    {
      id: 'digital-health',
      year: 2015,
      title: 'Health Tech',
      icon: Heart,
      position: { x: 70, y: 25 },
      color: 'from-red-400 to-rose-400',
      glowColor: 'shadow-red-400/50',
      description: 'Healthcare technology with wearables and telemedicine solutions.',
      achievements: [
        'Fitness trackers mainstream',
        'Telemedicine platforms',
        'Electronic health records',
        'Precision medicine',
        'Health apps wellness'
      ]
    },
    {
      id: 'ai-emergence',
      year: 2018,
      title: 'AI Renaissance',
      icon: Cpu,
      position: { x: 80, y: 70 },
      color: 'from-amber-400 to-orange-400',
      glowColor: 'shadow-amber-400/50',
      description: 'AI and ML became practical tools for businesses and consumers.',
      achievements: [
        'Deep learning breakthroughs',
        'Voice assistants everywhere',
        'Computer vision advances',
        'Natural language processing',
        'Autonomous vehicles'
      ]
    },
    {
      id: 'sustainability',
      year: 2020,
      title: 'Green Tech',
      icon: Leaf,
      position: { x: 45, y: 40 },
      color: 'from-green-400 to-lime-400',
      glowColor: 'shadow-green-400/50',
      description: 'Environmental focus drove clean technology and renewable energy.',
      achievements: [
        'Electric vehicle adoption',
        'Renewable energy parity',
        'Carbon tracking tech',
        'Circular economy',
        'Green building standards'
      ]
    },
    {
      id: 'metaverse',
      year: 2022,
      title: 'Virtual Worlds',
      icon: GraduationCap,
      position: { x: 65, y: 85 },
      color: 'from-violet-400 to-indigo-400',
      glowColor: 'shadow-violet-400/50',
      description: 'VR/AR created immersive experiences and digital social interaction.',
      achievements: [
        'VR/AR mainstream',
        'Virtual real estate',
        'Digital identity systems',
        'Remote work immersion',
        'NFT digital assets'
      ]
    },
    {
      id: 'quantum-future',
      year: 2025,
      title: 'Quantum Age',
      icon: Atom,
      position: { x: 85, y: 50 },
      color: 'from-fuchsia-400 to-purple-400',
      glowColor: 'shadow-fuchsia-400/50',
      description: 'Quantum computing and advanced AI shape the next technological era.',
      achievements: [
        'Quantum computing breakthrough',
        'Neural interfaces',
        'Fusion energy progress',
        'Space tech advancement',
        'Biotechnology revolution'
      ]
    }
  ];

  // Handle rocket movement with keyboard
  const moveRocket = useCallback((dx, dy) => {
    setRocketPosition(prev => {
      const newX = Math.max(0, Math.min(100, prev.x + dx));
      const newY = Math.max(0, Math.min(100, prev.y + dy));
      
      // Update year based on position
      const progress = newX / 100;
      const year = Math.round(2000 + (progress * 25));
      setCurrentYear(Math.max(2000, Math.min(2025, year)));
      setJourneyProgress(progress * 100);
      
      return { x: newX, y: newY };
    });
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch(e.code) {
        case 'Space':
          e.preventDefault();
          if (!isAutoMode) {
            startAutoJourney();
          } else {
            resetJourney();
          }
          break;
        case 'Escape':
          resetJourney();
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveRocket(0, -2);
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveRocket(0, 2);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveRocket(-2, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRocket(2, 0);
          break;
        case 'KeyH':
          if (e.ctrlKey) {
            e.preventDefault();
            setShowControls(prev => !prev);
          }
          break;
        case 'KeyI':
          if (e.ctrlKey) {
            e.preventDefault();
            setShowInstructions(prev => !prev);
          }
          break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
          if (e.ctrlKey) {
            e.preventDefault();
            const index = parseInt(e.code.replace('Digit', '')) - 1;
            if (index < stations.length) {
              jumpToStation(stations[index]);
            }
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAutoMode, moveRocket, stations]);

  const startAutoJourney = async () => {
    setIsAutoMode(true);
    
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      
      setRocketPosition(station.position);
      setCurrentYear(station.year);
      setJourneyProgress((i / (stations.length - 1)) * 100);
      setSelectedStation(station);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsAutoMode(false);
  };

  const jumpToStation = async (station) => {
    setIsAutoMode(true);
    
    setRocketPosition(station.position);
    setCurrentYear(station.year);
    setJourneyProgress((stations.findIndex(s => s.id === station.id) / (stations.length - 1)) * 100);
    setSelectedStation(station);
    
    setTimeout(() => setIsAutoMode(false), 500);
  };

  const resetJourney = () => {
    setIsAutoMode(false);
    setRocketPosition({ x: 50, y: 50 });
    setCurrentYear(2000);
    setJourneyProgress(0);
    setSelectedStation(null);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 overflow-hidden">
      {/* Static Starfield Background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Static Nebula Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Interactive Container */}
      <div
        ref={containerRef}
        className="absolute inset-0"
      >
        {/* Stations */}
        {stations.map((station, index) => {
          const IconComponent = station.icon;
          return (
            <div
              key={station.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2`}
              style={{ left: `${station.position.x}%`, top: `${station.position.y}%` }}
            >
              {/* Station Orbit */}
              <motion.div
                className="absolute inset-0 w-24 h-24 border-2 border-white/20 rounded-full"
                style={{ left: '-48px', top: '-48px' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Station Planet */}
              <div
                className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${station.color} 
                           ${station.glowColor} shadow-2xl flex items-center justify-center
                           border border-white/30 backdrop-blur-sm`}
              >
                <IconComponent className="w-8 h-8 text-white drop-shadow-lg" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {index + 1}
                </div>
              </div>
              
              {/* Station Label */}
              <div
                className="absolute top-20 left-1/2 transform -translate-x-1/2 
                           bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg
                           border border-white/20 whitespace-nowrap"
              >
                <div className="text-white font-bold text-sm">{station.year}</div>
                <div className="text-gray-300 text-xs">{station.title}</div>
              </div>
            </div>
          );
        })}

        {/* Interactive Rocket */}
        <motion.div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-out"
          style={{ left: `${rocketPosition.x}%`, top: `${rocketPosition.y}%` }}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            {/* Rocket Body */}
            <div
              className="relative w-12 h-20 bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500
                         rounded-t-full rounded-b-lg shadow-2xl border border-white/30"
            >
              {/* Rocket Window */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2
                            w-4 h-4 bg-cyan-300 rounded-full border-2 border-white/50
                            shadow-inner" />
              
              {/* Rocket Fins */}
              <div className="absolute bottom-0 -left-2 w-4 h-6 bg-gray-700
                            transform rotate-12 rounded-l-lg" />
              <div className="absolute bottom-0 -right-2 w-4 h-6 bg-gray-700
                            transform -rotate-12 rounded-r-lg" />
            </div>
            
            {/* Engine Flames */}
            <motion.div
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <div className="w-6 h-8 bg-gradient-to-b from-orange-400 via-red-500 to-yellow-300
                            rounded-b-full blur-sm" />
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2
                            w-4 h-6 bg-gradient-to-b from-blue-400 to-purple-500
                            rounded-b-full" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Control Panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute top-6 left-6 bg-black/80 backdrop-blur-xl rounded-2xl
                      border border-white/20 p-6 min-w-80 z-10"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text 
                            bg-gradient-to-r from-cyan-400 to-purple-400
                            font-mono tracking-wider">
                MISSION CONTROL
              </h2>
              <button 
                onClick={() => setShowControls(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Year</span>
                <span className="text-cyan-400 font-mono font-bold text-xl">
                  {currentYear}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Progress</span>
                <span className="text-purple-400 font-mono font-bold">
                  {Math.round(journeyProgress)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500
                            shadow-lg shadow-purple-500/50"
                  initial={{ width: "0%" }}
                  animate={{ width: `${journeyProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={startAutoJourney}
                  disabled={isAutoMode}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 
                            hover:from-cyan-400 hover:to-blue-500
                            disabled:opacity-50 disabled:cursor-not-allowed
                            text-white font-semibold py-3 px-6 rounded-lg
                            shadow-lg shadow-cyan-500/25 transition-all duration-200
                            flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  {isAutoMode ? 'TRAVELING...' : 'AUTO PILOT'}
                </button>
                
                <button
                  onClick={resetJourney}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600
                            hover:from-purple-500 hover:to-pink-500
                            text-white font-semibold py-3 px-6 rounded-lg
                            shadow-lg shadow-purple-500/25 transition-all duration-200
                            flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} />
                  RESET
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600
                            hover:from-blue-500 hover:to-indigo-500
                            text-white font-semibold py-3 px-6 rounded-lg
                            shadow-lg shadow-blue-500/25 transition-all duration-200
                            flex items-center justify-center gap-2"
                >
                  <Info size={16} />
                  {showInstructions ? 'HIDE HELP' : 'SHOW HELP'}
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="text-xs text-gray-400 space-y-1">
                <div>⌨️ SPACE: Auto pilot</div>
                <div>⌨️ ESC: Reset journey</div>
                <div>⌨️ Arrows: Navigate rocket</div>
                <div>⌨️ Ctrl+1-8: Jump to station</div>
                <div>⌨️ Ctrl+H: Toggle this panel</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Controls Button */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-6 left-6 bg-black/70 backdrop-blur-md rounded-lg p-3
                    border border-white/20 text-white z-10 transition-all hover:scale-110"
        >
          ☰
        </button>
      )}

      {/* Instructions Panel */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-xl rounded-2xl
                      border border-white/20 p-6 max-w-md z-10"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-transparent bg-clip-text 
                            bg-gradient-to-r from-cyan-400 to-purple-400">
                KEYBOARD CONTROLS
              </h3>
              <button 
                onClick={() => setShowInstructions(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="font-medium">Arrow Keys</span>
                <span className="bg-gray-700 px-2 py-1 rounded">Move Rocket</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="font-medium">Space</span>
                <span className="bg-gray-700 px-2 py-1 rounded">Auto Pilot</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="font-medium">Escape</span>
                <span className="bg-gray-700 px-2 py-1 rounded">Reset</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="font-medium">Ctrl + 1-8</span>
                <span className="bg-gray-700 px-2 py-1 rounded">Jump to Station</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="font-medium">Ctrl + H</span>
                <span className="bg-gray-700 px-2 py-1 rounded">Toggle Controls</span>
              </div>
              
              <div className="pt-2 text-cyan-400 font-medium">
                Use arrow keys to navigate the rocket through the timeline
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Mode Indicator */}
      <div className="absolute top-6 right-6 bg-green-600/90 backdrop-blur-md rounded-lg px-4 py-2
                  text-white font-semibold flex items-center gap-2">
        <Keyboard size={16} />
        Keyboard Navigation Active
      </div>

      {/* Information Panel */}
      <AnimatePresence>
        {selectedStation && (
          <motion.div
            className="absolute top-6 right-6 bg-black/80 backdrop-blur-xl rounded-2xl
                      border border-white/20 p-6 max-w-md"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedStation.color}
                             flex items-center justify-center border border-white/30`}>
                <selectedStation.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedStation.title}
                </h3>
                <p className="text-cyan-400 font-mono">{selectedStation.year}</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              {selectedStation.description}
            </p>
            
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50
                           rounded-lg p-4 border border-purple-500/20">
              <h4 className="text-purple-300 font-semibold mb-3 text-sm uppercase tracking-wider">
                Key Innovations
              </h4>
              <ul className="space-y-2">
                {selectedStation.achievements.map((achievement, index) => (
                  <li
                    key={index}
                    className="text-gray-300 text-sm flex items-start gap-2"
                  >
                    <span className="text-purple-400 mt-1">◦</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
            
            <button
              onClick={() => setSelectedStation(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white
                        transition-colors duration-200"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpaceTimelineExplorer;