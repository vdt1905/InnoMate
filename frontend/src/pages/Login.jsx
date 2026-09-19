import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import AuthLayout from '../components/AuthLayout';
import GoogleButton, { OrDivider } from '../components/GoogleButton';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Errors live in the store, so without this a failed attempt here would still
  // be on screen after navigating to Register and back.
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // login() resolves to null on bad credentials and sets `error`. Navigating
    // regardless sent the user to a protected route with no session, which
    // bounced them straight back to the landing page and hid the error.
    const result = await login(form);
    if (result) navigate('/home');
  };

  return (
    <AuthLayout
      title="Log in to InnoMate"
      subtitle="Welcome back. Pick up where your team left off."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-link hover:underline">Sign up</Link>
        </>
      }
    >
      <GoogleButton />
      <OrDivider />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <div className="alert-error" role="alert">{error}</div>}

        <div>
          <label htmlFor="email" className="label">Email or username</label>
          <input
            id="email"
            name="email"
            type="text"
            autoComplete="username"
            value={form.email}
            onChange={handleChange}
            className="input py-2.5"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="input py-2.5 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-subtle transition-colors hover:text-fg"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !form.email || !form.password}
          className="btn btn-primary w-full py-2.5"
        >
          {loading ? (
            <>
              <span className="spinner h-4 w-4" />
              Logging in…
            </>
          ) : (
            'Log in'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
