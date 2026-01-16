// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../Store/authStore';
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Search,
  Lightbulb,
  Users,
  MessageSquare,
  UserCircle,
  PlusSquare,
  LogOut,

  Menu,
  X,
  ChevronLeft
} from 'lucide-react';

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
      icon: <LayoutDashboard className="w-5 h-5" />
    },

    {
      path: '/myteams',
      label: 'Team',
      icon: <Users className="w-5 h-5" />
    },
    {
      path: '/chat',
      label: 'Chat',
      icon: <MessageSquare className="w-5 h-5" />,
      highlight: true
    },
    {
      path: '/search-peers',
      label: 'Find Peers',
      icon: <Search className="w-5 h-5" />
    },
    {
      path: '/allideas',
      label: 'All Ideas',
      icon: <Lightbulb className="w-5 h-5" />
    },
    {
      path: '/newproject',
      label: 'New Work',
      icon: <PlusSquare className="w-5 h-5" />
    }
  ];

  const isActiveLink = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button - Fixed at top left */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 bg-slate-800 text-white rounded-lg shadow-lg border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          {isCollapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        ${isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-72'}
        transition-all duration-300 ease-in-out h-screen bg-[#0F172A] border-r border-slate-800 flex flex-col shadow-2xl
      `}>
        {/* Background Gradient Blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-[#0F172A] pointer-events-none" />

        {/* Content wrapper with relative z-index */}
        <div className="relative z-10 flex flex-col h-full">

          {/* Top Section: Mac Controls & Brand */}
          <div className="p-6 relative group">

            {/* Desktop Toggle Button - Visible on hover or when collapsed */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`
                    hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-white hover:border-violet-500/50 transition-all z-50
                    ${isCollapsed ? 'rotate-180' : ''}
                `}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            {/* Mac Window Controls */}


            {/* Brand */}
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                <span className="text-white font-bold text-xl font-mono">I</span>
              </div>
              {!isCollapsed && (
                <span className="text-white font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  InnoMate
                </span>
              )}
            </div>

            {/* Search Bar */}

          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
            {navigationItems.map((item) => {
              const active = isActiveLink(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 768) setIsCollapsed(true);
                  }}
                  className={`
                      flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative
                      ${active
                      ? 'bg-gradient-to-r from-violet-600/10 to-cyan-600/10 text-white border border-violet-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
                    }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className={`
                        flex-shrink-0 transition-colors
                        ${active ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}
                    `}>
                    {item.icon}
                  </div>

                  {!isCollapsed && (
                    <>
                      <span className={`ml-3 font-medium text-[14px] tracking-wide ${active ? 'text-white' : ''}`}>
                        {item.label}
                      </span>
                      {item.highlight && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
                      )}
                      {active && (
                        <div className="ml-auto w-1 h-1 rounded-full bg-violet-400 shadow-[0_0_4px_rgba(167,139,250,0.5)]"></div>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer: User Profile */}
          <div className="p-4 mt-auto">
            <div
              onClick={() => navigate(`/${user?.username}`)}
              className={`
                    flex items-center p-3 rounded-2xl bg-slate-900/50 border border-slate-800 cursor-pointer hover:border-violet-500/20 hover:bg-slate-800 transition-all duration-300
                    ${isCollapsed ? 'justify-center' : 'gap-3'}
                `}>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                    <UserCircle className="w-6 h-6 text-slate-300" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-lg"></div>
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-semibold truncate hover:text-violet-400 transition-colors">
                    {user?.name || 'User'}
                  </h4>
                  <p className="text-slate-500 text-xs truncate">Member</p>
                </div>
              )}

              {!isCollapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                  }}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;