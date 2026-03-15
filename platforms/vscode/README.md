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
npm install

# Build the extension
cd platforms/vscode
npm run build

# Watch for changes during development
npm run watch

# Package the extension as .vsix
npm run package
```
