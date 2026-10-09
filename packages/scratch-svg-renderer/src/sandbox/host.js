/**
 * Whether the editor host can deliver sandbox scripts from emitted assets.
 * @returns {boolean} True when script URLs can be loaded by sandboxed frames.
 */
const usesUrlDelivery = () =>
    ['http:', 'https:', 'vscode-webview:'].includes(window.location.protocol);

module.exports = {usesUrlDelivery};
