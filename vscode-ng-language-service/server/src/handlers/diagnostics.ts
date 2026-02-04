/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as lsp from 'vscode-languageserver/node';
import type {CancellationToken, ResultProgressReporter} from 'vscode-languageserver/node';
import type * as ts from 'typescript/lib/tsserverlibrary';
import {promisify} from 'util';
import {Session} from '../session';
import {tsDiagnosticToLspDiagnostic} from '../diagnostic';
import {isDebugMode, filePathToUri, uriToFilePath} from '../utils';

interface DiagnosticFetchingLanguageService {
  getSemanticDiagnostics(fileName: string): ts.Diagnostic[];
  getSuggestionDiagnostics(fileName: string): ts.DiagnosticWithLocation[];
}

/**
 * Cache for tracking result IDs for unchanged diagnostic reports.
 * Maps file URI to a tuple of [resultId, versionString].
 * We store the full version string (not parsed numeric) for robust change detection,
 * as the format of TypeScript's ScriptInfo version strings could change.
 */
const diagnosticResultCache = new Map<
  string,
  {resultId: string; version: string; projectName: string; projectEpoch: number}
>();

/**
 * Per-project invalidation epochs used by pull diagnostics caching.
 *
 * ScriptInfo.getLatestVersion() only tracks file-content changes for that one file.
 * Diagnostics for file A can still change when:
 * - an imported dependency B changes, or
 * - project/compiler config changes.
 *
 * To avoid returning stale `Unchanged` in those cases, each cached result also stores
 * the current project epoch, and callers bump project/global epochs on invalidation events.
 */
const projectDiagnosticEpoch = new Map<string, number>();
let globalDiagnosticEpoch = 0;

/**
 * Promisified setImmediate, used to yield to the event loop between files.
 * This is the same pattern used in session.ts for sendPendingDiagnostics.
 */
const setImmediateP = promisify(setImmediate);

/**
 * Shared loop helper for diagnostics file traversal.
 *
 * Keeps yield/cancel mechanics consistent between pull and push flows while
 * allowing each caller to provide its own per-file behavior.
 */
export async function forEachDiagnosticsFile(
  files: string[],
  options: {
    shouldStop: () => boolean;
    onFile: (fileName: string) => Promise<void> | void;
    yieldBetween?: boolean;
  },
): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    if (options.shouldStop()) {
      return;
    }

    await options.onFile(files[i]);

    if ((options.yieldBetween ?? true) && i < files.length - 1) {
      await setImmediateP();
    }
  }
}

/** Monotonically increasing counter for generating unique result IDs. */
let nextResultId = 1;

/**
 * Generate a unique result ID for diagnostic caching.
 */
function generateResultId(): string {
  return String(nextResultId++);
}

/**
 * Shared implementation for fetching semantic + suggestion diagnostics and
 * mapping them to LSP diagnostics with consistent timing labels.
 */
export function getLspDiagnosticsForFile(
  session: Session,
  languageService: DiagnosticFetchingLanguageService,
  fileName: string,
  timingPrefix: string,
): lsp.Diagnostic[] {
  const semanticLabel = `${timingPrefix} - getSemanticDiagnostics for ${fileName}`;
  const suggestionLabel = `${timingPrefix} - getSuggestionDiagnostics for ${fileName}`;

  if (isDebugMode) {
    console.time(semanticLabel);
  }
  const diagnostics = languageService.getSemanticDiagnostics(fileName);
  if (isDebugMode) {
    console.timeEnd(semanticLabel);
    console.time(suggestionLabel);
  }
  diagnostics.push(...languageService.getSuggestionDiagnostics(fileName));
  if (isDebugMode) {
    console.timeEnd(suggestionLabel);
  }

  return diagnostics.map((d) => tsDiagnosticToLspDiagnostic(d, session.projectService));
}

function getProjectDiagnosticEpoch(projectName: string): number {
  return Math.max(globalDiagnosticEpoch, projectDiagnosticEpoch.get(projectName) ?? 0);
}

export function invalidateProjectDiagnostics(projectName: string): void {
  projectDiagnosticEpoch.set(projectName, getProjectDiagnosticEpoch(projectName) + 1);
}

export function invalidateAllProjectDiagnostics(): void {
  globalDiagnosticEpoch++;
}

/**
 * Compute diagnostics for a single file, using the cache to avoid recomputation.
 *
 * Returns an unchanged report if the file hasn't changed since the last request,
 * or a full report with fresh diagnostics otherwise.
 */
function computeDiagnosticsForFile(
  session: Session,
  uri: string,
  previousResultId: string | undefined,
): lsp.DocumentDiagnosticReport {
  const filePath = uriToFilePath(uri);
  if (!filePath) {
    return {kind: lsp.DocumentDiagnosticReportKind.Full, items: []};
  }

  const result = session.getLSAndScriptInfo(filePath);
  if (!result) {
    return {kind: lsp.DocumentDiagnosticReportKind.Full, items: []};
  }

  const {languageService, scriptInfo} = result;
  const project = session.getDefaultProjectForScriptInfo(scriptInfo);
  if (!project) {
    return {kind: lsp.DocumentDiagnosticReportKind.Full, items: []};
  }
  const projectName = project.getProjectName();
  const projectEpoch = getProjectDiagnosticEpoch(projectName);
  const cached = diagnosticResultCache.get(uri);
  const currentVersion = scriptInfo.getLatestVersion();

  // Check if we can return an unchanged report
  if (previousResultId && cached && cached.resultId === previousResultId) {
    if (
      currentVersion === cached.version &&
      cached.projectName === projectName &&
      cached.projectEpoch === projectEpoch
    ) {
      return {
        kind: lsp.DocumentDiagnosticReportKind.Unchanged,
        resultId: cached.resultId,
      };
    }
  }

  const fileName = scriptInfo.fileName;
  const diagnostics = getLspDiagnosticsForFile(
    session,
    languageService,
    fileName,
    'Pull diagnostics',
  );

  const newResultId = generateResultId();
  diagnosticResultCache.set(uri, {
    resultId: newResultId,
    version: currentVersion,
    projectName,
    projectEpoch,
  });

  return {
    kind: lsp.DocumentDiagnosticReportKind.Full,
    resultId: newResultId,
    items: diagnostics,
  };
}

export async function onDocumentDiagnostic(
  session: Session,
  params: lsp.DocumentDiagnosticParams,
  token: CancellationToken,
): Promise<lsp.DocumentDiagnosticReport> {
  // Early exit if the client has already cancelled this request (e.g., the user typed
  // again and a new diagnostic request superseded this one).
  if (token.isCancellationRequested) {
    return {kind: lsp.DocumentDiagnosticReportKind.Full, items: []};
  }
  return computeDiagnosticsForFile(session, params.textDocument.uri, params.previousResultId);
}

/**
 * Handle the workspace/diagnostic request (LSP 3.17 Pull Diagnostics).
 *
 * Reports diagnostics for all source files across all configured Angular projects,
 * not just files currently open in the editor. This provides whole-workspace error
 * coverage — errors in files the user hasn't opened yet will still appear in the
 * Problems panel.
 *
 * Open files are processed first (they are the user's current focus), followed by
 * the remaining project files. Uses setImmediate between files to yield to the
 * event loop, preventing the server from blocking on large workspaces.
 *
 * The caching via resultId/version ensures that unchanged files return immediately
 * without recomputing diagnostics.
 */
export async function onWorkspaceDiagnostic(
  session: Session,
  params: lsp.WorkspaceDiagnosticParams,
  token: CancellationToken,
  resultProgress?: ResultProgressReporter<lsp.WorkspaceDiagnosticReportPartialResult>,
): Promise<lsp.WorkspaceDiagnosticReport> {
  const items: lsp.WorkspaceDocumentDiagnosticReport[] = [];

  // Build a map of previous result IDs for quick lookup
  const previousResults = new Map<string, string>();
  for (const prev of params.previousResultIds) {
    previousResults.set(prev.uri, prev.value);
  }

  // Get all project source files (open files first, then remaining project files)
  const projectFiles = session.getProjectFileNames();

  await forEachDiagnosticsFile(projectFiles, {
    shouldStop: () => token.isCancellationRequested,
    onFile: async (filePath) => {
      const uri = filePathToUri(filePath);
      const previousResultId = previousResults.get(uri);
      const report = computeDiagnosticsForFile(session, uri, previousResultId);

      // Wrap the document report in a workspace report (adds uri + version)
      let workspaceReport: lsp.WorkspaceDocumentDiagnosticReport;
      if (report.kind === lsp.DocumentDiagnosticReportKind.Unchanged) {
        workspaceReport = {
          kind: lsp.DocumentDiagnosticReportKind.Unchanged,
          resultId: report.resultId,
          uri,
          version: null,
        };
      } else {
        workspaceReport = {
          kind: lsp.DocumentDiagnosticReportKind.Full,
          resultId: report.resultId,
          uri,
          version: null,
          items: report.items,
        };
      }

      items.push(workspaceReport);

      // Stream partial results so the Problems panel populates incrementally
      // as files are processed, rather than waiting for the entire workspace scan.
      if (resultProgress) {
        resultProgress.report({items: [workspaceReport]});
      }
    },
  });

  if (token.isCancellationRequested) {
    return {items};
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
