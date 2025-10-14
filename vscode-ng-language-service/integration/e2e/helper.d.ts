import * as vscode from 'vscode';
export declare const COMPLETION_COMMAND = "vscode.executeCompletionItemProvider";
export declare const HOVER_COMMAND = "vscode.executeHoverProvider";
export declare const DEFINITION_COMMAND = "vscode.executeDefinitionProvider";
export declare const APP_COMPONENT_URI: vscode.Uri;
export declare const FOO_TEMPLATE_URI: vscode.Uri;
export declare function activate(uri: vscode.Uri): Promise<void>;
