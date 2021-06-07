/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MessageBundle, Serializer, Xliff, Xliff2, Xmb} from '@angular/compiler';
import * as path from 'path';
import * as ts from 'typescript';

import {CompilerOptions} from './api';

export function i18nGetExtension(formatName: string): string {
  const format = formatName.toLowerCase();

  switch (format) {
    case 'xmb':
      return 'xmb';
    case 'xlf':
    case 'xlif':
    case 'xliff':
    case 'xlf2':
    case 'xliff2':
      return 'xlf';
  }

  throw new Error(`Unsupported format "${formatName}"`);
}

export function i18nExtract(
    formatName: string|null, outFile: string|null, host: ts.CompilerHost, options: CompilerOptions,
    bundle: MessageBundle,
    pathResolve: (...segments: string[]) => string = path.resolve): string[] {
  formatName = formatName || 'xlf';
  // Checks the format and returns the extension
  const ext = i18nGetExtension(formatName);
  const content = i18nSerialize(bundle, formatName, options);
  const dstFile = outFile || `messages.${ext}`;
  const dstPath = pathResolve(options.outDir || options.basePath!, dstFile);
  host.writeFile(dstPath, content, false, undefined, []);
  return [dstPath];
}

export function i18nSerialize(
    bundle: MessageBundle, formatName: string, options: CompilerOptions): string {
  const format = formatName.toLowerCase();
  let serializer: Serializer;

  switch (format) {
    case 'xmb':
      serializer = new Xmb();
      break;
    case 'xliff2':
    case 'xlf2':
      serializer = new Xliff2();
      break;
    case 'xlf':
    case 'xliff':
    default:
      serializer = new Xliff();
  }

  return bundle.write(serializer, getPathNormalizer(options.basePath));
}

function getPathNormalizer(basePath?: string) {
  // normalize source paths by removing the base path and always using "/" as a separator
  return (sourcePath: string) => {
    sourcePath = basePath ? path.relative(basePath, sourcePath) : sourcePath;
    return sourcePath.split(path.sep).join('/');
  };
}
