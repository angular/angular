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
  VirtualTypeScriptEnvironment,
  createDefaultMapFromCDN,
  createSystem,
  createVirtualTypeScriptEnvironment,
} from '@typescript/vfs';
import {Subject} from 'rxjs';

import {TsVfsWorkerActions} from './enums/actions';

import {AutocompleteRequest} from './interfaces/autocomplete-request';
import {AutocompleteResponse} from './interfaces/autocomplete-response';
import {CodeChangeRequest} from './interfaces/code-change-request';
import {DefineTypesRequest, Typing} from './interfaces/define-types-request';
import {DiagnosticsRequest, DiagnosticsResponse} from './interfaces/diagnostics-request';
import {DisplayTooltipRequest} from './interfaces/display-tooltip-request';
import {DisplayTooltipResponse} from './interfaces/display-tooltip-response';
import {ActionMessage} from './interfaces/message';

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

const eventManager = new Subject<ActionMessage>();

let languageService: ts.LanguageService | undefined;
let env: VirtualTypeScriptEnvironment | undefined;
let defaultFilesMap: Map<string, string> = new Map();
let compilerOpts: ts.CompilerOptions | undefined;
let cachedTypingFiles: Typing[] = [];

// Create virtual environment for code editor files.
function createVfsEnv(request: ActionMessage<Map<string, string>>): ActionMessage {
  if (env) {
    env.languageService.dispose();
  }

  // merge code editor ts files with default TypeScript libs
  const tutorialFilesMap = request.data ?? new Map();
  const fileSystemMap = new Map<string, string>();

  [...tutorialFilesMap, ...defaultFilesMap].forEach(([key, value]) => {
    fileSystemMap.set(normalizeFileName(key), normalizeFileContent(value));
  });

  const system = createSystem(fileSystemMap);

  const entryFiles: string[] = Array.from(tutorialFilesMap.keys());

  env = createVirtualTypeScriptEnvironment(system, entryFiles, ts, compilerOpts);

  languageService = env.languageService;

  if (cachedTypingFiles.length > 0)
    defineTypes({action: TsVfsWorkerActions.DEFINE_TYPES_REQUEST, data: cachedTypingFiles});

  return {action: TsVfsWorkerActions.CREATE_VFS_ENV_RESPONSE};
}

function updateVfsEnv(request: ActionMessage<Map<string, string>>): void {
  if (!env?.sys) return;

  request.data?.forEach((value, key) => {
    updateOrCreateFile(env!, key, value);
  });
}

// Update content of the file in virtual environment.
function codeChanged(request: ActionMessage<CodeChangeRequest>): void {
  if (!request.data || !env) return;

  updateFile(env, request.data.file, request.data.code);

  // run diagnostics when code changed
  postMessage(
    runDiagnostics({
      action: TsVfsWorkerActions.DIAGNOSTICS_REQUEST,
      data: {file: request.data.file},
    }),
  );
}

// Get autocomplete proposal for given position of the file.
function getAutocompleteProposals(
  request: ActionMessage<AutocompleteRequest>,
): ActionMessage<AutocompleteResponse> {
  if (!env) {
    return {
      action: TsVfsWorkerActions.AUTOCOMPLETE_RESPONSE,
      data: [],
    };
  }

  updateFile(env, request.data!.file, request.data!.content);

  const completions = languageService!.getCompletionsAtPosition(
    request.data!.file,
    request.data!.position,
    USER_PREFERENCES,
    FORMAT_CODE_SETTINGS,
  );

  const completionsWithImportSuggestions = completions?.entries.map((entry) => {
    if (entry.source) {
      const entryDetails = languageService!.getCompletionEntryDetails(
        request.data!.file,
        request.data!.position,
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
    action: TsVfsWorkerActions.AUTOCOMPLETE_RESPONSE,
    data: completionsWithImportSuggestions,
  };
}

// Run diagnostics after file update.
function runDiagnostics(
  request: ActionMessage<DiagnosticsRequest>,
): ActionMessage<DiagnosticsResponse> {
  if (!env?.sys || !fileExists(env, request.data!.file)) {
    return {action: TsVfsWorkerActions.DIAGNOSTICS_RESPONSE, data: []};
  }

  const syntacticDiagnostics = languageService?.getSyntacticDiagnostics(request.data!.file) ?? [];
  const semanticDiagnostic = languageService?.getSemanticDiagnostics(request.data!.file) ?? [];
  const suggestionDiagnostics = languageService?.getSuggestionDiagnostics(request.data!.file) ?? [];

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

  return {action: TsVfsWorkerActions.DIAGNOSTICS_RESPONSE, data: result};
}

function defineTypes(request: ActionMessage<DefineTypesRequest>): void {
  if (!env?.sys || !request.data?.length) return;

  for (const {path, content} of request.data) {
    updateOrCreateFile(env, path, content);
  }

  cachedTypingFiles = request.data ?? [];
}

function displayTooltip(
  request: ActionMessage<DisplayTooltipRequest>,
): ActionMessage<DisplayTooltipResponse> {
  if (!languageService) {
    return {
      action: TsVfsWorkerActions.DISPLAY_TOOLTIP_RESPONSE,
      data: {
        tags: null,
        displayParts: null,
        documentation: null,
      },
    };
  }

  const result = languageService.getQuickInfoAtPosition(request.data!.file, request.data!.position);

  if (!result) {
    return {
      action: TsVfsWorkerActions.DISPLAY_TOOLTIP_RESPONSE,
      data: {
        tags: null,
        displayParts: null,
        documentation: null,
      },
    };
  }

  return {
    action: TsVfsWorkerActions.DISPLAY_TOOLTIP_RESPONSE,
    data: {
      tags: result.tags ?? null,
      displayParts: result.displayParts ?? null,
      documentation: result.documentation ?? null,
    },
  };
}

// Strategy defines what function needs to be triggered for given request.
const triggerActionStrategy: Record<string, (request: ActionMessage) => ActionMessage | void> = {
  [TsVfsWorkerActions.CREATE_VFS_ENV_REQUEST]: (request: ActionMessage) => createVfsEnv(request),
  [TsVfsWorkerActions.UPDATE_VFS_ENV_REQUEST]: (request: ActionMessage) => updateVfsEnv(request),
  [TsVfsWorkerActions.CODE_CHANGED]: (request: ActionMessage) => codeChanged(request),
  [TsVfsWorkerActions.AUTOCOMPLETE_REQUEST]: (request: ActionMessage) =>
    getAutocompleteProposals(request),
  [TsVfsWorkerActions.DIAGNOSTICS_REQUEST]: (request: ActionMessage) => runDiagnostics(request),
  [TsVfsWorkerActions.DEFINE_TYPES_REQUEST]: (request: ActionMessage) => defineTypes(request),
  [TsVfsWorkerActions.DISPLAY_TOOLTIP_REQUEST]: (request: ActionMessage) => displayTooltip(request),
};

const bootstrapWorker = async () => {
  const sendResponse = (message: ActionMessage): void => {
    postMessage(message);
  };

  compilerOpts = getCompilerOpts(ts);
  defaultFilesMap = await createDefaultMapFromCDN(compilerOpts, ts.version, false, ts);

  sendResponse({action: TsVfsWorkerActions.INIT_DEFAULT_FILE_SYSTEM_MAP});

  eventManager.subscribe((request) => {
    const response = triggerActionStrategy[request.action](request);

    if (response) {
      sendResponse(response);
    }
  });
};

addEventListener('message', ({data}: MessageEvent<ActionMessage>) => {
  eventManager.next(data);
});

// Initialize worker, create on init TypeScript Virtual Environment and setup listeners for action i.e. run diagnostics, autocomplete etc.
Promise.resolve(bootstrapWorker());
