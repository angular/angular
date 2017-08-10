/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {CompilerHost, CompilerOptions, Program} from './api';
import {createModuleFilenameResolver} from './module_filename_resolver';
export {createProgram} from './program';
export {createModuleFilenameResolver};

export function createHost({tsHost, options}: {tsHost: ts.CompilerHost, options: CompilerOptions}):
    CompilerHost {
  const resolver = createModuleFilenameResolver(tsHost, options);

  const host = Object.create(tsHost);

  host.moduleNameToFileName = resolver.moduleNameToFileName.bind(resolver);
  host.fileNameToModuleName = resolver.fileNameToModuleName.bind(resolver);
  host.getNgCanonicalFileName = resolver.getNgCanonicalFileName.bind(resolver);
  host.assumeFileExists = resolver.assumeFileExists.bind(resolver);

  // Make sure we do not `host.realpath()` from TS as we do not want to resolve symlinks.
  // https://github.com/Microsoft/TypeScript/issues/9552
  host.realpath = (fileName: string) => fileName;

  return host;
}
