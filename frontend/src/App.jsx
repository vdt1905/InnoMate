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
import Hyperspeed from './components/Hyperspeed';

import LandingPage from './pages/LandingPage';

function App() {
  const { user, fetchUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black">
        <Hyperspeed />
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
