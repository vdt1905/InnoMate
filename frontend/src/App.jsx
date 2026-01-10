// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import useAuthStore from './Store/authStore';
import Login from './pages/Login';
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

function App() {
  const { user, fetchUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
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
            <Route path="/newproject" element={<Newproject />} />
            <Route path="/:username" element={<Profile />} />

            <Route path="/" element={<Navigate to="/home" />} />


            <Route path="*" element={<Navigate to="/home" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
