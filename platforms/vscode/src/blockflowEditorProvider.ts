import * as vscode from 'vscode';
import { getWebviewOptions, getHtmlForWebview } from './util';

/**
 * Custom text editor provider for .blockflow files (JSON).
 * Renders a generator-like form editor in a webview.
 */
export class BlockflowEditorProvider implements vscode.CustomTextEditorProvider {
    public static readonly viewType = 'blockflow.blockflowEditor';

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        return vscode.window.registerCustomEditorProvider(
            BlockflowEditorProvider.viewType,
            new BlockflowEditorProvider(context),
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
                supportsMultipleEditorsPerDocument: false,
            }
        );
    }

    constructor(private readonly context: vscode.ExtensionContext) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = getWebviewOptions(this.context.extensionUri);
        webviewPanel.webview.html = getHtmlForWebview(
            webviewPanel.webview,
            this.context.extensionUri,
            'blockflow.js'
        );

        // Track whether we're currently applying an edit from the webview
        // to avoid echoing it back
        let isApplyingEdit = false;

        // Send the document content to the webview
        const updateWebview = () => {
            if (webviewPanel.webview) {
                webviewPanel.webview.postMessage({
                    type: 'load',
                    content: document.getText(),
                });
            }
        };

        // Listen for messages from the webview
        const messageDisposable = webviewPanel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.type) {
                    case 'ready':
                        updateWebview();
                        return;

                    case 'edit': {
                        isApplyingEdit = true;
                        try {
                            const edit = new vscode.WorkspaceEdit();
                            edit.replace(
                                document.uri,
                                new vscode.Range(0, 0, document.lineCount, 0),
                                message.content
                            );
                            await vscode.workspace.applyEdit(edit);
                        } finally {
                            isApplyingEdit = false;
                        }
                        return;
                    }
                }
            }
        );

        // Listen for external changes to the document
        const changeDocumentDisposable = vscode.workspace.onDidChangeTextDocument(
            (e) => {
                if (e.document.uri.toString() === document.uri.toString() && !isApplyingEdit) {
                    updateWebview();
                }
            }
        );

        webviewPanel.onDidDispose(() => {
            messageDisposable.dispose();
            changeDocumentDisposable.dispose();
        });
    }
}
