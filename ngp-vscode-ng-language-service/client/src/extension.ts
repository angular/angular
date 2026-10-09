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

let client: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel(
    'Angular Hybrid Language Service Prototype',
    {log: true},
  );

  let tsApiPipe: string | undefined;
  try {
    const commands = await vscode.commands.getCommands();
    if (commands.includes('typescript.native-preview.initializeAPIConnection')) {
      tsApiPipe = await vscode.commands.executeCommand<string>(
        'typescript.native-preview.initializeAPIConnection',
      );
      if (tsApiPipe) {
        outputChannel.appendLine(
          `Reusing existing TypeScript API connection on pipe: ${tsApiPipe}`,
        );
      }
    }
  } catch (err) {
    outputChannel.appendLine(`Could not get existing TypeScript API connection: ${err}`);
  }

  const serverModule = context.asAbsolutePath(path.join('dist', 'server', 'server.js'));
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

  const startAngularClientPromise = client.start().catch((err) => {
    outputChannel.appendLine(`Failed to start Angular Language Service: ${err}`);
  });

  const tsGoPath = await resolveTsGoPath();

  // If we already connected to an existing TypeScript LSP server via tsApiPipe,
  // we do not need to launch a separate fallback ts7Client.
  // Otherwise, if tsGoPath is available, launch our fallback ts7Client.
  if (!tsApiPipe && tsGoPath) {
    launchTs7Client(tsGoPath, context);
  }
}

function launchTs7Client(tsGoPath: string, context: vscode.ExtensionContext) {
  const isNative =
    tsGoPath.includes(`native-preview-${process.platform}-${process.arch}`) ||
    tsGoPath.endsWith('/tsgo.exe') ||
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
      try {
        const res = await ts7Client!.sendRequest<{sessionId: string; pipe: string}>(
          'custom/initializeAPISession',
          {},
        );
        if (res?.pipe) {
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

  const workspaceRoot = path.resolve(__dirname, '../../..');

  const platformName = `@typescript/native-preview-${process.platform}-${process.arch}`;
  const localCandidates = [
    path.join(workspaceRoot, 'node_modules', platformName, 'lib', 'tsgo'),
    path.join(workspaceRoot, 'node_modules', '@typescript', 'native-preview', 'bin', 'tsgo'),
    path.join(workspaceRoot, 'node_modules', '@typescript', 'native-preview', 'bin', 'tsgo.js'),
  ];

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
