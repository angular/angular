'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', {enumerable: true, value: v});
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', {value: true});
exports.Session = void 0;
const api_1 = require('@angular/language-service/api');
const ts = __importStar(require('typescript/lib/tsserverlibrary'));
const util_1 = require('util');
const vscode_html_languageservice_1 = require('vscode-html-languageservice');
const vscode_languageserver_textdocument_1 = require('vscode-languageserver-textdocument');
const lsp = __importStar(require('vscode-languageserver/node'));
const notifications_1 = require('../../common/notifications');
const requests_1 = require('../../common/requests');
const completion_1 = require('./completion');
const diagnostic_1 = require('./diagnostic');
const embedded_support_1 = require('./embedded_support');
const text_render_1 = require('./text_render');
const utils_1 = require('./utils');
var LanguageId;
(function (LanguageId) {
  LanguageId['TS'] = 'typescript';
  LanguageId['HTML'] = 'html';
})(LanguageId || (LanguageId = {}));
// Empty definition range for files without `scriptInfo`
const EMPTY_RANGE = lsp.Range.create(0, 0, 0, 0);
const setImmediateP = (0, util_1.promisify)(setImmediate);
const defaultFormatOptions = {};
let defaultPreferences = {};
const htmlLS = (0, vscode_html_languageservice_1.getLanguageService)();
const alwaysSuppressDiagnostics = [
  // Diagnostics codes whose errors should always be suppressed, regardless of the options
  // configuration.
];
/**
 * Session is a wrapper around lsp.IConnection, with all the necessary protocol
 * handlers installed for Angular language service.
 */
class Session {
  constructor(options) {
    this.openFiles = new utils_1.MruTracker();
    this.diagnosticsTimeout = null;
    this.isProjectLoading = false;
    /**
     * Tracks which `ts.server.Project`s have the renaming capability disabled.
     *
     * If we detect the compiler options diagnostic that suggests enabling strict mode, we want to
     * disable renaming because we know that there are many cases where it will not work correctly.
     */
    this.renameDisabledProjects = new WeakSet();
    this.clientCapabilities = {};
    this.includeAutomaticOptionalChainCompletions =
      options.includeAutomaticOptionalChainCompletions;
    this.includeCompletionsWithSnippetText = options.includeCompletionsWithSnippetText;
    this.includeCompletionsForModuleExports = options.includeCompletionsForModuleExports;
    this.logger = options.logger;
    this.logToConsole = options.logToConsole;
    defaultPreferences = Object.assign(Object.assign({}, defaultPreferences), {
      includeCompletionsForModuleExports: options.includeCompletionsForModuleExports,
    });
    // Create a connection for the server. The connection uses Node's IPC as a transport.
    this.connection = lsp.createConnection({
      // cancelUndispatched is a "middleware" to handle all cancellation requests.
      // LSP spec requires every request to send a response back, even if it is
      // cancelled. See
      // https://microsoft.github.io/language-server-protocol/specifications/specification-current/#cancelRequest
      cancelUndispatched(message) {
        return {
          jsonrpc: message.jsonrpc,
          // This ID is just a placeholder to satisfy the ResponseMessage type.
          // `vscode-jsonrpc` will replace the ID with the ID of the message to
          // be cancelled. See
          // https://github.com/microsoft/vscode-languageserver-node/blob/193f06bf602ee1120afda8f0bac33c5161cab18e/jsonrpc/src/common/connection.ts#L619
          id: -1,
          error: new lsp.ResponseError(lsp.LSPErrorCodes.RequestCancelled, 'Request cancelled'),
        };
      },
    });
    this.addProtocolHandlers(this.connection);
    this.projectService = this.createProjectService(options);
  }
  createProjectService(options) {
    const projSvc = new ts.server.ProjectService({
      host: options.host,
      logger: options.logger,
      cancellationToken: ts.server.nullCancellationToken,
      useSingleInferredProject: true,
      useInferredProjectPerProjectRoot: true,
      typingsInstaller: ts.server.nullTypingsInstaller,
      // Not supressing diagnostic events can cause a type error to be thrown when the
      // language server session gets an event for a file that is outside the project
      // managed by the project service, and for which a program does not exist in the
      // corresponding project's language service.
      // See https://github.com/angular/vscode-ng-language-service/issues/693
      suppressDiagnosticEvents: true,
      eventHandler: (e) => this.handleProjectServiceEvent(e),
      globalPlugins: [options.ngPlugin],
      pluginProbeLocations: [options.resolvedNgLsPath],
      // do not resolve plugins from the directory where tsconfig.json is located
      allowLocalPluginLoads: false,
      session: undefined,
    });
    projSvc.setHostConfiguration({
      formatOptions: projSvc.getHostFormatCodeOptions(),
      extraFileExtensions: [
        {
          // TODO: in View Engine getExternalFiles() returns a list of external
          // templates (HTML files). This configuration is no longer needed in
          // Ivy because Ivy returns the typecheck files.
          extension: '.html',
          isMixedContent: false,
          scriptKind: ts.ScriptKind.Unknown,
        },
      ],
      preferences: {
        // We don't want the AutoImportProvider projects to be created. See
        // https://devblogs.microsoft.com/typescript/announcing-typescript-4-0/#smarter-auto-imports
        includePackageJsonAutoImports: 'off',
        includeCompletionsForModuleExports: this.includeCompletionsForModuleExports,
      },
      watchOptions: {
        // Used as watch options when not specified by user's `tsconfig`.
        watchFile: ts.WatchFileKind.UseFsEvents,
        watchDirectory: ts.WatchDirectoryKind.UseFsEvents,
        fallbackPolling: ts.PollingWatchKind.DynamicPriority,
      },
    });
    const pluginConfig = {
      angularOnly: true,
    };
    if (options.forceStrictTemplates) {
      pluginConfig.forceStrictTemplates = true;
    }
    if (options.disableLetSyntax) {
      pluginConfig.enableLetSyntax = false;
    }
    if (options.angularCoreVersion !== null) {
      pluginConfig.angularCoreVersion = options.angularCoreVersion;
    }
    if (options.suppressAngularDiagnosticCodes !== null) {
      const parsedDiagnosticCodes = options.suppressAngularDiagnosticCodes
        .split(',')
        .map((c) => parseInt(c));
      pluginConfig.suppressAngularDiagnosticCodes = [
        ...alwaysSuppressDiagnostics,
        ...parsedDiagnosticCodes,
      ];
    }
    projSvc.configurePlugin({
      pluginName: options.ngPlugin,
      configuration: pluginConfig,
    });
    return projSvc;
  }
  addProtocolHandlers(conn) {
    conn.onInitialize((p) => this.onInitialize(p));
    conn.onDidOpenTextDocument((p) => this.onDidOpenTextDocument(p));
    conn.onDidCloseTextDocument((p) => this.onDidCloseTextDocument(p));
    conn.onDidChangeTextDocument((p) => this.onDidChangeTextDocument(p));
    conn.onDidSaveTextDocument((p) => this.onDidSaveTextDocument(p));
    conn.onDefinition((p) => this.onDefinition(p));
    conn.onTypeDefinition((p) => this.onTypeDefinition(p));
    conn.onReferences((p) => this.onReferences(p));
    conn.onRenameRequest((p) => this.onRenameRequest(p));
    conn.onPrepareRename((p) => this.onPrepareRename(p));
    conn.onHover((p) => this.onHover(p));
    conn.onFoldingRanges((p) => this.onFoldingRanges(p));
    conn.onCompletion((p) => this.onCompletion(p));
    conn.onCompletionResolve((p) => this.onCompletionResolve(p));
    conn.onRequest(requests_1.GetComponentsWithTemplateFile, (p) =>
      this.onGetComponentsWithTemplateFile(p),
    );
    conn.onRequest(requests_1.GetTemplateLocationForComponent, (p) =>
      this.onGetTemplateLocationForComponent(p),
    );
    conn.onRequest(requests_1.GetTcbRequest, (p) => this.onGetTcb(p));
    conn.onRequest(requests_1.IsInAngularProject, (p) => this.isInAngularProject(p));
    conn.onCodeLens((p) => this.onCodeLens(p));
    conn.onCodeLensResolve((p) => this.onCodeLensResolve(p));
    conn.onSignatureHelp((p) => this.onSignatureHelp(p));
    conn.onCodeAction((p) => this.onCodeAction(p));
    conn.onCodeActionResolve(async (p) => await this.onCodeActionResolve(p));
  }
  onCodeAction(params) {
    const filePath = (0, utils_1.uriToFilePath)(params.textDocument.uri);
    const lsInfo = this.getLSAndScriptInfo(params.textDocument);
    if (!lsInfo) {
      return null;
    }
    const refactorRange = {
      pos: (0, utils_1.lspPositionToTsPosition)(lsInfo.scriptInfo, params.range.start),
      end: (0, utils_1.lspPositionToTsPosition)(lsInfo.scriptInfo, params.range.end),
    };
    const applicableRefactors = lsInfo.languageService.getApplicableRefactors(
      filePath,
      refactorRange,
      defaultPreferences,
    );
    const codeActions = [];
    for (const diagnostic of params.context.diagnostics) {
      const errorCode = diagnostic.code;
      if (typeof errorCode !== 'number') {
        continue;
      }
      const start = (0, utils_1.lspPositionToTsPosition)(lsInfo.scriptInfo, diagnostic.range.start);
      const end = (0, utils_1.lspPositionToTsPosition)(lsInfo.scriptInfo, diagnostic.range.end);
      const codeActionsForDiagnostic = lsInfo.languageService.getCodeFixesAtPosition(
        filePath,
        start,
        end,
        [errorCode],
        defaultFormatOptions,
        defaultPreferences,
      );
      codeActions.push(...codeActionsForDiagnostic);
    }
    const individualCodeFixes = codeActions.map((codeAction) => {
      return {
        title: codeAction.description,
        kind: lsp.CodeActionKind.QuickFix,
        diagnostics: params.context.diagnostics,
        edit: (0, utils_1.tsFileTextChangesToLspWorkspaceEdit)(codeAction.changes, (path) =>
          this.projectService.getScriptInfo(path),
        ),
      };
    });
    const codeFixesAll = getCodeFixesAll(codeActions, params.textDocument);
    return [
      ...individualCodeFixes,
      ...codeFixesAll,
      ...applicableRefactors.map((r) => ({
        title: r.description,
        kind: lsp.CodeActionKind.Refactor,
        data: {
          refactor: true,
          name: r.name,
          range: refactorRange,
          document: params.textDocument,
        },
      })),
    ];
  }
  async onCodeActionResolve(param) {
    const codeActionResolve = param.data;
    // This is a refactoring action; not a code fix.
    if (codeActionResolve.refactor === true) {
      const filePath = (0, utils_1.uriToFilePath)(codeActionResolve.document.uri);
      const lsInfo = this.getLSAndScriptInfo(codeActionResolve.document);
      if (!lsInfo) {
        return param;
      }
      const progress = await this.connection.window.createWorkDoneProgress();
      progress.begin('Refactoring', 0);
      let edits = undefined;
      try {
        edits = await lsInfo.languageService.applyRefactoring(
          filePath,
          codeActionResolve.range,
          codeActionResolve.name,
          (percentage, updateMessage) => {
            progress.report(percentage, updateMessage);
          },
        );
      } catch (e) {
        console.error(e);
        this.connection.window.showErrorMessage(`Refactor failed with unexpected error: ${e}`);
      } finally {
        progress.done();
      }
      if ((edits === null || edits === void 0 ? void 0 : edits.warningMessage) !== undefined) {
        this.connection.window.showWarningMessage(edits.warningMessage);
      }
      if ((edits === null || edits === void 0 ? void 0 : edits.errorMessage) !== undefined) {
        this.connection.window.showErrorMessage(edits.errorMessage);
      }
      if (!edits) {
        return param;
      }
      return Object.assign(Object.assign({}, param), {
        edit: (0, utils_1.tsFileTextChangesToLspWorkspaceEdit)(edits.edits, (path) =>
          this.projectService.getScriptInfo(path),
        ),
      });
    }
    /**
     * Now `@angular/language-service` only support quick fix, so the `onCodeAction` will return the
     * `edit` of the `lsp.CodeAction` for the diagnostics in the range that the user selects except
     * the fix all code actions.
     *
     * And the function `getCombinedCodeFix` only cares about the `fixId` and the `document`.
     * https://github.com/microsoft/vscode/blob/8ba9963c2edb08d54f2b7221137d6f1de79ecc09/extensions/typescript-language-features/src/languageFeatures/quickFix.ts#L258
     */
    const isCodeFixesAll = codeActionResolve.fixId !== undefined;
    if (!isCodeFixesAll) {
      return param;
    }
    const filePath = (0, utils_1.uriToFilePath)(codeActionResolve.document.uri);
    const lsInfo = this.getLSAndScriptInfo(codeActionResolve.document);
    if (!lsInfo) {
      return param;
    }
    const fixesAllChanges = lsInfo.languageService.getCombinedCodeFix(
      {
        type: 'file',
        fileName: filePath,
      },
      codeActionResolve.fixId,
      defaultFormatOptions,
      defaultPreferences,
    );
    return {
      title: param.title,
      edit: (0, utils_1.tsFileTextChangesToLspWorkspaceEdit)(fixesAllChanges.changes, (path) =>
        this.projectService.getScriptInfo(path),
      ),
    };
  }
  isInAngularProject(params) {
    const filePath = (0, utils_1.uriToFilePath)(params.textDocument.uri);
    if (!filePath) {
      return false;
    }
    const lsAndScriptInfo = this.getLSAndScriptInfo(params.textDocument);
    if (!lsAndScriptInfo) {
      // If we cannot get language service / script info, return null to indicate we don't know
      // the answer definitively.
      return null;
    }
    const project = this.getDefaultProjectForScriptInfo(lsAndScriptInfo.scriptInfo);
    if (!project) {
      // If we cannot get project, return null to indicate we don't know
      // the answer definitively.
      return null;
    }
    const angularCore = project.getFileNames().find(isAngularCore);
    return angularCore !== undefined;
  }
  onGetTcb(params) {
    const lsInfo = this.getLSAndScriptInfo(params.textDocument);
    if (lsInfo === null) {
      return null;
    }
    const {languageService, scriptInfo} = lsInfo;
    const offset = (0, utils_1.lspPositionToTsPosition)(scriptInfo, params.position);
    const response = languageService.getTcb(scriptInfo.fileName, offset);
    if (response === undefined) {
      return null;
    }
    const {fileName: tcfName} = response;
    const tcfScriptInfo = this.projectService.getScriptInfo(tcfName);
    if (!tcfScriptInfo) {
      return null;
    }
    return {
      uri: (0, utils_1.filePathToUri)(tcfName),
      content: response.content,
      selections: response.selections.map((span) =>
        (0, utils_1.tsTextSpanToLspRange)(tcfScriptInfo, span),
      ),
    };
  }
  onGetTemplateLocationForComponent(params) {
    const lsInfo = this.getLSAndScriptInfo(params.textDocument);
    if (lsInfo === null) {
      return null;
    }
    const {languageService, scriptInfo} = lsInfo;
    const offset = (0, utils_1.lspPositionToTsPosition)(scriptInfo, params.position);
    const documentSpan = languageService.getTemplateLocationForComponent(
      scriptInfo.fileName,
      offset,
    );
    if (documentSpan === undefined) {
      return null;
    }
    const templateScriptInfo = this.projectService.getScriptInfo(documentSpan.fileName);
    if (templateScriptInfo === undefined) {
      return null;
    }
    const range = (0, utils_1.tsTextSpanToLspRange)(templateScriptInfo, documentSpan.textSpan);
    return lsp.Location.create((0, utils_1.filePathToUri)(documentSpan.fileName), range);
  }
  onGetComponentsWithTemplateFile(params) {
    const lsInfo = this.getLSAndScriptInfo(params.textDocument);
    if (lsInfo === null) {
      return null;
    }
    const {languageService, scriptInfo} = lsInfo;
    const documentSpans = languageService.getComponentLocationsForTemplate(scriptInfo.fileName);
    const results = [];
    for (const documentSpan of documentSpans) {
      const scriptInfo = this.projectService.getScriptInfo(documentSpan.fileName);
      if (scriptInfo === undefined) {
        continue;
      }
      const range = (0, utils_1.tsTextSpanToLspRange)(scriptInfo, documentSpan.textSpan);
      results.push(lsp.Location.create((0, utils_1.filePathToUri)(documentSpan.fileName), range));
    }
    return results;
  }
  onSignatureHelp(params) {
    const lsInfo = this.getLSAndScriptInfo(params.textDocument);
    if (lsInfo === null) {
      return null;
    }
    const {languageService, scriptInfo} = lsInfo;
    const offset = (0, utils_1.lspPositionToTsPosition)(scriptInfo, params.position);
    const help = languageService.getSignatureHelpItems(scriptInfo.fileName, offset, undefined);
    if (help === undefined) {
      return null;
    }
    return {
      activeParameter: help.argumentCount > 0 ? help.argumentIndex : null,
      activeSignature: help.selectedItemIndex,
      signatures: help.items.map((item) => {
        // For each signature, build up a 'label' which represents the full signature text, as well
        // as a parameter list where each parameter label is a span within the signature label.
        let label = (0, utils_1.tsDisplayPartsToText)(item.prefixDisplayParts);
        const parameters = [];
        let first = true;
        for (const param of item.parameters) {
          if (!first) {
            label += (0, utils_1.tsDisplayPartsToText)(item.separatorDisplayParts);
          }
          first = false;
          // Add the parameter to the label, keeping track of its start and end positions.
          const start = label.length;
          label += (0, utils_1.tsDisplayPartsToText)(param.displayParts);
          const end = label.length;
          // The parameter itself uses a range within the signature label as its own label.
          parameters.push({
            label: [start, end],
            documentation: (0, utils_1.tsDisplayPartsToText)(param.documentation),
          });
        }
        label += (0, utils_1.tsDisplayPartsToText)(item.suffixDisplayParts);
        return {
          label,
          documentation: (0, utils_1.tsDisplayPartsToText)(item.documentation),
          parameters,
        };
      }),
    };
  }
  onCodeLens(params) {
    if (!params.textDocument.uri.endsWith('.html') || !this.isInAngularProject(params)) {
      return null;
    }
    const position = lsp.Position.create(0, 0);
    const topOfDocument = lsp.Range.create(position, position);
    const codeLens = {
      range: topOfDocument,
      data: params.textDocument,
    };
    return [codeLens];
  }
  onCodeLensResolve(params) {
    const components = this.onGetComponentsWithTemplateFile({textDocument: params.data});
    if (components === null || components.length === 0) {
      // While the command is supposed to be optional, vscode will show `!!MISSING: command!!` that
      // fails if you click on it when a command is not provided. Instead, throwing an error will
      // make vscode show the text "no commands" (and it's not a link).
      // It is documented that code lens resolution can throw an error:
      // https://microsoft.github.io/language-server-protocol/specification#codeLens_resolve
      throw new Error('Could not determine component for ' + params.data.uri);
    }
    params.command = {
      command: 'angular.goToComponentWithTemplateFile',
      title:
        components.length > 1
          ? `Used as templateUrl in ${components.length} components`
          : 'Go to component',
    };
    return params;
  }
  enableLanguageServiceForProject(project) {
    const projectName = project.getProjectName();
    if (project.isClosed()) {
      this.info(`Cannot enable language service for closed project ${projectName}.`);
      return;
    }
    if (!project.languageServiceEnabled) {
      project.enableLanguageService();
      // When the language service got disabled, the program was discarded via
      // languageService.cleanupSemanticCache(). However, the program is not
      // recreated when the language service is re-enabled. We manually mark the
      // project as dirty to force update the graph.
      // Note: markAsDirty() is not a public API
      project.markAsDirty();
    }
    this.info(`Enabling language service for ${projectName}.`);
    this.handleCompilerOptionsDiagnostics(project);
    // Send diagnostics since we skipped this step when opening the file.
    // First, make sure the Angular project is complete.
    this.runGlobalAnalysisForNewlyLoadedProject(project);
    project.refreshDiagnostics();
  }
  disableLanguageServiceForProject(project, reason) {
    if (!project.languageServiceEnabled) {
      return;
    }
    this.info(`Disabling language service for ${project.getProjectName()} because ${reason}.`);
    project.disableLanguageService();
  }
  /**
   * Invoke the compiler for the first time so that external templates get
   * matched to the project they belong to.
   */
  runGlobalAnalysisForNewlyLoadedProject(project) {
    if (!project.hasRoots()) {
      return;
    }
    const fileName = project.getRootScriptInfos()[0].fileName;
    const label = `Global analysis - getSemanticDiagnostics for ${fileName}`;
    if (utils_1.isDebugMode) {
      console.time(label);
    }
    // Getting semantic diagnostics will trigger a global analysis.
    project.getLanguageService().getSemanticDiagnostics(fileName);
    if (utils_1.isDebugMode) {
      console.timeEnd(label);
    }
  }
  handleCompilerOptionsDiagnostics(project) {
    if (!(0, utils_1.isConfiguredProject)(project)) {
      return;
    }
    const diags = project.getLanguageService().getCompilerOptionsDiagnostics();
    const suggestStrictModeDiag = diags.find((d) => d.code === -9910001);
    if (suggestStrictModeDiag) {
      const configFilePath = project.getConfigFilePath();
      this.connection.sendNotification(notifications_1.SuggestStrictMode, {
        configFilePath,
        message: suggestStrictModeDiag.messageText,
      });
      this.renameDisabledProjects.add(project);
    } else {
      this.renameDisabledProjects.delete(project);
    }
  }
  /**
   * An event handler that gets invoked whenever the program changes and
   * TS ProjectService sends `ProjectUpdatedInBackgroundEvent`. This particular
   * event is used to trigger diagnostic checks.
   * @param event
   */
  handleProjectServiceEvent(event) {
    var _a;
    switch (event.eventName) {
      case ts.server.ProjectLoadingStartEvent:
        this.isProjectLoading = true;
        this.connection.sendNotification(notifications_1.ProjectLoadingStart);
        this.logger.info(`Loading new project: ${event.data.reason}`);
        break;
      case ts.server.ProjectLoadingFinishEvent: {
        if (this.isProjectLoading) {
          this.isProjectLoading = false;
          this.connection.sendNotification(notifications_1.ProjectLoadingFinish);
        }
        const {project} = event.data;
        const angularCore = this.findAngularCore(project);
        if (angularCore) {
          this.enableLanguageServiceForProject(project);
        } else if (
          (_a = project.getProjectReferences()) === null || _a === void 0 ? void 0 : _a.length
        ) {
          // Do not disable language service for project if it has project references. Even though
          // we couldn't find angular/core for this parent tsconfig, it might exist in the
          // referenced projects. Disabling the language service for this root project will clean up
          // the program for the project.
          // https://github.com/microsoft/TypeScript/commit/3c4c060dff2b0292d3a4d88ba0627b7657d67e7f#diff-fad6af6557c1406192e30af30e0113a5eb327d60f9e2588bdce6667d619ebd04R973-R983
          // We need to keep this language service and program enabled because referenced projects
          // don't load until we open a client file for that project.
          this.info(
            `@angular/core could not be found for project ${project.getProjectName()} but it has references that might.` +
              ` The Angular language service will remain enabled for this project.`,
          );
        } else {
          this.disableLanguageServiceForProject(
            project,
            `project is not an Angular project ('@angular/core' could not be found)`,
          );
        }
        break;
      }
      case ts.server.ProjectsUpdatedInBackgroundEvent:
        // ProjectsUpdatedInBackgroundEvent is sent whenever diagnostics are
        // requested via project.refreshDiagnostics()
        this.triggerDiagnostics(event.data.openFiles, event.eventName);
        break;
      case ts.server.ProjectLanguageServiceStateEvent:
        this.connection.sendNotification(notifications_1.ProjectLanguageService, {
          projectName: event.data.project.getProjectName(),
          languageServiceEnabled: event.data.languageServiceEnabled,
        });
    }
  }
  /**
   * Request diagnostics to be computed due to the specified `file` being opened
   * or changed.
   * @param file File opened / changed
   * @param reason Trace to explain why diagnostics are requested
   */
  requestDiagnosticsOnOpenOrChangeFile(file, reason) {
    const files = [];
    if (isExternalTemplate(file)) {
      // If only external template is opened / changed, we know for sure it will
      // not affect other files because it is local to the Component.
      files.push(file);
    } else {
      // Get all open files, most recently used first.
      for (const openFile of this.openFiles.getAll()) {
        const scriptInfo = this.projectService.getScriptInfo(openFile);
        if (scriptInfo) {
          files.push(scriptInfo.fileName);
        }
      }
    }
    this.triggerDiagnostics(files, reason);
  }
  /**
   * Retrieve Angular diagnostics for the specified `files` after a specific
   * `delay`, or renew the request if there's already a pending one.
   * @param files files to be checked
   * @param reason Trace to explain why diagnostics are triggered
   * @param delay time to wait before sending request (milliseconds)
   */
  triggerDiagnostics(files, reason, delay = 300) {
    // Do not immediately send a diagnostics request. Send only after user has
    // stopped typing after the specified delay.
    if (this.diagnosticsTimeout) {
      // If there's an existing timeout, cancel it
      clearTimeout(this.diagnosticsTimeout);
    }
    // Set a new timeout
    this.diagnosticsTimeout = setTimeout(() => {
      this.diagnosticsTimeout = null; // clear the timeout
      this.sendPendingDiagnostics(files, reason);
      // Default delay is 200ms, consistent with TypeScript. See
      // https://github.com/microsoft/vscode/blob/7b944a16f52843b44cede123dd43ae36c0405dfd/extensions/typescript-language-features/src/features/bufferSyncSupport.ts#L493)
    }, delay);
  }
  /**
   * Execute diagnostics request for each of the specified `files`.
   * @param files files to be checked
   * @param reason Trace to explain why diagnostics is triggered
   */
  async sendPendingDiagnostics(files, reason) {
    for (let i = 0; i < files.length; ++i) {
      const fileName = files[i];
      const result = this.getLSAndScriptInfo(fileName);
      if (!result) {
        continue;
      }
      const label = `${reason} - getSemanticDiagnostics for ${fileName}`;
      if (utils_1.isDebugMode) {
        console.time(label);
      }
      const diagnostics = result.languageService.getSemanticDiagnostics(fileName);
      if (utils_1.isDebugMode) {
        console.timeEnd(label);
      }
      const suggestionLabel = `${reason} - getSuggestionDiagnostics for ${fileName}`;
      if (utils_1.isDebugMode) {
        console.time(suggestionLabel);
      }
      diagnostics.push(...result.languageService.getSuggestionDiagnostics(fileName));
      if (utils_1.isDebugMode) {
        console.timeEnd(suggestionLabel);
      }
      // Need to send diagnostics even if it's empty otherwise editor state will
      // not be updated.
      this.connection.sendDiagnostics({
        uri: (0, utils_1.filePathToUri)(fileName),
        diagnostics: diagnostics.map((d) =>
          (0, diagnostic_1.tsDiagnosticToLspDiagnostic)(d, this.projectService),
        ),
      });
      if (this.diagnosticsTimeout) {
        // There is a pending request to check diagnostics for all open files,
        // so stop this one immediately.
        return;
      }
      if (i < files.length - 1) {
        // If this is not the last file, yield so that pending I/O events get a
        // chance to run. This will open an opportunity for the server to process
        // incoming requests. The next file will be checked in the next iteration
        // of the event loop.
        await setImmediateP();
      }
    }
  }
  /**
   * Return the default project for the specified `scriptInfo` if it is already
   * a configured project. If not, attempt to find a relevant config file and
   * make that project its default. This method is to ensure HTML files always
   * belong to a configured project instead of the default behavior of being in
   * an inferred project.
   * @param scriptInfo
   */
  getDefaultProjectForScriptInfo(scriptInfo) {
    let project = this.projectService.getDefaultProjectForFile(
      scriptInfo.fileName,
      // ensureProject tries to find a default project for the scriptInfo if
      // it does not already have one. It is not needed here because we are
      // going to assign it a project below if it does not have one.
      false,
    );
    // TODO: verify that HTML files are attached to Inferred project by default.
    // If they are already part of a ConfiguredProject then the following is
    // not needed.
    if (!project || project.projectKind !== ts.server.ProjectKind.Configured) {
      const {configFileName} = this.projectService.openClientFile(scriptInfo.fileName);
      if (!configFileName) {
        // Failed to find a config file. There is nothing we could do.
        this.error(`No config file for ${scriptInfo.fileName}`);
        return null;
      }
      project = this.projectService.findProject(configFileName);
      if (!project) {
        return null;
      }
      scriptInfo.detachAllProjects();
      scriptInfo.attachToProject(project);
    }
    return project;
  }
  onInitialize(params) {
    var _a, _b, _c;
    this.snippetSupport =
      (_c =
        (_b =
          (_a = params.capabilities.textDocument) === null || _a === void 0
            ? void 0
            : _a.completion) === null || _b === void 0
          ? void 0
          : _b.completionItem) === null || _c === void 0
        ? void 0
        : _c.snippetSupport;
    const serverOptions = {
      logFile: this.logger.getLogFileName(),
    };
    this.clientCapabilities = params.capabilities;
    return {
      capabilities: {
        foldingRangeProvider: true,
        codeLensProvider: {resolveProvider: true},
        textDocumentSync: lsp.TextDocumentSyncKind.Incremental,
        completionProvider: {
          resolveProvider: true,
          triggerCharacters: ['<', '.', '*', '[', '(', '$', '|', '@'],
        },
        definitionProvider: true,
        typeDefinitionProvider: true,
        referencesProvider: true,
        renameProvider: {
          // Renames should be checked and tested before being executed.
          prepareProvider: true,
        },
        hoverProvider: true,
        signatureHelpProvider: {
          triggerCharacters: ['(', ','],
          retriggerCharacters: [','],
        },
        workspace: {
          workspaceFolders: {supported: true},
        },
        codeActionProvider: {
          resolveProvider: true,
          // Now the Angular code action provider only supports `QuickFix`. If leave the
          // `codeActionKinds` empty, all action requests will be sent to the Angular language
          // service, especially for the action before saving the file, the Angular code action
          // provider will try to fix all errors in the whole file, it's expensive.
          //
          // Find more info
          // [here](https://github.com/angular/vscode-ng-language-service/issues/1828)
          codeActionKinds: [lsp.CodeActionKind.QuickFix],
        },
      },
      serverOptions,
    };
  }
  onDidOpenTextDocument(params) {
    var _a;
    const {uri, languageId, text} = params.textDocument;
    const filePath = (0, utils_1.uriToFilePath)(uri);
    if (!filePath) {
      return;
    }
    this.openFiles.update(filePath);
    // External templates (HTML files) should be tagged as ScriptKind.Unknown
    // so that they don't get parsed as TS files. See
    // https://github.com/microsoft/TypeScript/blob/b217f22e798c781f55d17da72ed099a9dee5c650/src/compiler/program.ts#L1897-L1899
    const scriptKind = languageId === LanguageId.TS ? ts.ScriptKind.TS : ts.ScriptKind.Unknown;
    try {
      // The content could be newer than that on disk. This could be due to
      // buffer in the user's editor which has not been saved to disk.
      // See https://github.com/angular/vscode-ng-language-service/issues/632
      let result = this.projectService.openClientFile(filePath, text, scriptKind);
      // If the first opened file is an HTML file and the project is a composite/solution-style
      // project with references, TypeScript will _not_ open a project unless the file is explicitly
      // included in the files/includes list. This is quite unlikely to be the case for HTML files.
      // As a best-effort to fix this, we attempt to open a TS file with the same name. Most of the
      // time, this is going to be the component file for the external template.
      // https://github.com/angular/vscode-ng-language-service/issues/2149
      if (result.configFileName === undefined && languageId === LanguageId.HTML) {
        const maybeComponentTsPath = filePath.replace(/\.html$/, '.ts');
        if (!this.projectService.openFiles.has(this.projectService.toPath(maybeComponentTsPath))) {
          this.projectService.openClientFile(maybeComponentTsPath);
          this.projectService.closeClientFile(maybeComponentTsPath);
          result = this.projectService.openClientFile(filePath, text, scriptKind);
        }
      }
      const {configFileName, configFileErrors} = result;
      if (configFileErrors && configFileErrors.length) {
        // configFileErrors is an empty array even if there's no error, so check length.
        this.error(configFileErrors.map((e) => e.messageText).join('\n'));
      }
      const project = configFileName
        ? this.projectService.findProject(configFileName)
        : (_a = this.projectService.getScriptInfo(filePath)) === null || _a === void 0
          ? void 0
          : _a.containingProjects.find(utils_1.isConfiguredProject);
      if (!(project === null || project === void 0 ? void 0 : project.languageServiceEnabled)) {
        return;
      }
      // The act of opening a file can cause the text storage to switchToScriptVersionCache for
      // version tracking, which results in an identity change for the source file. This isn't
      // typically an issue but the identity can change during an update operation for template
      // type-checking, when we _only_ expect the typecheck files to change. This _is_ an issue
      // because the because template type-checking should not modify the identity of any other
      // source files (other than the generated typecheck files). We need to ensure that the
      // compiler is aware of this change that shouldn't have happened and recompiles the file
      // because we store references to some string expressions (inline templates, style/template
      // urls).
      // Note: markAsDirty() is not a public API
      project.markAsDirty();
      // Show initial diagnostics
      this.requestDiagnosticsOnOpenOrChangeFile(filePath, `Opening ${filePath}`);
    } catch (error) {
      if (this.isProjectLoading) {
        this.isProjectLoading = false;
        this.connection.sendNotification(notifications_1.ProjectLoadingFinish);
      }
      if (error.stack) {
        this.error(error.stack);
      }
      throw error;
    }
  }
  onDidCloseTextDocument(params) {
    const {textDocument} = params;
    const filePath = (0, utils_1.uriToFilePath)(textDocument.uri);
    if (!filePath) {
      return;
    }
    this.openFiles.delete(filePath);
    this.projectService.closeClientFile(filePath);
  }
  onDidChangeTextDocument(params) {
    const {contentChanges, textDocument} = params;
    const filePath = (0, utils_1.uriToFilePath)(textDocument.uri);
    if (!filePath) {
      return;
    }
    this.openFiles.update(filePath);
    const scriptInfo = this.projectService.getScriptInfo(filePath);
    if (!scriptInfo) {
      this.error(`Failed to get script info for ${filePath}`);
      return;
    }
    for (const change of contentChanges) {
      if ('range' in change) {
        const [start, end] = (0, utils_1.lspRangeToTsPositions)(scriptInfo, change.range);
        scriptInfo.editContent(start, end, change.text);
      } else {
        // New text is considered to be the full content of the document.
        scriptInfo.editContent(0, scriptInfo.getSnapshot().getLength(), change.text);
      }
    }
    const project = this.getDefaultProjectForScriptInfo(scriptInfo);
    if (!project || !project.languageServiceEnabled) {
      return;
    }
    this.requestDiagnosticsOnOpenOrChangeFile(scriptInfo.fileName, `Changing ${filePath}`);
  }
  onDidSaveTextDocument(params) {
    const {text, textDocument} = params;
    const filePath = (0, utils_1.uriToFilePath)(textDocument.uri);
    if (!filePath) {
      return;
    }
    this.openFiles.update(filePath);
    const scriptInfo = this.projectService.getScriptInfo(filePath);
    if (!scriptInfo) {
      return;
    }
    if (text) {
      scriptInfo.open(text);
    } else {
      scriptInfo.reloadFromFile();
    }
  }
  onFoldingRanges(params) {
    var _a, _b;
    const lsInfo = this.getLSAndScriptInfo(params.textDocument);
    if (lsInfo === null) {
      return null;
    }
    const {scriptInfo, languageService} = lsInfo;
    const angularOutliningSpans = languageService.getOutliningSpans(scriptInfo.fileName);
    const angularFoldingRanges = angularOutliningSpans.map((outliningSpan) => {
      const range = (0, utils_1.tsTextSpanToLspRange)(scriptInfo, {
        start: outliningSpan.textSpan.start,
        length: outliningSpan.textSpan.length,
      });
      // We do not want to fold the line containing the closing of the block because then the
      // closing character (and line) would get hidden in the folding range. We only want to fold
      // the inside and leave the start/end lines visible.
      const endLine = Math.max(range.end.line - 1, range.start.line);
      return lsp.FoldingRange.create(range.start.line, endLine);
    });
    if (!((_a = params.textDocument.uri) === null || _a === void 0 ? void 0 : _a.endsWith('ts'))) {
      return angularFoldingRanges;
    }
    const sf =
      (_b = this.getDefaultProjectForScriptInfo(scriptInfo)) === null || _b === void 0
        ? void 0
        : _b.getSourceFile(scriptInfo.path);
    if (sf === undefined) {
      return null;
    }
    const virtualHtmlDocContents = (0, embedded_support_1.getHTMLVirtualContent)(sf);
    const virtualHtmlDoc = vscode_languageserver_textdocument_1.TextDocument.create(
      params.textDocument.uri.toString(),
      'html',
      0,
      virtualHtmlDocContents,
    );
    return [...htmlLS.getFoldingRanges(virtualHtmlDoc), ...angularFoldingRanges];
  }
  onDefinition(params) {
    var _a, _b, _c;
    const lsInfo = this.getLSAndScriptInfo(params.textDocument);
    if (lsInfo === null) {
      return null;
    }
    const {languageService, scriptInfo} = lsInfo;
    const offset = (0, utils_1.lspPositionToTsPosition)(scriptInfo, params.position);
    const definition = languageService.getDefinitionAndBoundSpan(scriptInfo.fileName, offset);
    if (!definition || !definition.definitions) {
      return null;
    }
    const clientSupportsLocationLinks =
      (_c =
        (_b =
          (_a = this.clientCapabilities.textDocument) === null || _a === void 0
            ? void 0
            : _a.definition) === null || _b === void 0
          ? void 0
          : _b.linkSupport) !== null && _c !== void 0
        ? _c
        : false;
    if (!clientSupportsLocationLinks) {
      return this.tsDefinitionsToLspLocations(definition.definitions);
    }
    const originSelectionRange = (0, utils_1.tsTextSpanToLspRange)(scriptInfo, definition.textSpan);
    return this.tsDefinitionsToLspLocationLinks(definition.definitions, originSelectionRange);
  }
  onTypeDefinition(params) {
    var _a, _b, _c;
    const lsInfo = this.getLSAndScriptInfo(params.textDocument);
    if (lsInfo === null) {
      return null;
    }
    const {languageService, scriptInfo} = lsInfo;
    const offset = (0, utils_1.lspPositionToTsPosition)(scriptInfo, params.position);
    const definitions = languageService.getTypeDefinitionAtPosition(scriptInfo.fileName, offset);
    if (!definitions) {
      return null;
    }
    const clientSupportsLocationLinks =
      (_c =
        (_b =
          (_a = this.clientCapabilities.textDocument) === null || _a === void 0
            ? void 0
            : _a.typeDefinition) === null || _b === void 0
          ? void 0
          : _b.linkSupport) !== null && _c !== void 0
        ? _c
        : false;
    if (!clientSupportsLocationLinks) {
      return this.tsDefinitionsToLspLocations(definitions);
    }
    return this.tsDefinitionsToLspLocationLinks(definitions);
  }
  onRenameRequest(params) {
    const lsInfo = this.getLSAndScriptInfo(params.textDocument);
    if (lsInfo === null) {
      return null;
    }
    const {languageService, scriptInfo} = lsInfo;
    const project = this.getDefaultProjectForScriptInfo(scriptInfo);
    if (project === null || this.renameDisabledProjects.has(project)) {
      return null;
    }
    const offset = (0, utils_1.lspPositionToTsPosition)(scriptInfo, params.position);
    const renameLocations = languageService.findRenameLocations(
      scriptInfo.fileName,
      offset,
      /*findInStrings*/ false,
      /*findInComments*/ false,
    );
    if (renameLocations === undefined) {
      return null;
    }
    const changes = renameLocations.reduce((changes, location) => {
      let uri = (0, utils_1.filePathToUri)(location.fileName);
      if (changes[uri] === undefined) {
        changes[uri] = [];
      }
      const fileEdits = changes[uri];
      const lsInfo = this.getLSAndScriptInfo(location.fileName);
      if (lsInfo === null) {
        return changes;
      }
      const range = (0, utils_1.tsTextSpanToLspRange)(lsInfo.scriptInfo, location.textSpan);
      fileEdits.push({range, newText: params.newName});
      return changes;
    }, {});
    return {changes};
  }
  onPrepareRename(params) {
    const lsInfo = this.getLSAndScriptInfo(params.textDocument);
    if (lsInfo === null) {
      return null;
    }
    const {languageService, scriptInfo} = lsInfo;
    const project = this.getDefaultProjectForScriptInfo(scriptInfo);
    if (project === null || this.renameDisabledProjects.has(project)) {
      return null;
    }
    const offset = (0, utils_1.lspPositionToTsPosition)(scriptInfo, params.position);
    const renameInfo = languageService.getRenameInfo(scriptInfo.fileName, offset);
    if (!renameInfo.canRename) {
      return null;
    }
    const range = (0, utils_1.tsTextSpanToLspRange)(scriptInfo, renameInfo.triggerSpan);
    return {
      range,
      placeholder: renameInfo.displayName,
    };
  }
  onReferences(params) {
    const lsInfo = this.getLSAndScriptInfo(params.textDocument);
    if (lsInfo === null) {
      return null;
    }
    const {languageService, scriptInfo} = lsInfo;
    const offset = (0, utils_1.lspPositionToTsPosition)(scriptInfo, params.position);
    const references = languageService.getReferencesAtPosition(scriptInfo.fileName, offset);
    if (references === undefined) {
      return null;
    }
    return references.map((ref) => {
      const scriptInfo = this.projectService.getScriptInfo(ref.fileName);
      const range = scriptInfo
        ? (0, utils_1.tsTextSpanToLspRange)(scriptInfo, ref.textSpan)
        : EMPTY_RANGE;
      const uri = (0, utils_1.filePathToUri)(ref.fileName);
      return {uri, range};
    });
  }
  tsDefinitionsToLspLocations(definitions) {
    var _a;
    const results = [];
    for (const d of definitions) {
      const scriptInfo = this.projectService.getScriptInfo(d.fileName);
      // Some definitions, like definitions of CSS files, may not be recorded files with a
      // `scriptInfo` but are still valid definitions because they are files that exist. In this
      // case, check to make sure that the text span of the definition is zero so that the file
      // doesn't have to be read; if the span is non-zero, we can't do anything with this
      // definition.
      if (!scriptInfo && d.textSpan.length > 0) {
        continue;
      }
      let mappedInfo = d;
      let range = EMPTY_RANGE;
      if (scriptInfo) {
        const project = this.getDefaultProjectForScriptInfo(scriptInfo);
        mappedInfo = project ? (0, utils_1.getMappedDefinitionInfo)(d, project) : mappedInfo;
        // After the DTS file maps to original source file, the `scriptInfo` should be updated.
        const originalScriptInfo =
          (_a = this.projectService.getScriptInfo(mappedInfo.fileName)) !== null && _a !== void 0
            ? _a
            : scriptInfo;
        range = (0, utils_1.tsTextSpanToLspRange)(originalScriptInfo, mappedInfo.textSpan);
      }
      const uri = (0, utils_1.filePathToUri)(mappedInfo.fileName);
      results.push({
        uri,
        range,
      });
    }
    return results;
  }
  tsDefinitionsToLspLocationLinks(definitions, originSelectionRange) {
    var _a;
    const results = [];
    for (const d of definitions) {
      const scriptInfo = this.projectService.getScriptInfo(d.fileName);
      // Some definitions, like definitions of CSS files, may not be recorded files with a
      // `scriptInfo` but are still valid definitions because they are files that exist. In this
      // case, check to make sure that the text span of the definition is zero so that the file
      // doesn't have to be read; if the span is non-zero, we can't do anything with this
      // definition.
      if (!scriptInfo && d.textSpan.length > 0) {
        continue;
      }
      let mappedInfo = d;
      let range = EMPTY_RANGE;
      if (scriptInfo) {
        const project = this.getDefaultProjectForScriptInfo(scriptInfo);
        mappedInfo = project ? (0, utils_1.getMappedDefinitionInfo)(d, project) : mappedInfo;
        // After the DTS file maps to original source file, the `scriptInfo` should be updated.
        const originalScriptInfo =
          (_a = this.projectService.getScriptInfo(mappedInfo.fileName)) !== null && _a !== void 0
            ? _a
            : scriptInfo;
        range = (0, utils_1.tsTextSpanToLspRange)(originalScriptInfo, mappedInfo.textSpan);
      }
      const targetUri = (0, utils_1.filePathToUri)(mappedInfo.fileName);
      results.push({
        originSelectionRange,
        targetUri,
        targetRange: range,
        targetSelectionRange: range,
      });
    }
    return results;
  }
  getLSAndScriptInfo(textDocumentOrFileName) {
    const filePath = lsp.TextDocumentIdentifier.is(textDocumentOrFileName)
      ? (0, utils_1.uriToFilePath)(textDocumentOrFileName.uri)
      : textDocumentOrFileName;
    const scriptInfo = this.projectService.getScriptInfo(filePath);
    if (!scriptInfo) {
      this.error(`Script info not found for ${filePath}`);
      return null;
    }
    const project = this.getDefaultProjectForScriptInfo(scriptInfo);
    if (!(project === null || project === void 0 ? void 0 : project.languageServiceEnabled)) {
      return null;
    }
    if (project.isClosed()) {
      scriptInfo.detachFromProject(project);
      this.logger.info(
        `Failed to get language service for closed project ${project.getProjectName()}.`,
      );
      return null;
    }
    const languageService = project.getLanguageService();
    if (!(0, api_1.isNgLanguageService)(languageService)) {
      return null;
    }
    return {
      languageService,
      scriptInfo,
    };
  }
  onHover(params) {
    const lsInfo = this.getLSAndScriptInfo(params.textDocument);
    if (lsInfo === null) {
      return null;
    }
    const {languageService, scriptInfo} = lsInfo;
    const offset = (0, utils_1.lspPositionToTsPosition)(scriptInfo, params.position);
    const info = languageService.getQuickInfoAtPosition(scriptInfo.fileName, offset);
    if (!info) {
      return null;
    }
    const {kind, kindModifiers, textSpan, displayParts, documentation, tags} = info;
    let desc = kindModifiers ? kindModifiers + ' ' : '';
    if (displayParts && displayParts.length > 0) {
      // displayParts does not contain info about kindModifiers
      // but displayParts does contain info about kind
      desc += displayParts.map((dp) => dp.text).join('');
    } else {
      desc += kind;
    }
    const contents = [
      {
        language: 'typescript',
        value: desc,
      },
    ];
    const mds = (0, text_render_1.documentationToMarkdown)(documentation, tags, (fileName) => {
      var _a;
      return (_a = this.getLSAndScriptInfo(fileName)) === null || _a === void 0
        ? void 0
        : _a.scriptInfo;
    });
    contents.push(mds.join('\n'));
    return {
      contents,
      range: (0, utils_1.tsTextSpanToLspRange)(scriptInfo, textSpan),
    };
  }
  onCompletion(params) {
    const lsInfo = this.getLSAndScriptInfo(params.textDocument);
    if (lsInfo === null) {
      return null;
    }
    const {languageService, scriptInfo} = lsInfo;
    const offset = (0, utils_1.lspPositionToTsPosition)(scriptInfo, params.position);
    let options = {};
    const includeCompletionsWithSnippetText =
      this.includeCompletionsWithSnippetText && this.snippetSupport;
    if (
      this.includeAutomaticOptionalChainCompletions ||
      includeCompletionsWithSnippetText ||
      this.includeCompletionsForModuleExports
    ) {
      options = {
        includeAutomaticOptionalChainCompletions: this.includeAutomaticOptionalChainCompletions,
        includeCompletionsWithSnippetText: includeCompletionsWithSnippetText,
        includeCompletionsWithInsertText:
          this.includeAutomaticOptionalChainCompletions || includeCompletionsWithSnippetText,
        includeCompletionsForModuleExports: this.includeCompletionsForModuleExports,
      };
    }
    const completions = languageService.getCompletionsAtPosition(
      scriptInfo.fileName,
      offset,
      options,
    );
    if (!completions) {
      return null;
    }
    return completions.entries.map((e) =>
      (0, completion_1.tsCompletionEntryToLspCompletionItem)(e, params.position, scriptInfo),
    );
  }
  onCompletionResolve(item) {
    var _a;
    const data = (0, completion_1.readNgCompletionData)(item);
    if (data === null) {
      // This item wasn't tagged with Angular LS completion data - it probably didn't originate
      // from this language service.
      return item;
    }
    const {filePath, position} = data;
    const lsInfo = this.getLSAndScriptInfo(filePath);
    if (lsInfo === null) {
      return item;
    }
    const {languageService, scriptInfo} = lsInfo;
    const offset = (0, utils_1.lspPositionToTsPosition)(scriptInfo, position);
    const details = languageService.getCompletionEntryDetails(
      filePath,
      offset,
      (_a = item.insertText) !== null && _a !== void 0 ? _a : item.label,
      undefined,
      undefined,
      defaultPreferences,
      data.tsData,
    );
    if (details === undefined) {
      return item;
    }
    const {kind, kindModifiers, displayParts, documentation, tags, codeActions} = details;
    const codeActionsDetail = generateCommandAndTextEditsFromCodeActions(
      codeActions !== null && codeActions !== void 0 ? codeActions : [],
      filePath,
      (path) => this.projectService.getScriptInfo(path),
    );
    let desc = kindModifiers ? kindModifiers + ' ' : '';
    if (displayParts && displayParts.length > 0) {
      // displayParts does not contain info about kindModifiers
      // but displayParts does contain info about kind
      desc += displayParts.map((dp) => dp.text).join('');
    } else {
      desc += kind;
    }
    item.detail = desc;
    item.documentation = {
      kind: lsp.MarkupKind.Markdown,
      value: (0, text_render_1.documentationToMarkdown)(documentation, tags, (fileName) => {
        var _a;
        return (_a = this.getLSAndScriptInfo(fileName)) === null || _a === void 0
          ? void 0
          : _a.scriptInfo;
      }).join('\n'),
    };
    item.additionalTextEdits = codeActionsDetail.additionalTextEdits;
    item.command = codeActionsDetail.command;
    return item;
  }
  /**
   * Show an error message in the remote console and log to file.
   *
   * @param message The message to show.
   */
  error(message) {
    if (this.logToConsole) {
      this.connection.console.error(message);
    }
    this.logger.msg(message, ts.server.Msg.Err);
  }
  /**
   * Show a warning message in the remote console and log to file.
   *
   * @param message The message to show.
   */
  warn(message) {
    if (this.logToConsole) {
      this.connection.console.warn(message);
    }
    // ts.server.Msg does not have warning level, so log as info.
    this.logger.msg(`[WARN] ${message}`, ts.server.Msg.Info);
  }
  /**
   * Show an information message in the remote console and log to file.
   *
   * @param message The message to show.
   */
  info(message) {
    if (this.logToConsole) {
      this.connection.console.info(message);
    }
    this.logger.msg(message, ts.server.Msg.Info);
  }
  /**
   * Start listening on the input stream for messages to process.
   */
  listen() {
    this.connection.listen();
  }
  /**
   * Find the main declaration file for `@angular/core` in the specified
   * `project`.
   *
   * @returns main declaration file in `@angular/core`.
   */
  findAngularCore(project) {
    const projectName = project.getProjectName();
    if (!project.languageServiceEnabled) {
      this.info(
        `Language service is already disabled for ${projectName}. ` +
          `This could be due to non-TS files that exceeded the size limit (${ts.server.maxProgramSizeForNonTsFiles} bytes).` +
          `Please check log file for details.`,
      );
      return null;
    }
    if (!project.hasRoots() || project.isNonTsProject()) {
      return null;
    }
    const angularCore = project.getFileNames().find(isAngularCore);
    if (angularCore === undefined && project.getExcludedFiles().some(isAngularCore)) {
      this.info(
        `Please check your tsconfig.json to make sure 'node_modules' directory is not excluded.`,
      );
    }
    return angularCore !== null && angularCore !== void 0 ? angularCore : null;
  }
}
exports.Session = Session;
function isAngularCore(path) {
  return isExternalAngularCore(path) || isInternalAngularCore(path);
}
function isExternalAngularCore(path) {
  return path.endsWith('@angular/core/core.d.ts') || path.endsWith('@angular/core/index.d.ts');
}
function isInternalAngularCore(path) {
  // path in g3
  return (
    path.endsWith('angular2/rc/packages/core/index.d.ts') ||
    // angular/angular repository direct sources
    path.indexOf('angular/packages/core/src') !== -1
  );
}
function isTypeScriptFile(path) {
  return path.endsWith('.ts');
}
function isExternalTemplate(path) {
  return !isTypeScriptFile(path);
}
/**
 * Extract the fixAll action from `codeActions`
 *
 * When getting code fixes at the specified cursor position, the LS will return the code actions
 * that tell the editor how to fix it. For each code action, if the document includes multi
 * same-type errors, the `fixId` will append to it, because they are not `complete`. This function
 * will extract them, and they will be resolved lazily in the `onCodeActionResolve` function.
 *
 * Now the client can only resolve the `edit` property.
 * https://github.com/microsoft/vscode-languageserver-node/blob/f97bb73dbfb920af4bc8c13ecdcdc16359cdeda6/client/src/common/codeAction.ts#L45
 */
function getCodeFixesAll(codeActions, document) {
  const seenFixId = new Set();
  const lspCodeActions = [];
  for (const codeAction of codeActions) {
    const fixId = codeAction.fixId;
    if (fixId === undefined || codeAction.fixAllDescription === undefined || seenFixId.has(fixId)) {
      continue;
    }
    seenFixId.add(fixId);
    const codeActionResolveData = {
      fixId,
      document,
    };
    lspCodeActions.push({
      title: codeAction.fixAllDescription,
      kind: lsp.CodeActionKind.QuickFix,
      data: codeActionResolveData,
    });
  }
  return lspCodeActions;
}
/**
 * In the completion item, the `additionalTextEdits` can only be included the changes about the
 * current file, the other changes should be inserted by the vscode command.
 *
 * For example, when the user selects a component in an HTML file, the extension inserts the
 * selector in the HTML file and auto-generates the import declaration in the TS file.
 *
 * The code is copied from
 * [here](https://github.com/microsoft/vscode/blob/4608b378a8101ff273fa5db36516da6022f66bbf/extensions/typescript-language-features/src/languageFeatures/completions.ts#L304)
 */
function generateCommandAndTextEditsFromCodeActions(codeActions, currentFilePath, getScriptInfo) {
  if (codeActions.length === 0) {
    return {};
  }
  // Try to extract out the additionalTextEdits for the current file.
  // Also check if we still have to apply other workspace edits and commands
  // using a vscode command
  const additionalTextEdits = [];
  const commandTextEditors = [];
  for (const tsAction of codeActions) {
    const currentFileChanges = tsAction.changes.filter(
      (change) => change.fileName === currentFilePath,
    );
    const otherWorkspaceFileChanges = tsAction.changes.filter(
      (change) => change.fileName !== currentFilePath,
    );
    if (currentFileChanges.length > 0) {
      // Apply all edits in the current file using `additionalTextEdits`
      const additionalWorkspaceEdit = (0, utils_1.tsFileTextChangesToLspWorkspaceEdit)(
        currentFileChanges,
        getScriptInfo,
      ).changes;
      if (additionalWorkspaceEdit !== undefined) {
        for (const edit of Object.values(additionalWorkspaceEdit)) {
          additionalTextEdits.push(...edit);
        }
      }
    }
    if (otherWorkspaceFileChanges.length > 0) {
      commandTextEditors.push(
        (0, utils_1.tsFileTextChangesToLspWorkspaceEdit)(otherWorkspaceFileChanges, getScriptInfo),
      );
    }
  }
  let command = undefined;
  if (commandTextEditors.length > 0) {
    // Create command that applies all edits not in the current file.
    command = {
      title: '',
      command: 'angular.applyCompletionCodeAction',
      arguments: [commandTextEditors],
    };
  }
  return {
    command,
    additionalTextEdits: additionalTextEdits.length ? additionalTextEdits : undefined,
  };
}
//# sourceMappingURL=session.js.map
