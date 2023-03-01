/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';
import {AbsoluteFsPath, PathString} from './types';

const TS_DTS_JS_EXTENSION = /(?:\.d)?\.ts$|\.js$/;

/**
 * Convert Windows-style separators to POSIX separators.
 */
export function normalizeSeparators(path: string): string {
  // TODO: normalize path only for OS that need it.
  return path.replace(/\\/g, '/');
}

/**
 * Remove a .ts, .d.ts, or .js extension from a file name.
 */
export function stripExtension<T extends PathString>(path: T): T {
  return path.replace(TS_DTS_JS_EXTENSION, '') as T;
}

export function getSourceFileOrError(program: ts.Program, fileName: AbsoluteFsPath): ts.SourceFile {
  const sf = program.getSourceFile(fileName);
  if (sf === undefined) {
    throw new Error(`Program does not contain "${fileName}" - available files are ${
        program.getSourceFiles().map(sf => sf.fileName).join(', ')}`);
  }
  return sf;
}
