// src/components/Layout.jsx
import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import useAuthStore from '../Store/authStore';
import { getSocket } from '../api/socket';

const Layout = () => {
  const fetchConversations = useAuthStore((state) => state.fetchConversations);
  const fetchNotifications = useAuthStore((state) => state.fetchNotifications);

  // Invites, join requests and their answers arrive live.
  useEffect(() => {
    fetchNotifications();
    const socket = getSocket();
    socket.on('notification:new', fetchNotifications);
    return () => socket.off('notification:new', fetchNotifications);
  }, [fetchNotifications]);
  const { pathname } = useLocation();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  // Keeps the unread dot on Messages current from anywhere in the app. The
  // conversation you're looking at handles its own read state, so a refresh
  // here would briefly mark it unread again.
  useEffect(() => {
    fetchConversations();
    const socket = getSocket();
    const onMessage = ({ conversationId }) => {
      if (pathRef.current !== `/chat/${conversationId}`) fetchConversations();
    };
    socket.on('dm:message', onMessage);
    return () => socket.off('dm:message', onMessage);
  }, [fetchConversations]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-fg">
      <Navbar />
      {/* On phones the fixed top bar and bottom tab bar are each h-14. */}
      <main className="relative w-full flex-1 overflow-y-auto pt-14 pb-14 md:pt-0 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
