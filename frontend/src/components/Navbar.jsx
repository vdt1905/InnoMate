// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../Store/authStore';
import React, { useState,useEffect } from 'react';
import { Search } from 'lucide-react';

const Navbar = () => {
  const { logout, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close sidebar on route change for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Set initial
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationItems = [
    {
      path: '/home',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },

    {
      path: '/search-peers',
      label: 'Find Peers',
      icon: <Search className="w-5 h-5" />
    },
    {
      path: '/allideas',
      label: 'All Ideas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      path: '/myteams',
      label: 'Myteams',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      path: '/chat',
      label: 'Chat',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    {
      path: user ? `/${user.username}` : '/login',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  const isActiveLink = (path) => location.pathname === path;

  // Handle new project navigation
  const handleNewProject = () => {
    navigate('/newproject');
  };

  // Handle support action
  const handleSupport = () => {
    // You can navigate to a support page or open a modal
    console.log('Support clicked');
    // navigate('/support'); // if you have a support page
  };

  return (
    <>
      {/* Mobile Menu Button - Fixed at top left */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        ${isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-72'}
        transition-all duration-300 ease-in-out h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-r border-gray-700/50 shadow-2xl flex flex-col overflow-hidden
      `}>

        {/* Header with Collapse Toggle (Desktop only) */}
        <div className="p-6 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-white truncate">Dashboard</h2>
                  <p className="text-xs text-gray-400 truncate">Management Panel</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:block p-2 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white transition-all duration-200 flex-shrink-0"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  // On mobile, close sidebar after clicking a link
                  if (window.innerWidth < 768) setIsCollapsed(true);
                }}
                className={`
                group flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-in-out relative
                ${isActiveLink(item.path)
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50 hover:border-gray-600/30 border border-transparent'
                  }
              `}
                title={isCollapsed ? item.label : ''}
              >
                <div className={`
                flex-shrink-0 transition-all duration-300
                ${isActiveLink(item.path)
                    ? 'text-purple-400 scale-110'
                    : 'text-gray-500 group-hover:text-gray-300 group-hover:scale-105'
                  }
              `}>
                  {item.icon}
                </div>

                {(!isCollapsed || window.innerWidth < 768) && (
                  <>
                    <span className={`font-medium tracking-wide ml-3 truncate ${isCollapsed && 'md:hidden'}`}>{item.label}</span>
                    {isActiveLink(item.path) && (
                      <div className="ml-auto flex-shrink-0">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </>
                )}

                {isCollapsed && isActiveLink(item.path) && (
                  <div className="hidden md:block absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Quick Actions</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleNewProject();
                    if (window.innerWidth < 768) setIsCollapsed(true);
                  }}
                  className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 text-sm group"
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="truncate">New Project</span>
                </button>
                <button
                  onClick={handleSupport}
                  className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 text-sm group"
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="truncate">Support</span>
                </button>
              </div>
            </div>
          )}

          {/* Collapsed Quick Actions */}
          {isCollapsed && (
            <div className="hidden md:block mt-8 pt-6 border-t border-gray-700/50">
              <div className="space-y-2 flex flex-col items-center">
                <button
                  onClick={handleNewProject}
                  className="p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
                  title="New Project"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <button
                  onClick={handleSupport}
                  className="p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
                  title="Support"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-700/50 flex-shrink-0">
          <div className={`flex items-center ${isCollapsed ? 'justify-center md:justify-center' : 'space-x-3'} mb-4 p-3 bg-gray-800/30 rounded-xl`}>
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {(!isCollapsed || window.innerWidth < 768) && (
              <div className={`flex-1 min-w-0 ${isCollapsed && 'md:hidden'}`}>
                <p className="text-white text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-gray-400 text-xs truncate">Administrator</p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-center px-4'} py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all duration-300 group`}
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {(!isCollapsed || window.innerWidth < 768) && <span className={`font-medium ml-2 truncate ${isCollapsed && 'md:hidden'}`}>Sign Out</span>}
          </button>
        </div>
      </div>
    </>
  );
}
  export default Navbar;