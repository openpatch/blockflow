import {execFileSync} from 'node:child_process';
import {copyFile, readdir, rm, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const guiRoot = fileURLToPath(new URL('..', import.meta.url));
const repoRoot = path.resolve(guiRoot, '../..');
const bundleDir = path.join(guiRoot, 'build-embedded');
const releaseDir = path.join(repoRoot, 'dist', 'blockflow');
const archivePath = path.join(releaseDir, 'dist-embedded.zip');

// Worker and MediaPipe copies carry upstream source maps; the browser bundle ships without them.
const removeSourceMaps = async directory => {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            await removeSourceMaps(entryPath);
        } else if (entry.name.endsWith('.map')) {
            await rm(entryPath);
        }
    }
};

await removeSourceMaps(bundleDir);
for (const notice of ['LICENSE', 'TRADEMARK']) {
    await copyFile(path.join(repoRoot, notice), path.join(bundleDir, notice));
}
const revision = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: repoRoot, encoding: 'utf8'}).trim();
await writeFile(path.join(bundleDir, 'SOURCE.md'),
    `# Blockflow browser bundle\n\n` +
    `Source: https://github.com/openpatch/blockflow/tree/${revision}\n\n` +
    `Use Node.js from .nvmrc, the npm version in package.json devDependencies, and the zip command.\n` +
    `Build with npm ci and npm run build:embedded.\n` +
    `Serve this directory over HTTP and open editor.html, player.html, or generator.html.\n` +
    `Project files are supplied through the ?project= URL parameter.\n`);
await mkdir(releaseDir, {recursive: true});
await rm(archivePath, {force: true});
execFileSync('zip', ['-q', '-r', '-9', archivePath, '.'], {cwd: bundleDir, stdio: 'inherit'});
console.log(`Packaged Blockflow: ${archivePath}`);
