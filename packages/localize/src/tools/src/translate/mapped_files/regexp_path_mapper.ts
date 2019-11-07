/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PathMapper} from './mapped_file_translation_handler';

/**
 * A `PathMapper` that uses regular expression replacement to map the path.
 */
export class RegExpPathMapper implements PathMapper {
  constructor(private pattern: RegExp, private replacer: string) {}
  mapPath(sourcePath: string): string {
    return sourcePath.replace(this.pattern, this.replacer);
  }
}
