import * as path from 'path';
import * as fs from 'node:fs/promises';
import * as cp from 'child_process';

import {TextDocument} from 'vscode-languageserver-textdocument';
import * as rpc from 'vscode-jsonrpc/node';
import {URI} from 'vscode-uri';
import {fileURLToPath} from 'node:url';
import {
  Location,
  LocationLink,
  Hover,
  CompletionList,
  CompletionItem,
  CompletionItemKind,
  Position,
  FileChangeType,
  FullDocumentDiagnosticReport,
  WorkspaceDiagnosticReport,
  SignatureHelp,
  SignatureHelpContext,
} from 'vscode-languageserver';
import {TestFileManager} from '../../packages/compiler-cli/preprocessor/language-service/tests/test_file_manager';
import {startTsgo} from '../../packages/compiler-cli/preprocessor/language-service/tests/test_helpers';
import {canonicalizePath as normalizePath} from '../../packages/compiler-cli/preprocessor/language-service/src/utils.js';

export async function startTestServer(workspacePath: string) {
  console.log('[LSP TEST DEBUG] Starting tsgo...');
  // 1. Find and spawn tsgo (TS 7 server)
  const {connection: tsgoConnection, cleanup: tsgoCleanup} = await startTsgo(workspacePath);

  console.log('[LSP TEST DEBUG] tsgo started. Spawning hybrid server...');
  // 2. Find and spawn our server (Hybrid server)
  const serverPath = path.resolve(__dirname, '../dist/server/server.js');

  await fs.access(serverPath).catch(() => {
    throw new Error(`Server binary not found at ${serverPath}`);
  });

  const serverProcess = cp.spawn(process.execPath, [serverPath, '--stdio'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    cwd: workspacePath,
  });

  const connection = rpc.createMessageConnection(
    new rpc.StreamMessageReader(serverProcess.stdout!),
    new rpc.StreamMessageWriter(serverProcess.stdin!),
  );

  connection.onNotification('window/logMessage', (params: any) => {
    console.log(`[Server Log] ${params.message}`);
  });

  connection.onRequest(
    'angular/sendTsServerRequest',
    async (params: {method: string; params: any}) => {
      return tsgoConnection.sendRequest(params.method, params.params);
    },
  );

  connection.onNotification(
    'angular/sendTsServerNotification',
    async (params: {method: string; params: any}) => {
      tsgoConnection.sendNotification(params.method, params.params);
    },
  );

  connection.listen();

  let apiPipe: string | undefined;
  try {
    const apiSession = await tsgoConnection.sendRequest<{sessionId: string; pipe: string}>(
      'custom/initializeAPISession',
      {},
    );
    apiPipe = apiSession?.pipe;
  } catch (err) {
    console.error('Failed to initialize API session in test tsgo:', err);
  }

  console.log('[LSP TEST DEBUG] Hybrid server listening, sending initialize request...');
  await connection.sendRequest('initialize', {
    processId: process.pid,
    rootUri: `file://${workspacePath}`,
    initializationOptions: {
      tsApiPipe: apiPipe,
    },
    capabilities: {
      textDocument: {
        hover: {
          contentFormat: ['markdown', 'plaintext'],
        },
        signatureHelp: {
          signatureInformation: {
            documentationFormat: ['markdown', 'plaintext'],
            parameterInformation: {
              labelOffsetSupport: true,
            },
            activeParameterSupport: true,
          },
        },
      },
    },
  });

  console.log('[LSP TEST DEBUG] initialize request resolved!');
  await connection.sendNotification('initialized', {});

  return {
    connection,
    tsgoConnection,
    cleanup: async () => {
      try {
        await Promise.race([
          connection.sendRequest('shutdown'),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
        await connection.sendNotification('exit', {});
      } catch {}
      serverProcess.kill();

      try {
        await tsgoCleanup();
      } catch {}
    },
  };
}

async function toUri(filePath: string): Promise<string> {
  try {
    const rawPath = filePath.startsWith('file://') ? fileURLToPath(filePath) : filePath;
    return URI.file(await normalizePath(rawPath)).toString();
  } catch {
    return filePath;
  }
}

class LspClient {
  private currentVersion = 0;

  constructor(
    private connection: rpc.MessageConnection,
    private tsgoConnection: rpc.MessageConnection,
  ) {}

  private async sendNotificationToBoth(method: string, params: any, filePath: string) {
    try {
      const promises: Promise<void>[] = [this.connection.sendNotification(method, params)];
      if (filePath.endsWith('.ts')) {
        promises.push(this.tsgoConnection.sendNotification(method, params));
      }
      await Promise.all(promises);
    } catch {
      // Ignore if connection closed
    }
  }

  async didOpen(filePath: string, text: string) {
    const uri = await toUri(filePath);
    await this.sendNotificationToBoth(
      'textDocument/didOpen',
      {
        textDocument: {
          uri,
          languageId: 'typescript',
          version: ++this.currentVersion,
          text,
        },
      },
      filePath,
    );
  }

  async didChange(filePath: string, text: string, version?: number) {
    const uri = await toUri(filePath);
    const v = version !== undefined ? version : ++this.currentVersion;
    await this.sendNotificationToBoth(
      'textDocument/didChange',
      {
        textDocument: {uri, version: v},
        contentChanges: [{text}],
      },
      filePath,
    );
  }

  async didClose(filePath: string) {
    const uri = await toUri(filePath);
    await this.sendNotificationToBoth(
      'textDocument/didClose',
      {
        textDocument: {uri},
      },
      filePath,
    );
  }

  async didChangeWatchedFiles(filePath: string, type: FileChangeType = FileChangeType.Changed) {
    const uri = await toUri(filePath);
    await this.sendNotificationToBoth(
      'workspace/didChangeWatchedFiles',
      {
        changes: [{uri, type}],
      },
      filePath,
    );
  }

  async hover(filePath: string, position: Position) {
    const uri = await toUri(filePath);
    return this.connection.sendRequest<Hover | null>('textDocument/hover', {
      textDocument: {uri},
      position,
    });
  }

  async definition(filePath: string, position: Position) {
    const uri = await toUri(filePath);
    return this.connection.sendRequest<Location | Location[] | LocationLink[] | null>(
      'textDocument/definition',
      {
        textDocument: {uri},
        position,
      },
    );
  }

  async completion(filePath: string, position: Position) {
    const uri = await toUri(filePath);
    return this.connection.sendRequest<CompletionList | CompletionItem[] | null>(
      'textDocument/completion',
      {
        textDocument: {uri},
        position,
      },
    );
  }

  async completionResolve(item: CompletionItem) {
    return this.connection.sendRequest<CompletionItem>('completionItem/resolve', item);
  }

  async references(filePath: string, position: Position, includeDeclaration = true) {
    const uri = await toUri(filePath);
    return this.connection.sendRequest<Location[] | null>('textDocument/references', {
      textDocument: {uri},
      position,
      context: {includeDeclaration},
    });
  }

  async prepareRename(filePath: string, position: Position) {
    const uri = await toUri(filePath);
    return this.connection.sendRequest<any>('textDocument/prepareRename', {
      textDocument: {uri},
      position,
    });
  }

  async rename(filePath: string, position: Position, newName: string) {
    const uri = await toUri(filePath);
    return this.connection.sendRequest<any>('textDocument/rename', {
      textDocument: {uri},
      position,
      newName,
    });
  }

  async signatureHelp(filePath: string, position: Position, context?: SignatureHelpContext) {
    const uri = await toUri(filePath);
    return this.connection.sendRequest<SignatureHelp | null>('textDocument/signatureHelp', {
      textDocument: {uri},
      position,
      context,
    });
  }

  async diagnostic(filePath: string) {
    const uri = await toUri(filePath);
    return this.connection.sendRequest<FullDocumentDiagnosticReport>('textDocument/diagnostic', {
      textDocument: {uri},
    });
  }

  async workspaceDiagnostic() {
    return this.connection.sendRequest<WorkspaceDiagnosticReport>('workspace/diagnostic', {
      previousResultIds: [],
    });
  }
}

function matchesKind(
  itemKind: CompletionItemKind | undefined,
  expectedKind: CompletionItemKind | undefined,
): boolean {
  if (expectedKind === undefined) return true;
  if (itemKind === expectedKind) return true;
  if (
    (itemKind === CompletionItemKind.Field || itemKind === CompletionItemKind.Property) &&
    (expectedKind === CompletionItemKind.Field || expectedKind === CompletionItemKind.Property)
  ) {
    return true;
  }
  if (
    (itemKind === CompletionItemKind.Method || itemKind === CompletionItemKind.Function) &&
    (expectedKind === CompletionItemKind.Method || expectedKind === CompletionItemKind.Function)
  ) {
    return true;
  }
  if (
    (itemKind === CompletionItemKind.Value || itemKind === CompletionItemKind.Constant) &&
    (expectedKind === CompletionItemKind.Value || expectedKind === CompletionItemKind.Constant)
  ) {
    return true;
  }
  return itemKind === expectedKind;
}

export class TestEnv {
  private openedFiles: string[] = [];
  public lspClient: LspClient;

  constructor(
    connection: rpc.MessageConnection,
    tsgoConnection: rpc.MessageConnection,
    private fileManager: TestFileManager,
  ) {
    this.lspClient = new LspClient(connection, tsgoConnection);
  }

  async openFile(filePath: string, text: string) {
    const normPath = await normalizePath(filePath);
    await this.lspClient.didOpen(normPath, text);
    this.openedFiles.push(normPath);
  }

  async updateFiles(updates: {filePath: string; text: string; version: number}[]) {
    for (const update of updates) {
      const normPath = await normalizePath(update.filePath);
      await this.lspClient.didChange(normPath, update.text, update.version);
    }
  }

  async closeFile(filePath: string) {
    const normPath = await normalizePath(filePath);
    this.openedFiles = this.openedFiles.filter((u) => u !== normPath);
    this.fileManager.closeFile(normPath);
    await this.lspClient.didClose(normPath);
  }

  async createFile(name: string, content: string): Promise<string> {
    const filePath = this.fileManager.createFilePath(name);
    await this.editFile(filePath, content);
    return filePath;
  }

  async editFile(filePath: string, content: string, type: 'virtual' | 'physical' = 'physical') {
    const normPath = await normalizePath(filePath);
    const {text} = await this.fileManager.editFile(normPath, content, type);

    if (type === 'physical') {
      if (!this.openedFiles.includes(normPath)) {
        await this.lspClient.didChangeWatchedFiles(normPath);
      }
    } else {
      if (this.openedFiles.includes(normPath)) {
        await this.lspClient.didChange(normPath, text);
      } else {
        throw new Error('cannot make virtual changes to a file that is not open');
      }
    }
  }

  async getFileContent(filePath: string): Promise<string> {
    return this.fileManager.getFileContent(await normalizePath(filePath));
  }

  getCursorOffset(): number | undefined {
    return this.fileManager.getCursorOffset();
  }

  async getCursorContext(filePath: string): Promise<{
    normPath: string;
    offset: number;
    position: {line: number; character: number};
    fileContent: string;
    uri: string;
  }> {
    const normPath = await normalizePath(filePath);
    const offset = this.fileManager.getCursorOffset();
    if (offset === undefined) {
      throw new Error('No cursor marker (¦) found in content');
    }
    const uri = `file://${normPath}`;
    const fileContent = await this.getFileContent(normPath);
    const doc = TextDocument.create(uri, 'typescript', 0, fileContent);
    const position = doc.positionAt(offset);
    return {normPath, offset, position, fileContent, uri};
  }

  async expectHoverAtCursor(filePath: string, expectedTexts: string[] | null) {
    const {normPath, position} = await this.getCursorContext(filePath);
    const result = await this.lspClient.hover(normPath, position);

    if (expectedTexts) {
      expect(result).toBeTruthy();
      let text = '';
      const contents = result!.contents;
      if (typeof contents === 'string') {
        text = contents;
      } else if (Array.isArray(contents)) {
        text = contents.map((c) => (typeof c === 'string' ? c : c.value)).join('\n');
      } else if (typeof contents === 'object' && 'value' in contents) {
        text = contents.value;
      }

      for (const expected of expectedTexts) {
        expect(text).toContain(expected);
      }
    } else {
      expect(result).toBeNull();
    }
  }

  async expectDefinitionAtCursor(filePath: string, expectedFileName: string) {
    const {normPath, position} = await this.getCursorContext(filePath);
    const result = await this.lspClient.definition(normPath, position);

    expect(result).toBeTruthy();
    const locations = Array.isArray(result) ? result : [result];
    const fileNames = locations.map((l: any) => l.uri || l.targetUri);
    expect(fileNames.some((f: string) => f && f.includes(expectedFileName))).toBe(true);
  }

  async expectDiagnostics(filePath: string, expectedMessages: string[]) {
    const normPath = await normalizePath(filePath);
    const result = await this.lspClient.diagnostic(normPath);
    expect(result).toBeTruthy();
    expect(result.items).toBeTruthy();

    const messages = result.items.map((item: any) => item.message);
    for (const expected of expectedMessages) {
      expect(messages.some((m: string) => m.includes(expected))).toBe(true);
    }
  }

  async expectCompletionsAtCursor(
    filePath: string,
    expectedEntries?: {label: string; kind?: CompletionItemKind}[],
  ): Promise<CompletionList | CompletionItem[] | null> {
    const {normPath, position} = await this.getCursorContext(filePath);
    const result = await this.lspClient.completion(normPath, position);

    if (expectedEntries) {
      expect(result).toBeTruthy();
      const items: CompletionItem[] = Array.isArray(result) ? result : result?.items || [];
      for (const expected of expectedEntries) {
        const found = items.some(
          (i: CompletionItem) => i.label === expected.label && matchesKind(i.kind, expected.kind),
        );
        expect(found)
          .withContext(
            `Expected completions to contain "${expected.label}" (kind: ${expected.kind}), but found: ${JSON.stringify(items.map((i: any) => ({label: i.label, kind: i.kind})))}`,
          )
          .toBe(true);
      }
    }
    return result;
  }

  async getReferencesAtCursor(
    filePath: string,
    includeDeclaration = true,
  ): Promise<Location[] | null> {
    const {normPath, position} = await this.getCursorContext(filePath);
    return await this.lspClient.references(normPath, position, includeDeclaration);
  }

  async prepareRenameAtCursor(filePath: string) {
    const {normPath, position} = await this.getCursorContext(filePath);
    return await this.lspClient.prepareRename(normPath, position);
  }

  async renameAtCursor(filePath: string, newName: string) {
    const {normPath, position} = await this.getCursorContext(filePath);
    return await this.lspClient.rename(normPath, position, newName);
  }

  async getSignatureHelpAtCursor(
    filePath: string,
    context?: SignatureHelpContext,
  ): Promise<SignatureHelp | null> {
    const {normPath, position} = await this.getCursorContext(filePath);
    return await this.lspClient.signatureHelp(normPath, position, context);
  }

  async cleanup() {
    for (const uri of this.openedFiles) {
      await this.closeFile(uri);
    }
    this.openedFiles = [];
    const files = [...this.fileManager.getFiles()];
    for (const file of files) {
      await fs.rm(file, {force: true});
      await this.lspClient.didChangeWatchedFiles(file, 3);
    }
    await this.fileManager.cleanup();
  }

  async run(name: string, content: string, callback: (filePath: string) => Promise<void>) {
    try {
      const filePath = await this.createFile(name, content);
      const finalContent = await this.getFileContent(filePath);
      await this.openFile(filePath, finalContent);
      await callback(filePath);
    } finally {
      await this.cleanup();
      this.fileManager.setCursorOffset(undefined);
    }
  }
}
