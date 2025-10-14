/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { MessageConnection } from 'vscode-jsonrpc/node';
import * as lsp from 'vscode-languageserver-protocol';
export interface ServerOptions {
    ivy: boolean;
    includeAutomaticOptionalChainCompletions?: boolean;
    includeCompletionsWithSnippetText?: boolean;
    angularCoreVersion?: string;
}
export declare function createConnection(serverOptions: ServerOptions): MessageConnection;
export declare function initializeServer(client: MessageConnection): Promise<lsp.InitializeResult>;
export declare function openTextDocument(client: MessageConnection, filePath: string, newText?: string): void;
export declare function convertPathToFileUrl(filePath: string): string;
export declare function createTracer(): lsp.Tracer;
