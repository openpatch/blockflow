/**
 * Entry for embed-generator.html: the blockflow project-file generator
 * talking to a host page through the message protocol in
 * src/lib/embed-bridge.js.
 *
 * The app is not rendered until the first `load` arrives. Each `load`/`update`
 * remounts GeneratorApp with the document as `initialProjectFile`.
 */

import React from 'react';
import ReactDomClient from 'react-dom/client';

import GeneratorApp from './generator-app.jsx';

import {sendReady, sendChange, sendSaved, sendError, send, onMessage} from '../lib/embed-bridge.js';

document.body.style.margin = '0';
document.body.style.padding = '0';

let appTarget = document.getElementById('root');
if (!appTarget) {
    appTarget = document.createElement('div');
    appTarget.id = 'root';
    document.body.appendChild(appTarget);
}

let root = null;
let generator = null;
let lastSentContent = null;
let syncLastSentOnMount = false;

/**
 * Report an edit to the host, skipping content identical to what was last
 * sent (or loaded) so echo loops are avoided.
 * @param {object} projectJSON - the current project file.
 */
const handleProjectFileChange = projectJSON => {
    const content = JSON.stringify(projectJSON, null, 2);
    if (content === lastSentContent) return;
    lastSentContent = content;
    sendChange(content, 'utf8');
};

/**
 * Forward the generator's preview request so a host may show the encoded
 * project in a nested editor.html?project= player.
 * @param {string} encodedPakoUrl - pako-compressed, base64-encoded project file.
 */
const handlePreview = encodedPakoUrl => {
    send({type: 'preview', url: encodedPakoUrl});
};

// Class component: the ref is the instance, which provides getJSONString()
const setGeneratorRef = app => {
    generator = app;
    // After mounting a loaded document, treat its serialized form as "sent"
    // so an unchanged document is not echoed back to the host
    if (app && syncLastSentOnMount) {
        lastSentContent = app.getJSONString();
        syncLastSentOnMount = false;
    }
};

const renderApp = projectFile => {
    if (root) root.unmount();
    syncLastSentOnMount = true;
    root = ReactDomClient.createRoot(appTarget);
    root.render(
        <GeneratorApp
            ref={setGeneratorRef}
            embedded
            initialProjectFile={projectFile}
            onProjectFileChange={handleProjectFileChange}
            onPreview={handlePreview}
        />
    );
};

onMessage(message => {
    if (!message || typeof message.type !== 'string') return;
    switch (message.type) {
    case 'load':
    case 'update':
        if (!message.content) {
            renderApp({});
            break;
        }
        try {
            renderApp(JSON.parse(message.content));
        } catch (err) {
            sendError(`Invalid project file JSON: ${err.message}`);
        }
        break;
    case 'save':
        if (!generator) {
            sendError('Cannot save: no project loaded');
            break;
        }
        lastSentContent = generator.getJSONString();
        sendSaved(lastSentContent, 'utf8');
        break;
    default:
        // ignore unknown message types
    }
});

// tell the host we're up; it should answer with `load`
sendReady('generator');
