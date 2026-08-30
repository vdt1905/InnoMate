// src/components/GridScanLazy.jsx
// GridScan pulls in three.js + postprocessing (~600 kB). It is a decorative
// background, so it is fetched after the page itself has rendered rather than
// blocking the first paint. Same props as the real component.
import React, { Suspense, lazy } from 'react';

const GridScanImpl = lazy(() =>
    import('./GridScan').then((m) => ({ default: m.GridScan }))
);

export const GridScan = (props) => (
    <Suspense fallback={null}>
        <GridScanImpl {...props} />
    </Suspense>
);

export default GridScan;
