/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

import {
  OpenOutputChannel,
  ProjectLoadingFinish,
  ProjectLoadingStart,
  SuggestStrictMode,
  SuggestStrictModeParams,
} from '../../common/notifications';
import {
  GetComponentsWithTemplateFile,
  GetTcbRequest,
  GetTemplateLocationForComponent,
  IsInAngularProject,
} from '../../common/requests';
import {NodeModule, resolve, Version} from '../../common/resolver';

import {isInsideStringLiteral, isNotTypescriptOrSupportedDecoratorField} from './embedded_support';

interface GetTcbResponse {
  uri: vscode.Uri;
  content: string;
  selections: vscode.Range[];
}

export class AngularLanguageClient implements vscode.Disposable {
  private client: lsp.LanguageClient | null = null;
  private readonly disposables: vscode.Disposable[] = [];
  private readonly outputChannel: vscode.OutputChannel;
  private readonly clientOptions: lsp.LanguageClientOptions;
  private readonly name = 'Angular Language Service';
  private readonly virtualDocumentContents = new Map<string, string>();
  /** A map that indicates whether Angular could be found in the file's project. */
  private readonly fileToIsInAngularProjectMap = new Map<string, boolean>();

  constructor(private readonly context: vscode.ExtensionContext) {
    vscode.workspace.registerTextDocumentContentProvider('angular-embedded-content', {
      provideTextDocumentContent: (uri) => {
        return this.virtualDocumentContents.get(uri.toString());
      },
    });

    this.outputChannel = vscode.window.createOutputChannel(this.name);
    // Options to control the language client
    this.clientOptions = {
      // Register the server for Angular templates and TypeScript documents
      documentSelector: [
        // scheme: 'file' means listen to changes to files on disk only
        // other option is 'untitled', for buffer in the editor (like a new doc)
        {scheme: 'file', language: 'html'},
        {scheme: 'file', language: 'typescript'},
      ],
      synchronize: {
        fileEvents: [
          // Notify the server about file changes to tsconfig.json contained in the workspace
          vscode.workspace.createFileSystemWatcher('**/tsconfig.json'),
        ],
      },
      // Don't let our output console pop open
      revealOutputChannelOn: lsp.RevealOutputChannelOn.Never,
      outputChannel: this.outputChannel,
      markdown: {
        isTrusted: true,
      },
      middleware: {
        provideCodeActions: async (
          document: vscode.TextDocument,
          range: vscode.Range,
          context: vscode.CodeActionContext,
          token: vscode.CancellationToken,
          next: lsp.ProvideCodeActionsSignature,
        ) => {
          // Code actions can trigger also outside of `@Component(<...>)` fields.
          if (await this.isInAngularProject(document)) {
            return next(document, range, context, token);
          }
        },
        prepareRename: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          token: vscode.CancellationToken,
          next: lsp.PrepareRenameSignature,
        ) => {
          // We are able to provide renames for many types of string literals: template strings,
          // pipe names, and hopefully in the future selectors and input/output aliases. Because
          // TypeScript isn't able to provide renames for these, we can more or less
          // guarantee that the Angular Language service will be called for the rename as the
          // fallback. We specifically do not provide renames outside of string literals
          // because we cannot ensure our extension is prioritized for renames in TS files (see
          // https://github.com/microsoft/vscode/issues/115354) we disable renaming completely so we
          // can provide consistent expectations.
          if (
            (await this.isInAngularProject(document)) &&
            isInsideStringLiteral(document, position)
          ) {
            return next(document, position, token);
          }
        },
        provideDefinition: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          token: vscode.CancellationToken,
          next: lsp.ProvideDefinitionSignature,
        ) => {
          if (
            (await this.isInAngularProject(document)) &&
            isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            return next(document, position, token);
          }
        },
        provideTypeDefinition: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          token: vscode.CancellationToken,
          next,
        ) => {
          if (
            (await this.isInAngularProject(document)) &&
            isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            return next(document, position, token);
          }
        },
        provideHover: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          token: vscode.CancellationToken,
          next: lsp.ProvideHoverSignature,
        ) => {
          if (
            !(await this.isInAngularProject(document)) ||
            !isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            return;
          }

          const angularResultsPromise = next(document, position, token);

          // Include results for inline HTML via virtual document and native html providers.
          if (document.languageId === 'typescript') {
            const vdocUri = this.createVirtualHtmlDoc(document);
            const htmlProviderResultsPromise = vscode.commands.executeCommand<vscode.Hover[]>(
              'vscode.executeHoverProvider',
              vdocUri,
              position,
            );

            const [angularResults, htmlProviderResults] = await Promise.all([
              angularResultsPromise,
              htmlProviderResultsPromise,
            ]);
            return angularResults ?? htmlProviderResults?.[0];
          }

          return angularResultsPromise;
        },
        provideSignatureHelp: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          context: vscode.SignatureHelpContext,
          token: vscode.CancellationToken,
          next: lsp.ProvideSignatureHelpSignature,
        ) => {
          if (
            (await this.isInAngularProject(document)) &&
            isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            return next(document, position, context, token);
          }
        },
        provideCompletionItem: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          context: vscode.CompletionContext,
          token: vscode.CancellationToken,
          next: lsp.ProvideCompletionItemsSignature,
        ) => {
          // If not in inline template, do not perform request forwarding
          if (
            !(await this.isInAngularProject(document)) ||
            !isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            return;
          }
          const angularCompletionsPromise = next(document, position, context, token) as Promise<
            vscode.CompletionItem[] | null | undefined
          >;

          // Include results for inline HTML via virtual document and native html providers.
          if (document.languageId === 'typescript') {
            const vdocUri = this.createVirtualHtmlDoc(document);
            // This will not include angular stuff because the vdoc is not associated with an
            // angular component
            const htmlProviderCompletionsPromise =
              vscode.commands.executeCommand<vscode.CompletionList>(
                'vscode.executeCompletionItemProvider',
                vdocUri,
                position,
                context.triggerCharacter,
              );
            const [angularCompletions, htmlProviderCompletions] = await Promise.all([
              angularCompletionsPromise,
              htmlProviderCompletionsPromise,
            ]);
            return [...(angularCompletions ?? []), ...(htmlProviderCompletions?.items ?? [])];
          }

          return angularCompletionsPromise;
        },
        provideFoldingRanges: async (
          document: vscode.TextDocument,
          context: vscode.FoldingContext,
          token: vscode.CancellationToken,
          next,
        ) => {
          if (!(await this.isInAngularProject(document))) {
            return null;
          }
          return next(document, context, token);
        },
      },
    };
  }

  async applyWorkspaceEdits(workspaceEdits: lsp.WorkspaceEdit[]) {
    for (const edit of workspaceEdits) {
      const workspaceEdit = this.client?.protocol2CodeConverter.asWorkspaceEdit(edit);
      if (workspaceEdit === undefined) {
        continue;
      }
      await vscode.workspace.applyEdit(workspaceEdit);
    }
  }

  private async isInAngularProject(doc: vscode.TextDocument): Promise<boolean> {
    if (this.client === null) {
      return false;
    }
    const uri = doc.uri.toString();
    if (this.fileToIsInAngularProjectMap.has(uri)) {
      return this.fileToIsInAngularProjectMap.get(uri)!;
    }

    try {
      const response = await this.client.sendRequest(IsInAngularProject, {
        textDocument: this.client.code2ProtocolConverter.asTextDocumentIdentifier(doc),
      });
      if (response == null) {
        // If the response indicates the answer can't be determined at the moment, return `false`
        // but do not cache the result so we can try to get the real answer on follow-up requests.
        return false;
      }
      this.fileToIsInAngularProjectMap.set(uri, response);
      return response;
    } catch {
      return false;
    }
  }

  private createVirtualHtmlDoc(document: vscode.TextDocument): vscode.Uri {
    const originalUri = document.uri.toString();
    const vdocUri = vscode.Uri.file(encodeURIComponent(originalUri) + '.html').with({
      scheme: 'angular-embedded-content',
      authority: 'html',
    });
    this.virtualDocumentContents.set(vdocUri.toString(), document.getText());
    return vdocUri;
  }

  /**
   * Spin up the language server in a separate process and establish a connection.
   */
  async start(): Promise<void> {
    if (this.client !== null) {
      throw new Error(`An existing client is running. Call stop() first.`);
    }

    // Node module for the language server
    const args = await this.constructArgs();
    const prodBundle = this.context.asAbsolutePath('server');
    const devBundle = this.context.asAbsolutePath(
      path.join('bazel-bin', 'server', 'src', 'server.js'),
    );

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: lsp.ServerOptions = {
      run: {
        module: this.context.asAbsolutePath('server'),
        transport: lsp.TransportKind.ipc,
        args,
      },
      debug: {
        // VS Code Insider launches extensions in debug mode by default but users
        // install prod bundle so we have to check whether dev bundle exists.
        module: fs.existsSync(devBundle) ? devBundle : prodBundle,
        transport: lsp.TransportKind.ipc,
        options: {
          // Argv options for Node.js
          execArgv: [
            // do not lazily evaluate the code so all breakpoints are respected
            '--nolazy',
            // If debugging port is changed, update .vscode/launch.json as well
            '--inspect-brk=6009',
          ],
          env: {
            NG_DEBUG: true,
          },
        },
        args,
      },
    };

    if (!extensionVersionCompatibleWithAllProjects(serverOptions.run.module)) {
      vscode.window.showWarningMessage(
        `A project in the workspace is using a newer version of Angular than the language service extension. ` +
          `This may cause the extension to show incorrect diagnostics.`,
      );
    }

    // Create the language client and start the client.
    const forceDebug = process.env['NG_DEBUG'] === 'true';
    this.client = new lsp.LanguageClient(
      // This is the ID for Angular-specific configurations, like "angular.log".
      // See contributes.configuration in package.json.
      'angular',
      this.name,
      serverOptions,
      this.clientOptions,
      forceDebug,
    );
    this.disposables.push(this.client.start());
    await this.client.onReady();
    // Must wait for the client to be ready before registering notification
    // handlers.
    this.disposables.push(registerNotificationHandlers(this.client));
  }

  /**
   * Construct the arguments that's used to spawn the server process.
   * @param ctx vscode extension context
   */
  private async constructArgs(): Promise<string[]> {
    const config = vscode.workspace.getConfiguration();
    const args: string[] = ['--logToConsole'];

    const ngLog: string = config.get('angular.log', 'off');
    if (ngLog !== 'off') {
      // Log file does not yet exist on disk. It is up to the server to create the file.
      const logFile = path.join(this.context.logUri.fsPath, 'nglangsvc.log');
      args.push('--logFile', logFile);
      args.push('--logVerbosity', ngLog);
    }

    const ngProbeLocations = getProbeLocations(this.context.extensionPath);
    args.push('--ngProbeLocations', ngProbeLocations.join(','));

    const includeAutomaticOptionalChainCompletions = config.get<boolean>(
      'angular.suggest.includeAutomaticOptionalChainCompletions',
    );
    if (includeAutomaticOptionalChainCompletions) {
      args.push('--includeAutomaticOptionalChainCompletions');
    }

    const includeCompletionsWithSnippetText = config.get<boolean>(
      'angular.suggest.includeCompletionsWithSnippetText',
    );
    if (includeCompletionsWithSnippetText) {
      args.push('--includeCompletionsWithSnippetText');
    }

    const includeCompletionsForModuleExports = config.get<boolean>('angular.suggest.autoImports');
    args.push(
      '--includeCompletionsForModuleExports',
      includeCompletionsForModuleExports === undefined
        ? 'true'
        : includeCompletionsForModuleExports.toString(),
    );

    // Sort the versions from oldest to newest.
    const angularVersions = (await getAngularVersionsInWorkspace(this.outputChannel)).sort(
      (a, b) => (a.version.greaterThanOrEqual(b.version) ? 1 : -1),
    );

    // Only disable block syntax if we find angular/core and every one we find does not support
    // block syntax
    if (angularVersions.length > 0) {
      const disableBlocks = angularVersions.every((v) => v.version.major < 17);
      const disableLet = angularVersions.every((v) => {
        return v.version.major < 18 || (v.version.major === 18 && v.version.minor < 1);
      });

      if (disableBlocks) {
        args.push('--disableBlockSyntax');
        this.outputChannel.appendLine(
          `All workspace roots are using versions of Angular that do not support control flow block syntax.` +
            ` Block syntax parsing in templates will be disabled.`,
        );
      }

      if (disableLet) {
        args.push('--disableLetSyntax');
        this.outputChannel.appendLine(
          `All workspace roots are using versions of Angular that do not support @let syntax.` +
            ` @let syntax parsing in templates will be disabled.`,
        );
      }
    }

    setAngularVersionAndShowMultipleVersionsWarning(angularVersions, args, this.outputChannel);

    const forceStrictTemplates = config.get<boolean>('angular.forceStrictTemplates');
    if (forceStrictTemplates) {
      args.push('--forceStrictTemplates');
    }

    const suppressAngularDiagnosticCodes = config.get<string>(
      'angular.suppressAngularDiagnosticCodes',
    );
    if (suppressAngularDiagnosticCodes) {
      args.push('--suppressAngularDiagnosticCodes', suppressAngularDiagnosticCodes);
    }

    const tsdk = config.get('typescript.tsdk', '');
    if (tsdk.trim().length > 0) {
      args.push('--tsdk', tsdk);
    }
    const tsProbeLocations = [...getProbeLocations(this.context.extensionPath)];
    args.push('--tsProbeLocations', tsProbeLocations.join(','));

    return args;
  }

  /**
   * Kill the language client and perform some clean ups.
   */
  async stop(): Promise<void> {
    if (this.client === null) {
      return;
    }
    await this.client.stop();
    this.outputChannel.clear();
    this.dispose();
    this.client = null;
    this.fileToIsInAngularProjectMap.clear();
    this.virtualDocumentContents.clear();
  }

  /**
   * Requests a template typecheck block at the current cursor location in the
   * specified editor.
   */
  async getTcbUnderCursor(textEditor: vscode.TextEditor): Promise<GetTcbResponse | undefined> {
    if (this.client === null) {
      return undefined;
    }
    const c2pConverter = this.client.code2ProtocolConverter;
    // Craft a request by converting vscode params to LSP. The corresponding
    // response is in LSP.
    const response = await this.client.sendRequest(GetTcbRequest, {
      textDocument: c2pConverter.asTextDocumentIdentifier(textEditor.document),
      position: c2pConverter.asPosition(textEditor.selection.active),
    });
    if (response === null) {
      return undefined;
    }
    const p2cConverter = this.client.protocol2CodeConverter;
    // Convert the response from LSP back to vscode.
    return {
      uri: p2cConverter.asUri(response.uri),
      content: response.content,
      selections: p2cConverter.asRanges(response.selections),
    };
  }

  get initializeResult(): lsp.InitializeResult | undefined {
    return this.client?.initializeResult;
  }

  async getComponentsForOpenExternalTemplate(
    textEditor: vscode.TextEditor,
  ): Promise<vscode.Location[] | undefined> {
    if (this.client === null) {
      return undefined;
    }

    const response = await this.client.sendRequest(GetComponentsWithTemplateFile, {
      textDocument: this.client.code2ProtocolConverter.asTextDocumentIdentifier(
        textEditor.document,
      ),
    });
    if (response === undefined) {
      return undefined;
    }

    const p2cConverter = this.client.protocol2CodeConverter;
    return response.map(
      (v) => new vscode.Location(p2cConverter.asUri(v.uri), p2cConverter.asRange(v.range)),
    );
  }

  async getTemplateLocationForComponent(
    textEditor: vscode.TextEditor,
  ): Promise<vscode.Location | null> {
    if (this.client === null) {
      return null;
    }
    const c2pConverter = this.client.code2ProtocolConverter;
    // Craft a request by converting vscode params to LSP. The corresponding
    // response is in LSP.
    const response = await this.client.sendRequest(GetTemplateLocationForComponent, {
      textDocument: c2pConverter.asTextDocumentIdentifier(textEditor.document),
      position: c2pConverter.asPosition(textEditor.selection.active),
    });
    if (response === null) {
      return null;
    }
    const p2cConverter = this.client.protocol2CodeConverter;
    return new vscode.Location(
      p2cConverter.asUri(response.uri),
      p2cConverter.asRange(response.range),
    );
  }

  dispose() {
    for (let d = this.disposables.pop(); d !== undefined; d = this.disposables.pop()) {
      d.dispose();
    }
  }
}

function registerNotificationHandlers(client: lsp.LanguageClient): vscode.Disposable {
  const disposables: vscode.Disposable[] = [];
  disposables.push(
    client.onNotification(ProjectLoadingStart, () => {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Window,
          title: 'Initializing Angular language features',
        },
        () =>
          new Promise<void>((resolve) => {
            client.onNotification(ProjectLoadingFinish, resolve);
          }),
      );
    }),
  );

  disposables.push(
    client.onNotification(SuggestStrictMode, async (params: SuggestStrictModeParams) => {
      const config = vscode.workspace.getConfiguration();
      if (
        config.get('angular.enable-strict-mode-prompt') === false ||
        config.get('angular.forceStrictTemplates')
      ) {
        return;
      }

      const openTsConfig = 'Open tsconfig.json';
      // Markdown is not generally supported in `showInformationMessage()`,
      // but links are supported. See
      // https://github.com/microsoft/vscode/issues/20595#issuecomment-281099832
      const doNotPromptAgain = 'Do not show again for this workspace';
      const selection = await vscode.window.showInformationMessage(
        'Some language features are not available. To access all features, enable ' +
          '[strictTemplates](https://angular.dev/reference/configs/angular-compiler-options#stricttemplates) in ' +
          '[angularCompilerOptions](https://angular.dev/reference/configs/angular-compiler-options).',
        openTsConfig,
        doNotPromptAgain,
      );
      if (selection === openTsConfig) {
        const document = await vscode.workspace.openTextDocument(params.configFilePath);
        vscode.window.showTextDocument(document);
      } else if (selection === doNotPromptAgain) {
        config.update(
          'angular.enable-strict-mode-prompt',
          false,
          vscode.ConfigurationTarget.Workspace,
        );
      }
    }),
  );

  disposables.push(
    client.onNotification(OpenOutputChannel, () => {
      client.outputChannel.show();
    }),
  );

  return vscode.Disposable.from(...disposables);
}

/**
 * Return the paths for the module that corresponds to the specified `configValue`,
 * and use the specified `bundled` as fallback if none is provided.
 * @param configName
 * @param bundled
 */
function getProbeLocations(bundled: string): string[] {
  const locations = [];
  // Prioritize the bundled version
  locations.push(bundled);
  // Look in workspaces currently open
  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  for (const folder of workspaceFolders) {
    locations.push(folder.uri.fsPath);
  }
  return locations;
}

function extensionVersionCompatibleWithAllProjects(serverModuleLocation: string): boolean {
  const languageServiceVersion = resolve(
    '@angular/language-service',
    serverModuleLocation,
  )?.version;
  if (languageServiceVersion === undefined) {
    return true;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  for (const workspaceFolder of workspaceFolders) {
    const angularCore = resolve('@angular/core', workspaceFolder.uri.fsPath);
    if (angularCore === undefined) {
      continue;
    }
    if (!languageServiceVersion.greaterThanOrEqual(angularCore.version, 'minor')) {
      return false;
    }
  }
  return true;
}

/**
 * Traverses through the currently open VSCode workspace (i.e. all open folders)
 * and finds all `@angular/core` versions installed based on `package.json` files.
 */
async function getAngularVersionsInWorkspace(
  outputChannel: vscode.OutputChannel,
): Promise<NodeModule[]> {
  const packageJsonFiles = await vscode.workspace.findFiles(
    '**/package.json',
    // Skip looking inside `node_module` folders as those contain irrelevant files.
    '**/node_modules/**',
  );
  const packageJsonRoots = packageJsonFiles.map((f) => path.dirname(f.fsPath));
  const angularCoreModules = new Set<NodeModule>();

  outputChannel.appendLine(`package.json roots detected: ${packageJsonRoots.join(',\n  ')}`);

  for (const packageJsonRoot of packageJsonRoots) {
    const angularCore = resolve('@angular/core', packageJsonRoot);
    if (angularCore === undefined) {
      continue;
    }
    angularCoreModules.add(angularCore);
  }
  return Array.from(angularCoreModules);
}

function setAngularVersionAndShowMultipleVersionsWarning(
  angularVersions: NodeModule[],
  args: string[],
  outputChannel: vscode.OutputChannel,
) {
  if (angularVersions.length === 0) {
    return;
  }
  if (angularVersions[0].version.toString() === '0.0.0') {
    // If only version 0.x is found, update it to 999 instead (0.0.0 is used for the version when building locally)
    angularVersions[0].version = new Version('999.999.999');
  }
  // Pass the earliest Angular version along to the compiler for maximum compatibility.
  // For example, if we tell the v21 compiler that we're using v21 but there's a v13 project,
  // the compiler may attempt to import and use APIs from angular core that don't exist in v13.
  args.push('--angularCoreVersion', angularVersions[0].version.toString());
  outputChannel.appendLine(`Using Angular version ${angularVersions[0].version.toString()}.`);

  let minorVersions = new Map<string, NodeModule>();
  for (const v of angularVersions) {
    minorVersions.set(`${v.version.major}.${v.version.minor}`, v);
  }
  if (minorVersions.size > 1) {
    vscode.window.showWarningMessage(
      `Multiple versions of Angular detected in the workspace. This can lead to compatibility issues for the language service. ` +
        `See the output panel for more details.`,
    );
    outputChannel.appendLine(`Multiple Angular versions detected in the workspace:`);
    for (const v of minorVersions.values()) {
      outputChannel.appendLine(
        `  Angular version ${v.version.toString()} detected at ${v.resolvedPath}`,
      );
    }
  }
}
