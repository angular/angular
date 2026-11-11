/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';
import {registerCommands} from './commands';
import * as fs from 'node:fs/promises';
import {createRequire} from 'node:module';

interface TsLanguageServerSdk {
  initializeAPIConnection(): Promise<string>;
}

interface TsNativePreviewExtensionApi {
  onLanguageServerInitialized?: vscode.Event<TsLanguageServerSdk>;
  initializeAPIConnection?: () => Promise<string>;
}

let client: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel(
    'Angular Hybrid Language Service Prototype',
    {log: true},
  );

  let tsApiPipe: string | undefined;
  let usingNativePreviewExtension = false;
  let resolveClientReady!: () => void;
  const clientReady = new Promise<void>((resolve) => {
    resolveClientReady = resolve;
  });

  try {
    const tsPreviewExt = vscode.extensions.getExtension<TsNativePreviewExtensionApi>(
      'typescriptteam.native-preview',
    );
    if (tsPreviewExt) {
      const extApi = tsPreviewExt.isActive ? tsPreviewExt.exports : await tsPreviewExt.activate();
      if (extApi && typeof extApi.onLanguageServerInitialized === 'function') {
        usingNativePreviewExtension = true;
        context.subscriptions.push(
          extApi.onLanguageServerInitialized(async (sdk) => {
            try {
              const pipe = await sdk.initializeAPIConnection();
              if (!pipe) {
                return;
              }
              tsApiPipe = pipe;
              outputChannel.appendLine(
                `Reusing existing TypeScript API connection on pipe: ${pipe}`,
              );
              await clientReady;
              client.sendNotification('angular/setTsApiPipe', {pipe});
            } catch (err) {
              outputChannel.appendLine(`Failed to initialize TypeScript API connection: ${err}`);
            }
          }),
        );
      } else if (extApi && typeof extApi.initializeAPIConnection === 'function') {
        tsApiPipe = await extApi.initializeAPIConnection();
        if (tsApiPipe) {
          usingNativePreviewExtension = true;
          outputChannel.appendLine(
            `Reusing existing TypeScript API connection on pipe: ${tsApiPipe}`,
          );
        }
      }
    }

    if (!usingNativePreviewExtension) {
      const commands = await vscode.commands.getCommands();
      if (commands.includes('typescript.native-preview.initializeAPIConnection')) {
        tsApiPipe = await vscode.commands.executeCommand<string>(
          'typescript.native-preview.initializeAPIConnection',
        );
        if (tsApiPipe) {
          usingNativePreviewExtension = true;
          outputChannel.appendLine(
            `Reusing existing TypeScript API connection on pipe: ${tsApiPipe}`,
          );
        }
      }
    }
  } catch (err) {
    outputChannel.appendLine(`Could not get existing TypeScript API connection: ${err}`);
  }

  const distServer = context.asAbsolutePath(path.join('dist', 'server', 'server.js'));
  const bazelServer = context.asAbsolutePath(
    path.join('..', 'dist', 'bin', 'ngp-vscode-ng-language-service', 'server', 'server_bundle.js'),
  );
  const serverModule = (await pathExists(distServer)) ? distServer : bazelServer;
  const serverOptions: ServerOptions = {
    run: {module: serverModule, transport: TransportKind.ipc},
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: {
        execArgv: ['--nolazy', '--inspect=6009'],
      },
    },
  };

  const clientOptions: LanguageClientOptions = {
    outputChannel,
    documentSelector: [
      {scheme: 'file', language: 'html'},
      {scheme: 'file', language: 'typescript'},
    ],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.ts'),
    },
    initializationOptions: {
      tsApiPipe,
    },
  };

  client = new LanguageClient(
    'angularLanguageService',
    'Angular Hybrid Language Service Prototype',
    serverOptions,
    clientOptions,
  );

  registerCommands(context, client, outputChannel);

  client
    .start()
    .then(() => {
      resolveClientReady();
    })
    .catch((err) => {
      outputChannel.appendLine(`Failed to start Angular Language Service: ${err}`);
    });

  const tsGoPath = await resolveTsGoPath();

  // Launch ts7Client when tsGoPath is available so registerTs7RelayHandlers is active
  // for TsGoFacade LSP requests. Only initialize an API session on ts7Client if we
  // didn't already connect to typescriptteam.native-preview's API pipe.
  if (tsGoPath) {
    launchTs7Client(tsGoPath, context, clientReady, !tsApiPipe && !usingNativePreviewExtension);
  }
}

function launchTs7Client(
  tsGoPath: string,
  context: vscode.ExtensionContext,
  clientReady: Promise<void>,
  initializeApiSession: boolean,
) {
  const isNative =
    tsGoPath.includes(`typescript-${process.platform}-${process.arch}`) ||
    tsGoPath.includes(`native-preview-${process.platform}-${process.arch}`) ||
    tsGoPath.endsWith('/lib/tsc') ||
    tsGoPath.endsWith('/tsc.exe') ||
    tsGoPath.endsWith('/tsgo.exe') ||
    tsGoPath.endsWith('/built/local/tsc') ||
    tsGoPath.endsWith('/built/local/tsgo');
  const ts7ServerOptions: ServerOptions = isNative
    ? {
        command: tsGoPath,
        args: ['--lsp', '--stdio'],
      }
    : {
        command: process.execPath,
        args: [tsGoPath, '--lsp', '--stdio'],
        options: {
          env: {
            ...process.env,
            ELECTRON_RUN_AS_NODE: '1',
          },
        },
      };

  const ts7OutputChannel = vscode.window.createOutputChannel('Angular TS 7 Server', {log: true});
  const ts7ClientOptions: LanguageClientOptions = {
    outputChannel: ts7OutputChannel,
    documentSelector: [{scheme: 'file', language: 'typescript'}],
    middleware: new Proxy(
      {},
      {
        get(target, prop) {
          if (
            typeof prop === 'string' &&
            (prop.startsWith('provide') || prop.startsWith('resolve'))
          ) {
            // Return a function that returns undefined to suppress the provider
            return () => undefined;
          }
          // use default behavior
          return undefined;
        },
      },
    ),
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.ts'),
    },
  };

  const ts7Client = new LanguageClient(
    'ng-ts-server',
    'Angular TS 7 Server',
    ts7ServerOptions,
    ts7ClientOptions,
  );

  ts7Client
    .start()
    .then(async () => {
      if (!initializeApiSession) {
        return;
      }
      try {
        const res = await ts7Client!.sendRequest<{sessionId: string; pipe: string}>(
          'custom/initializeAPISession',
          {},
        );
        if (res?.pipe) {
          await clientReady;
          client.sendNotification('angular/setTsApiPipe', {pipe: res.pipe});
        }
      } catch {}
    })
    .catch((err) => {
      ts7OutputChannel.appendLine(`Failed to start TS 7 Server: ${err}`);
    });
  context.subscriptions.push(registerTs7RelayHandlers(client, ts7Client));
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

function registerTs7RelayHandlers(
  angularClient: LanguageClient,
  ts7Client: LanguageClient,
): vscode.Disposable {
  const disposables: vscode.Disposable[] = [];

  disposables.push(
    angularClient.onRequest(
      'angular/sendTsServerRequest',
      async (params: {method: string; params: any}) => {
        return ts7Client.sendRequest(params.method, params.params);
      },
    ),
  );

  disposables.push(
    angularClient.onNotification(
      'angular/sendTsServerNotification',
      async (params: {method: string; params: any}) => {
        ts7Client.sendNotification(params.method, params.params);
      },
    ),
  );

  return vscode.Disposable.from(...disposables);
}

const pathExists = (p: string): Promise<boolean> =>
  fs.access(p).then(
    () => true,
    () => false,
  );

async function resolveTsGoPath(): Promise<string | null> {
  if (process.env.TSGO_BINARY_PATH) {
    return process.env.TSGO_BINARY_PATH;
  }

  const extensionRoot = path.resolve(__dirname, '../..');
  const workspaceRoot = path.resolve(__dirname, '../../..');
  const ext = process.platform === 'win32' ? '.exe' : '';
  const tsPlatformName = `@typescript/typescript-${process.platform}-${process.arch}`;
  const previewPlatformName = `@typescript/native-preview-${process.platform}-${process.arch}`;

  try {
    const req = createRequire(path.join(extensionRoot, 'package.json'));
    const previewPkg = req.resolve('@typescript/native-preview/package.json');
    const previewReq = createRequire(previewPkg);
    const platformTargets = [
      {pkg: tsPlatformName, bin: `tsc${ext}`},
      {pkg: previewPlatformName, bin: `tsgo${ext}`},
    ];
    for (const target of platformTargets) {
      try {
        const platPkg = previewReq.resolve(`${target.pkg}/package.json`);
        const exe = path.join(path.dirname(platPkg), 'lib', target.bin);
        if (await pathExists(exe)) {
          return exe;
        }
      } catch {}
    }
  } catch {}

  const localCandidates = [extensionRoot, workspaceRoot].flatMap((root) => [
    path.join(root, 'node_modules', tsPlatformName, 'lib', `tsc${ext}`),
    path.join(root, 'node_modules', '@typescript', 'native-preview', 'lib', 'tsc.js'),
    path.join(root, 'node_modules', '@typescript', 'native-preview', 'bin', 'tsc'),
    path.join(root, 'node_modules', previewPlatformName, 'lib', `tsgo${ext}`),
    path.join(root, 'node_modules', '@typescript', 'native-preview', 'bin', 'tsgo'),
    path.join(root, 'node_modules', '@typescript', 'native-preview', 'bin', 'tsgo.js'),
  ]);

  const localResults = await Promise.all(
    localCandidates.map(async (candidate) => ((await pathExists(candidate)) ? candidate : null)),
  );
  const foundLocal = localResults.find((c): c is string => c !== null);
  if (foundLocal) {
    return foundLocal;
  }

  const tsGoExtension = vscode.extensions.getExtension('typescriptteam.native-preview');
  if (tsGoExtension) {
    const extensionPath = tsGoExtension.extensionPath;
    const candidates = [
      path.join(extensionPath, 'lib', 'tsc'),
      path.join(extensionPath, 'lib', 'tsc.exe'),
      path.join(extensionPath, 'bin', 'tsc'),
      path.join(extensionPath, 'bin', 'tsc.exe'),
      path.join(extensionPath, 'tsc'),
      path.join(extensionPath, 'tsc.exe'),
      path.join(extensionPath, 'bin', 'tsgo'),
      path.join(extensionPath, 'bin', 'tsgo.exe'),
      path.join(extensionPath, 'lib', 'tsgo'),
      path.join(extensionPath, 'lib', 'tsgo.exe'),
      path.join(extensionPath, 'tsgo'),
      path.join(extensionPath, 'tsgo.exe'),
    ];

    const extResults = await Promise.all(
      candidates.map(async (candidate) => ((await pathExists(candidate)) ? candidate : null)),
    );
    const foundExt = extResults.find((c): c is string => c !== null);
    if (foundExt) {
      return foundExt;
    }
  }

  return null;
}
