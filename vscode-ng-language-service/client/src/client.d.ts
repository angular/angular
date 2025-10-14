/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';
interface GetTcbResponse {
    uri: vscode.Uri;
    content: string;
    selections: vscode.Range[];
}
export declare class AngularLanguageClient implements vscode.Disposable {
    private readonly context;
    private client;
    private readonly disposables;
    private readonly outputChannel;
    private readonly clientOptions;
    private readonly name;
    private readonly virtualDocumentContents;
    /** A map that indicates whether Angular could be found in the file's project. */
    private readonly fileToIsInAngularProjectMap;
    constructor(context: vscode.ExtensionContext);
    applyWorkspaceEdits(workspaceEdits: lsp.WorkspaceEdit[]): Promise<void>;
    private isInAngularProject;
    private createVirtualHtmlDoc;
    /**
     * Spin up the language server in a separate process and establish a connection.
     */
    start(): Promise<void>;
    /**
     * Construct the arguments that's used to spawn the server process.
     * @param ctx vscode extension context
     */
    private constructArgs;
    /**
     * Kill the language client and perform some clean ups.
     */
    stop(): Promise<void>;
    /**
     * Requests a template typecheck block at the current cursor location in the
     * specified editor.
     */
    getTcbUnderCursor(textEditor: vscode.TextEditor): Promise<GetTcbResponse | undefined>;
    get initializeResult(): lsp.InitializeResult | undefined;
    getComponentsForOpenExternalTemplate(textEditor: vscode.TextEditor): Promise<vscode.Location[] | undefined>;
    getTemplateLocationForComponent(textEditor: vscode.TextEditor): Promise<vscode.Location | null>;
    dispose(): void;
}
export {};
