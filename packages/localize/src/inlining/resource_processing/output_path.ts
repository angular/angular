/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {join} from 'path';

export interface OutputPathFn { (locale: string, relativePath: string): string; }

export function getOutputPathFn(outputPath: string): OutputPathFn {
  const [pre, post] = outputPath.split('${locale}');
  return post === undefined ? (_locale, relativePath) => join(pre, relativePath) :
                              (locale, relativePath) => join(pre, locale, post, relativePath);
}
