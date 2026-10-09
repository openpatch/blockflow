const fs = require('fs');
const path = require('path');
const vm = require('vm');

test('browser workers load beside a bundle served under a nested path', () => {
    const bundleUrl = 'https://example.com/course/__hyperbook_assets/directive-blockflow/shared.js';
    const workers = [];
    const context = {
        self: {},
        URL,
        Headers,
        fetch: jest.fn(),
        document: {
            baseURI: 'https://example.com/course/lessons/index.html',
            currentScript: {tagName: 'SCRIPT', src: bundleUrl}
        },
        Worker: class {
            constructor (url) {
                workers.push(String(url));
            }
            addEventListener () {}
        }
    };
    const source = fs.readFileSync(path.join(__dirname, '../../dist/web/scratch-storage.js'), 'utf8');
    vm.runInNewContext(source, context);
    const storage = new context.self.ScratchStorage.ScratchStorage();
    expect(storage.webHelper).toBeDefined();
    expect(workers.length).toBeGreaterThan(0);
    for (const worker of workers) {
        expect(worker).toMatch(
            /^https:\/\/example.com\/course\/__hyperbook_assets\/directive-blockflow\/chunks\/fetch-worker\./
        );
    }
});
