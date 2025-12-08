import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CanvasPage } from './pages/CanvasPage';
import { BuilderPage } from './pages/BuilderPage';
import { PreviewPage } from './pages/PreviewPage';

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

