/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {transformSync} from '@babel/core';

import {ParsedMessage} from '../utils';
import {makeEs2015ExtractPlugin} from './source_files/es2015_extract_plugin';
import {makeEs5ExtractPlugin} from './source_files/es5_extract_plugin';

/**
 * A class that extracts parsed messages from file contents, by parsing the contents as JavaScript
 * and looking for occurrences of `$localize` in the source code.
 */
export class Extractor {
  messages: ParsedMessage[] = [];
  extractMessages(sourceCode: string, filename: string): void {
    if (sourceCode.includes('$localize')) {
      // Only bother to parse the file if it contains a reference to `$localize`.
      transformSync(sourceCode, {
        plugins: [
          makeEs2015ExtractPlugin(this.messages),
          makeEs5ExtractPlugin(this.messages),
        ],
        code: false,
        ast: false
      });
    }
  }
}
