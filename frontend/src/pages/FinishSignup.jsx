import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../Store/authStore';
import { Loader2 } from 'lucide-react';
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

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="text-center">
                {status === 'Verifying link...' || status === 'Completing sign in...' ? (
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-500 mb-4" />
                ) : null}
                <h2 className="text-2xl font-bold mb-2">{status}</h2>
                {storeError && <p className="text-red-400">{storeError}</p>}
            </div>
        </div>
    );
}
