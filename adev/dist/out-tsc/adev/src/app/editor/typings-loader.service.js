/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
/**
 * This service is responsible for retrieving the types definitions for the
 * predefined dependencies.
 */
let TypingsLoader = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TypingsLoader = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      TypingsLoader = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    librariesToGetTypesFrom = [
      '@angular/common',
      '@angular/core',
      '@angular/forms',
      '@angular/router',
      '@angular/platform-browser',
      '@angular/material',
      '@angular/cdk',
    ];
    webContainer;
    _typings = signal([]);
    typings = this._typings.asReadonly();
    typings$ = toObservable(this._typings);
    /**
     * Retrieve types from the predefined libraries and set the types files and contents in the `typings` signal
     */
    async retrieveTypeDefinitions(webContainer) {
      this.webContainer = webContainer;
      const typesDefinitions = [];
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
      } catch (error) {
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
    async getFilesToRead() {
      if (!this.webContainer) return;
      const filesToRead = [];
      const directoriesToRead = [];
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
          const types = exportEntry.typings ?? exportEntry.types;
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
    async getTypeDefinitionFilesFromDirectory(directory) {
      if (!this.webContainer) throw new Error('this.webContainer is not defined');
      const files = await this.webContainer.fs.readdir(directory);
      return files.filter(this.isTypeDefinitionFile).map((file) => `${directory}/${file}`);
    }
    isTypeDefinitionFile(path) {
      return path.endsWith('.d.ts');
    }
    normalizePath(path) {
      if (path.startsWith('./')) {
        return path.substring(2);
      }
      if (path.startsWith('.')) {
        return path.substring(1);
      }
      return path;
    }
  };
  return (TypingsLoader = _classThis);
})();
export {TypingsLoader};
//# sourceMappingURL=typings-loader.service.js.map
