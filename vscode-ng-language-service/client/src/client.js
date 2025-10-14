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
exports.AngularLanguageClient = void 0;
const fs = __importStar(require('node:fs'));
const path = __importStar(require('node:path'));
const vscode = __importStar(require('vscode'));
const lsp = __importStar(require('vscode-languageclient/node'));
const notifications_1 = require('../../common/notifications');
const requests_1 = require('../../common/requests');
const resolver_1 = require('../../common/resolver');
const embedded_support_1 = require('./embedded_support');
class AngularLanguageClient {
  constructor(context) {
    this.context = context;
    this.client = null;
    this.disposables = [];
    this.name = 'Angular Language Service';
    this.virtualDocumentContents = new Map();
    /** A map that indicates whether Angular could be found in the file's project. */
    this.fileToIsInAngularProjectMap = new Map();
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
        provideCodeActions: async (document, range, context, token, next) => {
          // Code actions can trigger also outside of `@Component(<...>)` fields.
          if (await this.isInAngularProject(document)) {
            return next(document, range, context, token);
          }
        },
        prepareRename: async (document, position, token, next) => {
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
            (0, embedded_support_1.isInsideStringLiteral)(document, position)
          ) {
            return next(document, position, token);
          }
        },
        provideDefinition: async (document, position, token, next) => {
          if (
            (await this.isInAngularProject(document)) &&
            (0, embedded_support_1.isNotTypescriptOrSupportedDecoratorField)(document, position)
          ) {
            return next(document, position, token);
          }
        },
        provideTypeDefinition: async (document, position, token, next) => {
          if (
            (await this.isInAngularProject(document)) &&
            (0, embedded_support_1.isNotTypescriptOrSupportedDecoratorField)(document, position)
          ) {
            return next(document, position, token);
          }
        },
        provideHover: async (document, position, token, next) => {
          if (
            !(await this.isInAngularProject(document)) ||
            !(0, embedded_support_1.isNotTypescriptOrSupportedDecoratorField)(document, position)
          ) {
            return;
          }
          const angularResultsPromise = next(document, position, token);
          // Include results for inline HTML via virtual document and native html providers.
          if (document.languageId === 'typescript') {
            const vdocUri = this.createVirtualHtmlDoc(document);
            const htmlProviderResultsPromise = vscode.commands.executeCommand(
              'vscode.executeHoverProvider',
              vdocUri,
              position,
            );
            const [angularResults, htmlProviderResults] = await Promise.all([
              angularResultsPromise,
              htmlProviderResultsPromise,
            ]);
            return angularResults !== null && angularResults !== void 0
              ? angularResults
              : htmlProviderResults === null || htmlProviderResults === void 0
                ? void 0
                : htmlProviderResults[0];
          }
          return angularResultsPromise;
        },
        provideSignatureHelp: async (document, position, context, token, next) => {
          if (
            (await this.isInAngularProject(document)) &&
            (0, embedded_support_1.isNotTypescriptOrSupportedDecoratorField)(document, position)
          ) {
            return next(document, position, context, token);
          }
        },
        provideCompletionItem: async (document, position, context, token, next) => {
          var _a;
          // If not in inline template, do not perform request forwarding
          if (
            !(await this.isInAngularProject(document)) ||
            !(0, embedded_support_1.isNotTypescriptOrSupportedDecoratorField)(document, position)
          ) {
            return;
          }
          const angularCompletionsPromise = next(document, position, context, token);
          // Include results for inline HTML via virtual document and native html providers.
          if (document.languageId === 'typescript') {
            const vdocUri = this.createVirtualHtmlDoc(document);
            // This will not include angular stuff because the vdoc is not associated with an
            // angular component
            const htmlProviderCompletionsPromise = vscode.commands.executeCommand(
              'vscode.executeCompletionItemProvider',
              vdocUri,
              position,
              context.triggerCharacter,
            );
            const [angularCompletions, htmlProviderCompletions] = await Promise.all([
              angularCompletionsPromise,
              htmlProviderCompletionsPromise,
            ]);
            return [
              ...(angularCompletions !== null && angularCompletions !== void 0
                ? angularCompletions
                : []),
              ...((_a =
                htmlProviderCompletions === null || htmlProviderCompletions === void 0
                  ? void 0
                  : htmlProviderCompletions.items) !== null && _a !== void 0
                ? _a
                : []),
            ];
          }
          return angularCompletionsPromise;
        },
        provideFoldingRanges: async (document, context, token, next) => {
          if (!(await this.isInAngularProject(document))) {
            return null;
          }
          return next(document, context, token);
        },
      },
    };
  }
  async applyWorkspaceEdits(workspaceEdits) {
    var _a;
    for (const edit of workspaceEdits) {
      const workspaceEdit =
        (_a = this.client) === null || _a === void 0
          ? void 0
          : _a.protocol2CodeConverter.asWorkspaceEdit(edit);
      if (workspaceEdit === undefined) {
        continue;
      }
      await vscode.workspace.applyEdit(workspaceEdit);
    }
  }
  async isInAngularProject(doc) {
    if (this.client === null) {
      return false;
    }
    const uri = doc.uri.toString();
    if (this.fileToIsInAngularProjectMap.has(uri)) {
      return this.fileToIsInAngularProjectMap.get(uri);
    }
    try {
      const response = await this.client.sendRequest(requests_1.IsInAngularProject, {
        textDocument: this.client.code2ProtocolConverter.asTextDocumentIdentifier(doc),
      });
      if (response == null) {
        // If the response indicates the answer can't be determined at the moment, return `false`
        // but do not cache the result so we can try to get the real answer on follow-up requests.
        return false;
      }
      this.fileToIsInAngularProjectMap.set(uri, response);
      return response;
    } catch (_a) {
      return false;
    }
  }
  createVirtualHtmlDoc(document) {
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
  async start() {
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
    const serverOptions = {
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
            '--inspect=6009',
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
  async constructArgs() {
    const config = vscode.workspace.getConfiguration();
    const args = ['--logToConsole'];
    const ngLog = config.get('angular.log', 'off');
    if (ngLog !== 'off') {
      // Log file does not yet exist on disk. It is up to the server to create the file.
      const logFile = path.join(this.context.logUri.fsPath, 'nglangsvc.log');
      args.push('--logFile', logFile);
      args.push('--logVerbosity', ngLog);
    }
    const ngProbeLocations = getProbeLocations(this.context.extensionPath);
    args.push('--ngProbeLocations', ngProbeLocations.join(','));
    const includeAutomaticOptionalChainCompletions = config.get(
      'angular.suggest.includeAutomaticOptionalChainCompletions',
    );
    if (includeAutomaticOptionalChainCompletions) {
      args.push('--includeAutomaticOptionalChainCompletions');
    }
    const includeCompletionsWithSnippetText = config.get(
      'angular.suggest.includeCompletionsWithSnippetText',
    );
    if (includeCompletionsWithSnippetText) {
      args.push('--includeCompletionsWithSnippetText');
    }
    const includeCompletionsForModuleExports = config.get('angular.suggest.autoImports');
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
    // Pass the earliest Angular version along to the compiler for maximum compatibility.
    if (angularVersions.length > 0) {
      args.push('--angularCoreVersion', angularVersions[0].version.toString());
      this.outputChannel.appendLine(
        `Using Angular version ${angularVersions[0].version.toString()}.`,
      );
    }
    const forceStrictTemplates = config.get('angular.forceStrictTemplates');
    if (forceStrictTemplates) {
      args.push('--forceStrictTemplates');
    }
    const suppressAngularDiagnosticCodes = config.get('angular.suppressAngularDiagnosticCodes');
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
  async stop() {
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
  async getTcbUnderCursor(textEditor) {
    if (this.client === null) {
      return undefined;
    }
    const c2pConverter = this.client.code2ProtocolConverter;
    // Craft a request by converting vscode params to LSP. The corresponding
    // response is in LSP.
    const response = await this.client.sendRequest(requests_1.GetTcbRequest, {
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
  get initializeResult() {
    var _a;
    return (_a = this.client) === null || _a === void 0 ? void 0 : _a.initializeResult;
  }
  async getComponentsForOpenExternalTemplate(textEditor) {
    if (this.client === null) {
      return undefined;
    }
    const response = await this.client.sendRequest(requests_1.GetComponentsWithTemplateFile, {
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
  async getTemplateLocationForComponent(textEditor) {
    if (this.client === null) {
      return null;
    }
    const c2pConverter = this.client.code2ProtocolConverter;
    // Craft a request by converting vscode params to LSP. The corresponding
    // response is in LSP.
    const response = await this.client.sendRequest(requests_1.GetTemplateLocationForComponent, {
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
exports.AngularLanguageClient = AngularLanguageClient;
function registerNotificationHandlers(client) {
  const disposables = [];
  disposables.push(
    client.onNotification(notifications_1.ProjectLoadingStart, () => {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Window,
          title: 'Initializing Angular language features',
        },
        () =>
          new Promise((resolve) => {
            client.onNotification(notifications_1.ProjectLoadingFinish, resolve);
          }),
      );
    }),
  );
  disposables.push(
    client.onNotification(notifications_1.SuggestStrictMode, async (params) => {
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
          '[strictTemplates](https://angular.io/guide/angular-compiler-options#stricttemplates) in ' +
          '[angularCompilerOptions](https://angular.io/guide/angular-compiler-options).',
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
    client.onNotification(notifications_1.OpenOutputChannel, () => {
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
function getProbeLocations(bundled) {
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
function extensionVersionCompatibleWithAllProjects(serverModuleLocation) {
  var _a;
  const languageServiceVersion =
    (_a = (0, resolver_1.resolve)('@angular/language-service', serverModuleLocation)) === null ||
    _a === void 0
      ? void 0
      : _a.version;
  if (languageServiceVersion === undefined) {
    return true;
  }
  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  for (const workspaceFolder of workspaceFolders) {
    const angularCore = (0, resolver_1.resolve)('@angular/core', workspaceFolder.uri.fsPath);
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
async function getAngularVersionsInWorkspace(outputChannel) {
  const packageJsonFiles = await vscode.workspace.findFiles(
    '**/package.json',
    // Skip looking inside `node_module` folders as those contain irrelevant files.
    '**/node_modules/**',
  );
  const packageJsonRoots = packageJsonFiles.map((f) => path.dirname(f.fsPath));
  const angularCoreModules = new Set();
  outputChannel.appendLine(`package.json roots detected: ${packageJsonRoots.join(',\n  ')}`);
  for (const packageJsonRoot of packageJsonRoots) {
    const angularCore = (0, resolver_1.resolve)('@angular/core', packageJsonRoot);
    if (angularCore === undefined) {
      continue;
    }
    angularCoreModules.add(angularCore);
  }
  return Array.from(angularCoreModules);
}
//# sourceMappingURL=client.js.map
