import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { PreviewPage } from '@/client/pages/PreviewPage';
import { HyperFormsPage } from '@/client/pages/HyperFormsPage';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HyperFormsPage />} />
        <Route path="/preview/:formId" element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
