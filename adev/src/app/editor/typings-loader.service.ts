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
import {setupTypeAcquisition} from '@typescript/ata';
import ts from 'typescript';

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

  private _typings = signal<Typing[]>([]);
  readonly typings = this._typings.asReadonly();
  readonly typings$ = toObservable(this._typings);

  /**
   * Retrieve types from the predefined libraries and set the types files and contents in the `typings` signal
   */
  async retrieveTypeDefinitions(webContainer: WebContainer): Promise<void> {
    this.webContainer = webContainer;

    const typesDefinitions: Typing[] = [];

    const ata = setupTypeAcquisition({
      projectName: 'My ATA Project',
      typescript: ts,
      logger: console,
      delegate: {
        receivedFile: (content: string, path: string) => {
          if (path.endsWith('.d.ts')) {
            typesDefinitions.push({path, content});
          }
        },
        started: () => {},
        progress: () => {},
        finished: () => {},
      },
    });

    try {
      const filesToRead = await this.getFilesToRead();

      if (filesToRead && filesToRead.length > 0) {
        await Promise.all(
          filesToRead.map((path) =>
            webContainer.fs
              .readFile(path, 'utf-8')
              .then(async (content) => {
                await ata(content);
                return content;
              })
              .then((content) => {
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
      const packageJsonContent = await this.webContainer.fs
        .readFile(`./node_modules/${library}/package.json`, 'utf-8')
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

      const packageJson = JSON.parse(packageJsonContent);

      // If the package.json doesn't have `exports`, skip this library
      if (!packageJson?.exports) continue;

      // Based on `exports` we can identify paths to the types definition files
      for (const exportKey of Object.keys(packageJson.exports)) {
        const exportEntry = packageJson.exports[exportKey];
        const types: string | undefined = exportEntry.typings ?? exportEntry.types;

        if (types) {
          const path = `/node_modules/${library}/${this.normalizePath(types)}`;

          // If the path contains `*` we need to read the directory files
          if (path.includes('*')) {
            const directory = path.substring(0, path.lastIndexOf('/'));

            directoriesToRead.push(directory);
          } else {
            filesToRead.push(path);
          }
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

    const files = await this.webContainer.fs.readdir(directory);

    return files.filter(this.isTypeDefinitionFile).map((file) => `${directory}/${file}`);
  }

  private isTypeDefinitionFile(path: string): boolean {
    return path.endsWith('.d.ts');
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
