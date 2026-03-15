import React from 'react';
import ReactDOM from 'react-dom';

import GUI from '../../../../packages/scratch-gui/src/containers/gui.jsx';
import {AppStateProviderHOC} from '../../../../packages/scratch-gui/src/lib/app-state-provider-hoc.jsx';
import {EditorState} from '../../../../packages/scratch-gui/src/lib/editor-state';

import {isInVsCode, sendReady, sendEdit, onMessage, base64ToArrayBuffer, arrayBufferToBase64} from './vscode-bridge.js';

// Safety-wrap history.pushState/replaceState: VS Code webviews may block
// cross-origin state changes that non-essential scratch-gui routing attempts.
const _origPushState = history.pushState.bind(history);
const _origReplaceState = history.replaceState.bind(history);
history.pushState = (...args) => {
    try { _origPushState(...args); } catch (_) { /* ignore in webview */ }
};
history.replaceState = (...args) => {
    try { _origReplaceState(...args); } catch (_) { /* ignore in webview */ }
};

// Detect preview mode: data injected by extension host for blockflow preview
const previewProjectData = window.__WEBVIEW_DATA__?.previewProjectData || null;
const isPreviewMode = previewProjectData !== null ||
    new URLSearchParams(window.location.search).has('project');

// If preview data is injected, set it as a global for ProjectFileHOC
if (previewProjectData) {
    window.__PREVIEW_PROJECT_DATA__ = previewProjectData;
}

// Base path for static assets (blocks-media, etc.)
const basePath = window.__WEBVIEW_BASE_PATH__ || './';

let editorState = null;
let vm = null;
let saveTimeout = null;
let isInitialLoad = true;

const SAVE_DEBOUNCE_MS = 1000;

function initEditor () {
    const container = document.getElementById('root');
    if (!container) return;

    editorState = new EditorState({});

    // Use the default GUI export which includes the full HOC chain:
    // LocalizationHOC → ErrorBoundary → FontLoader → QueryParser →
    // ProjectFileHOC → ProjectFetcher → Titled → ProjectSaver →
    // vmListener → vmManager → SBFileUploader → cloudManager → systemPreferences
    const WrappedGui = AppStateProviderHOC(GUI);

    GUI.setAppElement(container);

    ReactDOM.render(
        <WrappedGui
            appState={editorState}
            basePath={basePath}
            canEditTitle
            canSave={false}
        />,
        container
    );
}

function waitForVM (callback) {
    const check = () => {
        if (window.vm) {
            vm = window.vm;
            callback();
            return;
        }
        setTimeout(check, 100);
    };
    check();
}

function setupProjectChangeListener () {
    if (!vm) return;

    // Listen for project changes to send edits back to the extension
    vm.on('PROJECT_CHANGED', () => {
        debouncedSave();
    });
}

function debouncedSave () {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
        if (!vm) return;
        vm.saveProjectSb3().then(blob => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = arrayBufferToBase64(reader.result);
                sendEdit(base64);
            };
            reader.readAsArrayBuffer(blob);
        });
    }, SAVE_DEBOUNCE_MS);
}

function loadProject (base64Content) {
    const doLoad = () => {
        const buffer = base64ToArrayBuffer(base64Content);
        vm.loadProject(buffer)
            .then(() => {
                if (isInitialLoad) {
                    isInitialLoad = false;
                    // Only listen for changes after the real project loads,
                    // preventing the default Scratch cat from being saved back
                    setupProjectChangeListener();
                }
            })
            .catch(err => {
                console.error('Failed to load .sb3 project:', err);
            });
    };

    if (!vm) {
        waitForVM(doLoad);
    } else {
        doLoad();
    }
}

if (isPreviewMode) {
    // Preview mode: render the editor and let ProjectFileHOC handle loading
    initEditor();
} else if (isInVsCode()) {
    // VS Code editor mode: wait for file content before rendering
    // to avoid flashing the default Scratch cat project
    onMessage(message => {
        switch (message.type) {
        case 'load':
        case 'update':
            if (!editorState) {
                initEditor();
            }
            if (message.content) {
                loadProject(message.content);
            }
            break;
        }
    });

    sendReady();
}
