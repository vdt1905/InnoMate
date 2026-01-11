import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, User, UserPlus } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate('/check-email');
    }
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
            <UserPlus className="w-12 h-12 mx-auto text-white mb-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              InnoMate
            </h1>
            <p className="text-gray-400 text-sm mt-2 tracking-wider">CREATE ACCOUNT</p>
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
          <div className="px-8 pb-8 space-y-6">
            {/* Name field */}
            <div className="relative mt-8">
              <div className="relative">
                <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 z-20 ${focusedField === 'name' ? 'text-purple-400' : 'text-gray-500'
                  }`} />
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown}
                  placeholder=" "
                  required
                  className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white transition-all duration-200 focus:outline-none peer ${focusedField === 'name'
                    ? 'border-purple-500/50 bg-purple-500/5'
                    : 'border-gray-600/50 hover:border-gray-500/70'
                    }`}
                />
                <label className={`absolute transition-all duration-200 pointer-events-none z-10 ${focusedField === 'name' || formData.name ?
                  'text-xs text-purple-400 -top-2.5 left-12 bg-gray-900 px-2 rounded' :
                  'text-gray-400 top-4 left-12 peer-placeholder-shown:top-4 peer-placeholder-shown:left-12 peer-focus:-top-2.5 peer-focus:left-12 peer-focus:text-xs peer-focus:text-purple-400 peer-focus:bg-gray-900 peer-focus:px-2 peer-focus:rounded'
                  }`}>
                  Full Name
                </label>
              </div>
            </div>

            {/* Username field */}
            <div className="relative">
              <div className="relative">
                <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 z-20 ${focusedField === 'username' ? 'text-pink-400' : 'text-gray-500'
                  }`} />
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown}
                  placeholder=" "
                  required
                  className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white transition-all duration-200 focus:outline-none peer ${focusedField === 'username'
                    ? 'border-pink-500/50 bg-pink-500/5'
                    : 'border-gray-600/50 hover:border-gray-500/70'
                    }`}
                />
                <label className={`absolute transition-all duration-200 pointer-events-none z-10 ${focusedField === 'username' || formData.username ?
                  'text-xs text-pink-400 -top-2.5 left-12 bg-gray-900 px-2 rounded' :
                  'text-gray-400 top-4 left-12 peer-placeholder-shown:top-4 peer-placeholder-shown:left-12 peer-focus:-top-2.5 peer-focus:left-12 peer-focus:text-xs peer-focus:text-pink-400 peer-focus:bg-gray-900 peer-focus:px-2 peer-focus:rounded'
                  }`}>
                  Username
                </label>
              </div>
            </div>

            {/* Email field */}
            <div className="relative">
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 z-20 ${focusedField === 'email' ? 'text-violet-400' : 'text-gray-500'
                  }`} />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown}
                  placeholder=" "
                  required
                  className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white transition-all duration-200 focus:outline-none peer ${focusedField === 'email'
                    ? 'border-violet-500/50 bg-violet-500/5'
                    : 'border-gray-600/50 hover:border-gray-500/70'
                    }`}
                />
                <label className={`absolute transition-all duration-200 pointer-events-none z-10 ${focusedField === 'email' || formData.email ?
                  'text-xs text-violet-400 -top-2.5 left-12 bg-gray-900 px-2 rounded' :
                  'text-gray-400 top-4 left-12 peer-placeholder-shown:top-4 peer-placeholder-shown:left-12 peer-focus:-top-2.5 peer-focus:left-12 peer-focus:text-xs peer-focus:text-violet-400 peer-focus:bg-gray-900 peer-focus:px-2 peer-focus:rounded'
                  }`}>
                  Email Address
                </label>
              </div>
            </div>

            {/* Password field */}
            <div className="relative">
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 z-20 ${focusedField === 'password' ? 'text-cyan-400' : 'text-gray-500'
                  }`} />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown}
                  placeholder=" "
                  required
                  className={`w-full pl-12 pr-12 py-4 bg-white/5 border rounded-xl text-white transition-all duration-200 focus:outline-none peer ${focusedField === 'password'
                    ? 'border-cyan-500/50 bg-cyan-500/5'
                    : 'border-gray-600/50 hover:border-gray-500/70'
                    }`}
                />
                <label className={`absolute transition-all duration-200 pointer-events-none z-10 ${focusedField === 'password' || formData.password ?
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
              disabled={loading || !formData.name || !formData.username || !formData.email || !formData.password}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-purple-500 hover:to-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group mt-8"
            >
              <span className="flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>CREATING ACCOUNT...</span>
                  </>
                ) : (
                  <>
                    <span>JOIN NEXUS</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </span>
            </button>

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-gray-400 text-sm">
                Already have access?{' '}
                <button type="button" onClick={() => navigate('/login')} className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
                  Sign In
                </button>
              </p>
            </div>
          </div>



          {/* Google Sign In */}
          <div className="px-8 pb-4">
            <button
              type="button"
              onClick={async () => {
                try {
                  const { auth, googleProvider } = await import('../firebase');
                  const { signInWithPopup } = await import('firebase/auth');
                  const result = await signInWithPopup(auth, googleProvider);
                  const { user } = result;
                  const token = await user.getIdToken();
                  console.log("Google Token Generated");
                  // Call store action
                  const { googleLogin } = useAuthStore.getState();
                  await googleLogin({ token });
                  navigate('/home');
                } catch (error) {
                  console.error("Google Sign In Error", error);
                }
              }}
              className="w-full bg-white text-gray-900 font-semibold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
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
    </div >
  );
}