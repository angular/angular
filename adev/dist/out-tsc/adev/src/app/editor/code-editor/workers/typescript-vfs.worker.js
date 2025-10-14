/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/// <reference lib="webworker" />
import ts from 'typescript';
import {
  createDefaultMapFromCDN,
  createSystem,
  createVirtualTypeScriptEnvironment,
} from '@typescript/vfs';
import {Subject} from 'rxjs';
import {getCompilerOpts} from './utils/compiler-opts';
import {FORMAT_CODE_SETTINGS, USER_PREFERENCES} from './utils/ts-constants';
import {
  fileExists,
  normalizeFileContent,
  normalizeFileName,
  updateFile,
  updateOrCreateFile,
} from './utils/environment';
/**
 * Web worker uses TypeScript Virtual File System library to enrich code editor functionality i.e. :
 *  - provide autocomplete suggestions
 *  - display errors
 *  - display tooltip with types and documentation
 */
const eventManager = new Subject();
let languageService;
let env;
let defaultFilesMap = new Map();
let compilerOpts;
let cachedTypingFiles = [];
// Create virtual environment for code editor files.
function createVfsEnv(request) {
  if (env) {
    env.languageService.dispose();
  }
  // merge code editor ts files with default TypeScript libs
  const tutorialFilesMap = request.data ?? new Map();
  const fileSystemMap = new Map();
  [...tutorialFilesMap, ...defaultFilesMap].forEach(([key, value]) => {
    fileSystemMap.set(normalizeFileName(key), normalizeFileContent(value));
  });
  const system = createSystem(fileSystemMap);
  const entryFiles = Array.from(tutorialFilesMap.keys());
  env = createVirtualTypeScriptEnvironment(system, entryFiles, ts, compilerOpts);
  languageService = env.languageService;
  if (cachedTypingFiles.length > 0)
    defineTypes({
      action: 'define-types-request' /* TsVfsWorkerActions.DEFINE_TYPES_REQUEST */,
      data: cachedTypingFiles,
    });
  return {action: 'create-vfs-env-response' /* TsVfsWorkerActions.CREATE_VFS_ENV_RESPONSE */};
}
function updateVfsEnv(request) {
  if (!env?.sys) return;
  request.data?.forEach((value, key) => {
    updateOrCreateFile(env, key, value);
  });
}
// Update content of the file in virtual environment.
function codeChanged(request) {
  if (!request.data || !env) return;
  updateFile(env, request.data.file, request.data.code);
  // run diagnostics when code changed
  postMessage(
    runDiagnostics({
      action: 'diagnostics-request' /* TsVfsWorkerActions.DIAGNOSTICS_REQUEST */,
      data: {file: request.data.file},
    }),
  );
}
// Get autocomplete proposal for given position of the file.
function getAutocompleteProposals(request) {
  if (!env) {
    return {
      action: 'autocomplete-response' /* TsVfsWorkerActions.AUTOCOMPLETE_RESPONSE */,
      data: [],
    };
  }
  updateFile(env, request.data.file, request.data.content);
  const completions = languageService.getCompletionsAtPosition(
    request.data.file,
    request.data.position,
    USER_PREFERENCES,
    FORMAT_CODE_SETTINGS,
  );
  const completionsWithImportSuggestions = completions?.entries.map((entry) => {
    if (entry.source) {
      const entryDetails = languageService.getCompletionEntryDetails(
        request.data.file,
        request.data.position,
        entry.name,
        FORMAT_CODE_SETTINGS,
        entry.source,
        USER_PREFERENCES,
        entry.data,
      );
      if (entryDetails?.codeActions) {
        return {
          ...entry,
          codeActions: entryDetails?.codeActions,
        };
      }
    }
    return entry;
  });
  return {
    action: 'autocomplete-response' /* TsVfsWorkerActions.AUTOCOMPLETE_RESPONSE */,
    data: completionsWithImportSuggestions,
  };
}
// Run diagnostics after file update.
function runDiagnostics(request) {
  if (!env?.sys || !fileExists(env, request.data.file)) {
    return {action: 'diagnostics-response' /* TsVfsWorkerActions.DIAGNOSTICS_RESPONSE */, data: []};
  }
  const syntacticDiagnostics = languageService?.getSyntacticDiagnostics(request.data.file) ?? [];
  const semanticDiagnostic = languageService?.getSemanticDiagnostics(request.data.file) ?? [];
  const suggestionDiagnostics = languageService?.getSuggestionDiagnostics(request.data.file) ?? [];
  const result = [...syntacticDiagnostics, ...semanticDiagnostic, ...suggestionDiagnostics].map(
    (diagnostic) => {
      const lineAndCharacter =
        diagnostic.file && diagnostic.start
          ? diagnostic.file?.getLineAndCharacterOfPosition(diagnostic.start)
          : null;
      const from = diagnostic.start;
      const to = (diagnostic.start ?? 0) + (diagnostic.length ?? 0);
      return {
        from,
        to,
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        source: diagnostic.source,
        code: diagnostic.code,
        severity: ['warning', 'error', 'info'][diagnostic.category],
        ...(lineAndCharacter && {
          lineNumber: lineAndCharacter.line + 1,
          characterPosition: lineAndCharacter.character,
        }),
      };
    },
  );
  return {
    action: 'diagnostics-response' /* TsVfsWorkerActions.DIAGNOSTICS_RESPONSE */,
    data: result,
  };
}
function defineTypes(request) {
  if (!env?.sys || !request.data?.length) return;
  for (const {path, content} of request.data) {
    updateOrCreateFile(env, path, content);
  }
  cachedTypingFiles = request.data ?? [];
}
function displayTooltip(request) {
  if (!languageService) {
    return {
      action: 'display-tooltip-response' /* TsVfsWorkerActions.DISPLAY_TOOLTIP_RESPONSE */,
      data: {
        tags: null,
        displayParts: null,
        documentation: null,
      },
    };
  }
  const result = languageService.getQuickInfoAtPosition(request.data.file, request.data.position);
  if (!result) {
    return {
      action: 'display-tooltip-response' /* TsVfsWorkerActions.DISPLAY_TOOLTIP_RESPONSE */,
      data: {
        tags: null,
        displayParts: null,
        documentation: null,
      },
    };
  }
  return {
    action: 'display-tooltip-response' /* TsVfsWorkerActions.DISPLAY_TOOLTIP_RESPONSE */,
    data: {
      tags: result.tags ?? null,
      displayParts: result.displayParts ?? null,
      documentation: result.documentation ?? null,
    },
  };
}
// Strategy defines what function needs to be triggered for given request.
const triggerActionStrategy = {
  ['create-vfs-env-request' /* TsVfsWorkerActions.CREATE_VFS_ENV_REQUEST */]: (request) =>
    createVfsEnv(request),
  ['update-vfs-env-request' /* TsVfsWorkerActions.UPDATE_VFS_ENV_REQUEST */]: (request) =>
    updateVfsEnv(request),
  ['code-changed' /* TsVfsWorkerActions.CODE_CHANGED */]: (request) => codeChanged(request),
  ['autocomplete-request' /* TsVfsWorkerActions.AUTOCOMPLETE_REQUEST */]: (request) =>
    getAutocompleteProposals(request),
  ['diagnostics-request' /* TsVfsWorkerActions.DIAGNOSTICS_REQUEST */]: (request) =>
    runDiagnostics(request),
  ['define-types-request' /* TsVfsWorkerActions.DEFINE_TYPES_REQUEST */]: (request) =>
    defineTypes(request),
  ['display-tooltip-request' /* TsVfsWorkerActions.DISPLAY_TOOLTIP_REQUEST */]: (request) =>
    displayTooltip(request),
};
const bootstrapWorker = async () => {
  const sendResponse = (message) => {
    postMessage(message);
  };
  compilerOpts = getCompilerOpts(ts);
  defaultFilesMap = await createDefaultMapFromCDN(compilerOpts, ts.version, false, ts);
  sendResponse({action: 'default-fs-ready' /* TsVfsWorkerActions.INIT_DEFAULT_FILE_SYSTEM_MAP */});
  eventManager.subscribe((request) => {
    const response = triggerActionStrategy[request.action](request);
    if (response) {
      sendResponse(response);
    }
  });
};
addEventListener('message', ({data}) => {
  eventManager.next(data);
});
// Initialize worker, create on init TypeScript Virtual Environment and setup listeners for action i.e. run diagnostics, autocomplete etc.
Promise.resolve(bootstrapWorker());
//# sourceMappingURL=typescript-vfs.worker.js.map
