/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript/lib/tsserverlibrary';
import * as lsp from 'vscode-languageserver';
export declare const isDebugMode: boolean;
/**
 * Extract the file path from the specified `uri`.
 * @param uri
 */
export declare function uriToFilePath(uri: string): string;
/**
 * Converts the specified `filePath` to a proper URI.
 * @param filePath
 */
export declare function filePathToUri(filePath: string): lsp.DocumentUri;
/**
 * Converts ts.FileTextChanges to lsp.WorkspaceEdit.
 */
export declare function tsFileTextChangesToLspWorkspaceEdit(changes: readonly ts.FileTextChanges[], getScriptInfo: (path: string) => ts.server.ScriptInfo | undefined): lsp.WorkspaceEdit;
/**
 * Convert ts.TextSpan to lsp.TextSpan. TypeScript keeps track of offset using
 * 1-based index whereas LSP uses 0-based index.
 * @param scriptInfo Used to determine the offsets.
 * @param textSpan
 */
export declare function tsTextSpanToLspRange(scriptInfo: ts.server.ScriptInfo, textSpan: ts.TextSpan): lsp.Range;
/**
 * Convert lsp.Position to the absolute offset in the file. LSP keeps track of
 * offset using 0-based index whereas TypeScript uses 1-based index.
 * @param scriptInfo Used to determine the offsets.
 * @param position
 */
export declare function lspPositionToTsPosition(scriptInfo: ts.server.ScriptInfo, position: lsp.Position): number;
/**
 * Convert lsp.Range which is made up of `start` and `end` positions to
 * TypeScript's absolute offsets.
 * @param scriptInfo Used to determine the offsets.
 * @param range
 */
export declare function lspRangeToTsPositions(scriptInfo: ts.server.ScriptInfo, range: lsp.Range): [number, number];
/**
 * Convert a ts.DiagnosticRelatedInformation array to a
 * lsp.DiagnosticRelatedInformation array
 * @param scriptInfo Used to determine the offsets.
 * @param relatedInfo
 */
export declare function tsRelatedInformationToLspRelatedInformation(projectService: ts.server.ProjectService, relatedInfo?: ts.DiagnosticRelatedInformation[]): lsp.DiagnosticRelatedInformation[] | undefined;
export declare function isConfiguredProject(project: ts.server.Project): project is ts.server.ConfiguredProject;
/**
 * A class that tracks items in most recently used order.
 */
export declare class MruTracker {
    private readonly set;
    update(item: string): void;
    delete(item: string): void;
    /**
     * Returns all items sorted by most recently used.
     */
    getAll(): string[];
}
export declare function tsDisplayPartsToText(parts: ts.SymbolDisplayPart[]): string;
/**
 *
 * This function attempts to use *internal* TypeScript APIs to find the original source spans for
 * the `ts.DefinitionInfo` using source maps. If it fails, this function returns the same
 * `ts.DefinitionInfo` that was passed in.
 *
 * @see https://github.com/angular/vscode-ng-language-service/issues/1588
 */
export declare function getMappedDefinitionInfo(info: ts.DefinitionInfo, project: ts.server.Project): ts.DefinitionInfo;
