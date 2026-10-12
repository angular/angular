/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as path from 'path';
import * as ts from 'typescript/lib/tsserverlibrary';
import * as lsp from 'vscode-languageserver/node';

import {ServerHost} from './server_host';
import {filePathToUri} from './utils';

/**
 * Watches the files that the configured Custom Elements Manifests depend on, and synchronizes open
 * manifests, without registering language features for them.
 */
export class ResourceWatchers {
  private readonly projects = new Map<ts.server.Project, Set<string>>();
  private resources = new Set<string>();
  private readonly watchers = new Map<string, ts.FileWatcher>();
  private watchRegistration: lsp.Disposable | undefined;
  private watchRegistrationKey = '';
  private readonly documentRegistrations = new Map<string, lsp.Disposable>();
  private pendingUpdate: Promise<void> = Promise.resolve();

  constructor(
    private readonly host: ServerHost,
    private readonly connection: lsp.Connection,
    private readonly getCapabilities: () => lsp.ClientCapabilities,
    private readonly onChange: (fileName: string) => void,
  ) {}

  update(project?: ts.server.Project, fileNames: readonly string[] = []): void {
    if (project !== undefined) {
      this.projects.set(project, new Set(fileNames));
    }
    const resources = new Set<string>();
    const documents = new Set<string>();
    for (const [owner, files] of this.projects) {
      if (owner.isClosed() || !owner.languageServiceEnabled) {
        this.projects.delete(owner);
        continue;
      }
      for (const file of files) {
        resources.add(file);
        // readResource adds manifests as roots. TypeScript infers JSON ScriptKind even when
        // Unknown is requested, so ScriptKind alone cannot identify manifests. Resolution
        // metadata such as package.json is not added as a root.
        const scriptInfo = owner.getScriptInfo(file);
        if (scriptInfo !== undefined && owner.isRoot(scriptInfo)) {
          documents.add(file);
        }
      }
    }
    this.resources = resources;

    // A client can only watch a file whose directory exists. Until it does, watch the first
    // missing directory instead, and move the watch down as directories are created.
    const watchedPaths = new Map<string, () => void>();
    const clientPaths = new Set<string>();
    for (const file of resources) {
      watchedPaths.set(file, () => this.onChange(file));
      const missingDirectory = this.host.useClientSideFileWatcher
        ? this.findMissingDirectory(file)
        : null;
      if (missingDirectory === null) {
        clientPaths.add(file);
      } else {
        clientPaths.add(missingDirectory);
        if (!watchedPaths.has(missingDirectory)) {
          watchedPaths.set(missingDirectory, () => this.onDirectoryCreated(missingDirectory));
        }
      }
    }
    for (const [watchedPath, watcher] of this.watchers) {
      if (!watchedPaths.has(watchedPath)) {
        watcher.close();
        this.watchers.delete(watchedPath);
      }
    }
    for (const [watchedPath, callback] of watchedPaths) {
      if (!this.watchers.has(watchedPath)) {
        this.watchers.set(watchedPath, this.host.watchFile(watchedPath, callback));
      }
    }

    // Serialize updates so a slow registration cannot restore an obsolete set of resources.
    this.pendingUpdate = this.pendingUpdate
      .then(() => this.register(Array.from(clientPaths).sort(), Array.from(documents).sort()))
      .catch((error) =>
        this.connection.console.error(`Failed to watch Angular resources: ${error}`),
      );
  }

  getProjects(fileName: string): ts.server.Project[] {
    return Array.from(this.projects)
      .filter(
        ([project, files]) =>
          !project.isClosed() && project.languageServiceEnabled && files.has(fileName),
      )
      .map(([project]) => project);
  }

  /**
   * Returns the highest missing directory above `file`, whose parent exists, or `null` if the
   * directory of `file` exists.
   */
  private findMissingDirectory(file: string): string | null {
    let missingDirectory: string | null = null;
    let directory = path.dirname(file);
    while (!this.host.directoryExists(directory)) {
      missingDirectory = directory;
      const parent = path.dirname(directory);
      if (parent === directory) {
        break;
      }
      directory = parent;
    }
    return missingDirectory;
  }

  /**
   * Moves the watch below a directory that now exists. Files can be written together with the
   * directory, before the deeper watch is registered, so report the ones that exist once it is.
   */
  private onDirectoryCreated(directory: string): void {
    this.update();
    this.pendingUpdate = this.pendingUpdate
      .then(() => {
        for (const file of this.resources) {
          if (!path.relative(directory, file).startsWith('..') && this.host.fileExists(file)) {
            this.onChange(file);
          }
        }
      })
      .catch((error) =>
        this.connection.console.error(`Failed to watch Angular resources: ${error}`),
      );
  }

  private async register(clientPaths: string[], documents: string[]): Promise<void> {
    const capabilities = this.getCapabilities();
    const watchFiles =
      this.host.useClientSideFileWatcher &&
      capabilities.workspace?.didChangeWatchedFiles?.dynamicRegistration &&
      capabilities.workspace.didChangeWatchedFiles.relativePatternSupport;
    const watchedPaths = watchFiles ? clientPaths : [];
    const key = JSON.stringify(watchedPaths);
    if (key !== this.watchRegistrationKey) {
      const registrations = lsp.BulkRegistration.create();
      if (watchedPaths.length > 0) {
        registrations.add(lsp.DidChangeWatchedFilesNotification.type, {
          watchers: watchedPaths.map((watchedPath) => ({
            // Non-recursive relative watchers include dependencies excluded by workspace-wide globs
            // (notably node_modules) and resources outside the workspace.
            globPattern: {
              baseUri: filePathToUri(path.dirname(watchedPath)),
              pattern: escapeGlobPattern(path.basename(watchedPath)),
            },
          })),
        });
      }
      const registration =
        watchedPaths.length > 0 ? await this.connection.client.register(registrations) : undefined;
      this.watchRegistration?.dispose();
      this.watchRegistration = registration;
      this.watchRegistrationKey = key;
    }

    const synchronizedDocuments = new Set(
      capabilities.textDocument?.synchronization?.dynamicRegistration ? documents : [],
    );
    for (const [file, registration] of this.documentRegistrations) {
      if (!synchronizedDocuments.has(file)) {
        registration.dispose();
        this.documentRegistrations.delete(file);
      }
    }
    // Keep each document registration stable while other resources change. Replacing overlapping
    // synchronization selectors can duplicate incremental edits or close another unsaved buffer.
    for (const file of synchronizedDocuments) {
      if (this.documentRegistrations.has(file)) {
        continue;
      }
      const registrations = lsp.BulkRegistration.create();
      const documentSelector = [
        {
          scheme: 'file',
          pattern: escapeGlobPattern(file.replace(/\\/g, '/')),
        },
      ];
      registrations.add(lsp.DidOpenTextDocumentNotification.type, {documentSelector});
      registrations.add(lsp.DidChangeTextDocumentNotification.type, {
        documentSelector,
        syncKind: lsp.TextDocumentSyncKind.Incremental,
      });
      registrations.add(lsp.DidCloseTextDocumentNotification.type, {documentSelector});
      this.documentRegistrations.set(file, await this.connection.client.register(registrations));
    }
  }
}

/** Match a literal path, including filenames with glob metacharacters. */
function escapeGlobPattern(value: string): string {
  return value.replace(/[?*\[\]{}]/g, (character) => `[${character}]`);
}
