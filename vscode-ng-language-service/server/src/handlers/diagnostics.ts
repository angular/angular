/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as lsp from 'vscode-languageserver/node';
import {Session} from '../session';
import {tsDiagnosticToLspDiagnostic} from '../diagnostic';
import {isDebugMode, filePathToUri, uriToFilePath} from '../utils';

/**
 * Cache for tracking result IDs for unchanged diagnostic reports.
 * Maps file URI to a tuple of [resultId, versionString].
 * We store the full version string (not parsed numeric) for robust change detection,
 * as the format of TypeScript's ScriptInfo version strings could change.
 */
const diagnosticResultCache = new Map<string, {resultId: string; version: string}>();

/**
 * Generate a unique result ID for caching purposes.
 */
function generateResultId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Yield to the event loop to allow other requests to be processed.
 * This prevents blocking when processing many files in workspace diagnostics.
 */
function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * Handle the textDocument/diagnostic request (LSP 3.17 Pull Diagnostics).
 *
 * This handler is called when the client explicitly requests diagnostics for a document,
 * as opposed to the push-based model where the server sends diagnostics on every change.
 *
 * Benefits:
 * - Client controls when diagnostics are computed
 * - Supports result caching via resultId to avoid recomputing unchanged diagnostics
 * - Better integration with VS Code's diagnostic system
 */
export async function onDocumentDiagnostic(
  session: Session,
  params: lsp.DocumentDiagnosticParams,
): Promise<lsp.DocumentDiagnosticReport> {
  const filePath = uriToFilePath(params.textDocument.uri);
  if (!filePath) {
    return {kind: lsp.DocumentDiagnosticReportKind.Full, items: []};
  }

  const result = session.getLSAndScriptInfo(filePath);
  if (!result) {
    return {kind: lsp.DocumentDiagnosticReportKind.Full, items: []};
  }

  const {languageService, scriptInfo} = result;

  // Check if we can return an unchanged report
  const cached = diagnosticResultCache.get(params.textDocument.uri);
  const currentVersion = scriptInfo.getLatestVersion();

  if (params.previousResultId && cached && cached.resultId === params.previousResultId) {
    if (currentVersion === cached.version) {
      // Document hasn't changed, return unchanged report
      return {
        kind: lsp.DocumentDiagnosticReportKind.Unchanged,
        resultId: cached.resultId,
      };
    }
  }

  const fileName = scriptInfo.fileName;
  const label = `Pull diagnostics - getSemanticDiagnostics for ${fileName}`;

  if (isDebugMode) {
    console.time(label);
  }

  const diagnostics = languageService.getSemanticDiagnostics(fileName);

  if (isDebugMode) {
    console.timeEnd(label);
  }

  const suggestionLabel = `Pull diagnostics - getSuggestionDiagnostics for ${fileName}`;
  if (isDebugMode) {
    console.time(suggestionLabel);
  }

  diagnostics.push(...languageService.getSuggestionDiagnostics(fileName));

  if (isDebugMode) {
    console.timeEnd(suggestionLabel);
  }

  // Generate new result ID and cache it
  const newResultId = generateResultId();

  diagnosticResultCache.set(params.textDocument.uri, {
    resultId: newResultId,
    version: currentVersion,
  });

  // Convert TypeScript diagnostics to LSP diagnostics
  const lspDiagnostics = diagnostics.map((d) =>
    tsDiagnosticToLspDiagnostic(d, session.projectService),
  );

  return {
    kind: lsp.DocumentDiagnosticReportKind.Full,
    resultId: newResultId,
    items: lspDiagnostics,
  };
}

/**
 * Handle the workspace/diagnostic request (LSP 3.17 Pull Diagnostics).
 *
 * This handler provides diagnostics for all open files in the workspace.
 * It's useful for getting an overview of all issues across the project.
 *
 * Uses setImmediate between files to yield to the event loop, preventing
 * the server from blocking on large workspaces with many open files.
 */
export async function onWorkspaceDiagnostic(
  session: Session,
  params: lsp.WorkspaceDiagnosticParams,
): Promise<lsp.WorkspaceDiagnosticReport> {
  const items: lsp.WorkspaceDocumentDiagnosticReport[] = [];

  // Build a map of previous result IDs for quick lookup
  const previousResults = new Map<string, string>();
  for (const prev of params.previousResultIds) {
    previousResults.set(prev.uri, prev.value);
  }

  // Get all open files from the session
  const openFiles = session.getOpenFiles();

  for (const filePath of openFiles) {
    // Yield to event loop between files to allow other requests (hover, completion) to be handled
    await yieldToEventLoop();

    const uri = filePathToUri(filePath);
    const result = session.getLSAndScriptInfo(filePath);

    if (!result) {
      continue;
    }

    const {languageService, scriptInfo} = result;
    const previousResultId = previousResults.get(uri);
    const cached = diagnosticResultCache.get(uri);
    const currentVersion = scriptInfo.getLatestVersion();

    // Check if we can return unchanged (using full string comparison for robustness)
    if (previousResultId && cached && cached.resultId === previousResultId) {
      if (currentVersion === cached.version) {
        items.push({
          kind: lsp.DocumentDiagnosticReportKind.Unchanged,
          resultId: cached.resultId,
          uri,
          version: null,
        });
        continue;
      }
    }

    // Get fresh diagnostics
    const fileName = scriptInfo.fileName;
    const diagnostics = languageService.getSemanticDiagnostics(fileName);
    diagnostics.push(...languageService.getSuggestionDiagnostics(fileName));

    // Generate new result ID and cache
    const newResultId = generateResultId();

    diagnosticResultCache.set(uri, {
      resultId: newResultId,
      version: currentVersion,
    });

    items.push({
      kind: lsp.DocumentDiagnosticReportKind.Full,
      resultId: newResultId,
      uri,
      version: null,
      items: diagnostics.map((d) => tsDiagnosticToLspDiagnostic(d, session.projectService)),
    });
  }

  return {items};
}

/**
 * Clear the diagnostic cache for a specific document.
 * Should be called when a document is closed.
 */
export function clearDiagnosticCache(uri: string): void {
  diagnosticResultCache.delete(uri);
}

/**
 * Clear all diagnostic caches.
 * Should be called on workspace reset or server restart.
 */
export function clearAllDiagnosticCaches(): void {
  diagnosticResultCache.clear();
}
