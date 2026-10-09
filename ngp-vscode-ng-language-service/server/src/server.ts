import {
  createConnection,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  Connection,
  TextDocuments,
  TextDocumentChangeEvent,
  DidChangeWatchedFilesParams,
  FileChangeType,
  DocumentDiagnosticParams,
  WorkspaceDiagnosticParams,
  WorkspaceDiagnosticReport,
  WorkspaceFullDocumentDiagnosticReport,
  Diagnostic,
  CompletionItem,
} from 'vscode-languageserver/node';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {URI} from 'vscode-uri';
import {onGetTcb} from './handlers/tcb';
import {onHover} from './handlers/hover';
import {onDefinition} from './handlers/definition';
import {onCompletion, onCompletionResolve} from './handlers/completion';
import {onReferences} from './handlers/references';
import {onPrepareRename, onRename} from './handlers/rename';
import {onSignatureHelp} from './handlers/signature';
import {HandlerContext} from './handlers/utils';
import * as fs from 'node:fs/promises';
import * as rpc from 'vscode-jsonrpc/node';

import {API} from '@typescript/native-preview/unstable/async';
import {TsGoFacade} from '../../../packages/compiler-cli/preprocessor/language-service/src/facade';
import {fileURLToPath} from 'node:url';
import {getTcbPath} from '../../../packages/compiler-cli/preprocessor/src/tcb_ls_util.js';
import {
  FileInvalidation,
  FileUpdateType,
} from '../../../packages/compiler-cli/preprocessor/src/types.js';
import {ProjectManager} from './project_manager';
import {DiagnosticPublisher} from './diagnostic_publisher';
import {canonicalizePath as normalizePath} from '../../../packages/compiler-cli/preprocessor/language-service/src/utils.js';

let workspaceRoot: string = '';
let facade: TsGoFacade | null = null;
let projectManager: ProjectManager | null = null;

// Create a connection for the server, using Node's IPC as a transport.
const connection: Connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
const diagnosticPublisher = new DiagnosticPublisher(connection);
documents.listen(connection);

documents.onDidChangeContent((change: TextDocumentChangeEvent<TextDocument>) => {
  connection.console.log(`[SERVER] onDidChangeContent called for ${change.document.uri}`);
  if (!projectManager) {
    return;
  }
  const filePath = fileURLToPath(change.document.uri);
  const content = change.document.getText();

  if (filePath.endsWith('.ngtypecheck.ts')) {
    return;
  }

  if (filePath.endsWith('.html') || filePath.endsWith('.ts')) {
    projectManager.updateFileContent([{filePath, content}]).catch((err) => {
      connection.console.error(`[SERVER] Error updating file content for ${filePath}: ${err}`);
    });
  }
});

documents.onDidClose(async (event: TextDocumentChangeEvent<TextDocument>) => {
  connection.console.log(`[SERVER] onDidClose called for ${event.document.uri}`);
  await diagnosticPublisher.clearAllFor(event.document.uri);
  try {
    const filePath = fileURLToPath(event.document.uri);
    if (!projectManager) {
      return;
    }
    if (filePath.endsWith('.html') || filePath.endsWith('.ts')) {
      await projectManager.invalidateFiles([{filePath, updateType: FileUpdateType.Changed}]);
    }
  } catch (err) {
    connection.console.error(
      `[SERVER] Error handling onDidClose for ${event.document.uri}: ${err}`,
    );
  }
});

connection.onDidChangeWatchedFiles((params: DidChangeWatchedFilesParams) => {
  if (!projectManager) {
    return;
  }
  const invalidations: FileInvalidation[] = [];

  for (const change of params.changes) {
    const filePath = fileURLToPath(change.uri);
    console.error(`[SERVER DEBUG] change.uri: ${change.uri}, resolved filePath: ${filePath}`);

    if (filePath.endsWith('.ngtypecheck.ts')) {
      continue;
    }

    // If the file is open in the editor, ignore physical file changes.
    // The editor will send didChange notifications if it updates its content.
    if (documents.get(change.uri)) {
      continue;
    }

    let updateType: FileUpdateType;
    switch (change.type) {
      case FileChangeType.Created:
        updateType = FileUpdateType.Created;
        break;
      case FileChangeType.Deleted:
        updateType = FileUpdateType.Deleted;
        break;
      case FileChangeType.Changed:
        updateType = FileUpdateType.Changed;
        break;
      default:
        const exhaustive: number = change.type;
        throw new Error(`Unhandled file change type: ${exhaustive}`);
    }

    invalidations.push({filePath, updateType});
  }

  projectManager.invalidateFiles(invalidations).catch((err) => {
    connection.console.error(`[SERVER] Error handling onDidChangeWatchedFiles: ${err}`);
  });
});

connection.onInitialize(async (params: InitializeParams) => {
  connection.console.log(`Initializing Angular Hybrid Language Server`);
  if (params.rootUri) {
    workspaceRoot = fileURLToPath(params.rootUri);
  } else if (params.rootPath) {
    workspaceRoot = params.rootPath;
  }

  let api: API | undefined;
  if (params.initializationOptions?.tsApiPipe) {
    try {
      api = await API.fromLSPConnection({pipe: params.initializationOptions.tsApiPipe});
      connection.console.log(
        `[SERVER] Connected to TS7 API via pipe: ${params.initializationOptions.tsApiPipe}`,
      );
    } catch (err) {
      connection.console.error(`[SERVER] Failed to connect to TS7 API pipe: ${err}`);
    }
  }

  const ts7Connection: rpc.MessageConnection = {
    sendRequest: (method: string, params?: any) =>
      connection.sendRequest('angular/sendTsServerRequest', {method, params}),
    sendNotification: (method: string, params?: any) =>
      connection.sendNotification('angular/sendTsServerNotification', {method, params}),
  } as any;

  facade = new TsGoFacade(ts7Connection);
  projectManager = new ProjectManager({
    facade,
    api,
    nodeModulesPathOverride: process.env.NG_HYBRID_NODE_MODULES_OVERRIDE,
    onLog: (msg) => connection.console.log(msg),
    onError: (msg) => connection.console.error(msg),
  });

  connection.onNotification('angular/setTsApiPipe', async (params: {pipe: string}) => {
    try {
      const dynamicApi = await API.fromLSPConnection({pipe: params.pipe});
      if (projectManager) {
        projectManager.setApi(dynamicApi);
        connection.console.log(`[SERVER] Connected to dynamic TS7 API pipe: ${params.pipe}`);
      }
    } catch (err) {
      connection.console.error(`[SERVER] Failed to connect to dynamic TS7 API pipe: ${err}`);
    }
  });

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: 1, // TextDocumentSyncKind.Full
      hoverProvider: true,
      definitionProvider: true,
      referencesProvider: true,
      renameProvider: {
        prepareProvider: true,
      },
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['<', '.', '*', '[', '(', '$', '|', '@'],
      },
      signatureHelpProvider: {
        triggerCharacters: ['(', ','],
        retriggerCharacters: [','],
      },
      diagnosticProvider: {
        interFileDependencies: true,
        workspaceDiagnostics: true,
      },
    },
  };
  return result;
});

async function getProjectInfo(uri: string) {
  if (!projectManager || !facade) {
    connection.console.error('ProjectManager or Facade not initialized!');
    return null;
  }
  if (uri.endsWith('.ngtypecheck.ts')) {
    return null;
  }
  const filePath = fileURLToPath(uri);
  const project = await projectManager.getProjectForFile(filePath);
  if (!project) {
    connection.console.log(`No project found for ${filePath}`);
    return null;
  }
  return {project, filePath, facade, projectManager};
}

function withProject<P extends {textDocument: {uri: string}}, R>(
  handler: (params: P, ctx: HandlerContext) => R | Promise<R>,
): (params: P) => Promise<R | null> {
  return async (params: P) => {
    const info = await getProjectInfo(params.textDocument.uri);
    if (!info) return null;
    await info.project.hybridCompiler.ensureReady();
    return handler(params, {
      workspaceRoot,
      languageService: info.project.languageService,
      connection,
      documents,
    });
  };
}

connection.onRequest('angular/getTcb', withProject(onGetTcb));
connection.onHover(withProject(onHover));
connection.onDefinition(withProject(onDefinition));
connection.onCompletion(withProject(onCompletion));

connection.onCompletionResolve(async (item: CompletionItem) => {
  if (!projectManager || !facade) return item;
  const data = item.data as
    {filePath?: string; position?: {line: number; character: number}} | undefined;
  if (data?.filePath) {
    const project = await projectManager.getProjectForFile(data.filePath);
    if (project) {
      await project.hybridCompiler.ensureReady();
      return onCompletionResolve(item, {
        workspaceRoot,
        languageService: project.languageService,
        connection,
        documents,
      });
    }
  }
  return item;
});

connection.onReferences(withProject(onReferences));
connection.onPrepareRename(withProject(onPrepareRename));
connection.onRenameRequest(withProject(onRename));
connection.onSignatureHelp(withProject(onSignatureHelp));

connection.onRequest('textDocument/diagnostic', async (params: DocumentDiagnosticParams) => {
  const uri = params.textDocument.uri;
  connection.console.log(`[SERVER] Received textDocument/diagnostic for ${uri}`);

  const info = await getProjectInfo(uri);
  if (!info) {
    await diagnosticPublisher.clearAllFor(uri);
    return {kind: 'full', items: []};
  }
  const {project, filePath, facade} = info;

  let tsFilePath = filePath;
  if (filePath.endsWith('.html')) {
    const templateUsage = project.hybridCompiler.getTsFileForTemplate(filePath);
    if (!templateUsage) {
      connection.console.log(`[SERVER] No component found for template ${filePath}`);
      await diagnosticPublisher.clearAllFor(uri);
      return {kind: 'full', items: []};
    }
    tsFilePath = templateUsage.tsFilePath;
  } else if (!filePath.endsWith('.ts')) {
    await diagnosticPublisher.clearAllFor(uri);
    return {kind: 'full', items: []};
  }

  await project.hybridCompiler.ensureReady();

  const tcbFilePath = getTcbPath(tsFilePath);
  const tcbContent = project.hybridCompiler.getTcbForFile(tsFilePath);
  if (!tcbContent) {
    await diagnosticPublisher.clearAllFor(uri);
    return {kind: 'full', items: []};
  }

  try {
    await facade.ensureDocument(tcbFilePath, tcbContent);
    const tcbDiagnostics = await facade.getDiagnostics(tcbFilePath);

    const mappedDiagnostics = await project.languageService.handleDiagnostics({
      filePath: tcbFilePath,
      diagnostics: tcbDiagnostics,
    });

    if (!documents.get(uri)) {
      await diagnosticPublisher.clearAllFor(uri);
      return {kind: 'full', items: []};
    }

    connection.console.log(
      `[SERVER] Mapped diagnostics for ${uri}: ${JSON.stringify(mappedDiagnostics)}`,
    );

    const responseItems = await diagnosticPublisher.update(uri, uri, mappedDiagnostics || {});
    return {kind: 'full', items: responseItems};
  } catch (e) {
    connection.console.error(`Failed to pull diagnostics from TS7: ${e}`);
    await diagnosticPublisher.clearAllFor(uri);
    return {kind: 'full', items: []};
  }
});

async function computeWorkspaceDiagnostics(): Promise<WorkspaceDiagnosticReport> {
  if (!projectManager || !facade) {
    connection.console.error('ProjectManager/Facade not initialized!');
    return {items: []};
  }

  const projects = projectManager.getLoadedProjects();
  const allDocumentDiagnostics = new Map<string, Diagnostic[]>();

  for (const project of projects) {
    await project.hybridCompiler.ensureReady();

    const candidateFiles = new Set<string>(project.rootNames);
    for (const doc of documents.all()) {
      try {
        const docPath = await normalizePath(fileURLToPath(doc.uri));
        if (docPath.endsWith('.ts') && !docPath.endsWith('.ngtypecheck.ts')) {
          const docProject = await projectManager.getProjectForFile(docPath);
          if (docProject?.tsconfigPath === project.tsconfigPath) {
            candidateFiles.add(docPath);
          }
        }
      } catch {}
    }

    const validCandidateFiles = (
      await Promise.all(
        Array.from(candidateFiles).map(async (filePath) => {
          if (!filePath.endsWith('.ts') || filePath.endsWith('.ngtypecheck.ts')) {
            return null;
          }

          try {
            await fs.access(filePath);
            return filePath;
          } catch {
            return null;
          }
        }),
      )
    ).filter((f): f is string => f !== null);

    for (const filePath of validCandidateFiles) {
      try {
        const tcbContent = project.hybridCompiler.getTcbForFile(filePath);
        if (!tcbContent) {
          continue;
        }

        const tcbFilePath = getTcbPath(filePath);
        await facade.ensureDocument(tcbFilePath, tcbContent);
        const tcbDiagnostics = await facade.getDiagnostics(tcbFilePath);
        const mappedDiagnostics = await project.languageService.handleDiagnostics({
          filePath: tcbFilePath,
          diagnostics: tcbDiagnostics,
        });

        if (mappedDiagnostics) {
          for (const [targetPath, diags] of Object.entries(mappedDiagnostics)) {
            const targetUri = URI.file(await normalizePath(targetPath)).toString();
            const existing = allDocumentDiagnostics.get(targetUri) || [];
            allDocumentDiagnostics.set(targetUri, [...existing, ...diags]);
          }
        }
      } catch (err) {
        connection.console.error(
          `[SERVER] Error generating workspace diagnostics for ${filePath}: ${err}`,
        );
      }
    }
  }

  const items: WorkspaceFullDocumentDiagnosticReport[] = [];
  for (const [uri, diags] of allDocumentDiagnostics.entries()) {
    items.push({
      uri,
      kind: 'full',
      version: documents.get(uri)?.version ?? null,
      items: diags,
    });
  }

  return {items};
}

connection.onRequest('workspace/diagnostic', async (_params: WorkspaceDiagnosticParams) => {
  return computeWorkspaceDiagnostics();
});

connection.listen();
