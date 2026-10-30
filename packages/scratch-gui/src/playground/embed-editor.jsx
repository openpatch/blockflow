/**
 * Entry for embed-editor.html: the Scratch editor talking to a host page
 * through the message protocol in src/lib/embed-bridge.js.
 *
 * The GUI is not rendered until the first `load` arrives, so the default
 * project does not flash before the host's document is loaded. If no `load`
 * ever arrives (e.g. the page is opened standalone), a fallback timer
 * renders the editor with the default project.
 */

import React from 'react';
import ReactDomClient from 'react-dom/client';

import GUI from '../containers/gui.jsx';
import {AppStateProviderHOC} from '../lib/app-state-provider-hoc.jsx';
import {EditorState} from '../lib/editor-state';

import {
    sendReady,
    sendChange,
    sendSaved,
    sendError,
    onMessage,
    base64ToArrayBuffer,
    arrayBufferToBase64
} from '../lib/embed-bridge.js';

const CHANGE_DEBOUNCE_MS = 1000;
const LOAD_FALLBACK_MS = 30000;

let editorState = null;
let root = null;
let vm = null;
let changeTimeout = null;
let changeListenerAttached = false;

const initEditor = locale => {
    if (editorState) return;
    const container = document.createElement('div');
    document.body.appendChild(container);

    editorState = new EditorState(locale ? {locale} : {});
    const WrappedGui = AppStateProviderHOC(GUI);

    GUI.setAppElement(container);

    root = ReactDomClient.createRoot(container);
    root.render(
        <WrappedGui
            appState={editorState}
            projectId={null}
            canEditTitle
            canSave={false}
        />
    );
};

const waitForVm = callback => {
    const check = () => {
        if (window.vm) {
            vm = window.vm;
            callback();
            return;
        }
        setTimeout(check, 100);
    };
    check();
};

const serializeProject = () => vm.saveProjectSb3()
    .then(blob => blob.arrayBuffer())
    .then(arrayBufferToBase64);

// Debounced so bursts of edits produce one message, and with the change
// listener attached only after a project load, the load itself is not reported.
const handleChange = () => {
    if (!vm) return;
    serializeProject()
        .then(base64 => sendChange(base64, 'base64'))
        .catch(err => sendError(`Failed to serialize project: ${err.message}`));
};

const scheduleChange = () => {
    clearTimeout(changeTimeout);
    changeTimeout = setTimeout(handleChange, CHANGE_DEBOUNCE_MS);
};

const attachChangeListener = () => {
    if (changeListenerAttached || !vm) return;
    changeListenerAttached = true;
    vm.on('PROJECT_CHANGED', scheduleChange);
};

const loadProject = base64Content => {
    const doLoad = () => {
        // Promise.resolve so undecodable base64 is also reported as an error message
        Promise.resolve()
            .then(() => vm.loadProject(base64ToArrayBuffer(base64Content)))
            .then(attachChangeListener)
            .catch(err => sendError(`Failed to load project: ${err.message}`));
    };
    if (vm) {
        doLoad();
    } else {
        waitForVm(doLoad);
    }
};

const handleSave = () => {
    if (!vm) {
        sendError('Cannot save: no project loaded');
        return;
    }
    // serialize freshly so the answer reflects the current state, not a debounce
    serializeProject()
        .then(base64 => sendSaved(base64, 'base64'))
        .catch(err => sendError(`Failed to save project: ${err.message}`));
};

// Fallback: render with the default project if the host never sends `load`
const loadFallbackTimeout = setTimeout(() => {
    if (!editorState) initEditor();
}, LOAD_FALLBACK_MS);

onMessage(message => {
    if (!message || typeof message.type !== 'string') return;
    switch (message.type) {
    case 'load':
    case 'update':
        clearTimeout(loadFallbackTimeout);
        if (!editorState) initEditor(message.locale);
        if (message.content) {
            if (message.encoding && message.encoding !== 'base64') {
                sendError(`Unsupported encoding: ${message.encoding}`);
            } else {
                loadProject(message.content);
            }
        }
        break;
    case 'save':
        handleSave();
        break;
    default:
        // ignore unknown message types
    }
});

// tell the host we're up; it should answer with `load`
sendReady('editor');
