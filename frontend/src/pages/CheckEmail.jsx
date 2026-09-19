import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

export default function CheckEmail() {
  return (
    <AuthLayout>
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface-2">
          <Mail className="h-6 w-6 text-fg" strokeWidth={1.8} />
        </span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-fg">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          We've sent a verification link to your email address. Open it to activate your account, then log in.
        </p>
        <p className="mt-4 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-left text-xs text-muted">
          Can't find it? Check your spam or junk folder — the email comes from Firebase.
        </p>
        <Link to="/login" className="btn btn-primary mt-6 w-full py-2.5">
          Back to log in
        </Link>
      </div>
    </AuthLayout>
  );
}
