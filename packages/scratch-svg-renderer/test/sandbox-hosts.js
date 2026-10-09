const test = require('tap').test;
const {usesUrlDelivery} = require('../src/sandbox/host');

test('sandbox script delivery for editor hosts', t => {
    const originalWindow = global.window;
    t.after(() => {
        global.window = originalWindow;
    });

    for (const protocol of ['http:', 'https:', 'vscode-webview:']) {
        global.window = {location: {protocol}};
        t.equal(usesUrlDelivery(), true, `${protocol} delivers scripts from emitted assets`);
    }
    global.window = {location: {protocol: 'file:'}};
    t.equal(usesUrlDelivery(), false, 'local files deliver scripts inline');
    t.end();
});
