/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {WebContainer} from '@webcontainer/api';
import {Typing} from './code-editor/workers/interfaces/define-types-request';

/**
 * This service is responsible for retrieving the types definitions for the
 * predefined dependencies.
 */
@Injectable({providedIn: 'root'})
export class TypingsLoader {
  private readonly librariesToGetTypesFrom = [
    '@angular/common',
    '@angular/core',
    '@angular/forms',
    '@angular/router',
    '@angular/platform-browser',
    '@angular/material',
    '@angular/cdk',
  ];

  private webContainer: WebContainer | undefined;

  private readonly _typings = signal<Typing[]>([]);
  readonly typings = this._typings.asReadonly();
  readonly typings$ = toObservable(this._typings);

  /**
   * Retrieve types from the predefined libraries and set the types files and contents in the `typings` signal
   */
  async retrieveTypeDefinitions(webContainer: WebContainer): Promise<void> {
    this.webContainer = webContainer;

    const typesDefinitions: Typing[] = [];

    try {
      const filesToRead = await this.getFilesToRead();

      if (filesToRead && filesToRead.length > 0) {
        await Promise.all(
          filesToRead.map((path) =>
            webContainer.fs.readFile(path, 'utf-8').then((content) => {
              typesDefinitions.push({path, content});
            }),
          ),
        );

        this._typings.set(typesDefinitions);
      }
    } catch (error: any) {
      // ignore "ENOENT" errors as this can happen while reading files and resetting the WebContainer
      if (error?.message.startsWith('ENOENT')) {
        return;
      } else {
        throw error;
      }
    }
  }

  /**
   * Get the list of files to read the types definitions from the predefined libraries
   */
  private async getFilesToRead() {
    if (!this.webContainer) return;

    const filesToRead: string[] = [];
    const directoriesToRead: string[] = [];

    for (const library of this.librariesToGetTypesFrom) {
      // The library's package.json is where the type definitions are defined
      const packageJsonFsPath = `./node_modules/${library}/package.json`;
      const packageJsonContent = await this.webContainer.fs
        .readFile(packageJsonFsPath, 'utf-8')
        .catch((error) => {
          // Note: "ENOENT" errors occurs:
          //    - While resetting the NodeRuntimeSandbox.
          //    - When the library is not a dependency in the project, its package.json won't exist.
          //
          // In both cases we ignore the error to continue the process.
          if (error?.message.startsWith('ENOENT')) {
            return;
          }

          throw error;
        });

      // if the package.json content is empty, skip this library
      if (!packageJsonContent) continue;

      // Ensure the worker VFS also receives the package.json file so NodeNext resolution
      // can read "exports"/"types" information when resolving imports like '@angular/core'.
      filesToRead.push(`/node_modules/${library}/package.json`);

      const packageJson = JSON.parse(packageJsonContent);

      // If the package exposes a top-level types entry, include that directory as a fallback
      const topLevelTypes: string | undefined = packageJson.types ?? packageJson.typings;
      if (!packageJson?.exports && topLevelTypes) {
        const path = `/node_modules/${library}/${this.normalizePath(topLevelTypes)}`;
        const directory = path.substring(0, path.lastIndexOf('/'));
        directoriesToRead.push(directory);
        continue;
      }

      if (!packageJson?.exports) continue;

      // Based on `exports` we can identify paths to the types definition files
      for (const exportKey of Object.keys(packageJson.exports)) {
        const exportEntry = packageJson.exports[exportKey];
        // Handle both object and string entries; for strings we can't infer types, so skip
        const types: string | undefined =
          exportEntry && typeof exportEntry === 'object'
            ? (exportEntry.typings ?? exportEntry.types)
            : undefined;

        if (types) {
          const path = `/node_modules/${library}/${this.normalizePath(types)}`;

          // We want to pull all the d.ts files in the directory
          // as the file pointed `path` might also import other d.ts files
          const directory = path.substring(0, path.lastIndexOf('/'));
          directoriesToRead.push(directory);
        }
      }
    }

    const directoryFiles = (
      await Promise.all(
        directoriesToRead.map((directory) => this.getTypeDefinitionFilesFromDirectory(directory)),
      )
    ).flat();

    for (const file of directoryFiles) {
      filesToRead.push(file);
    }

    return filesToRead;
  }

  private async getTypeDefinitionFilesFromDirectory(directory: string): Promise<string[]> {
    if (!this.webContainer) throw new Error('this.webContainer is not defined');

    // Use a `visited` set to avoid loops/duplicates between recurses.
    return this.getTypeDefinitionFilesRecursively(directory, new Set());
  }

  private async getTypeDefinitionFilesRecursively(
    directory: string,
    visited: Set<string>,
  ): Promise<string[]> {
    if (!this.webContainer) throw new Error('this.webContainer is not defined');

    // Normalize and deduplicate the current directory
    const dir = directory.replace(/\/+$/, '');
    if (visited.has(dir)) return [];
    visited.add(dir);

    const results: string[] = [];

    // Read entries; if directory doesn't exist, ignore (optional exports)
    const entries = await this.webContainer.fs.readdir(dir).catch((error) => {
      if (error?.message?.startsWith('ENOENT')) return [] as string[];
      throw error;
    });

    // Deterministic sort: sort alfab.
    entries.sort();

    for (const entry of entries) {
      // Some FS (or test fakes) already return full paths.
      // Normalize to avoid `dir/dir/file`.
      const fullPath = entry.startsWith(dir + '/') ? entry : `${dir}/${entry}`;

      // If it's a `.d.ts`, add it and move on (don't try `readdir` on file)
      if (this.isTypeDefinitionFile(fullPath)) {
        results.push(fullPath);
        continue;
      }

      // Avoid recursively going down paths that are likely files (e.g. .js/.mjs)
      if (this.isProbablyAFile(fullPath)) {
        continue;
      }

      // Try reading it as a directory.
      const children = await this.webContainer.fs.readdir(fullPath).catch(() => null);

      // Only if `children` is a non-empty array do we consider it a directory and descend.
      if (Array.isArray(children) && children.length > 0) {
        const nested = await this.getTypeDefinitionFilesRecursively(fullPath, visited);
        results.push(...nested);
      }
    }

    // Dedup and deterministic order
    const uniqueSorted = Array.from(new Set(results)).sort();
    return uniqueSorted;
  }

  private isTypeDefinitionFile(path: string): boolean {
    return path.endsWith('.d.ts');
  }

  private isProbablyAFile(path: string): boolean {
    // Consider any path whose last segment contains a period to be a "file" (e.g., index.js, index.mjs)
    // Example regex: '/something/index.js' -> true; '/something/nested' -> false
    return /\/[^\/]+\.[^\/]+$/.test(path);
  }

  private normalizePath(path: string): string {
    if (path.startsWith('./')) {
      return path.substring(2);
    }
    if (path.startsWith('.')) {
      return path.substring(1);
    }
    return path;
  }
}
