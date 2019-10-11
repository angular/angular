/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Diagnostics} from '../../diagnostics';
import {FileUtils} from '../../file_utils';
import {OutputPathFn} from '../output_path';
import {TranslationBundle, TranslationHandler} from '../translator';



/**
 * Translate an asset file by simply copying it to the appropriate translation output paths.
 */
export class AssetTranslationHandler implements TranslationHandler {
  canTranslate(_relativeFilePath: string, _contents: Buffer): boolean { return true; }
  translate(
      diagnostics: Diagnostics, _sourceRoot: string, relativeFilePath: string, contents: Buffer,
      outputPathFn: OutputPathFn, translations: TranslationBundle[], sourceLocale?: string): void {
    for (const translation of translations) {
      try {
        FileUtils.writeFile(outputPathFn(translation.locale, relativeFilePath), contents);
      } catch (e) {
        diagnostics.error(e.message);
      }
    }
    if (sourceLocale !== undefined) {
      try {
        FileUtils.writeFile(outputPathFn(sourceLocale, relativeFilePath), contents);
      } catch (e) {
        diagnostics.error(e.message);
      }
    }
  }
}
