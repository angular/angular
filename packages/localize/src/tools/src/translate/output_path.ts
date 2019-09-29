/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {join} from 'path';

export interface OutputPathFn { (locale: string, relativePath: string): string; }

/**
 * Create a function that will compute the absolute path to where a translated file should be
 * written.
 *
 * The special `{{LOCALE}}` marker will be replaced with the locale code of the current translation.
 * @param outputFolder An absolute path to the folder containing this set of translations.
 */
export function getOutputPathFn(outputFolder: string): OutputPathFn {
  const [pre, post] = outputFolder.split('{{LOCALE}}');
  return post === undefined ? (_locale, relativePath) => join(pre, relativePath) :
                              (locale, relativePath) => join(pre + locale + post, relativePath);
}
