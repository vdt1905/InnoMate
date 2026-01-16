import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, User, UserPlus, ArrowLeft } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GridScan } from '../components/GridScan';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4">
      {/* GridScan Background */}
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
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Navigation to Landing */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Back</span>
      </button>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-cyan-600/30 rounded-2xl blur-xl"></div>

        {/* Card container */}
        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="p-6 pb-4 text-center">
            <UserPlus className="w-10 h-10 mx-auto text-white mb-2" />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              InnoMate
            </h1>
            <p className="text-gray-400 text-xs mt-1 tracking-wider">CREATE ACCOUNT</p>
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

          {/* Form */}
          <div className="px-6 pb-6 space-y-4">
            {/* Name field */}
            <div className="relative mt-2">
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
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white transition-all duration-200 focus:outline-none peer ${focusedField === 'name'
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
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white transition-all duration-200 focus:outline-none peer ${focusedField === 'username'
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
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white transition-all duration-200 focus:outline-none peer ${focusedField === 'email'
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
                  className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white transition-all duration-200 focus:outline-none peer ${focusedField === 'password'
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
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-purple-500 hover:to-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group mt-4"
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
          <div className="px-6 pb-6 pt-0">
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
              className="w-full bg-white text-gray-900 font-semibold py-3 px-8 rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-3"
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
    </div >
  );
}