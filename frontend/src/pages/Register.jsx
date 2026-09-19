import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import AuthLayout from '../components/AuthLayout';
import GoogleButton, { OrDivider } from '../components/GoogleButton';

const FIELDS = [
  { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
  { name: 'username', label: 'Username', type: 'text', autoComplete: 'username' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

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

  const incomplete = !formData.name || !formData.username || !formData.email || !formData.password;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Find collaborators and build projects together."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-link hover:underline">Log in</Link>
        </>
      }
    >
      <GoogleButton label="Sign up with Google" />
      <OrDivider />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <div className="alert-error" role="alert">{error}</div>}

        {FIELDS.map((field, i) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="label">{field.label}</label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              value={formData[field.name]}
              onChange={handleChange}
              className="input py-2.5"
              autoFocus={i === 0}
            />
          </div>
        ))}

        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.password}
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
          <p className="help">At least 6 characters.</p>
        </div>

        <button type="submit" disabled={loading || incomplete} className="btn btn-primary w-full py-2.5">
          {loading ? (
            <>
              <span className="spinner h-4 w-4" />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>

        <p className="text-center text-xs text-subtle">
          We'll email you a link to verify your address before you can log in.
        </p>
      </form>
    </AuthLayout>
  );
}
