import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, AlertTriangle } from 'lucide-react';

export default function CheckEmail() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4">
            {/* Background Ambience */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-cyan-900/20 opacity-50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-96 h-96 border border-purple-500/5 rounded-full animate-pulse"></div>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 rounded-2xl blur-xl"></div>

                <div className="relative bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 text-center">

                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
                            <Mail className="w-10 h-10 text-purple-400" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                        Verify Your Email
                    </h1>

                    <p className="text-gray-300 mb-6 text-lg">
                        We've sent a verification link to your email address.
                    </p>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8 text-left">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-200/90">
                                <p className="font-semibold mb-1">Don't see it?</p>
                                <p>Please check your <strong>Spam</strong> or <strong>Junk</strong> folder. Sometimes the magic gets lost there!</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-white/5 border border-white/10 text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                        <span>Back to Login</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
