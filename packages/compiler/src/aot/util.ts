/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const STRIP_SRC_FILE_SUFFIXES = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const GENERATED_FILE = /\.ngfactory\.|\.ngsummary\./;
const JIT_SUMMARY_FILE = /\.ngsummary\./;
const JIT_SUMMARY_NAME = /NgSummary$/;

export function ngfactoryFilePath(filePath: string, forceSourceFile = false): string {
  const urlWithSuffix = splitTypescriptSuffix(filePath, forceSourceFile);
  return `${urlWithSuffix[0]}.ngfactory${normalizeGenFileSuffix(urlWithSuffix[1])}`;
}

export function stripGeneratedFileSuffix(filePath: string): string {
  return filePath.replace(GENERATED_FILE, '.');
}

export function isGeneratedFile(filePath: string): boolean {
  return GENERATED_FILE.test(filePath);
}

export function splitTypescriptSuffix(path: string, forceSourceFile = false): string[] {
  if (path.endsWith('.d.ts')) {
    return [path.slice(0, -5), forceSourceFile ? '.ts' : '.d.ts'];
  }

  const lastDot = path.lastIndexOf('.');

  if (lastDot !== -1) {
    return [path.substring(0, lastDot), path.substring(lastDot)];
  }

  return [path, ''];
}

export function normalizeGenFileSuffix(srcFileSuffix: string): string {
  return srcFileSuffix === '.tsx' ? '.ts' : srcFileSuffix;
}

export function summaryFileName(fileName: string): string {
  const fileNameWithoutSuffix = fileName.replace(STRIP_SRC_FILE_SUFFIXES, '');
  return `${fileNameWithoutSuffix}.ngsummary.json`;
}

export function summaryForJitFileName(fileName: string, forceSourceFile = false): string {
  const urlWithSuffix = splitTypescriptSuffix(stripGeneratedFileSuffix(fileName), forceSourceFile);
  return `${urlWithSuffix[0]}.ngsummary${urlWithSuffix[1]}`;
}

export function stripSummaryForJitFileSuffix(filePath: string): string {
  return filePath.replace(JIT_SUMMARY_FILE, '.');
}

export function summaryForJitName(symbolName: string): string {
  return `${symbolName}NgSummary`;
}

export function stripSummaryForJitNameSuffix(symbolName: string): string {
  return symbolName.replace(JIT_SUMMARY_NAME, '');
}

const LOWERED_SYMBOL = /\u0275\d+/;

export function isLoweredSymbol(name: string) {
  return LOWERED_SYMBOL.test(name);
}

export function createLoweredSymbol(id: number): string {
  return `\u0275${id}`;
}
