import React from 'react';
import { Link } from 'react-router-dom';
import { GridScan } from './GridScanLazy';

// Shared frame for the signed-out screens (log in, sign up, email checks):
// the landing page's grid behind a single centred card.
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
    <div className="absolute inset-0">
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
    {/* Keeps the form readable over the moving grid. */}
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: 'radial-gradient(ellipse at center, rgb(5 7 11 / 0.9) 0%, rgb(5 7 11 / 0.65) 45%, rgb(5 7 11 / 0.25) 100%)' }}
    />

    <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center px-6 py-5">
      <Link to="/" className="text-xl font-semibold tracking-tight text-fg">InnoMate</Link>
    </header>

    <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
      <div className="w-full max-w-[400px]">
        <div className="card p-6 shadow-2xl shadow-black/40 sm:p-8">
          {title && (
            <div className="mb-6 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-fg">{title}</h1>
              {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
        {footer && <div className="card mt-3 p-4 text-center text-sm text-muted">{footer}</div>}
      </div>
    </main>
  </div>
);

export default AuthLayout;
