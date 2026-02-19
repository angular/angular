/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isNgLanguageService, NgLanguageService, PluginConfig} from '@angular/language-service/api';
import * as ts from 'typescript/lib/tsserverlibrary';
import {promisify} from 'util';
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
import {
  filePathToUri,
  isConfiguredProject,
  isDebugMode,
  lspRangeToTsPositions,
  MruTracker,
  uriToFilePath,
} from './utils';
import {onCodeAction, onCodeActionResolve} from './handlers/code_actions';
import {getComponentsWithTemplateFile, onCodeLens, onCodeLensResolve} from './handlers/code_lens';
import {onCompletion, onCompletionResolve} from './handlers/completions';
import {onDefinition, onTypeDefinition, onReferences} from './handlers/definitions';
import {
  onDocumentDiagnostic,
  onWorkspaceDiagnostic,
  clearDiagnosticCache,
  getLspDiagnosticsForFile,
  invalidateAllProjectDiagnostics,
  invalidateProjectDiagnostics,
} from './handlers/diagnostics';
import {onFoldingRanges} from './handlers/folding';
import {onHover} from './handlers/hover';
import {onInitialize} from './handlers/initialization';
import {onLinkedEditingRange} from './handlers/linked_editing_range';
import {onRenameRequest, onPrepareRename} from './handlers/rename';
import {onSignatureHelp} from './handlers/signature';
import {onGetTcb} from './handlers/tcb';
import {onGetTemplateLocationForComponent, isInAngularProject} from './handlers/template_info';
import {onDidChangeWatchedFiles} from './handlers/did_change_watched_files';

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

enum LanguageId {
  TS = 'typescript',
  HTML = 'html',
}

const setImmediateP = promisify(setImmediate);

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
  private readonly host: ServerHost;
  private readonly logToConsole: boolean;
  private readonly openFiles = new MruTracker();
  readonly includeAutomaticOptionalChainCompletions: boolean;
  readonly includeCompletionsWithSnippetText: boolean;
  readonly includeCompletionsForModuleExports: boolean;
  snippetSupport: boolean | undefined;
  private diagnosticsTimeout: NodeJS.Timeout | null = null;
  isProjectLoading = false;
  /**
   * Whether the client supports pull-based diagnostics (LSP 3.17).
   * If true, we use workspace/diagnostic/refresh to notify the client
   * instead of pushing diagnostics via textDocument/publishDiagnostics.
   */
  private usePullDiagnostics = false;
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
    this.host = options.host;
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
    conn.onDidChangeWatchedFiles((p) => onDidChangeWatchedFiles(p, this.logger, this.host));
    conn.onDidOpenTextDocument((p) => this.onDidOpenTextDocument(p));
    conn.onDidCloseTextDocument((p) => this.onDidCloseTextDocument(p));
    conn.onDidChangeTextDocument((p) => this.onDidChangeTextDocument(p));
    conn.onDidSaveTextDocument((p) => this.onDidSaveTextDocument(p));
    conn.onDefinition((p) => onDefinition(this, p));
    conn.onTypeDefinition((p) => onTypeDefinition(this, p));
    conn.onReferences((p) => onReferences(this, p));
    conn.onRenameRequest((p) => onRenameRequest(this, p));
    conn.onPrepareRename((p) => onPrepareRename(this, p));
    conn.onHover((p) => onHover(this, p));
    conn.onFoldingRanges((p) => onFoldingRanges(this, p));
    conn.languages.onLinkedEditingRange((p) => onLinkedEditingRange(this, p));
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

    // Pull-based diagnostics handlers (LSP 3.17)
    conn.languages.diagnostics.on((p, token) => onDocumentDiagnostic(this, p, token));
    conn.languages.diagnostics.onWorkspace((p, token, _workDoneProgress, resultProgress) =>
      onWorkspaceDiagnostic(this, p, token, resultProgress),
    );
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
    if (this.usePullDiagnostics) {
      // In pull mode, ask the client to refresh and then pull diagnostics.
      // Avoid triggering push-oriented diagnostics work via project.refreshDiagnostics().
      this.refreshDiagnostics(true);
    } else {
      project.refreshDiagnostics();
    }
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
        this.triggerDiagnostics(event.data.openFiles, event.eventName);
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
   * Request diagnostics to be computed due to the specified `file` being opened
   * or changed.
   * @param file File opened / changed
   * @param reason Trace to explain why diagnostics are requested
   */
  private requestDiagnosticsOnOpenOrChangeFile(file: string, reason: string): void {
    const files: string[] = [];
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
  private triggerDiagnostics(files: string[], reason: string, delay: number = 300) {
    // Do not immediately send a diagnostics request. Send only after user has
    // stopped typing after the specified delay.
    if (this.diagnosticsTimeout) {
      // If there's an existing timeout, cancel it
      clearTimeout(this.diagnosticsTimeout);
    }
    // Set a new timeout
    this.diagnosticsTimeout = setTimeout(() => {
      this.diagnosticsTimeout = null; // clear the timeout

      // If using pull-based diagnostics (LSP 3.17), ask the client to refresh
      // instead of pushing diagnostics from the server
      if (this.usePullDiagnostics) {
        // For background project updates we do not have a precise changed-file set,
        // so invalidate globally for correctness across project references.
        if (reason === ts.server.ProjectsUpdatedInBackgroundEvent) {
          this.refreshDiagnostics(true);
          return;
        }

        // For open/change triggers we attempt a finer-grained invalidation so
        // unrelated files can still return cached `Unchanged` results.
        this.invalidatePullDiagnosticsForImpactedFiles(files);
        this.logger.info(`${reason} - Requesting client to refresh diagnostics (pull-based)`);
        this.refreshDiagnostics(false);
      } else {
        this.sendPendingDiagnostics(files, reason);
      }
      // Default delay is 200ms, consistent with TypeScript. See
      // https://github.com/microsoft/vscode/blob/7b944a16f52843b44cede123dd43ae36c0405dfd/extensions/typescript-language-features/src/features/bufferSyncSupport.ts#L493)
    }, delay);
  }

  private invalidatePullDiagnosticsForImpactedFiles(files: string[]): void {
    const impactedFiles = new Set<string>();
    const fallbackProjects = new Set<string>();

    for (const changedFile of files) {
      impactedFiles.add(changedFile);
      const scriptInfo = this.projectService.getScriptInfo(changedFile);
      if (!scriptInfo) {
        continue;
      }

      const project = this.getDefaultProjectForScriptInfo(scriptInfo);
      if (!project || project.isClosed()) {
        continue;
      }
      fallbackProjects.add(project.getProjectName());

      const languageService = project.getLanguageService();
      if (!isNgLanguageService(languageService)) {
        continue;
      }

      const projectFiles = project.getFileNames(true, true);
      const reverseDeps = this.buildReverseDependencyMap(languageService.getProgram());
      const componentToTemplates = this.buildComponentToTemplateMap(languageService, projectFiles);

      const queue = [changedFile];
      const visited = new Set<string>();
      while (queue.length > 0) {
        const current = queue.pop()!;
        if (visited.has(current)) {
          continue;
        }
        visited.add(current);
        impactedFiles.add(current);

        for (const importer of reverseDeps.get(current) ?? []) {
          if (!visited.has(importer)) {
            queue.push(importer);
          }
        }

        if (isExternalTemplate(current)) {
          for (const component of languageService.getComponentLocationsForTemplate(current)) {
            if (!visited.has(component.fileName)) {
              queue.push(component.fileName);
            }
          }
        }

        for (const template of componentToTemplates.get(current) ?? []) {
          impactedFiles.add(template);
        }
      }

      // Angular metadata edits can affect templates without TS import edges
      // (e.g. selector rename for an unimported component).
      const snapshot = scriptInfo.getSnapshot();
      const text = snapshot.getText(0, snapshot.getLength());
      if (/@Component\s*\(|@Directive\s*\(|@Pipe\s*\(|@NgModule\s*\(/.test(text)) {
        for (const fileName of projectFiles) {
          impactedFiles.add(fileName);
        }
      }
    }

    for (const fileName of impactedFiles) {
      clearDiagnosticCache(filePathToUri(fileName));
    }

    // Fallback for cases where impacted files could not be determined.
    if (impactedFiles.size === 0) {
      for (const projectName of fallbackProjects) {
        invalidateProjectDiagnostics(projectName);
      }
    }
  }

  private buildReverseDependencyMap(program: ts.Program | undefined): Map<string, Set<string>> {
    const reverseDeps = new Map<string, Set<string>>();
    if (!program) {
      return reverseDeps;
    }

    for (const sourceFile of program.getSourceFiles()) {
      const importer = sourceFile.fileName;
      const resolvedModules = (
        sourceFile as ts.SourceFile & {
          resolvedModules?: ReadonlyMap<string, ts.ResolvedModuleFull | undefined>;
        }
      ).resolvedModules;
      if (!resolvedModules) {
        continue;
      }
      for (const resolved of resolvedModules.values()) {
        const imported = resolved?.resolvedFileName;
        if (!imported) {
          continue;
        }
        let importers = reverseDeps.get(imported);
        if (!importers) {
          importers = new Set<string>();
          reverseDeps.set(imported, importers);
        }
        importers.add(importer);
      }
    }

    return reverseDeps;
  }

  private buildComponentToTemplateMap(
    languageService: NgLanguageService,
    projectFiles: string[],
  ): Map<string, Set<string>> {
    const componentToTemplates = new Map<string, Set<string>>();
    for (const fileName of projectFiles) {
      if (!isExternalTemplate(fileName)) {
        continue;
      }
      const components = languageService.getComponentLocationsForTemplate(fileName);
      for (const component of components) {
        let templates = componentToTemplates.get(component.fileName);
        if (!templates) {
          templates = new Set<string>();
          componentToTemplates.set(component.fileName, templates);
        }
        templates.add(fileName);
      }
    }
    return componentToTemplates;
  }

  /**
   * Execute diagnostics request for each of the specified `files`.
   * Used for push-based diagnostics (fallback when client doesn't support pull).
   * @param files files to be checked
   * @param reason Trace to explain why diagnostics is triggered
   */
  private async sendPendingDiagnostics(files: string[], reason: string) {
    for (let i = 0; i < files.length; ++i) {
      const fileName = files[i];
      const result = this.getLSAndScriptInfo(fileName);
      if (!result) {
        continue;
      }
      const diagnostics = getLspDiagnosticsForFile(this, result.languageService, fileName, reason);

      // Need to send diagnostics even if it's empty otherwise editor state will
      // not be updated.
      this.connection.sendDiagnostics({
        uri: filePathToUri(fileName),
        diagnostics,
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

  private onDidOpenTextDocument(params: lsp.DidOpenTextDocumentParams) {
    const {uri, languageId, text} = params.textDocument;
    const filePath = uriToFilePath(uri);
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
        : this.projectService.getScriptInfo(filePath)?.containingProjects.find(isConfiguredProject);
      if (!project?.languageServiceEnabled) {
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
      (project as any).markAsDirty();
      // Show initial diagnostics
      this.requestDiagnosticsOnOpenOrChangeFile(filePath, `Opening ${filePath}`);
    } catch (error) {
      if (this.isProjectLoading) {
        this.isProjectLoading = false;
        this.connection.sendNotification(ProjectLoadingFinish);
      }
      if (error instanceof Error && error.stack) {
        this.error(error.stack);
      }
      throw error;
    }
  }

  private onDidCloseTextDocument(params: lsp.DidCloseTextDocumentParams) {
    const {textDocument} = params;
    const filePath = uriToFilePath(textDocument.uri);
    if (!filePath) {
      return;
    }
    this.logger.info(`Closing file: ${filePath}`);
    this.openFiles.delete(filePath);
    this.projectService.closeClientFile(filePath);
    // Clear the diagnostic cache for this file
    clearDiagnosticCache(textDocument.uri);
  }

  private onDidChangeTextDocument(params: lsp.DidChangeTextDocumentParams): void {
    const {contentChanges, textDocument} = params;
    const filePath = uriToFilePath(textDocument.uri);
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
        const [start, end] = lspRangeToTsPositions(scriptInfo, change.range);
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

  private onDidSaveTextDocument(params: lsp.DidSaveTextDocumentParams): void {
    const {text, textDocument} = params;
    const filePath = uriToFilePath(textDocument.uri);
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

  /**
   * Get all source files across all configured Angular projects.
   * Returns user source files (excluding library .d.ts files and config files)
   * that are either TypeScript files or external templates (HTML).
   * Open files are returned first for priority processing.
   */
  getProjectFileNames(): string[] {
    const allFiles = new Set<string>();
    const openFileSet = new Set(this.openFiles.getAll());

    for (const [, project] of this.projectService.configuredProjects) {
      if (!project.languageServiceEnabled || project.isClosed()) {
        continue;
      }
      // getFileNames(true, true) excludes external library .d.ts files and config files
      for (const fileName of project.getFileNames(true, true)) {
        allFiles.add(fileName);
      }
    }

    // Return open files first (they are the user's current focus),
    // followed by the remaining project files
    const openFirst: string[] = [];
    const rest: string[] = [];
    for (const fileName of allFiles) {
      if (openFileSet.has(fileName)) {
        openFirst.push(fileName);
      } else {
        rest.push(fileName);
      }
    }
    return [...openFirst, ...rest];
  }

  /**
   * Set whether to use pull-based diagnostics (LSP 3.17).
   * When enabled, the server will ask the client to refresh diagnostics
   * via workspace/diagnostic/refresh instead of pushing them.
   */
  setPullDiagnosticsMode(enabled: boolean): void {
    this.usePullDiagnostics = enabled;
    this.logger.info(`Pull-based diagnostics: ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Request the client to refresh all diagnostics.
   * This is useful when the server detects a project-wide change.
   */
  refreshDiagnostics(invalidateAll: boolean = true): void {
    if (!this.usePullDiagnostics) {
      this.logger.info(
        'Skipping workspace/diagnostic/refresh because pull diagnostics is disabled.',
      );
      return;
    }
    if (invalidateAll) {
      // Project-wide refresh means diagnostics may change for files whose text version did not.
      // Bump global invalidation epoch so pull requests recompute at least once.
      invalidateAllProjectDiagnostics();
    }
    this.connection.languages.diagnostics.refresh();
  }
}

function isAngularCore(path: string): boolean {
  return isExternalAngularCore(path) || isInternalAngularCore(path);
}

function isExternalAngularCore(path: string): boolean {
  return /@angular\/core\/.+\.d\.ts$/.test(path);
}

function isInternalAngularCore(path: string): boolean {
  // path in g3
  return (
    path.endsWith('angular2/rc/packages/core/index.d.ts') ||
    // angular/angular repository direct sources
    path.includes('angular/packages/core/src')
  );
}

function isTypeScriptFile(path: string): boolean {
  return path.endsWith('.ts');
}

function isExternalTemplate(path: string): boolean {
  return !isTypeScriptFile(path);
}
