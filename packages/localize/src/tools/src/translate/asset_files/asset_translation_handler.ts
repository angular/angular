/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {writeFile} from '../../utils';
import {OutputPathFn} from '../output_path';
import {TranslationBundle, TranslationHandler} from '../translator';

/**
 * Translate an asset file by simply copying it to the appropriate translation output paths.
 */
export class AssetTranslationHandler implements TranslationHandler {
  canTranslate(_relativeFilePath: string, _contents: Buffer): boolean { return true; }
  translate(
      _sourceRoot: string, relativeFilePath: string, contents: Buffer, outputPathFn: OutputPathFn,
      translations: TranslationBundle[]): void {
    for (const translation of translations) {
      writeFile(outputPathFn(translation.locale, relativeFilePath), contents);
    }
  }
}
