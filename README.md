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
    "allowExtensions": false
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
      "image": "https://example.com/step2.png"
    }
  ],
  "costumes": {
    "enabled": false,
    "showBuiltin": false,
    "tags": [
      { "key": "animal", "label": "Animal" },
      { "key": "person", "label": "Person" }
    ],
    "library": [
      { "name": "Cat", "url": "https://example.com/cat.svg", "tags": ["animal"] },
      { "name": "Photo", "url": "https://example.com/photo.png", "centerX": 100, "centerY": 80, "tags": ["person"] }
    ]
  },
  "sounds": {
    "enabled": false,
    "showBuiltin": false,
    "tags": [
      { "key": "effect", "label": "Effect" }
    ],
    "library": [
      { "name": "Meow", "url": "https://example.com/meow.mp3", "tags": ["effect"] }
    ]
  },
  "backdrops": {
    "showBuiltin": false,
    "library": [
      { "name": "Beach", "url": "https://example.com/beach.png" }
    ]
  },
  "sprites": {
    "showBuiltin": false,
    "tags": [
      { "key": "animal", "label": "Animal" }
    ],
    "library": [
      {
        "name": "Dog",
        "tags": ["animal"],
        "costumes": [
          { "name": "dog-a", "url": "https://example.com/dog-a.svg" }
        ],
        "sounds": [
          { "name": "bark", "url": "https://example.com/bark.mp3" }
        ]
      }
    ]
  }
}
```

| Field | Description |
|-------|-------------|
| `title` | **(required)** Project name displayed in the editor. |
| `sb3` | URL to a `.sb3` file to load into the VM. |
| `ui.allowExtensions` | Show or hide the extensions button. |
| `toolbox.categories` | Array of enabled block categories (`motion`, `looks`, `sound`, `events`, `control`, `sensing`, `operators`, `variables`, `myBlocks`). |
| `toolbox.blocks` | Object mapping category names to arrays of allowed block opcodes for fine-grained filtering. |
| `steps` | Array of tutorial steps, each with `title`, `text`, `image`, and/or `video`. |
| `costumes` | Custom costumes. Can be a flat array of items (backward compatible) or an object with `enabled`, `showBuiltin`, `tags`, and `library`. |
| `costumes.enabled` | Show or hide the Costumes/Backdrops tab (default: `true`). |
| `costumes.showBuiltin` | Show or hide built-in costumes in the costume library (default: `true`). |
| `costumes.tags` | Array of tag definitions (`{key, label}`) for filtering. Appended to built-in tags; shown alone when `showBuiltin` is `false`. |
| `costumes.library` | Array of costume items, each with `name`, `url`, optional `centerX`/`centerY`, and optional `tags` (array of tag keys). |
| `sounds` | Custom sounds. Can be a flat array or an object with `enabled`, `showBuiltin`, `tags`, and `library`. |
| `sounds.enabled` | Show or hide the Sounds tab (default: `true`). |
| `sounds.showBuiltin` | Show or hide built-in sounds in the sound library (default: `true`). |
| `sounds.tags` | Array of tag definitions (`{key, label}`) for filtering. Appended to built-in tags; shown alone when `showBuiltin` is `false`. |
| `sounds.library` | Array of sound items, each with `name`, `url`, and optional `tags` (array of tag keys). |
| `backdrops` | Custom backdrops. Can be a flat array or an object with `showBuiltin`, `tags`, and `library`. |
| `backdrops.showBuiltin` | Show or hide built-in backdrops in the backdrop library (default: `true`). |
| `backdrops.tags` | Array of tag definitions (`{key, label}`) for filtering. Appended to built-in tags; shown alone when `showBuiltin` is `false`. |
| `backdrops.library` | Array of backdrop items, each with `name`, `url`, optional `centerX`/`centerY`, and optional `tags` (array of tag keys). |
| `sprites` | Custom sprites. Can be a flat array or an object with `showBuiltin`, `tags`, and `library`. |
| `sprites.showBuiltin` | Show or hide built-in sprites in the sprite library (default: `true`). |
| `sprites.tags` | Array of tag definitions (`{key, label}`) for filtering. Appended to built-in tags; shown alone when `showBuiltin` is `false`. |
| `sprites.library` | Array of sprite items, each with `name`, `costumes`, `sounds`, and optional `tags` (array of tag keys). |

Relative URLs in `sb3`, `image`, `video`, and asset `url` fields are resolved relative to the project file URL.

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
- **`scratch-storage`** — Loads and caches project assets.
- **`scratch-paint`** — Costume and backdrop editor.
- **`scratch-render`** — Renders backdrops, sprites, and clones on the stage.
- **`scratch-svg-renderer`** — Processes SVG images for use in Scratch projects.
- **`task-herder`** — Async task queue with token-bucket rate limiting and concurrency control.
- **`scratch-media-lib-scripts`** — Builds the editor's media libraries.

The VS Code extension is in [`platforms/vscode`](platforms/vscode/README.md).

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

## Browser Bundle

Run `npm run build:embedded` from the repository root to create `dist/blockflow/dist-embedded.zip`
(requires the `zip` command).
The archive includes `editor.html`, `player.html`, `generator.html`, shared JavaScript chunks,
workers, static assets, and license notices. Source maps and development playgrounds are excluded.
Extract it into a directory served over HTTP; the bundle supports nested paths and iframe embeds.

Push a `blockflow-v<version>` tag to publish the archive as a GitHub Release asset through
`.github/workflows/release-embedded.yml`. A manual workflow run builds an Actions artifact for inspection.
Consumers can pin `https://github.com/openpatch/blockflow/releases/download/blockflow-v<version>/dist-embedded.zip`.

## Embedding with a message protocol

Besides the `?project=` URL parameter, the bundle ships two host-driven entries:
`embed-editor.html` (Scratch editor for `.sb3` projects) and `embed-generator.html`
(blockflow project file generator). They render nothing until the embedding host page
loads a document into them over `postMessage`, which lets hosts such as
[Hyperbook](https://github.com/openpatch/hyperbook) open and save projects inside their own UI.
`manifest.json` in the bundle root lists the bundle `version`, source `commit`, and
available `entries` so hosts can assert the version they serve.

### Protocol

| Direction | Message | Meaning |
| --- | --- | --- |
| embed → host | `{type:"ready", version, entry}` | bundle is up; host sends `load`. `entry` is `"editor"` or `"generator"` |
| host → embed | `{type:"load", content, encoding, locale?}` | the document: `.sb3` bytes (`encoding:"base64"`) for the editor, project-file JSON (`encoding:"utf8"`) for the generator. `locale` overrides the detected editor locale |
| host → embed | `{type:"update", …}` | like `load`, but for an external change (e.g. host-side undo) |
| host → embed | `{type:"save"}` | host wants the current document now (its Ctrl/⌘+S) |
| embed → host | `{type:"change", content, encoding}` | debounced (~1 s) edits |
| embed → host | `{type:"saved", content, encoding}` | authoritative answer to `save`, freshly serialized |
| embed → host | `{type:"error", message}` | e.g. undecodable project |
| embed → host | `{type:"preview", url}` | generator only: a `pako:`-encoded project URL a host may open in a nested `editor.html?project=<url>` player |

The editor does not report the initial `load` as a `change`; the generator skips
`change` messages whose content equals the last sent document (no echo loops).

### Origin allowlist

Incoming messages are accepted only from the parent window (`event.source === window.parent`)
and only from the bundle's own origin (same-origin embedding) — or from origins listed
in the `embedOrigin` query parameter:

```text
embed-editor.html?embedOrigin=https://a.example,https://b.example
```

Outgoing messages are posted with an explicit target origin (never `*`): the origin
learned from the first accepted host message, an unambiguous `embedOrigin` entry, the
(embedded) referrer origin, or the bundle's own origin.

### Recommended host CSP

If you serve the bundle entries behind your own server, apply this CSP to their documents
(adapted from the VS Code extension's webview CSP; `script-src` needs `'unsafe-eval'` because
scratch-vm compiles scripts with `new Function`). Add your host origin to `frame-ancestors`:

```text
default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: blob: https:; media-src 'self' data: blob: https:; connect-src 'self' data: blob: https://assets.scratch.mit.edu https://cdn.assets.scratch.mit.edu https://projects.scratch.mit.edu; worker-src 'self' blob:; frame-src 'self' blob: data:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'
```

### Minimal host for the editor

```html
<iframe id="editor" src="/assets/blockflow/embed-editor.html"></iframe>
<script>
    const frame = document.getElementById('editor');
    let embedOrigin = null;
    window.addEventListener('message', event => {
        if (event.source !== frame.contentWindow) return;
        embedOrigin = event.origin;
        switch (event.data.type) {
        case 'ready':
            fetch(bookProjectSb3Url)
                .then(response => response.arrayBuffer())
                .then(buffer => {
                    const binary = Array.from(new Uint8Array(buffer), b => String.fromCharCode(b)).join('');
                    frame.contentWindow.postMessage({
                        type: 'load', content: btoa(binary), encoding: 'base64'
                    }, embedOrigin);
                });
            break;
        case 'change':
            saveToBook(event.data.content); // debounced, base64 .sb3
            break;
        }
    });
    window.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            frame.contentWindow.postMessage({type: 'save'}, embedOrigin);
        }
    });
</script>
```

### Minimal host for the generator

```html
<iframe id="generator" src="/assets/blockflow/embed-generator.html"></iframe>
<script>
    const frame = document.getElementById('generator');
    let embedOrigin = null;
    window.addEventListener('message', event => {
        if (event.source !== frame.contentWindow) return;
        embedOrigin = event.origin;
        switch (event.data.type) {
        case 'ready':
            frame.contentWindow.postMessage({
                type: 'load', content: JSON.stringify(bookProjectFile), encoding: 'utf8'
            }, embedOrigin);
            break;
        case 'change':
            saveToBook(event.data.content); // project-file JSON, utf8
            break;
        }
    });
</script>
```

The tests in `packages/scratch-gui/test/playwright/embed-protocol.spec.js` exercise the
full protocol against a served `build-embedded/` bundle.

## License

This project is licensed under [AGPL-3.0-only](LICENSE), the same license as the upstream Scratch editor.

## Acknowledgments

Blockflow is built on the incredible work of the [Scratch Foundation](https://scratch.mit.edu) and the global community of Scratch contributors. Thank you for making Scratch open source.

If you'd like to support the original Scratch project, please consider making a [donation to the Scratch Foundation](https://secure.donationpay.org/scratchfoundation/).
