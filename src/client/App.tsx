import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { CanvasPage } from '@/client/pages/CanvasPage';
import { BuilderPage } from '@/client/pages/BuilderPage';
import { PreviewPage } from '@/client/pages/PreviewPage';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CanvasPage />} />
        <Route path="/builder/:formId" element={<BuilderPage />} />
        <Route path="/preview/:formId" element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

