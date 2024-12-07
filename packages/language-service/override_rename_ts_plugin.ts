/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

function isAngularCore(path: string): boolean {
  return isExternalAngularCore(path) || isInternalAngularCore(path);
}

function isExternalAngularCore(path: string): boolean {
  return path.endsWith('@angular/core/core.d.ts') || path.endsWith('@angular/core/index.d.ts');
}

function isInternalAngularCore(path: string): boolean {
  return path.endsWith('angular2/rc/packages/core/index.d.ts');
}

/**
 * This factory is used to disable the built-in rename provider,
 * see `packages/language-service/README.md#override-rename-ts-plugin` for more info.
 */
const factory: ts.server.PluginModuleFactory = (): ts.server.PluginModule => {
  return {
    create(info: ts.server.PluginCreateInfo): ts.LanguageService {
      const {project, languageService} = info;
      /** A map that indicates whether Angular could be found in the file's project. */
      const fileToIsInAngularProjectMap = new Map<string, boolean>();

      return {
        ...languageService,
        getRenameInfo: (fileName, position) => {
          let isInAngular: boolean;
          if (fileToIsInAngularProjectMap.has(fileName)) {
            isInAngular = fileToIsInAngularProjectMap.get(fileName)!;
          } else {
            isInAngular = project.getFileNames().some(isAngularCore);
            fileToIsInAngularProjectMap.set(fileName, isInAngular);
          }
          if (isInAngular) {
            return {
              canRename: false,
              localizedErrorMessage: 'Delegating rename to the Angular Language Service.',
            };
          } else {
            return languageService.getRenameInfo(fileName, position);
          }
        },
      };
    },
  };
};

export {factory};
