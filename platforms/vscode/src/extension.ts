import * as vscode from 'vscode';
import { BlockflowEditorProvider } from './blockflowEditorProvider';
import { Sb3EditorProvider } from './sb3EditorProvider';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        BlockflowEditorProvider.register(context)
    );
    context.subscriptions.push(
        Sb3EditorProvider.register(context)
    );
}

export function deactivate() {}
