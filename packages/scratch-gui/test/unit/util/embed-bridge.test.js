import {
    VERSION,
    send,
    sendReady,
    sendChange,
    sendSaved,
    sendError,
    onMessage,
    base64ToArrayBuffer,
    arrayBufferToBase64
} from '../../../src/lib/embed-bridge.js';

/**
 * Dispatch a `message` event as if it came from the parent window.
 * @param {object} data - message payload.
 * @param {string} origin - claimed message origin.
 * @param {Window} source - claimed message source.
 * @returns {void}
 */
const dispatchHostMessage = (data, origin, source) => window.dispatchEvent(
    new MessageEvent('message', {data, origin, source})
);

const SAME_ORIGIN = window.location.origin;
const ORIGIN_A = 'https://a.example';
const ORIGIN_B = 'https://b.example';

let postMessageSpy;

beforeEach(() => {
    postMessageSpy = jest.spyOn(window.parent, 'postMessage');
});

afterEach(() => {
    postMessageSpy.mockRestore();
    window.history.replaceState(null, '', window.location.pathname);
});

describe('base64 helpers', () => {
    test('arrayBufferToBase64/base64ToArrayBuffer round-trip', () => {
        const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255]);
        const base64 = arrayBufferToBase64(bytes.buffer);
        const decoded = new Uint8Array(base64ToArrayBuffer(base64));
        expect(Array.from(decoded)).toEqual(Array.from(bytes));
    });

    test('base64ToArrayBuffer decodes to the expected bytes', () => {
        // "AAECAwQ=" is base64 for 00 01 02 03 04
        expect(Array.from(new Uint8Array(base64ToArrayBuffer('AAECAwQ='))))
            .toEqual([0, 1, 2, 3, 4]);
    });
});

describe('send helpers', () => {
    test('sendReady includes the package version and entry', () => {
        sendReady('editor');
        expect(postMessageSpy).toHaveBeenCalledWith(
            {type: 'ready', version: VERSION, entry: 'editor'},
            SAME_ORIGIN
        );
        expect(VERSION).toMatch(/^\d+\.\d+\.\d+/);
    });

    test('sendChange and sendSaved serialize content and encoding', () => {
        sendChange('Y2hhbmdl', 'base64');
        sendSaved('c2F2ZWQ=', 'base64');
        expect(postMessageSpy).toHaveBeenNthCalledWith(
            1, {type: 'change', content: 'Y2hhbmdl', encoding: 'base64'}, SAME_ORIGIN
        );
        expect(postMessageSpy).toHaveBeenNthCalledWith(
            2, {type: 'saved', content: 'c2F2ZWQ=', encoding: 'base64'}, SAME_ORIGIN
        );
    });

    test('sendError serializes the message', () => {
        sendError('broken project');
        expect(postMessageSpy).toHaveBeenCalledWith(
            {type: 'error', message: 'broken project'},
            SAME_ORIGIN
        );
    });

    test('send uses the single allowlisted origin as target', () => {
        window.history.replaceState(null, '', `${window.location.pathname}?embedOrigin=${ORIGIN_A}`);
        send({type: 'ready'});
        expect(postMessageSpy).toHaveBeenCalledWith({type: 'ready'}, ORIGIN_A);
    });
});

describe('message allowlist', () => {
    test('accepts same-origin messages from the parent', () => {
        const handler = jest.fn();
        const unsubscribe = onMessage(handler);
        dispatchHostMessage({type: 'load'}, SAME_ORIGIN, window.parent);
        expect(handler).toHaveBeenCalledWith({type: 'load'});
        unsubscribe();
    });

    test('rejects messages whose source is not the parent', () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        const handler = jest.fn();
        const unsubscribe = onMessage(handler);
        dispatchHostMessage({type: 'load'}, SAME_ORIGIN, null);
        dispatchHostMessage({type: 'load'}, SAME_ORIGIN, iframe.contentWindow);
        expect(handler).not.toHaveBeenCalled();
        unsubscribe();
        document.body.removeChild(iframe);
    });

    test('rejects foreign origins by default', () => {
        const handler = jest.fn();
        const unsubscribe = onMessage(handler);
        dispatchHostMessage({type: 'load'}, ORIGIN_A, window.parent);
        expect(handler).not.toHaveBeenCalled();
        unsubscribe();
    });

    test('accepts allowlisted origins and rejects other foreign origins', () => {
        window.history.replaceState(
            null, '', `${window.location.pathname}?embedOrigin=${ORIGIN_A},${ORIGIN_B}`);
        const handler = jest.fn();
        const unsubscribe = onMessage(handler);
        dispatchHostMessage({type: 'load'}, ORIGIN_A, window.parent);
        dispatchHostMessage({type: 'update'}, ORIGIN_B, window.parent);
        dispatchHostMessage({type: 'save'}, 'https://c.example', window.parent);
        expect(handler).toHaveBeenCalledTimes(2);
        expect(handler).toHaveBeenNthCalledWith(1, {type: 'load'});
        expect(handler).toHaveBeenNthCalledWith(2, {type: 'update'});
        unsubscribe();
    });

    test('send targets the origin learned from an accepted message', () => {
        window.history.replaceState(null, '', `${window.location.pathname}?embedOrigin=${ORIGIN_A}`);
        const unsubscribe = onMessage(() => {});
        dispatchHostMessage({type: 'load', content: 'e30='}, ORIGIN_A, window.parent);
        sendChange('e30=', 'base64');
        expect(postMessageSpy).toHaveBeenLastCalledWith(
            {type: 'change', content: 'e30=', encoding: 'base64'},
            ORIGIN_A
        );
        unsubscribe();
    });

    test('unsubscribe stops delivering messages', () => {
        const handler = jest.fn();
        const unsubscribe = onMessage(handler);
        dispatchHostMessage({type: 'save'}, SAME_ORIGIN, window.parent);
        expect(handler).toHaveBeenCalledTimes(1);
        unsubscribe();
        dispatchHostMessage({type: 'save'}, SAME_ORIGIN, window.parent);
        expect(handler).toHaveBeenCalledTimes(1);
    });
});
