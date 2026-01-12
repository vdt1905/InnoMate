// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import useAuthStore from './Store/authStore';
import Login from './pages/Login';
import CheckEmail from './pages/CheckEmail';
import FinishSignup from './pages/FinishSignup';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import AllIdeas from './pages/AllIdeas';
import Register from './pages/Register';
import Newproject from './pages/Newproject';
import Myteams from './pages/Myteams';
import SpaceTimelineExplorer from './pages/SpaceTimelineExplorer';
import SearchPeers from './pages/SearchPeers';
import ProjectDetails from './pages/ProjectDetails';
import TeamDashboard from './pages/TeamDashboard';
import TeamChat from './pages/TeamChat';
import ChatList from './pages/ChatList';

import LandingPage from './pages/LandingPage';

function App() {
  const { user, fetchUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Tech Spinner */}
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-500 border-r-cyan-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-t-transparent border-r-transparent border-b-pink-500 border-l-transparent rounded-full animate-spin-reverse"></div>

            {/* Inner Pulse */}
            <div className="absolute inset-[30%] bg-white/5 rounded-full animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse tracking-wide">
            INNOMATE
          </h2>
          <div className="flex items-center gap-1 mt-3">
            <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="text-cyan-500/50 text-xs tracking-widest uppercase ml-2">System Initializing</span>
          </div>
        </div>

        <style>{`
          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .animate-spin-reverse {
            animation: spin-reverse 3s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/finish-signup" element={<FinishSignup />} />
        <Route path="/space" element={<SpaceTimelineExplorer />} />

        {/* Protected Routes */}
        {user ? (
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            {/* <Route path="/profile" element={<Profile />} /> */}
            <Route path="/allideas" element={<AllIdeas />} />
            <Route path="/search-peers" element={<SearchPeers />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/myteams" element={<Myteams />} />
            <Route path="/team/:id" element={<TeamDashboard />} /> {/* ✅ Secure Route */}
            <Route path="/team/:id/chat" element={<TeamChat />} /> {/* 💬 Full Page Chat */}
            <Route path="/chat" element={<ChatList />} />
            <Route path="/newproject" element={<Newproject />} />
            <Route path="/:username" element={<Profile />} />

            <Route path="*" element={<Navigate to="/home" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
