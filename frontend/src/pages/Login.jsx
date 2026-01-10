import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, User } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { login, loading, error } = useAuthStore();

  // Mock store and navigate for demo - replace with your actual imports


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form); // or register(form)
    navigate('/home');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // Lightweight mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4">
      {/* Lightweight Background Animations */}
      <div className="absolute inset-0">
        {/* Animated gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-cyan-900/20 opacity-50"
          style={{
            transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`
          }}
        ></div>

        {/* Enhanced Floating orbs with more animation */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-30"
              style={{
                left: `${10 + (i * 15)}%`,
                top: `${20 + (i * 12)}%`,
                animation: `float ${3 + i * 0.5}s ease-in-out infinite, drift ${8 + i * 2}s linear infinite`,
                animationDelay: `${i * 0.6}s`
              }}
            >
              <div className={`${i % 4 === 0 ? 'w-6 h-6 bg-purple-500' :
                  i % 4 === 1 ? 'w-8 h-8 bg-pink-500' :
                    i % 4 === 2 ? 'w-5 h-5 bg-cyan-500' : 'w-7 h-7 bg-violet-500'
                } rounded-full blur-sm shadow-lg`}></div>
            </div>
          ))}
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute opacity-20"
              style={{
                left: `${5 + (i * 12)}%`,
                top: `${10 + (i * 10)}%`,
                animation: `sparkle ${2 + i * 0.3}s ease-in-out infinite, float ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`
              }}
            >
              <div className={`w-2 h-2 ${i % 2 === 0 ? 'bg-white' : 'bg-purple-300'
                } rounded-full`}></div>
            </div>
          ))}
        </div>

        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}
          ></div>
        </div>

        {/* Animated pulse circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 border border-purple-500/5 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
          <div className="absolute w-64 h-64 border border-cyan-500/5 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Main Container - Simplified */}
      <div className="relative z-10 w-full max-w-md">
        {/* Simple glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 rounded-2xl blur-xl"></div>

        {/* Enhanced Card container with glow animation */}
        <div className="relative bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
          style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}>
          {/* Header */}
          <div className="p-8 pb-6 text-center">
            <User className="w-12 h-12 mx-auto text-white mb-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              InnoMate
            </h1>
            <p className="text-gray-400 text-sm mt-2 tracking-wider">ACCESS PORTAL</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-8 mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Form - Clean and Simple */}
          <div className="px-8 pb-8 space-y-8">
            {/* Email field */}
            <div className="relative mt-8">
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 z-20 ${focusedField === 'email' ? 'text-purple-400' : 'text-gray-500'
                  }`} />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown}
                  placeholder=" "
                  className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white transition-all duration-200 focus:outline-none peer ${focusedField === 'email'
                      ? 'border-purple-500/50 bg-purple-500/5'
                      : 'border-gray-600/50 hover:border-gray-500/70'
                    }`}
                />
                <label className={`absolute transition-all duration-200 pointer-events-none z-10 ${focusedField === 'email' || form.email ?
                    'text-xs text-purple-400 -top-2.5 left-12 bg-gray-900 px-2 rounded' :
                    'text-gray-400 top-4 left-12 peer-placeholder-shown:top-4 peer-placeholder-shown:left-12 peer-focus:-top-2.5 peer-focus:left-12 peer-focus:text-xs peer-focus:text-purple-400 peer-focus:bg-gray-900 peer-focus:px-2 peer-focus:rounded'
                  }`}>
                  Email Address
                </label>
              </div>
            </div>

            {/* Password field */}
            <div className="relative mt-8">
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 z-20 ${focusedField === 'password' ? 'text-cyan-400' : 'text-gray-500'
                  }`} />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown}
                  placeholder=" "
                  className={`w-full pl-12 pr-12 py-4 bg-white/5 border rounded-xl text-white transition-all duration-200 focus:outline-none peer ${focusedField === 'password'
                      ? 'border-cyan-500/50 bg-cyan-500/5'
                      : 'border-gray-600/50 hover:border-gray-500/70'
                    }`}
                />
                <label className={`absolute transition-all duration-200 pointer-events-none z-10 ${focusedField === 'password' || form.password ?
                    'text-xs text-cyan-400 -top-2.5 left-12 bg-gray-900 px-2 rounded' :
                    'text-gray-400 top-4 left-12 peer-placeholder-shown:top-4 peer-placeholder-shown:left-12 peer-focus:-top-2.5 peer-focus:left-12 peer-focus:text-xs peer-focus:text-cyan-400 peer-focus:bg-gray-900 peer-focus:px-2 peer-focus:rounded'
                  }`}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 z-20"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !form.email || !form.password}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-purple-500 hover:to-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>ACCESS NEXUS</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </span>
            </button>

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-gray-400 text-sm">
                Need access?{' '}
                <button type="button" onClick={() => navigate('/register')} className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
                  Request Portal
                </button>
              </p>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-b-2xl"></div>
        </div>
      </div>

      {/* Enhanced CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes drift {
          0% { transform: translateX(0px); }
          50% { transform: translateX(30px); }
          100% { transform: translateX(0px); }
        }
        
        @keyframes sparkle {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.5); 
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
          }
          50% { 
            box-shadow: 0 0 40px rgba(147, 51, 234, 0.6), 0 0 60px rgba(6, 182, 212, 0.3);
          }
        }
      `}</style>
    </div>
  );
}