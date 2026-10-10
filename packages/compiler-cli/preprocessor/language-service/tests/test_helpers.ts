/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as path from 'path';
import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as cp from 'child_process';
import {HybridCompiler} from '../../src/hybrid_compiler.js';
import {NapiAnalyzer} from '../../src/analyzer_napi.js';
import {FileUpdateType} from '../../src/types.js';
import {LanguageService} from '../src/language_service';
import {buildTypeCheckingConfig} from '../../src/tcb';
import {TsGoFacade} from '../src/facade';
import {TextDocument} from 'vscode-languageserver-textdocument';
import * as rpc from 'vscode-jsonrpc/node';
import type {NgpCompilerOptions} from '../../src/compiler_options.js';
import {
  CompletionItem,
  CompletionItemKind,
  CompletionList,
  InsertTextFormat,
  MarkupContent,
  Location,
  SignatureHelp,
  SignatureHelpContext,
} from 'vscode-languageserver';

import {URI} from 'vscode-uri';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {canonicalizePath} from '../src/utils.js';
import {TestFileManager} from './test_file_manager';

/** Directory containing this file (and the spec files). */
const TESTS_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Relative path to the wasm engine, from the root of the Bazel runfiles tree. */
const WASM_RUNFILES_PATH =
  'packages/compiler-cli/preprocessor/ng-analyze/ng_analyze_wasm/ng_analyze_wasm.js';

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function runfilesDir(): string | undefined {
  return process.env['JS_BINARY__RUNFILES'] || process.env['RUNFILES_DIR'];
}

/**
 * Recursively copies `source` to `dest`, following symlinks and writing fresh files.
 *
 * Deliberately avoids `fs.cpSync`: on macOS it clones via `copyfile(3)`, and when the
 * source is a Bazel runfiles symlink the clone can `realpath()` back to the original
 * `bazel-out` file from another process, which makes the language server resolve the
 * fixture's `tsconfig.json` to the wrong location.
 */
function copyDirSync(source: string, dest: string): void {
  fsSync.mkdirSync(dest, {recursive: true});
  for (const entry of fsSync.readdirSync(source)) {
    const from = path.join(source, entry);
    const to = path.join(dest, entry);
    if (fsSync.statSync(from).isDirectory()) {
      copyDirSync(from, to);
    } else {
      fsSync.writeFileSync(to, fsSync.readFileSync(from));
    }
  }
}

const preparedWorkspaces = new Map<string, string>();

/**
 * Prepares a fixture directory for use as a project workspace by the specs.
 *
 * Under Bazel the runfiles tree is read-only, so `source` is copied into `TEST_TMPDIR`
 * once per process. Outside Bazel the source directory is used directly.
 */
export function prepareTestWorkspace(source: string): string {
  const cached = preparedWorkspaces.get(source);
  if (cached !== undefined) {
    return cached;
  }
  const tmpDir = process.env['TEST_TMPDIR'];
  let workspace: string;
  if (tmpDir && runfilesDir()) {
    const dest = path.join(tmpDir, `ngp-test-workspace-${preparedWorkspaces.size}`);
    copyDirSync(source, dest);
    workspace = fsSync.realpathSync(dest);
  } else {
    workspace = source;
  }
  preparedWorkspaces.set(source, workspace);
  return workspace;
}

/** Returns the directory the language-service specs use as their project workspace. */
export function getTestWorkspacePath(): string {
  return prepareTestWorkspace(path.join(TESTS_DIR, 'test-workspace'));
}

/**
 * Locates the wasm-bindgen build of the analysis engine.
 *
 * Honors the same overrides as the standalone runner, then falls back to the Bazel
 * runfiles tree. Returns `undefined` to let the analyzer loader use its own discovery.
 */
export function resolveWasmBinding(): string | undefined {
  const fromEnv = process.env['NG_EXP_COMPILER_WASM_BINDING'] || process.env['NGP_WASM_BINDING'];
  if (fromEnv) {
    return fromEnv;
  }
  const runfiles = runfilesDir();
  if (!runfiles) {
    return undefined;
  }
  for (const workspace of ['_main', 'angular', '']) {
    const candidate = path.join(runfiles, workspace, WASM_RUNFILES_PATH);
    if (fsSync.existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

async function toUri(filePath: string): Promise<string> {
  try {
    const rawPath = filePath.startsWith('file://') ? fileURLToPath(filePath) : filePath;
    return URI.file(await canonicalizePath(rawPath)).toString();
  } catch {
    return filePath;
  }
}

export async function resolveTsGoPath(): Promise<string> {
  if (process.env['TSGO_BINARY_PATH']) {
    return process.env['TSGO_BINARY_PATH'];
  }

  try {
    const req = createRequire(import.meta.url);
    const previewPkg = req.resolve('@typescript/native-preview/package.json');
    const previewReq = createRequire(previewPkg);
    const platformPkgName = `@typescript/native-preview-${process.platform}-${process.arch}`;
    const platPkg = previewReq.resolve(`${platformPkgName}/package.json`);
    const exe = path.join(
      path.dirname(platPkg),
      'lib',
      `tsgo${process.platform === 'win32' ? '.exe' : ''}`,
    );
    if (await pathExists(exe)) {
      return exe;
    }
  } catch {}

  const workspaceRoot = path.resolve(TESTS_DIR, '../..');
  const platformName = `@typescript/native-preview-${process.platform}-${process.arch}`;
  const localCandidates = [
    path.join(workspaceRoot, 'node_modules', platformName, 'lib', 'tsgo'),
    path.join(
      workspaceRoot,
      'reference',
      'typescript-go',
      'built',
      'local',
      `tsgo${process.platform === 'win32' ? '.exe' : ''}`,
    ),
    path.join(workspaceRoot, 'node_modules', '@typescript', 'native-preview', 'bin', 'tsgo.js'),
    path.join(workspaceRoot, 'node_modules', '@typescript', 'native-preview', 'bin', 'tsgo'),
    path.join(
      workspaceRoot,
      'reference',
      'typescript-go',
      '_packages',
      'native-preview',
      'bin',
      'tsgo',
    ),
  ];

  for (const candidate of localCandidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  throw new Error('Could not find tsgo binary.');
}

export async function startTsgo(workspacePath: string) {
  const binaryPath = await resolveTsGoPath();
  const isJs = binaryPath.endsWith('.js');
  const cmd = isJs ? process.execPath : binaryPath;
  const args = isJs ? [binaryPath, '--lsp', '--stdio'] : ['--lsp', '--stdio'];

  const serverProcess = cp.spawn(cmd, args, {
    stdio: ['pipe', 'pipe', 'inherit'],
    cwd: workspacePath,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
    },
  });

  const connection = rpc.createMessageConnection(
    new rpc.StreamMessageReader(serverProcess.stdout!),
    new rpc.StreamMessageWriter(serverProcess.stdin!),
  );

  connection.listen();

  await connection.sendRequest('initialize', {
    processId: process.pid,
    rootUri: `file://${workspacePath}`,
    capabilities: {
      textDocument: {
        hover: {
          contentFormat: ['markdown', 'plaintext'],
        },
        definition: {
          linkSupport: true,
        },
        typeDefinition: {
          linkSupport: true,
        },
        completion: {
          completionItem: {
            snippetSupport: true,
            documentationFormat: ['markdown', 'plaintext'],
            resolveSupport: {
              properties: ['documentation', 'detail'],
            },
          },
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
        diagnostic: {},
      },
    },
  });

  await connection.sendNotification('initialized', {});

  return {
    connection,
    serverProcess,
    cleanup: async () => {
      try {
        await Promise.race([
          connection.sendRequest('shutdown'),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
        await connection.sendNotification('exit', {});
      } catch {}
      serverProcess.kill();
    },
  };
}

export async function startTestServer(workspacePath: string) {
  const {connection, cleanup: tsgoCleanup} = await startTsgo(workspacePath);

  const facade = new TsGoFacade(connection);

  return {
    facade,
    connection,
    cleanup: async () => {
      await tsgoCleanup();
    },
  };
}

export class TestEnv {
  public compiler: HybridCompiler | null = null;
  private openedFiles: string[] = [];
  private currentVersion = 0;

  constructor(
    private facade: TsGoFacade,
    private fileManager: TestFileManager,
    private connection?: rpc.MessageConnection,
  ) {}

  async openFile(filePath: string, text: string) {
    if (this.connection) {
      const uri = await toUri(filePath);
      await this.connection.sendNotification('textDocument/didOpen', {
        textDocument: {
          uri,
          languageId: 'typescript',
          version: ++this.currentVersion,
          text,
        },
      });
    }
    const cleanPath = filePath.startsWith('file://') ? fileURLToPath(filePath) : filePath;
    this.openedFiles.push(cleanPath);
  }

  async updateFiles(updates: {filePath: string; text: string; version: number}[]) {
    for (const update of updates) {
      if (this.connection) {
        const uri = await toUri(update.filePath);
        await this.connection.sendNotification('textDocument/didChange', {
          textDocument: {uri, version: update.version},
          contentChanges: [{text: update.text}],
        });
      }
    }
  }

  async closeFile(filePath: string) {
    const cleanPath = filePath.startsWith('file://') ? fileURLToPath(filePath) : filePath;
    this.openedFiles = this.openedFiles.filter((u) => u !== cleanPath && u !== filePath);
    this.fileManager.closeFile(cleanPath);
    if (this.connection) {
      const uri = await toUri(filePath);
      await this.connection.sendNotification('textDocument/didClose', {
        textDocument: {uri},
      });
    }
  }

  async createFile(name: string, content: string): Promise<string> {
    const filePath = this.fileManager.createFilePath(name);
    await this.editFile(filePath, content);
    return filePath;
  }

  async editFile(filePath: string, content: string, type: 'virtual' | 'physical' = 'physical') {
    const {text} = await this.fileManager.editFile(filePath, content, type);

    if (type === 'physical') {
      if (!this.openedFiles.includes(filePath)) {
        await this.compiler?.invalidateFiles([{filePath, updateType: FileUpdateType.Changed}]);
      }
    } else {
      await this.compiler?.updateFileContent([{filePath, content: text}]);
    }

    if (this.openedFiles.includes(filePath) && filePath.endsWith('.ts') && this.connection) {
      const uri = await toUri(filePath);
      await this.connection.sendNotification('textDocument/didChange', {
        textDocument: {uri, version: ++this.currentVersion},
        contentChanges: [{text}],
      });
    }
  }

  async getFileContent(filePath: string): Promise<string> {
    return this.fileManager.getFileContent(filePath);
  }

  getCursorOffset(): number | undefined {
    return this.fileManager.getCursorOffset();
  }

  async getLanguageService(
    options?: NgpCompilerOptions & {
      enableSelectorless?: boolean;
    },
  ): Promise<LanguageService> {
    const tsconfigPath = path.join(this.fileManager.getWorkspacePath(), 'tsconfig.json');
    const wasmBinding = resolveWasmBinding();
    const analyzer = await NapiAnalyzer.create(tsconfigPath, {
      nodeModulesPathOverride: path.resolve(TESTS_DIR, '../../node_modules'),
      ngAnalyzeDir: path.resolve(TESTS_DIR, '../../ng-analyze'),
      ...(wasmBinding ? {backend: 'wasm', wasmBinding} : {}),
    });
    this.compiler = new HybridCompiler(analyzer, {
      tcbConfig: buildTypeCheckingConfig(options, true),
      templateParseOptions: {
        preserveWhitespaces: true,
        preserveLineEndings: true,
        preserveSignificantWhitespace: true,
        leadingTriviaChars: [],
        ...(options?.enableSelectorless ? {enableSelectorless: true} : {}),
      },
    });
    await this.compiler.init();
    return new LanguageService(this.compiler, this.facade);
  }

  async getCursorContext(filePath: string): Promise<{
    offset: number;
    position: {line: number; character: number};
    fileContent: string;
    uri: string;
  }> {
    const offset = this.fileManager.getCursorOffset();
    if (offset === undefined) {
      throw new Error('No cursor marker (¦) found in content');
    }
    const uri = await toUri(filePath);
    const fileContent = await this.getFileContent(filePath);
    const doc = TextDocument.create(uri, 'typescript', 0, fileContent);
    const position = doc.positionAt(offset);
    return {offset, position, fileContent, uri};
  }

  async expectHoverAtCursor(ls: LanguageService, filePath: string, expectedTexts: string[] | null) {
    const {offset, position, fileContent} = await this.getCursorContext(filePath);
    const result = await ls.getHover(filePath, offset, position, fileContent);

    if (expectedTexts) {
      expect(result).toBeTruthy();
      const normalizedResult = result!.text.replace(/\s+/g, ' ');
      for (const expected of expectedTexts) {
        expect(normalizedResult).toContain(expected.replace(/\s+/g, ' '));
      }
    } else {
      expect(result).toBeNull();
    }
  }

  async expectDefinitionAtCursor(ls: LanguageService, filePath: string, expectedFileName: string) {
    const {offset, position, fileContent} = await this.getCursorContext(filePath);
    const result = await ls.getDefinition(filePath, offset, position, fileContent);

    expect(result).toBeTruthy();
    const locations = Array.isArray(result) ? result : [result];
    const fileNames = locations.map((l: any) => l.uri || l.targetUri);
    expect(fileNames.some((f: string) => f && f.includes(expectedFileName))).toBe(true);
  }

  async getCompletionsAtPosition(
    ls: LanguageService,
    filePath: string,
  ): Promise<CompletionList | null> {
    const {offset, position, fileContent} = await this.getCursorContext(filePath);
    return await ls.getCompletionsAtPosition(filePath, offset, position, fileContent);
  }

  async getCompletionEntryDetails(
    ls: LanguageService,
    filePath: string,
    item: CompletionItem | string,
  ): Promise<CompletionItem | null> {
    const {offset, position, fileContent} = await this.getCursorContext(filePath);
    return await ls.getCompletionEntryDetails(filePath, offset, position, fileContent, item);
  }

  async getReferencesAtPosition(ls: LanguageService, filePath: string): Promise<Location[] | null> {
    const {offset, position, fileContent} = await this.getCursorContext(filePath);
    return await ls.getReferencesAtPosition(filePath, offset, position, fileContent);
  }

  async getRenameInfo(ls: LanguageService, filePath: string) {
    const {offset, position, fileContent} = await this.getCursorContext(filePath);
    return await ls.getRenameInfo(filePath, offset, position, fileContent);
  }

  async findRenameLocations(ls: LanguageService, filePath: string): Promise<Location[] | null> {
    const {offset, position, fileContent} = await this.getCursorContext(filePath);
    return await ls.findRenameLocations(filePath, offset, position, fileContent);
  }

  async getSignatureHelp(
    ls: LanguageService,
    filePath: string,
    context?: SignatureHelpContext,
  ): Promise<SignatureHelp | null> {
    const {offset, position, fileContent} = await this.getCursorContext(filePath);
    return await ls.getSignatureHelp(filePath, offset, position, fileContent, context);
  }

  async cleanup() {
    for (const uri of this.openedFiles) {
      await this.closeFile(uri);
    }
    this.openedFiles = [];
    this.compiler = null;
    await this.fileManager.cleanup();
  }

  async run(
    name: string,
    content: string,
    callback: (ls: LanguageService, filePath: string) => Promise<void>,
    options?: NgpCompilerOptions & {
      enableSelectorless?: boolean;
    },
  ) {
    try {
      const filePath = await this.createFile(name, content);
      const finalContent = await this.getFileContent(filePath);
      await this.openFile(filePath, finalContent);

      const ls = await this.getLanguageService(options);
      await callback(ls, filePath);
    } finally {
      await this.cleanup();
      this.fileManager.setCursorOffset(undefined);
    }
  }
}

function matchesKind(itemKind: CompletionItemKind | undefined, expectedKind: any): boolean {
  if (expectedKind === undefined) return true;
  if (itemKind === expectedKind) {
    return true;
  }
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
  return (itemKind as any) === (expectedKind as any);
}

export function expectContain(
  completions: CompletionList | null | undefined,
  kind: CompletionItemKind | string,
  names: string[],
) {
  expect(completions).toBeDefined();
  for (const name of names) {
    const found = completions!.items.some((e) => e.label === name && matchesKind(e.kind, kind));
    expect(found)
      .withContext(
        `Expected completions to contain entry "${name}" of kind "${kind}", but entries were: ${JSON.stringify(completions!.items.map((e) => ({label: e.label, kind: e.kind})))}`,
      )
      .toBe(true);
  }
}

export function expectAll(
  completions: CompletionList | null | undefined,
  contains: {[name: string]: CompletionItemKind | string},
): void {
  expect(completions).toBeDefined();
  for (const [name, kind] of Object.entries(contains)) {
    const found = completions!.items.some((e) => e.label === name && matchesKind(e.kind, kind));
    expect(found)
      .withContext(`Expected completions to contain entry "${name}" of kind "${kind}"`)
      .toBe(true);
  }
  expect(completions!.items.length).toEqual(Object.keys(contains).length);
}

export function expectDoesNotContain(
  completions: CompletionList | null | undefined,
  kind: CompletionItemKind | string,
  names: string[],
) {
  expect(completions).toBeDefined();
  for (const name of names) {
    const found = completions!.items.some((e) => e.label === name && matchesKind(e.kind, kind));
    expect(found)
      .withContext(`Expected completions NOT to contain entry "${name}" of kind "${kind}"`)
      .toBe(false);
  }
}

export function expectReplacementText(
  completions: CompletionList | null | undefined,
  text: string,
  replacementText: string,
) {
  if (!completions) {
    return;
  }

  for (const entry of completions.items) {
    expect(entry.textEdit).toBeDefined();
    if (entry.textEdit && 'range' in entry.textEdit) {
      // Check range replacement
      expect(entry.textEdit.newText).toBe(replacementText);
    }
  }
}

export function expectContainInsertText(
  completions: CompletionList | null | undefined,
  kind: CompletionItemKind | string,
  insertTexts: string[],
) {
  expect(completions).toBeDefined();
  for (const insertText of insertTexts) {
    const found = completions!.items.some(
      (e) => (e.insertText === insertText || e.label === insertText) && matchesKind(e.kind, kind),
    );
    expect(found)
      .withContext(`Expected completions to contain insertText "${insertText}" of kind "${kind}"`)
      .toBe(true);
  }
}

export function expectContainInsertTextWithSnippet(
  completions: CompletionList | null | undefined,
  kind: CompletionItemKind | string,
  insertTexts: string[],
) {
  expect(completions).toBeDefined();
  for (const insertText of insertTexts) {
    const found = completions!.items.some(
      (e) =>
        e.insertText === insertText &&
        matchesKind(e.kind, kind) &&
        e.insertTextFormat === InsertTextFormat.Snippet,
    );
    expect(found)
      .withContext(
        `Expected completions to contain snippet insertText "${insertText}" of kind "${kind}"`,
      )
      .toBe(true);
  }
}

export function expectDoesNotContainInsertTextWithSnippet(
  completions: CompletionList | null | undefined,
  kind: CompletionItemKind | string,
  insertTexts: string[],
) {
  expect(completions).toBeDefined();
  for (const insertText of insertTexts) {
    const found = completions!.items.some(
      (e) =>
        e.insertText === insertText &&
        matchesKind(e.kind, kind) &&
        e.insertTextFormat === InsertTextFormat.Snippet,
    );
    expect(found)
      .withContext(
        `Expected completions NOT to contain snippet insertText "${insertText}" of kind "${kind}"`,
      )
      .toBe(false);
  }
}

export function toText(doc?: string | MarkupContent): string {
  if (!doc) return '';
  if (typeof doc === 'string') return doc;
  return doc.value ?? '';
}
