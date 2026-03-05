import React from 'react';
import ReactDomClient from 'react-dom/client';

import LandingApp from './landing-app.jsx';

const appTarget = document.createElement('div');
document.body.appendChild(appTarget);

const root = ReactDomClient.createRoot(appTarget);
root.render(<LandingApp />);
