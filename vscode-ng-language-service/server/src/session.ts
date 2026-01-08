/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isNgLanguageService, NgLanguageService, PluginConfig} from '@angular/language-service/api';
import * as ts from 'typescript/lib/tsserverlibrary';
import * as lsp from 'vscode-languageserver/node';

import {
  ProjectLanguageService,
  ProjectLoadingFinish,
  ProjectLoadingStart,
  SuggestStrictMode,
} from '../../common/notifications';
import {
  GetComponentsWithTemplateFile,
  GetTcbRequest,
  GetTemplateLocationForComponent,
  IsInAngularProject,
} from '../../common/requests';

import {ServerHost} from './server_host';
import {isConfiguredProject, isDebugMode, uriToFilePath} from './utils';
import {onCodeAction, onCodeActionResolve} from './handlers/code_actions';
import {getComponentsWithTemplateFile, onCodeLens, onCodeLensResolve} from './handlers/code_lens';
import {onCompletion, onCompletionResolve} from './handlers/completions';
import {onDefinition, onReferences, onTypeDefinition} from './handlers/definitions';
import {onFoldingRanges} from './handlers/folding';
import {onHover} from './handlers/hover';
import {onInitialize} from './handlers/initialization';
import {onPrepareRename, onRenameRequest} from './handlers/rename';
import {onSignatureHelp} from './handlers/signature';
import {onGetTcb} from './handlers/tcb';
import {isInAngularProject, onGetTemplateLocationForComponent} from './handlers/template_info';
import {DocumentSyncHandler} from './handlers/document_sync';
import {isAngularCore} from './utils';

export interface SessionOptions {
  host: ServerHost;
  logger: ts.server.Logger;
  ngPlugin: string;
  resolvedNgLsPath: string;
  logToConsole: boolean;
  includeAutomaticOptionalChainCompletions: boolean;
  includeCompletionsWithSnippetText: boolean;
  includeCompletionsForModuleExports: boolean;
  forceStrictTemplates: boolean;
  disableBlockSyntax: boolean;
  disableLetSyntax: boolean;
  angularCoreVersion: string | null;
  suppressAngularDiagnosticCodes: string | null;
}
const alwaysSuppressDiagnostics: number[] = [
  // Diagnostics codes whose errors should always be suppressed, regardless of the options
  // configuration.
];

/**
 * Session is a wrapper around lsp.IConnection, with all the necessary protocol
 * handlers installed for Angular language service.
 */
export class Session {
  readonly connection: lsp.Connection;
  readonly projectService: ts.server.ProjectService;
  readonly logger: ts.server.Logger;
  private readonly logToConsole: boolean;
  readonly includeAutomaticOptionalChainCompletions: boolean;
  readonly includeCompletionsWithSnippetText: boolean;
  readonly includeCompletionsForModuleExports: boolean;
  snippetSupport: boolean | undefined;
  readonly documentSync = new DocumentSyncHandler(this);
  isProjectLoading = false;
  /**
   * Tracks which `ts.server.Project`s have the renaming capability disabled.
   *
   * If we detect the compiler options diagnostic that suggests enabling strict mode, we want to
   * disable renaming because we know that there are many cases where it will not work correctly.
   */
  readonly renameDisabledProjects: WeakSet<ts.server.Project> = new WeakSet();
  clientCapabilities: lsp.ClientCapabilities = {};
  readonly defaultPreferences: ts.UserPreferences = {};

  constructor(options: SessionOptions) {
    this.includeAutomaticOptionalChainCompletions =
      options.includeAutomaticOptionalChainCompletions;
    this.includeCompletionsWithSnippetText = options.includeCompletionsWithSnippetText;
    this.includeCompletionsForModuleExports = options.includeCompletionsForModuleExports;
    this.logger = options.logger;
    this.logToConsole = options.logToConsole;
    this.defaultPreferences = {
      ...this.defaultPreferences,
      includeCompletionsForModuleExports: options.includeCompletionsForModuleExports,
    };
    // Create a connection for the server. The connection uses Node's IPC as a transport.
    this.connection = lsp.createConnection({
      // cancelUndispatched is a "middleware" to handle all cancellation requests.
      // LSP spec requires every request to send a response back, even if it is
      // cancelled. See
      // https://microsoft.github.io/language-server-protocol/specifications/specification-current/#cancelRequest
      cancelUndispatched(message: lsp.Message): lsp.ResponseMessage | undefined {
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

  private createProjectService(options: SessionOptions): ts.server.ProjectService {
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
        // On Windows, fs.watch() can hold a lock on the watched directory, which
        // causes problems when users try to rename/move/delete folders.
        // It's better to use polling instead.
        // https://github.com/angular/vscode-ng-language-service/issues/1398
        // More history here: https://github.com/angular/vscode-ng-language-service/commit/6eb2984cbe2112d9f4284192ffa11d40ee6b2f74
        watchDirectory:
          process.platform === 'win32'
            ? ts.WatchDirectoryKind.DynamicPriorityPolling
            : ts.WatchDirectoryKind.UseFsEvents,
        fallbackPolling: ts.PollingWatchKind.DynamicPriority,
      },
    });

    const pluginConfig: PluginConfig = {
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

  private addProtocolHandlers(conn: lsp.Connection) {
    conn.onInitialize((p) => onInitialize(this, p));
    conn.onDidOpenTextDocument((p) => this.documentSync.onDidOpenTextDocument(p));
    conn.onDidCloseTextDocument((p) => this.documentSync.onDidCloseTextDocument(p));
    conn.onDidChangeTextDocument((p) => this.documentSync.onDidChangeTextDocument(p));
    conn.onDidSaveTextDocument((p) => this.documentSync.onDidSaveTextDocument(p));
    conn.onDefinition((p) => onDefinition(this, p));
    conn.onTypeDefinition((p) => onTypeDefinition(this, p));
    conn.onReferences((p) => onReferences(this, p));
    conn.onRenameRequest((p) => onRenameRequest(this, p));
    conn.onPrepareRename((p) => onPrepareRename(this, p));
    conn.onHover((p) => onHover(this, p));
    conn.onFoldingRanges((p) => onFoldingRanges(this, p));
    conn.onCompletion((p) => onCompletion(this, p));
    conn.onCompletionResolve((p) => onCompletionResolve(this, p));
    conn.onRequest(GetComponentsWithTemplateFile, (p) => getComponentsWithTemplateFile(this, p));
    conn.onRequest(GetTemplateLocationForComponent, (p) =>
      onGetTemplateLocationForComponent(this, p),
    );
    conn.onRequest(GetTcbRequest, (p) => onGetTcb(this, p));
    conn.onRequest(IsInAngularProject, (p) => isInAngularProject(this, p));
    conn.onCodeLens((p) => onCodeLens(this, p));
    conn.onCodeLensResolve((p) => onCodeLensResolve(this, p));
    conn.onSignatureHelp((p) => onSignatureHelp(this, p));
    conn.onCodeAction((p) => onCodeAction(this, p));
    conn.onCodeActionResolve(async (p) => await onCodeActionResolve(this, p));
  }

  private enableLanguageServiceForProject(project: ts.server.Project): void {
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
      (project as any).markAsDirty();
    }
    this.info(`Enabling language service for ${projectName}.`);
    this.handleCompilerOptionsDiagnostics(project);
    // Send diagnostics since we skipped this step when opening the file.
    // First, make sure the Angular project is complete.
    this.runGlobalAnalysisForNewlyLoadedProject(project);
    project.refreshDiagnostics();
  }

  private disableLanguageServiceForProject(project: ts.server.Project, reason: string): void {
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
  private runGlobalAnalysisForNewlyLoadedProject(project: ts.server.Project): void {
    if (!project.hasRoots()) {
      return;
    }
    const fileName = project.getRootScriptInfos()[0].fileName;
    const label = `Global analysis - getSemanticDiagnostics for ${fileName}`;
    if (isDebugMode) {
      console.time(label);
    }
    // Getting semantic diagnostics will trigger a global analysis.
    project.getLanguageService().getSemanticDiagnostics(fileName);
    if (isDebugMode) {
      console.timeEnd(label);
    }
  }

  private handleCompilerOptionsDiagnostics(project: ts.server.Project): void {
    if (!isConfiguredProject(project)) {
      return;
    }

    const diags = project.getLanguageService().getCompilerOptionsDiagnostics();
    const suggestStrictModeDiag = diags.find((d) => d.code === -9910001);

    if (suggestStrictModeDiag) {
      const configFilePath: string = project.getConfigFilePath();
      this.connection.sendNotification(SuggestStrictMode, {
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
  private handleProjectServiceEvent(event: ts.server.ProjectServiceEvent) {
    switch (event.eventName) {
      case ts.server.ProjectLoadingStartEvent:
        this.isProjectLoading = true;
        this.connection.sendNotification(ProjectLoadingStart);
        this.logger.info(`Loading new project: ${event.data.reason}`);
        break;
      case ts.server.ProjectLoadingFinishEvent: {
        if (this.isProjectLoading) {
          this.isProjectLoading = false;
          this.connection.sendNotification(ProjectLoadingFinish);
        }
        const {project} = event.data;
        const angularCore = this.findAngularCore(project);
        if (angularCore) {
          this.enableLanguageServiceForProject(project);
        } else if (project.getProjectReferences()?.length) {
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
        this.documentSync.triggerDiagnostics(event.data.openFiles, event.eventName);
        break;
      case ts.server.ProjectLanguageServiceStateEvent:
        this.logger.info(
          `Project language service state changed for ${event.data.project.getProjectName()}. Enabled: ${
            event.data.languageServiceEnabled
          }`,
        );
        this.connection.sendNotification(ProjectLanguageService, {
          projectName: event.data.project.getProjectName(),
          languageServiceEnabled: event.data.languageServiceEnabled,
        });
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
  getDefaultProjectForScriptInfo(scriptInfo: ts.server.ScriptInfo): ts.server.Project | null {
    let project = this.projectService.getDefaultProjectForFile(
      scriptInfo.fileName,
      // ensureProject tries to find a default project for the scriptInfo if
      // it does not already have one. It is not needed here because we are
      // going to assign it a project below if it does not have one.
      false, // ensureProject
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

  getLSAndScriptInfo(
    textDocumentOrFileName: lsp.TextDocumentIdentifier | string,
  ): {languageService: NgLanguageService; scriptInfo: ts.server.ScriptInfo} | null {
    const filePath = lsp.TextDocumentIdentifier.is(textDocumentOrFileName)
      ? uriToFilePath(textDocumentOrFileName.uri)
      : textDocumentOrFileName;
    const scriptInfo = this.projectService.getScriptInfo(filePath);
    if (!scriptInfo) {
      this.error(`Script info not found for ${filePath}`);
      return null;
    }

    const project = this.getDefaultProjectForScriptInfo(scriptInfo);
    if (!project?.languageServiceEnabled) {
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
    if (!isNgLanguageService(languageService)) {
      return null;
    }
    return {
      languageService,
      scriptInfo,
    };
  }

  /**
   * Show an error message in the remote console and log to file.
   *
   * @param message The message to show.
   */
  error(message: string): void {
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
  warn(message: string): void {
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
  info(message: string): void {
    if (this.logToConsole) {
      this.connection.console.info(message);
    }
    this.logger.msg(message, ts.server.Msg.Info);
  }

  /**
   * Start listening on the input stream for messages to process.
   */
  listen(): void {
    this.connection.listen();
  }

  /**
   * Find the main declaration file for `@angular/core` in the specified
   * `project`.
   *
   * @returns main declaration file in `@angular/core`.
   */
  private findAngularCore(project: ts.server.Project): string | null {
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
    return angularCore ?? null;
  }
}
