// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import React, { useEffect, useState, lazy, Suspense } from 'react';

import useAuthStore from './Store/authStore';
import Layout from './components/Layout';

// Entry screens stay in the main bundle so the first paint needs no extra round trip.
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Everything else is split into its own chunk and fetched on first visit.
const CheckEmail = lazy(() => import('./pages/CheckEmail'));
const FinishSignup = lazy(() => import('./pages/FinishSignup'));
const SpaceTimelineExplorer = lazy(() => import('./pages/SpaceTimelineExplorer'));
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const AllIdeas = lazy(() => import('./pages/AllIdeas'));
const Newproject = lazy(() => import('./pages/Newproject'));
const Myteams = lazy(() => import('./pages/Myteams'));
const SearchPeers = lazy(() => import('./pages/SearchPeers'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const TeamDashboard = lazy(() => import('./pages/TeamDashboard'));
const TeamChat = lazy(() => import('./pages/TeamChat'));
const ChatList = lazy(() => import('./pages/ChatList'));

const PageFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-900">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-white" />
  </div>
);

// Holds protected routes while the session check is still in flight, so a logged-in
// user is never bounced to the landing page on a hard refresh.
const RequireAuth = ({ ready, user }) => {
  if (!ready) return <PageFallback />;
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
};

function App() {
  const { user, fetchUser } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  // The session check runs in the background: public pages render immediately
  // instead of waiting on the API.
  useEffect(() => {
    fetchUser().finally(() => setAuthChecked(true));
  }, []);

  return (
    <Router>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/finish-signup" element={<FinishSignup />} />
          <Route path="/space" element={<SpaceTimelineExplorer />} />

          {/* Protected Routes */}
          <Route element={<RequireAuth ready={authChecked} user={user} />}>
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
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
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
