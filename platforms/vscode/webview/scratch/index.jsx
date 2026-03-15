import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';

import GUI from '../../../../packages/scratch-gui/src/containers/gui.jsx';
import {AppStateProviderHOC} from '../../../../packages/scratch-gui/src/lib/app-state-provider-hoc.jsx';
import {EditorState} from '../../../../packages/scratch-gui/src/lib/editor-state';
import HashParserHOC from '../../../../packages/scratch-gui/src/lib/hash-parser-hoc.jsx';

import {isInVsCode, sendReady, sendEdit, onMessage, base64ToArrayBuffer, arrayBufferToBase64} from './vscode-bridge.js';

// Detect preview mode: loaded in an iframe with ?project= parameter
const isPreviewMode = new URLSearchParams(window.location.search).has('project');

let editorState = null;
let guiRoot = null;
let vm = null;
let saveTimeout = null;

const SAVE_DEBOUNCE_MS = 1000;

function initEditor () {
    const container = document.getElementById('root');
    if (!container) return;

    editorState = new EditorState({});

    const WrappedGui = compose(
        AppStateProviderHOC,
        HashParserHOC
    )(GUI);

    GUI.setAppElement(container);

    ReactDOM.render(
        <WrappedGui
            appState={editorState}
            canEditTitle
            canSave={false}
        />,
        container,
        () => {
            if (!isPreviewMode) {
                waitForVM();
            }
        }
    );
}

function waitForVM () {
    // The VM is exposed globally by vm-manager-hoc.jsx
    const check = () => {
        if (window.vm) {
            vm = window.vm;
            setupProjectChangeListener();
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
    if (!vm) {
        // VM not ready yet, wait and retry
        setTimeout(() => loadProject(base64Content), 200);
        return;
    }

    const buffer = base64ToArrayBuffer(base64Content);
    vm.loadProject(buffer)
        .then(() => {
            vm.start();
        })
        .catch(err => {
            console.error('Failed to load .sb3 project:', err);
        });
}

if (isPreviewMode) {
    // Preview mode: just render the editor and let ProjectFileHOC handle ?project=
    initEditor();
} else if (isInVsCode()) {
    // VS Code editor mode: use postMessage bridge
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

    initEditor();
    sendReady();
}
