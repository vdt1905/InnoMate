import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../Store/authStore';
import AuthLayout from '../components/AuthLayout';
import React from 'react';
export default function FinishSignup() {
    const navigate = useNavigate();
    const { completeLoginWithLink, user, error: storeError } = useAuthStore();
    const [status, setStatus] = useState('Verifying link...');
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Check if user is already logged in
        if (user) {
            navigate('/home');
            return;
        }

        const processLink = async () => {
            const { auth } = await import('../firebase');
            const { isSignInWithEmailLink } = await import('firebase/auth');

            if (isSignInWithEmailLink(auth, window.location.href)) {
                let emailForSignIn = window.localStorage.getItem('emailForSignIn');

                if (!emailForSignIn) {
                    // If opened on another device, ask for email
                    emailForSignIn = window.prompt('Please provide your email for confirmation');
                }

                setEmail(emailForSignIn);
                setStatus('Completing sign in...');

                const success = await completeLoginWithLink(emailForSignIn, window.location.href);
                if (success) {
                    window.localStorage.removeItem('emailForSignIn');
                    navigate('/home');
                } else {
                    setStatus('Verification failed. Please try again.');
                }
            } else {
                setStatus('Invalid link.');
                navigate('/login');
            }
        };

        processLink();
    }, [completeLoginWithLink, navigate, user]);

    const working = status === 'Verifying link...' || status === 'Completing sign in...';

    return (
        <AuthLayout>
            <div className="text-center">
                {working && <span className="spinner mx-auto mb-4 block h-8 w-8" />}
                <h1 className="text-lg font-semibold text-fg">{status}</h1>
                {email && <p className="mt-1 text-sm text-muted">Signing in as {email}</p>}
                {storeError && <p className="alert-error mt-4">{storeError}</p>}
            </div>
        </AuthLayout>
    );
}
