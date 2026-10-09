# Blockflow VS Code Extension

Open and edit `.blockflow` project files and `.sb3` Scratch projects directly in VS Code.

## Features

### Blockflow Editor (`.blockflow` files)
Opens `.blockflow` project configuration files in a visual form editor similar to the Blockflow Generator. Edit project settings, toolbox configurations, tutorial steps, and asset libraries with a user-friendly interface.

### Scratch Editor (`.sb3` files)
Opens `.sb3` Scratch project files in the full Scratch editor. Create and modify sprites, costumes, sounds, and block scripts directly within VS Code.

## Usage

Simply open a `.blockflow` or `.sb3` file in VS Code. The extension will automatically use the appropriate custom editor.

## Development

```bash
# Install dependencies (from monorepo root)
npm ci

# Build all workspaces, including the extension and its worker dependencies
npm run build

# Build the extension
cd platforms/vscode
npm run build

# Watch for changes during development
npm run watch

# Package the extension as .vsix
npm run package
```

## Releases

The `Release VS Code Extension` workflow publishes to the VS Code Marketplace and Open VSX when a
`vscode-v<version>` tag is pushed. The tag must match the version in `platforms/vscode/package.json`.
The workflow builds all workspaces, packages the bundled extension without npm dependencies, and saves
the `.vsix` as a workflow artifact before publishing the same file to both registries.

Configure these repository secrets for the `openpatch` publisher:

- `VSCE_TOKEN`: VS Code Marketplace personal access token with Marketplace management permission.
- `OVSX_TOKEN`: Open VSX personal access token with access to the `openpatch` namespace.

To release, update the extension version and root lockfile, commit those changes, then push the matching tag.
For example, from the monorepo root:

```bash
npm version 0.1.1 --workspace=platforms/vscode --no-git-tag-version
git add platforms/vscode/package.json package-lock.json
git commit -m "chore(vscode): release 0.1.1"
git tag vscode-v0.1.1
git push origin HEAD
git push origin vscode-v0.1.1
```

If publishing succeeds in one registry but fails in the other, rerun the failed workflow. Both publish
commands skip versions that already exist.
