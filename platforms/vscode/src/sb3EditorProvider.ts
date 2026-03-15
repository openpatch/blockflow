import * as vscode from 'vscode';
import { getWebviewOptions, getHtmlForWebview } from './util';

/**
 * Document model for .sb3 files (binary).
 */
class Sb3Document implements vscode.CustomDocument {
    public readonly uri: vscode.Uri;
    private _content: Uint8Array;
    private readonly _onDidDispose = new vscode.EventEmitter<void>();
    public readonly onDidDispose = this._onDidDispose.event;

    constructor(uri: vscode.Uri, content: Uint8Array) {
        this.uri = uri;
        this._content = content;
    }

    get content(): Uint8Array {
        return this._content;
    }

    set content(value: Uint8Array) {
        this._content = value;
    }

    dispose(): void {
        this._onDidDispose.fire();
        this._onDidDispose.dispose();
    }
}

interface Sb3Edit {
    readonly content: Uint8Array;
}

/**
 * Custom editor provider for .sb3 files (binary Scratch projects).
 * Renders the full Scratch editor in a webview.
 */
export class Sb3EditorProvider implements vscode.CustomEditorProvider<Sb3Document> {
    public static readonly viewType = 'blockflow.sb3Editor';

    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<
        vscode.CustomDocumentEditEvent<Sb3Document>
    >();
    public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        return vscode.window.registerCustomEditorProvider(
            Sb3EditorProvider.viewType,
            new Sb3EditorProvider(context),
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
                supportsMultipleEditorsPerDocument: false,
            }
        );
    }

    constructor(private readonly context: vscode.ExtensionContext) {}

    public async openCustomDocument(
        uri: vscode.Uri,
        _openContext: vscode.CustomDocumentOpenContext,
        _token: vscode.CancellationToken
    ): Promise<Sb3Document> {
        const fileData = await vscode.workspace.fs.readFile(uri);
        return new Sb3Document(uri, fileData);
    }

    public async resolveCustomEditor(
        document: Sb3Document,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = getWebviewOptions(this.context.extensionUri);
        webviewPanel.webview.html = getHtmlForWebview(
            webviewPanel.webview,
            this.context.extensionUri,
            'scratch.js'
        );

        // Send the .sb3 content to the webview as base64
        const updateWebview = () => {
            const base64 = Buffer.from(document.content).toString('base64');
            webviewPanel.webview.postMessage({
                type: 'load',
                content: base64,
            });
        };

        // Listen for messages from the webview
        const messageDisposable = webviewPanel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.type) {
                    case 'ready':
                        updateWebview();
                        return;

                    case 'edit': {
                        const newContent = Uint8Array.from(
                            Buffer.from(message.content, 'base64')
                        );
                        const oldContent = document.content;
                        document.content = newContent;

                        this._onDidChangeCustomDocument.fire({
                            document,
                            undo: async () => {
                                document.content = oldContent;
                                updateWebview();
                            },
                            redo: async () => {
                                document.content = newContent;
                                updateWebview();
                            },
                        });
                        return;
                    }
                }
            }
        );

        webviewPanel.onDidDispose(() => {
            messageDisposable.dispose();
        });
    }

    public async saveCustomDocument(
        document: Sb3Document,
        cancellation: vscode.CancellationToken
    ): Promise<void> {
        await vscode.workspace.fs.writeFile(document.uri, document.content);
    }

    public async saveCustomDocumentAs(
        document: Sb3Document,
        destination: vscode.Uri,
        cancellation: vscode.CancellationToken
    ): Promise<void> {
        await vscode.workspace.fs.writeFile(destination, document.content);
    }

    public async revertCustomDocument(
        document: Sb3Document,
        cancellation: vscode.CancellationToken
    ): Promise<void> {
        const fileData = await vscode.workspace.fs.readFile(document.uri);
        document.content = fileData;
    }

    public async backupCustomDocument(
        document: Sb3Document,
        context: vscode.CustomDocumentBackupContext,
        cancellation: vscode.CancellationToken
    ): Promise<vscode.CustomDocumentBackup> {
        await vscode.workspace.fs.writeFile(context.destination, document.content);
        return {
            id: context.destination.toString(),
            delete: async () => {
                try {
                    await vscode.workspace.fs.delete(context.destination);
                } catch {
                    // Backup may already be deleted
                }
            },
        };
    }
}
