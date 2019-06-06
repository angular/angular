/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {FileSystem} from '../../../src/ngtsc/file_system';
import {NgtscCompilerHost} from '../../../src/ngtsc/file_system/src/compiler_host';
import {isRelativePath} from '../utils';

/**
 * Represents a compiler host that resolves a module import as a JavaScript source file if
 * available, instead of the .d.ts typings file that would have been resolved by TypeScript. This
 * is necessary for packages that have their typings in the same directory as the sources, which
 * would otherwise let TypeScript prefer the .d.ts file instead of the JavaScript source file.
 */
export class NgccSourcesCompilerHost extends NgtscCompilerHost {
  private cache = ts.createModuleResolutionCache(
      this.getCurrentDirectory(), file => this.getCanonicalFileName(file));

  constructor(fs: FileSystem, options: ts.CompilerOptions, protected entryPointPath: string) {
    super(fs, options);
  }

  resolveModuleNames(
      moduleNames: string[], containingFile: string, reusedNames?: string[],
      redirectedReference?: ts.ResolvedProjectReference): Array<ts.ResolvedModule|undefined> {
    return moduleNames.map(moduleName => {
      const {resolvedModule} = ts.resolveModuleName(
          moduleName, containingFile, this.options, this, this.cache, redirectedReference);

      // If the module request originated from a relative import in a JavaScript source file,
      // TypeScript may have resolved the module to its .d.ts declaration file if the .js source
      // file was in the same directory. This is undesirable, as we need to have the actual
      // JavaScript being present in the program. This logic recognizes this scenario and rewrites
      // the resolved .d.ts declaration file to its .js counterpart, if it exists.
      if (resolvedModule !== undefined && resolvedModule.extension === ts.Extension.Dts &&
          containingFile.endsWith('.js') && isRelativePath(moduleName)) {
        const jsFile = resolvedModule.resolvedFileName.replace(/\.d\.ts$/, '.js');
        if (this.fileExists(jsFile)) {
          return {...resolvedModule, resolvedFileName: jsFile, extension: ts.Extension.Js};
        }
      }
      return resolvedModule;
    });
  }
}
