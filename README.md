# Blockflow

Blockflow is a fork of the [Scratch editor](https://github.com/scratchfoundation/scratch-editor) by the Scratch Foundation. It extends Scratch with configurable project files that let you customize the editor UI, restrict available blocks, and embed step-by-step tutorials — all controlled via a single URL parameter.

This makes Blockflow well-suited for educational settings where you want to provide learners with a focused, guided Scratch experience.

## Key Features

- **Project Files** — Define a JSON configuration that controls which blocks, tabs, and UI elements are available, and optionally loads an `.sb3` project.
- **Tutorials** — Embed step-by-step instructions with text, images, and videos directly into the editor.
- **Toolbox Filtering** — Restrict the block palette to specific categories or individual blocks.
- **Generator** — A built-in visual tool (`generator.html`) for creating project file configurations without writing JSON by hand.
- **Player Mode** — A dedicated full-screen playback mode that hides the editor.

## Project File

A project file is a JSON object that configures the Blockflow editor. It is passed via the `?project=` URL parameter, which accepts:

- A **base64-encoded** JSON string
- A **URL** to a `.json` project file
- A **URL** to an `.sb3` Scratch project

### Structure

```json
{
  "title": "My Project",
  "sb3": "https://example.com/project.sb3",
  "ui": {
    "allowExtensions": false,
    "showCostumesTab": false,
    "showSoundsTab": false
  },
  "toolbox": {
    "categories": ["motion", "looks", "events", "control"],
    "blocks": {
      "motion": ["motion_movesteps", "motion_turnright"]
    }
  },
  "steps": [
    {
      "title": "Step 1",
      "text": "Drag a move block into the workspace.",
      "video": "https://example.com/step1.mp4"
    },
    {
      "title": "Step 2",
      "text": "Drag a move another block into the workspace.",
      "image": "https://example.com/step2.png",
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `title` | **(required)** Project name displayed in the editor. |
| `sb3` | URL to a `.sb3` file to load into the VM. |
| `ui.allowExtensions` | Show or hide the extensions button. |
| `ui.showCostumesTab` | Show or hide the Costumes/Backdrops tab. |
| `ui.showSoundsTab` | Show or hide the Sounds tab. |
| `toolbox.categories` | Array of enabled block categories (`motion`, `looks`, `sound`, `events`, `control`, `sensing`, `operators`, `variables`, `myBlocks`). |
| `toolbox.blocks` | Object mapping category names to arrays of allowed block opcodes for fine-grained filtering. |
| `steps` | Array of tutorial steps, each with `title`, `text`, `image`, and/or `video`. |

Relative URLs in `sb3`, `image`, and `video` fields are resolved relative to the project file URL.

## Generator

The Generator (`generator.html`) is a visual tool for creating project file configurations. It provides:

- Form fields for general settings (title, sb3 URL, UI toggles)
- A toolbox editor to toggle categories and pick individual blocks
- A tutorial step manager to add, remove, and edit steps
- Export as downloadable `.json`, copyable URL (base64-encoded), or raw JSON

## Packages

The `packages` directory contains:

- **`scratch-gui`** — Editor UI, menus, and the glue that brings the other modules together. Includes the project file system, generator, and player mode.
- **`scratch-vm`** — Virtual machine that runs Scratch projects.
- **`scratch-render`** — Renders backdrops, sprites, and clones on the stage.
- **`scratch-svg-renderer`** — Processes SVG images for use in Scratch projects.
- **`task-herder`** — Async task queue with token-bucket rate limiting and concurrency control.

## Getting Started

```sh
npm install
npm run build
```

To start the development server:

```sh
cd packages/scratch-gui
npm start
```

Then open `http://localhost:8601` in your browser.

## License

This project is licensed under [AGPL-3.0-only](LICENSE), the same license as the upstream Scratch editor.

## Acknowledgments

Blockflow is built on the incredible work of the [Scratch Foundation](https://scratch.mit.edu) and the global community of Scratch contributors. Thank you for making Scratch open source.

If you'd like to support the original Scratch project, please consider making a [donation to the Scratch Foundation](https://secure.donationpay.org/scratchfoundation/).
