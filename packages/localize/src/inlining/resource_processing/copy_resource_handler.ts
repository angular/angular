/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {writeFile} from '../file';
import {TranslationBundle} from '../translation_files/translation_bundle';
import {OutputPathFn} from './output_path';
import {ResourceHandler} from './resource_handler';

export class CopyResourceHandler implements ResourceHandler {
  canHandle(_relativeFilePath: string, _contents: Buffer): boolean { return true; }
  handle(
      _sourceRoot: string, relativeFilePath: string, contents: Buffer, outputPathFn: OutputPathFn,
      translations: TranslationBundle[]): void {
    for (const translation of translations) {
      writeFile(outputPathFn(translation.locale, relativeFilePath), contents);
    }
  }
}
