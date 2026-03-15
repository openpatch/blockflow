/**
 * VS Code bridge for webview communication.
 * Provides helpers for sending/receiving messages between
 * the webview and the VS Code extension host.
 */

let vscodeApi;

export function getVsCodeApi () {
    if (!vscodeApi) {
        // eslint-disable-next-line no-undef
        vscodeApi = acquireVsCodeApi();
    }
    return vscodeApi;
}

export function postMessage (message) {
    getVsCodeApi().postMessage(message);
}

export function onMessage (handler) {
    const listener = event => {
        handler(event.data);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
}

export function sendReady () {
    postMessage({type: 'ready'});
}

export function sendEdit (content) {
    postMessage({type: 'edit', content});
}

export function sendMessage (message) {
    postMessage(message);
}
