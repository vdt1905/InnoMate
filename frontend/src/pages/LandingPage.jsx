
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Terminal, Code2, Users2, Rocket } from 'lucide-react';
import { GridScan } from '../components/GridScan';
import useAuthStore from '../Store/authStore';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuthStore();

    useEffect(() => {
        if (!loading && user) {
            navigate('/home');
        }
    }, [user, loading, navigate]);

    if (loading) return null; // Or a loader

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
            {/* Background GridScan */}
            <div className="absolute inset-0 z-0">
                <GridScan
                    sensitivity={0.55}
                    lineThickness={1}
                    linesColor="#392e4e"
                    gridScale={0.1}
                    scanColor="#FF9FFC"
                    scanOpacity={0.4}
                    enablePost={true}
                    bloomIntensity={0.6}
                    chromaticAberration={0.002}
                    noiseIntensity={0.01}
                    // Adding style to ensure it fills container
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none">
                {/* Navbar Placeholder - positioned absolute top */}
                <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 pointer-events-auto">
                    <div className="flex items-center gap-2">
                      
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                            InnoMate
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl backdrop-blur-sm text-white font-medium transition-all"
                        >
                            Get Started
                        </button>
                    </div>
                </nav>

                {/* Main Hero Content */}
                <div className="max-w-4xl px-6 text-center pointer-events-auto">
                   

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                        Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">The Future</span>
                        <br /> Together
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        InnoMate connects visionaries, developers, and creators to turn ideas into reality.
                        Join teams, manage projects, and ship products faster than ever.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/register')}
                            className="group relative px-8 py-4 bg-gradient-to-r from-black-200 to-cyan-600 rounded-xl text-white font-bold text-lg shadow-lg shadow-black-500/20 hover:shadow-black-500/40 hover:scale-105 transition-all duration-200 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start Building Now
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-black-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>

                        {/* <button
                            onClick={() => navigate('/allideas')}
                            className="px-8 py-4 bg-gray-900/50 hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 rounded-xl text-white font-semibold text-lg backdrop-blur-md transition-all flex items-center gap-2"
                        >
                            <Terminal className="w-5 h-5 text-gray-400" />
                            Explore Projects
                        </button> */}
                    </div>
                </div>

                {/* Footer Stats/Features - Absolute Bottom */}
                

            </div>
        </div>
    );
};

export default LandingPage;
