
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lightbulb, Users2, MessageCircle } from 'lucide-react';
import { GridScan } from '../components/GridScanLazy';
import useAuthStore from '../Store/authStore';

const VALUE_PROPS = [
    { icon: Lightbulb, title: 'Share ideas', text: 'Post a project and find people who want to build it.' },
    { icon: Users2, title: 'Form teams', text: 'Invite collaborators and manage join requests in one place.' },
    { icon: MessageCircle, title: 'Ship together', text: 'Chat with your team and keep the work moving.' },
];

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuthStore();

    useEffect(() => {
        if (!loading && user) {
            navigate('/home');
        }
    }, [user, loading, navigate]);

    if (loading) return null; // Or a loader

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-bg font-sans">
            {/* Background grid, kept calm so the content leads */}
            <div className="absolute inset-0 z-0">
                <GridScan
                    sensitivity={0.55}
                    lineThickness={1}
                    linesColor="#1c2333"
                    gridScale={0.1}
                    scanColor="#1d4ed8"
                    scanOpacity={0.25}
                    enablePost={true}
                    bloomIntensity={0.15}
                    chromaticAberration={0}
                    noiseIntensity={0.005}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {/* Vignette keeps text readable over the grid */}
            <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{ background: 'radial-gradient(ellipse at center, rgb(0 0 0 / 0.85) 0%, rgb(0 0 0 / 0.6) 45%, rgb(0 0 0 / 0.2) 100%)' }}
            />

            {/* Content */}
            <div className="pointer-events-none relative z-10 flex min-h-screen w-full flex-col">
                <nav className="pointer-events-auto mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 md:px-8 md:py-6">
                    <span className="text-xl font-semibold tracking-tight text-fg">InnoMate</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/login')} className="btn btn-ghost">
                            Log in
                        </button>
                        <button onClick={() => navigate('/register')} className="btn btn-primary">
                            Sign up
                        </button>
                    </div>
                </nav>

                <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 md:px-8">
                    <div className="pointer-events-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl md:text-6xl">
                            Build the future, together
                        </h1>
                        <p className="mx-auto mt-5 max-w-xl text-base text-muted md:text-lg">
                            InnoMate connects people with ideas to the developers and creators who can help build them.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <button onClick={() => navigate('/register')} className="btn btn-primary w-full px-5 py-2.5 sm:w-auto">
                                Get started
                                <ArrowRight className="h-4 w-4" strokeWidth={2} />
                            </button>
                            <button onClick={() => navigate('/login')} className="btn btn-outline w-full bg-bg/60 px-5 py-2.5 sm:w-auto">
                                I have an account
                            </button>
                        </div>
                    </div>

                    <div className="pointer-events-auto mt-16 grid w-full max-w-4xl gap-8 sm:grid-cols-3 md:mt-20">
                        {VALUE_PROPS.map(({ icon, title, text }) => {
                            const Icon = icon;
                            return (
                                <div key={title} className="text-center sm:text-left">
                                    <Icon className="mx-auto h-5 w-5 text-fg sm:mx-0" strokeWidth={1.8} />
                                    <h2 className="mt-3 text-sm font-semibold text-fg">{title}</h2>
                                    <p className="mt-1 text-sm text-muted">{text}</p>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LandingPage;
