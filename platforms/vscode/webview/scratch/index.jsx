import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';

import GUI from '../../../../packages/scratch-gui/src/containers/gui.jsx';
import {AppStateProviderHOC} from '../../../../packages/scratch-gui/src/lib/app-state-provider-hoc.jsx';
import {EditorState} from '../../../../packages/scratch-gui/src/lib/editor-state';
import HashParserHOC from '../../../../packages/scratch-gui/src/lib/hash-parser-hoc.jsx';

import {sendReady, sendEdit, onMessage, base64ToArrayBuffer, arrayBufferToBase64} from './vscode-bridge.js';

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
            // After render, wait for VM to be available
            waitForVM();
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

// Listen for messages from the extension
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

// Initialize the editor and tell the extension we're ready
initEditor();
sendReady();
