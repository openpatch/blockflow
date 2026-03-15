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
    cssName?: string
): string {
    const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'webview', scriptName)
    );

    const cssUri = cssName
        ? webview.asWebviewUri(
              vscode.Uri.joinPath(extensionUri, 'dist', 'webview', cssName)
          )
        : null;

    const nonce = getNonce();

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'none';
        img-src ${webview.cspSource} data: blob:;
        font-src ${webview.cspSource};
        style-src ${webview.cspSource} 'unsafe-inline';
        script-src 'nonce-${nonce}' 'unsafe-eval';
        worker-src blob:;
        media-src ${webview.cspSource} data: blob:;
        connect-src ${webview.cspSource} data: blob:;
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
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}
