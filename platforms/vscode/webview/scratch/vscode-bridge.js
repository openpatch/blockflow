/**
 * VS Code bridge for scratch editor webview communication.
 * Handles binary .sb3 content via base64 encoding.
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

export function sendEdit (base64Content) {
    postMessage({type: 'edit', content: base64Content});
}

/**
 * Convert a base64 string to an ArrayBuffer.
 */
export function base64ToArrayBuffer (base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Convert an ArrayBuffer to a base64 string.
 */
export function arrayBufferToBase64 (buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
