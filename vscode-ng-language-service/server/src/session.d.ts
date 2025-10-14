/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript/lib/tsserverlibrary';
import { ServerHost } from './server_host';
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
/**
 * Session is a wrapper around lsp.IConnection, with all the necessary protocol
 * handlers installed for Angular language service.
 */
export declare class Session {
    private readonly connection;
    private readonly projectService;
    private readonly logger;
    private readonly logToConsole;
    private readonly openFiles;
    private readonly includeAutomaticOptionalChainCompletions;
    private readonly includeCompletionsWithSnippetText;
    private readonly includeCompletionsForModuleExports;
    private snippetSupport;
    private diagnosticsTimeout;
    private isProjectLoading;
    /**
     * Tracks which `ts.server.Project`s have the renaming capability disabled.
     *
     * If we detect the compiler options diagnostic that suggests enabling strict mode, we want to
     * disable renaming because we know that there are many cases where it will not work correctly.
     */
    private renameDisabledProjects;
    private clientCapabilities;
    constructor(options: SessionOptions);
    private createProjectService;
    private addProtocolHandlers;
    private onCodeAction;
    private onCodeActionResolve;
    private isInAngularProject;
    private onGetTcb;
    private onGetTemplateLocationForComponent;
    private onGetComponentsWithTemplateFile;
    private onSignatureHelp;
    private onCodeLens;
    private onCodeLensResolve;
    private enableLanguageServiceForProject;
    private disableLanguageServiceForProject;
    /**
     * Invoke the compiler for the first time so that external templates get
     * matched to the project they belong to.
     */
    private runGlobalAnalysisForNewlyLoadedProject;
    private handleCompilerOptionsDiagnostics;
    /**
     * An event handler that gets invoked whenever the program changes and
     * TS ProjectService sends `ProjectUpdatedInBackgroundEvent`. This particular
     * event is used to trigger diagnostic checks.
     * @param event
     */
    private handleProjectServiceEvent;
    /**
     * Request diagnostics to be computed due to the specified `file` being opened
     * or changed.
     * @param file File opened / changed
     * @param reason Trace to explain why diagnostics are requested
     */
    private requestDiagnosticsOnOpenOrChangeFile;
    /**
     * Retrieve Angular diagnostics for the specified `files` after a specific
     * `delay`, or renew the request if there's already a pending one.
     * @param files files to be checked
     * @param reason Trace to explain why diagnostics are triggered
     * @param delay time to wait before sending request (milliseconds)
     */
    private triggerDiagnostics;
    /**
     * Execute diagnostics request for each of the specified `files`.
     * @param files files to be checked
     * @param reason Trace to explain why diagnostics is triggered
     */
    private sendPendingDiagnostics;
    /**
     * Return the default project for the specified `scriptInfo` if it is already
     * a configured project. If not, attempt to find a relevant config file and
     * make that project its default. This method is to ensure HTML files always
     * belong to a configured project instead of the default behavior of being in
     * an inferred project.
     * @param scriptInfo
     */
    getDefaultProjectForScriptInfo(scriptInfo: ts.server.ScriptInfo): ts.server.Project | null;
    private onInitialize;
    private onDidOpenTextDocument;
    private onDidCloseTextDocument;
    private onDidChangeTextDocument;
    private onDidSaveTextDocument;
    private onFoldingRanges;
    private onDefinition;
    private onTypeDefinition;
    private onRenameRequest;
    private onPrepareRename;
    private onReferences;
    private tsDefinitionsToLspLocations;
    private tsDefinitionsToLspLocationLinks;
    private getLSAndScriptInfo;
    private onHover;
    private onCompletion;
    private onCompletionResolve;
    /**
     * Show an error message in the remote console and log to file.
     *
     * @param message The message to show.
     */
    error(message: string): void;
    /**
     * Show a warning message in the remote console and log to file.
     *
     * @param message The message to show.
     */
    warn(message: string): void;
    /**
     * Show an information message in the remote console and log to file.
     *
     * @param message The message to show.
     */
    info(message: string): void;
    /**
     * Start listening on the input stream for messages to process.
     */
    listen(): void;
    /**
     * Find the main declaration file for `@angular/core` in the specified
     * `project`.
     *
     * @returns main declaration file in `@angular/core`.
     */
    private findAngularCore;
}
