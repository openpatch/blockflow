// @ts-check
const fs = require('fs');
const http = require('http');
const path = require('path');

const {test, expect} = require('@playwright/test');

const bundleDir = path.resolve(__dirname, '..', '..', 'build-embedded');
const exampleSb3 = path.resolve(__dirname, '..', '..', 'example', 'Scratch-Projekt.sb3');
const packageVersion = require('../../package.json').version;

if (!fs.existsSync(path.join(bundleDir, 'embed-editor.html'))) {
    throw new Error('build-embedded/embed-editor.html not found; run `npm run build:embedded` first');
}

const MIME_TYPES = {
    '.css': 'text/css',
    '.gif': 'image/gif',
    '.hex': 'text/plain',
    '.html': 'text/html',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.mp3': 'audio/mpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain',
    '.wasm': 'application/wasm',
    '.wav': 'audio/wav',
    '.webm': 'video/webm',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

/**
 * Host page that frames an embed entry and records every message it sends.
 * Exposes window.__messages (received messages) and window.__post(message).
 * @param {string} entry - the embed entry html file to frame.
 * @returns {string} the host page HTML.
 */
const hostPage = entry => `<!DOCTYPE html>
<html>
<body>
<script>
    const frame = document.createElement('iframe');
    frame.id = 'embed';
    frame.style.cssText = 'width: 800px; height: 600px; border: 0';
    frame.src = ${JSON.stringify(entry)};
    window.__messages = [];
    window.addEventListener('message', event => {
        if (event.source === frame.contentWindow) window.__messages.push(event.data);
    });
    window.__post = message => frame.contentWindow.postMessage(message, window.location.origin);
    document.body.appendChild(frame);
</script>
</body>
</html>`;

let server;
let serverUrl;

const serveFile = (res, filePath) => {
    res.setHeader('Content-Type', MIME_TYPES[path.extname(filePath)] || 'application/octet-stream');
    fs.createReadStream(filePath)
        .on('error', () => {
            res.statusCode = 404;
            res.end('not found');
        })
        .pipe(res);
};

test.beforeAll(async () => {
    server = http.createServer((req, res) => {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname === '/__host__') {
            res.setHeader('Content-Type', 'text/html');
            res.end(hostPage(url.searchParams.get('entry') || 'embed-editor.html'));
            return;
        }
        if (url.pathname === '/example.sb3') {
            serveFile(res, exampleSb3);
            return;
        }
        const filePath = path.join(bundleDir, path.normalize(url.pathname));
        if (!filePath.startsWith(bundleDir)) {
            res.statusCode = 403;
            res.end('forbidden');
            return;
        }
        serveFile(res, filePath);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    serverUrl = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
    if (server) {
        await new Promise(resolve => server.close(resolve));
    }
});

/**
 * Wait for a message of the given type from the embed frame.
 * @param {import('@playwright/test').Page} page - the host page.
 * @param {string} type - the message type to wait for.
 * @returns {Promise<object>} the first message of that type.
 */
const waitForMessage = async (page, type) => {
    await expect.poll(
        () => page.evaluate(t => window.__messages.some(m => m.type === t), type),
        {timeout: 30000}
    ).toBe(true);
    return page.evaluate(t => window.__messages.find(m => m.type === t), type);
};

test('embed-editor.html: ready, load, change, and save a .sb3 project', async ({page}) => {
    test.setTimeout(180000); // booting the editor bundle is slow
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto(`${serverUrl}/__host__?entry=embed-editor.html`);

    const ready = await waitForMessage(page, 'ready');
    expect(ready).toEqual({type: 'ready', version: packageVersion, entry: 'editor'});

    // load the example project (base64 .sb3 bytes)
    const sb3Base64 = fs.readFileSync(exampleSb3).toString('base64');
    await page.evaluate(
        content => window.__post({type: 'load', content, encoding: 'base64'}),
        sb3Base64
    );

    // wait for the project to load: the example contains a "Bat" sprite
    // (the default project would only have "Cat")
    // the host URL ends with "?entry=embed-editor.html", so match the path exactly
    const embedFrame = page.frame({url: /\/[a-z-]*editor\.html$/});
    await expect.poll(
        () => embedFrame.evaluate(() =>
            window.vm && window.vm.runtime.targets.some(target => target.getName() === 'Bat')),
        {timeout: 30000}
    ).toBe(true);
    // the change listener is attached right after the load resolves
    await page.waitForTimeout(500);

    // a scripted edit triggers the debounced change notification
    await embedFrame.evaluate(() => window.vm.emit('PROJECT_CHANGED'));
    const change = await waitForMessage(page, 'change');
    expect(change.encoding).toBe('base64');
    // the serialized project is a zip file
    const changeBytes = Buffer.from(change.content, 'base64');
    expect(changeBytes.subarray(0, 2).toString('latin1')).toBe('PK');

    // save answers immediately with a freshly serialized project
    await page.evaluate(() => window.__post({type: 'save'}));
    const saved = await waitForMessage(page, 'saved');
    expect(saved.encoding).toBe('base64');
    const savedBytes = Buffer.from(saved.content, 'base64');
    expect(savedBytes.subarray(0, 2).toString('latin1')).toBe('PK');

    expect(pageErrors).toEqual([]);
});

test('embed-generator.html: ready, load, change, and save a project file', async ({page}) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto(`${serverUrl}/__host__?entry=embed-generator.html`);

    const ready = await waitForMessage(page, 'ready');
    expect(ready).toEqual({type: 'ready', version: packageVersion, entry: 'generator'});

    // load a project file (utf8 JSON)
    await page.evaluate(
        content => window.__post({type: 'load', content, encoding: 'utf8'}),
        JSON.stringify({title: 'T', steps: [{title: 'a'}]})
    );

    // the loaded title appears in the wizard's General panel
    const titleInput = page.frameLocator('#embed').getByPlaceholder('Project title');
    await expect(titleInput).toHaveValue('T');

    // an edit in the UI triggers a change notification with the new document
    await titleInput.fill('T2');
    const change = await waitForMessage(page, 'change');
    expect(change.encoding).toBe('utf8');
    expect(JSON.parse(change.content).title).toBe('T2');

    // save answers with a freshly serialized document
    await page.evaluate(() => window.__post({type: 'save'}));
    const saved = await waitForMessage(page, 'saved');
    expect(saved.encoding).toBe('utf8');
    expect(JSON.parse(saved.content).title).toBe('T2');

    expect(pageErrors).toEqual([]);
});

test('embed-generator.html: invalid JSON is reported as an error', async ({page}) => {
    await page.goto(`${serverUrl}/__host__?entry=embed-generator.html`);
    await waitForMessage(page, 'ready');

    await page.evaluate(
        content => window.__post({type: 'load', content, encoding: 'utf8'}),
        '{"title": "T"'
    );
    const error = await waitForMessage(page, 'error');
    expect(error.message).toContain('Invalid project file JSON');
});
