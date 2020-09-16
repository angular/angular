/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {syntaxError} from '@angular/compiler';
import * as path from 'path';
import * as ts from 'typescript';

import {CompilerOptions, DEFAULT_ERROR_CODE, Diagnostic, SOURCE} from './api';

export const GENERATED_FILES = /(.*?)\.(ngfactory|shim\.ngstyle|ngstyle|ngsummary)\.(js|d\.ts|ts)$/;
export const DTS = /\.d\.ts$/;
export const TS = /^(?!.*\.d\.ts$).*\.ts$/;

export const enum StructureIsReused {
  Not = 0,
  SafeModules = 1,
  Completely = 2
}

// Note: This is an internal property in TypeScript. Use it only for assertions and tests.
export function tsStructureIsReused(program: ts.Program): StructureIsReused {
  return (program as any).structureIsReused;
}

export function error(msg: string): never {
  throw new Error(`Internal error: ${msg}`);
}

export function userError(msg: string): never {
  throw syntaxError(msg);
}

export function createMessageDiagnostic(messageText: string): ts.Diagnostic&Diagnostic {
  return {
    file: undefined,
    start: undefined,
    length: undefined,
    category: ts.DiagnosticCategory.Message,
    messageText,
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

/**
 * Converts a ng.Diagnostic into a ts.Diagnostic.
 * This looses some information, and also uses an incomplete object as `file`.
 *
 * I.e. only use this where the API allows only a ts.Diagnostic.
 */
export function ngToTsDiagnostic(ng: Diagnostic): ts.Diagnostic {
  let file: ts.SourceFile|undefined;
  let start: number|undefined;
  let length: number|undefined;
  if (ng.span) {
    // Note: We can't use a real ts.SourceFile,
    // but we can at least mirror the properties `fileName` and `text`, which
    // are mostly used for error reporting.
    file = {fileName: ng.span.start.file.url, text: ng.span.start.file.content} as ts.SourceFile;
    start = ng.span.start.offset;
    length = ng.span.end.offset - start;
  }
  return {
    file,
    messageText: ng.messageText,
    category: ng.category,
    code: ng.code,
    start,
    length,
  };
}

/**
 * Strip multiline comment start and end markers from the `commentText` string.
 *
 * This will also strip the JSDOC comment start marker (`/**`).
 */
export function stripComment(commentText: string): string {
  return commentText.replace(/^\/\*\*?/, '').replace(/\*\/$/, '').trim();
}
