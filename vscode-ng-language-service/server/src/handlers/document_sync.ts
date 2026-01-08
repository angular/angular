/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver/node';
import * as ts from 'typescript/lib/tsserverlibrary';
import {ProjectLoadingFinish} from '../../../common/notifications';
import {
  uriToFilePath,
  lspRangeToTsPositions,
  isConfiguredProject,
  filePathToUri,
  isDebugMode,
  MruTracker,
} from '../utils';
import {tsDiagnosticToLspDiagnostic} from '../diagnostic';
import {Session} from '../session';

enum LanguageId {
  TS = 'typescript',
  HTML = 'html',
}

// Polyfill `setImmediate`
const setImmediateP = promisify(setImmediate);
import {promisify} from 'util';

export class DocumentSyncHandler {
  private diagnosticsTimeout: NodeJS.Timeout | null = null;
  private readonly openFiles = new MruTracker();

  constructor(private session: Session) {}

  onDidOpenTextDocument(params: lsp.DidOpenTextDocumentParams) {
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
      let result = this.session.projectService.openClientFile(filePath, text, scriptKind);
      // If the first opened file is an HTML file and the project is a composite/solution-style
      // project with references, TypeScript will _not_ open a project unless the file is explicitly
      // included in the files/includes list. This is quite unlikely to be the case for HTML files.
      // As a best-effort to fix this, we attempt to open a TS file with the same name. Most of the
      // time, this is going to be the component file for the external template.
      // https://github.com/angular/vscode-ng-language-service/issues/2149
      if (result.configFileName === undefined && languageId === LanguageId.HTML) {
        const maybeComponentTsPath = filePath.replace(/\.html$/, '.ts');
        if (
          !this.session.projectService.openFiles.has(
            this.session.projectService.toPath(maybeComponentTsPath),
          )
        ) {
          this.session.projectService.openClientFile(maybeComponentTsPath);
          this.session.projectService.closeClientFile(maybeComponentTsPath);
          result = this.session.projectService.openClientFile(filePath, text, scriptKind);
        }
      }

      const {configFileName, configFileErrors} = result;
      if (configFileErrors && configFileErrors.length) {
        // configFileErrors is an empty array even if there's no error, so check length.
        this.session.error(configFileErrors.map((e) => e.messageText).join('\n'));
      }
      const project = configFileName
        ? this.session.projectService.findProject(configFileName)
        : this.session.projectService
            .getScriptInfo(filePath)
            ?.containingProjects.find(isConfiguredProject);
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
      if (this.session.isProjectLoading) {
        this.session.isProjectLoading = false;
        this.session.connection.sendNotification(ProjectLoadingFinish);
      }
      if (error instanceof Error && error.stack) {
        this.session.error(error.stack);
      }
      throw error;
    }
  }

  onDidCloseTextDocument(params: lsp.DidCloseTextDocumentParams) {
    const {textDocument} = params;
    const filePath = uriToFilePath(textDocument.uri);
    if (!filePath) {
      return;
    }
    this.session.logger.info(`Closing file: ${filePath}`);
    this.openFiles.delete(filePath);
    this.session.projectService.closeClientFile(filePath);
  }

  onDidChangeTextDocument(params: lsp.DidChangeTextDocumentParams): void {
    const {contentChanges, textDocument} = params;
    const filePath = uriToFilePath(textDocument.uri);
    if (!filePath) {
      return;
    }
    this.openFiles.update(filePath);
    const scriptInfo = this.session.projectService.getScriptInfo(filePath);
    if (!scriptInfo) {
      this.session.error(`Failed to get script info for ${filePath}`);
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

    const project = this.session.getDefaultProjectForScriptInfo(scriptInfo);
    if (!project || !project.languageServiceEnabled) {
      return;
    }
    this.requestDiagnosticsOnOpenOrChangeFile(scriptInfo.fileName, `Changing ${filePath}`);
  }

  onDidSaveTextDocument(params: lsp.DidSaveTextDocumentParams): void {
    const {text, textDocument} = params;
    const filePath = uriToFilePath(textDocument.uri);
    if (!filePath) {
      return;
    }
    this.openFiles.update(filePath);
    const scriptInfo = this.session.projectService.getScriptInfo(filePath);
    if (!scriptInfo) {
      return;
    }
    if (text) {
      scriptInfo.open(text);
    } else {
      scriptInfo.reloadFromFile();
    }
  }

  requestDiagnosticsOnOpenOrChangeFile(file: string, reason: string): void {
    // When a file is opened or touched, we want to trigger diagnostics on all
    // open files, because the change might affect other files.
    // However, if the file being modified is an external template, we only
    // need to trigger diagnostics on the external template itself, because
    // the change will only affect the component that uses the template.
    // This is a heuristic that we use to avoid triggering diagnostics on all
    // open files when a user is typing in an external template.
    // See https://github.com/angular/vscode-ng-language-service/issues/632
    //
    // Note that we still need to trigger diagnostics on the external template
    // because if we don't, the diagnostics on the external template will not
    // be updated.
    const files: string[] = [];
    // If the file is a TS file, we want to trigger diagnostics on all open
    // files, because the change might affect other files.
    if (isExternalTemplate(file)) {
      // If only external template is opened / changed, we know for sure it will
      // not affect other files because it is local to the Component.
      files.push(file);
    } else {
      // Get all open files, most recently used first.
      for (const openFile of this.openFiles.getAll()) {
        const scriptInfo = this.session.projectService.getScriptInfo(openFile);
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
  triggerDiagnostics(files: string[], reason: string, delay: number = 300) {
    // Do not immediately send a diagnostics request. Send only after user has
    // stopped typing after the specified delay.
    if (this.diagnosticsTimeout) {
      // If there's an existing timeout, cancel it
      clearTimeout(this.diagnosticsTimeout);
    }
    // Set a new timeout
    this.diagnosticsTimeout = setTimeout(() => {
      this.diagnosticsTimeout = null; // clear the timeout
      this.sendPendingDiagnostics(files, reason);
      // Default delay is 200ms, consistent with TypeScript. See
      // https://github.com/microsoft/vscode/blob/7b944a16f52843b44cede123dd43ae36c0405dfd/extensions/typescript-language-features/src/features/bufferSyncSupport.ts#L493)
    }, delay);
  }

  /**
   * Execute diagnostics request for each of the specified `files`.
   * @param files files to be checked
   * @param reason Trace to explain why diagnostics is triggered
   */
  private async sendPendingDiagnostics(files: string[], reason: string) {
    for (let i = 0; i < files.length; ++i) {
      const fileName = files[i];
      const result = this.session.getLSAndScriptInfo(fileName);
      if (!result) {
        continue;
      }
      const label = `${reason} - getSemanticDiagnostics for ${fileName}`;
      if (isDebugMode) {
        console.time(label);
      }
      const diagnostics = result.languageService.getSemanticDiagnostics(fileName);
      if (isDebugMode) {
        console.timeEnd(label);
      }

      const suggestionLabel = `${reason} - getSuggestionDiagnostics for ${fileName}`;
      if (isDebugMode) {
        console.time(suggestionLabel);
      }
      diagnostics.push(...result.languageService.getSuggestionDiagnostics(fileName));
      if (isDebugMode) {
        console.timeEnd(suggestionLabel);
      }

      // Need to send diagnostics even if it's empty otherwise editor state will
      // not be updated.
      this.session.connection.sendDiagnostics({
        uri: filePathToUri(fileName),
        diagnostics: diagnostics.map((d) =>
          tsDiagnosticToLspDiagnostic(d, this.session.projectService),
        ),
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
}

function isTypeScriptFile(path: string): boolean {
  return path.endsWith('.ts');
}

function isExternalTemplate(path: string): boolean {
  return !isTypeScriptFile(path);
}
