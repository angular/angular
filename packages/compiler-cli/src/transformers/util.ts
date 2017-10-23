/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

import {CompilerOptions, DEFAULT_ERROR_CODE, Diagnostic, SOURCE} from './api';

export const GENERATED_FILES = /(.*?)\.(ngfactory|shim\.ngstyle|ngstyle|ngsummary)\.(js|d\.ts|ts)$/;
export const DTS = /\.d\.ts$/;

export const enum StructureIsReused {Not = 0, SafeModules = 1, Completely = 2}

// Note: This is an internal property in TypeScript. Use it only for assertions and tests.
export function tsStructureIsReused(program: ts.Program): StructureIsReused {
  return (program as any).structureIsReused;
}

export function createMessageDiagnostic(messageText: string): ts.Diagnostic&Diagnostic {
  return {
    file: undefined,
    start: undefined,
    length: undefined,
    category: ts.DiagnosticCategory.Message, messageText,
    code: DEFAULT_ERROR_CODE,
    source: SOURCE,
  };
}

export function isInRootDir(fileName: string, options: CompilerOptions) {
  return !options.rootDir || pathStartsWithPrefix(options.rootDir, fileName);
}

export function relativeToRootDirs(filePath: string, rootDirs: string[]): string {
  if (!filePath) return filePath;
  for (const dir of rootDirs || []) {
    const rel = pathStartsWithPrefix(dir, filePath);
    if (rel) {
      return rel;
    }
  }
  return filePath;
}

function pathStartsWithPrefix(prefix: string, fullPath: string): string|null {
  const rel = path.relative(prefix, fullPath);
  return rel.startsWith('..') ? null : rel;
}
