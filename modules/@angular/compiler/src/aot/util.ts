/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const STRIP_SRC_FILE_SUFFIXES = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const NG_FACTORY = /\.ngfactory\./;

export function ngfactoryFilePath(filePath: string): string {
  const urlWithSuffix = splitTypescriptSuffix(filePath);
  return `${urlWithSuffix[0]}.ngfactory${urlWithSuffix[1]}`;
}

export function stripNgFactory(filePath: string): string {
  return filePath.replace(NG_FACTORY, '.');
}

export function isNgFactoryFile(filePath: string): boolean {
  return NG_FACTORY.test(filePath);
}

export function splitTypescriptSuffix(path: string): string[] {
  if (path.endsWith('.d.ts')) {
    return [path.slice(0, -5), '.ts'];
  }

  const lastDot = path.lastIndexOf('.');

  if (lastDot !== -1) {
    return [path.substring(0, lastDot), path.substring(lastDot)];
  }

  return [path, ''];
}

export function summaryFileName(fileName: string): string {
  const fileNameWithoutSuffix = fileName.replace(STRIP_SRC_FILE_SUFFIXES, '');
  return `${fileNameWithoutSuffix}.ngsummary.json`;
}
