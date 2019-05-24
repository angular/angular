/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This is a private API for the ngtools toolkit.
 *
 * This API should be stable for NG 2. It can be removed in NG 4..., but should be replaced by
 * something else.
 */

/**
 *********************************************************************
 * Changes to this file need to be approved by the Angular CLI team. *
 *********************************************************************
 */

import * as ts from 'typescript';

import {CompilerOptions} from './transformers/api';
import {getOriginalReferences} from './transformers/compiler_host';
import {createProgram} from './transformers/entry_points';

export interface NgTools_InternalApi_NG2_CodeGen_Options {
  basePath: string;
  compilerOptions: ts.CompilerOptions;
  program: ts.Program;
  host: ts.CompilerHost;

  angularCompilerOptions: CompilerOptions;

  // i18n options.
  i18nFormat?: string;
  i18nFile?: string;
  locale?: string;
  missingTranslation?: string;

  readResource: (fileName: string) => Promise<string>;

  // Every new property under this line should be optional.
}

export interface NgTools_InternalApi_NG2_ListLazyRoutes_Options {
  program: ts.Program;
  host: ts.CompilerHost;
  angularCompilerOptions: CompilerOptions;
  entryModule: string;

  // Every new property under this line should be optional.
}

export interface NgTools_InternalApi_NG_2_LazyRouteMap { [route: string]: string; }

export interface NgTools_InternalApi_NG2_ExtractI18n_Options {
  basePath: string;
  compilerOptions: ts.CompilerOptions;
  program: ts.Program;
  host: ts.CompilerHost;
  angularCompilerOptions: CompilerOptions;
  i18nFormat?: string;
  readResource: (fileName: string) => Promise<string>;
  // Every new property under this line should be optional.
  locale?: string;
  outFile?: string;
}

/**
 * @internal
 * @deprecatd Use ngtools_api2 instead!
 */
export class NgTools_InternalApi_NG_2 {
  /**
   * @internal
   */
  static codeGen(options: NgTools_InternalApi_NG2_CodeGen_Options): Promise<any> {
    throw throwNotSupportedError();
  }

  /**
   * @internal
   */
  static listLazyRoutes(options: NgTools_InternalApi_NG2_ListLazyRoutes_Options):
      NgTools_InternalApi_NG_2_LazyRouteMap {
    // TODO(tbosch): Also throwNotSupportedError once Angular CLI 1.5.1 ships,
    // as we only needed this to support Angular CLI 1.5.0 rc.*
    const ngProgram = createProgram({
      rootNames: options.program.getRootFileNames(),
      options: {...options.angularCompilerOptions, collectAllErrors: true},
      host: options.host
    });
    const lazyRoutes = ngProgram.listLazyRoutes(options.entryModule);

    // reset the referencedFiles that the ng.Program added to the SourceFiles
    // as the host might be caching the source files!
    for (const sourceFile of options.program.getSourceFiles()) {
      const originalReferences = getOriginalReferences(sourceFile);
      if (originalReferences) {
        sourceFile.referencedFiles = originalReferences;
      }
    }

    const result: NgTools_InternalApi_NG_2_LazyRouteMap = {};
    lazyRoutes.forEach(lazyRoute => {
      const route = lazyRoute.route;
      const referencedFilePath = lazyRoute.referencedModule.filePath;
      if (result[route] && result[route] != referencedFilePath) {
        throw new Error(
            `Duplicated path in loadChildren detected: "${route}" is used in 2 loadChildren, ` +
            `but they point to different modules "(${result[route]} and ` +
            `"${referencedFilePath}"). Webpack cannot distinguish on context and would fail to ` +
            'load the proper one.');
      }
      result[route] = referencedFilePath;
    });

    return result;
  }

  /**
   * @internal
   */
  static extractI18n(options: NgTools_InternalApi_NG2_ExtractI18n_Options): Promise<any> {
    throw throwNotSupportedError();
  }
}

function throwNotSupportedError() {
  throw new Error(`Please update @angular/cli. Angular 5+ requires at least Angular CLI 1.5+`);
}
