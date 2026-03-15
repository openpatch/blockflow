import React from 'react';
import ReactDomClient from 'react-dom/client';

import GeneratorApp from '../../../../packages/scratch-gui/src/playground/generator-app.jsx';
import {sendReady, sendEdit, onMessage} from './vscode-bridge.js';

let root = null;
let currentProjectFile = null;

function renderApp (projectFile) {
    const appTarget = document.getElementById('root');
    if (!appTarget) return;

    // Unmount previous instance if re-rendering with new content
    if (root) {
        root.unmount();
    }

    root = ReactDomClient.createRoot(appTarget);
    root.render(
        <GeneratorApp
            initialProjectFile={projectFile}
            onProjectFileChange={handleProjectFileChange}
        />
    );
}

function handleProjectFileChange (projectJSON) {
    const content = JSON.stringify(projectJSON, null, 2);
    // Avoid sending duplicate edits
    const currentContent = JSON.stringify(currentProjectFile, null, 2);
    if (content !== currentContent) {
        currentProjectFile = projectJSON;
        sendEdit(content);
    }
}

// Listen for messages from the extension
onMessage(message => {
    switch (message.type) {
    case 'load':
    case 'update': {
        try {
            currentProjectFile = JSON.parse(message.content || '{}');
        } catch (_) {
            currentProjectFile = {};
        }
        renderApp(currentProjectFile);
        break;
    }
    }
});

// Tell the extension we're ready
sendReady();
