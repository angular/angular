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

import {AotCompilerHost, AotSummaryResolver, StaticReflector, StaticSymbolCache, StaticSymbolResolver} from '@angular/compiler';
import {I18nVersion} from '@angular/core';
import {AngularCompilerOptions, NgcCliOptions} from '@angular/tsc-wrapped';
import * as ts from 'typescript';

import {CodeGenerator} from './codegen';
import {CompilerHost, CompilerHostContext, ModuleResolutionHostAdapter} from './compiler_host';
import {Extractor} from './extractor';
import {normalizeFiles, normalizeI18nFormat, normalizeResolve} from './i18n_options';
import {V0ToV1Migration} from './migration/v0_to_v1'
import {listLazyRoutesOfModule} from './ngtools_impl';
import {PathMappedCompilerHost} from './path_mapped_compiler_host';

export interface NgTools_InternalApi_NG2_CodeGen_Options {
  basePath: string;
  compilerOptions: ts.CompilerOptions;
  program: ts.Program;
  host: ts.CompilerHost;

  angularCompilerOptions: AngularCompilerOptions;

  // i18n options.
  i18nFormat?: string;
  i18nFile?: string;
  locale?: string;
  i18nVersion?: string;
  missingTranslation?: string;

  readResource: (fileName: string) => Promise<string>;

  // Every new property under this line should be optional.
}

export interface NgTools_InternalApi_NG2_ListLazyRoutes_Options {
  program: ts.Program;
  host: ts.CompilerHost;
  angularCompilerOptions: AngularCompilerOptions;
  entryModule: string;

  // Every new property under this line should be optional.
}

export interface NgTools_InternalApi_NG_2_LazyRouteMap { [route: string]: string; }

export interface NgTools_InternalApi_NG2_ExtractI18n_Options {
  basePath: string;
  compilerOptions: ts.CompilerOptions;
  program: ts.Program;
  host: ts.CompilerHost;
  angularCompilerOptions: AngularCompilerOptions;
  readResource: (fileName: string) => Promise<string>;
  // Every new property under this line should be optional.
  i18nFormat?: string;
  locale?: string;
  outFile?: string;
}

export interface NgTools_InternalApi_NG2_MigrateI18n_Options {
  basePath: string;
  compilerOptions: ts.CompilerOptions;
  program: ts.Program;
  host: ts.CompilerHost;
  angularCompilerOptions: AngularCompilerOptions;
  readResource: (fileName: string) => Promise<string>;
  files: string;
  // Every new property under this line should be optional.
  i18nFormat?: string;
  resolve?: string;
}

/**
 * A ModuleResolutionHostAdapter that overrides the readResource() method with the one
 * passed in the interface.
 */
class CustomLoaderModuleResolutionHostAdapter extends ModuleResolutionHostAdapter {
  constructor(
      private _readResource: (path: string) => Promise<string>, host: ts.ModuleResolutionHost) {
    super(host);
  }

  readResource(path: string) { return this._readResource(path); }
}

/**
 * @internal
 * @private
 */
export class NgTools_InternalApi_NG_2 {
  /**
   * @internal
   * @private
   */
  static codeGen(options: NgTools_InternalApi_NG2_CodeGen_Options): Promise<any> {
    const hostContext: CompilerHostContext =
        new CustomLoaderModuleResolutionHostAdapter(options.readResource, options.host);

    const cliOptions: NgcCliOptions = {
      i18nFormat: options.i18nFormat || null,
      i18nFile: options.i18nFile || null,
      locale: options.locale || null,
      i18nVersion: options.i18nVersion || null,
      missingTranslation: options.missingTranslation || null,
      basePath: options.basePath
    };
    const ngOptions = options.angularCompilerOptions;
    if (ngOptions.enableSummariesForJit === undefined) {
      // default to false
      ngOptions.enableSummariesForJit = false;
    }

    // Create the Code Generator.
    const codeGenerator =
        CodeGenerator.create(ngOptions, cliOptions, options.program, options.host, hostContext);

    return codeGenerator.codegen();
  }

  /**
   * @internal
   * @private
   */
  static listLazyRoutes(options: NgTools_InternalApi_NG2_ListLazyRoutes_Options):
      NgTools_InternalApi_NG_2_LazyRouteMap {
    const angularCompilerOptions = options.angularCompilerOptions;
    const program = options.program;

    const moduleResolutionHost = new ModuleResolutionHostAdapter(options.host);
    const usePathMapping =
        !!angularCompilerOptions.rootDirs && angularCompilerOptions.rootDirs.length > 0;
    const ngCompilerHost: AotCompilerHost = usePathMapping ?
        new PathMappedCompilerHost(program, angularCompilerOptions, moduleResolutionHost) :
        new CompilerHost(program, angularCompilerOptions, moduleResolutionHost);

    const symbolCache = new StaticSymbolCache();
    const summaryResolver = new AotSummaryResolver(ngCompilerHost, symbolCache);
    const symbolResolver = new StaticSymbolResolver(ngCompilerHost, symbolCache, summaryResolver);
    const staticReflector = new StaticReflector(summaryResolver, symbolResolver);
    const routeMap = listLazyRoutesOfModule(options.entryModule, ngCompilerHost, staticReflector);

    return Object.keys(routeMap).reduce(
        (acc: NgTools_InternalApi_NG_2_LazyRouteMap, route: string) => {
          acc[route] = routeMap[route].absoluteFilePath;
          return acc;
        },
        {});
  }

  /**
   * @internal
   * @private
   */
  static extractI18n(options: NgTools_InternalApi_NG2_ExtractI18n_Options): Promise<any> {
    const hostContext: CompilerHostContext =
        new CustomLoaderModuleResolutionHostAdapter(options.readResource, options.host);

    // Create the i18n extractor.
    const locale = options.locale || null;
    const extractor = Extractor.create(
        I18nVersion.V0, options.angularCompilerOptions, options.program, options.host, locale,
        hostContext);

    return extractor.extract(options.i18nFormat !, options.outFile || null);
  }

  /**
   * @internal
   * @private
   */
  static migrateI18n(options: NgTools_InternalApi_NG2_MigrateI18n_Options): Promise<any> {
    const hostContext: CompilerHostContext =
        new CustomLoaderModuleResolutionHostAdapter(options.readResource, options.host);
    const files = normalizeFiles(options.files);
    const format = normalizeI18nFormat(options.i18nFormat);
    const autoResolve = normalizeResolve(options.resolve);

    // Create the i18n migrator
    const migrator = V0ToV1Migration.create(
        options.angularCompilerOptions, options.program, options.host, files, format, autoResolve,
        hostContext);

    return migrator.execute();
  }
}
