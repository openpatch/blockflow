import * as vscode from 'vscode';

/**
 * Generate a nonce for Content Security Policy.
 */
export function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/**
 * Get default webview options for custom editors.
 */
export function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
        enableScripts: true,
        localResourceRoots: [
            vscode.Uri.joinPath(extensionUri, 'dist', 'webview'),
        ],
    };
}

/**
 * Build the HTML content for a webview that loads a specific bundle.
 */
export function getHtmlForWebview(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    scriptName: string,
    options?: {
        cssName?: string;
        data?: Record<string, string>;
    }
): string {
    const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'webview', scriptName)
    );

    // Base URI for relative URL resolution (images, fonts, etc. from webpack asset modules)
    const baseUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'webview')
    );

    const cssUri = options?.cssName
        ? webview.asWebviewUri(
              vscode.Uri.joinPath(extensionUri, 'dist', 'webview', options.cssName)
          )
        : null;

    const nonce = getNonce();

    const scratchHosts = 'https://assets.scratch.mit.edu https://cdn.assets.scratch.mit.edu https://projects.scratch.mit.edu';
    const dataScript = options?.data
        ? `<script nonce="${nonce}">window.__WEBVIEW_DATA__ = ${JSON.stringify(options.data)};</script>`
        : '';

    const basePathScript = `<script nonce="${nonce}">window.__WEBVIEW_BASE_PATH__ = "${baseUri}/";</script>`;

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'none';
        img-src ${webview.cspSource} data: blob: ${scratchHosts};
        font-src ${webview.cspSource} data:;
        style-src ${webview.cspSource} 'unsafe-inline';
        script-src ${webview.cspSource} 'nonce-${nonce}' 'unsafe-eval';
        worker-src ${webview.cspSource} blob:;
        frame-src 'self';
        media-src ${webview.cspSource} data: blob: ${scratchHosts};
        connect-src ${webview.cspSource} data: blob: ${scratchHosts};
    ">
    ${cssUri ? `<link rel="stylesheet" href="${cssUri}">` : ''}
    <title>Blockflow</title>
    <style>
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        #root {
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    ${basePathScript}
    ${dataScript}
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}
