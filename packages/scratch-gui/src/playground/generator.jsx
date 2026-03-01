import React from 'react';
import ReactDomClient from 'react-dom/client';

import GeneratorApp from './generator-app.jsx';

const appTarget = document.createElement('div');
appTarget.id = 'generator-root';
document.body.appendChild(appTarget);

const root = ReactDomClient.createRoot(appTarget);
root.render(<GeneratorApp />);
