/**
 * Message bridge between the embedded bundle entries (embed-editor.html,
 * embed-generator.html) and the host page framing them.
 *
 * All messages travel over `window.parent.postMessage` with an explicit target
 * origin. Incoming messages are accepted only when they come from the frame's
 * parent (`event.source === window.parent`) and from an allowed origin:
 * by default the bundle's own origin (same-origin embedding), plus any origins
 * listed in the `?embedOrigin=` query parameter, e.g.
 * `embed-editor.html?embedOrigin=https://a.example,https://b.example`.
 *
 * Inside a VS Code webview (`acquireVsCodeApi` present) messages are routed
 * through the VS Code API instead, and the host is implicitly trusted.
 */

import packageInfo from '../../package.json';

const ALLOWED_ORIGIN_PARAM = 'embedOrigin';

export const VERSION = packageInfo.version;

let vscodeApi = null;
let parentOrigin = null; // origin of the last accepted host message

const getVsCodeApi = () => {
    if (vscodeApi === null && typeof acquireVsCodeApi === 'function') {
        try {
            vscodeApi = acquireVsCodeApi(); // eslint-disable-line no-undef
        } catch {
            // not actually running inside a VS Code webview
            vscodeApi = false;
        }
    }
    return vscodeApi || null;
};

const getAllowedOrigins = () => {
    const raw = new URLSearchParams(window.location.search).get(ALLOWED_ORIGIN_PARAM);
    if (!raw) {
        return [];
    }
    return raw.split(',')
        .map(origin => origin.trim())
        .filter(origin => /^https?:\/\/[^/]+$/.test(origin));
};

const isAllowedOrigin = origin =>
    origin === window.location.origin || getAllowedOrigins().includes(origin);

// Origin to use as postMessage target before the host has talked to us:
// an unambiguous allowlist entry, the (allowed) referrer of the embedding
// page, or the bundle's own origin for same-origin embedding.
const resolveTargetOrigin = () => {
    if (parentOrigin) {
        return parentOrigin;
    }
    const allowed = getAllowedOrigins();
    if (allowed.length === 1) {
        return allowed[0];
    }
    if (document.referrer) {
        try {
            const referrerOrigin = new URL(document.referrer).origin;
            if (isAllowedOrigin(referrerOrigin)) {
                return referrerOrigin;
            }
        } catch {
            // ignore malformed referrer
        }
    }
    return window.location.origin;
};

/**
 * Send a message to the host. Uses the VS Code API when available,
 * `window.parent.postMessage` otherwise.
 * @param {object} message - the message to send.
 */
export const send = message => {
    const api = getVsCodeApi();
    if (api) {
        api.postMessage(message);
        return;
    }
    window.parent.postMessage(message, resolveTargetOrigin());
};

/**
 * Register a handler for messages from the host. Only messages from the
 * parent window with an allowed origin are forwarded.
 * @param {function(object)} handler - called with each accepted message.
 * @returns {function()} unsubscribe function.
 */
export const onMessage = handler => {
    const listener = event => {
        if (getVsCodeApi()) {
            // inside VS Code the host is the extension, which is trusted
            handler(event.data);
            return;
        }
        if (event.source !== window.parent || !isAllowedOrigin(event.origin)) {
            return;
        }
        parentOrigin = event.origin;
        handler(event.data);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
};

/**
 * Tell the host the bundle is up and ready to receive `load`.
 * @param {string} entry - which entry is reporting ready: "editor" or "generator".
 */
export const sendReady = entry => {
    send({type: 'ready', version: VERSION, entry});
};

/**
 * Report a debounced document edit to the host.
 * @param {string} content - the edited document.
 * @param {string} encoding - "base64" for sb3 bytes, "utf8" for project-file JSON.
 */
export const sendChange = (content, encoding) => {
    send({type: 'change', content, encoding});
};

/**
 * Answer a host `save` request with a freshly serialized document.
 * @param {string} content - the serialized document.
 * @param {string} encoding - "base64" for sb3 bytes, "utf8" for project-file JSON.
 */
export const sendSaved = (content, encoding) => {
    send({type: 'saved', content, encoding});
};

/**
 * Report an error to the host (e.g. an undecodable project).
 * @param {string} message - human-readable error description.
 */
export const sendError = message => {
    send({type: 'error', message});
};

/**
 * Convert a base64 string to an ArrayBuffer.
 * @param {string} base64 - the base64 string.
 * @returns {ArrayBuffer} the decoded bytes.
 */
export const base64ToArrayBuffer = base64 => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

/**
 * Convert an ArrayBuffer to a base64 string.
 * @param {ArrayBuffer} buffer - the bytes to encode.
 * @returns {string} the base64 string.
 */
export const arrayBufferToBase64 = buffer => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};
