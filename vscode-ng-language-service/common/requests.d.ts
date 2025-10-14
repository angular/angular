/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as lsp from 'vscode-languageserver-protocol';
export declare const GetComponentsWithTemplateFile: lsp.RequestType<GetComponentsWithTemplateFileParams, lsp.Location[], void>;
export interface GetComponentsWithTemplateFileParams {
    textDocument: lsp.TextDocumentIdentifier;
}
export declare const GetTemplateLocationForComponent: lsp.RequestType<GetTemplateLocationForComponentParams, lsp.Location, void>;
export interface GetTemplateLocationForComponentParams {
    textDocument: lsp.TextDocumentIdentifier;
    position: lsp.Position;
}
export interface GetTcbParams {
    textDocument: lsp.TextDocumentIdentifier;
    position: lsp.Position;
}
export declare const GetTcbRequest: lsp.RequestType<GetTcbParams, GetTcbResponse | null, void>;
export interface GetTcbResponse {
    uri: lsp.DocumentUri;
    content: string;
    selections: lsp.Range[];
}
export declare const IsInAngularProject: lsp.RequestType<IsInAngularProjectParams, boolean | null, void>;
export interface IsInAngularProjectParams {
    textDocument: lsp.TextDocumentIdentifier;
}
