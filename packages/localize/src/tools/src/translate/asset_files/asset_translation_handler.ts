/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, AbsoluteFsPath, FileSystem, PathSegment} from '@angular/compiler-cli/src/ngtsc/file_system';

import {Diagnostics} from '../../diagnostics';
import {OutputPathFn} from '../output_path';
import {TranslationBundle, TranslationHandler} from '../translator';

/**
 * Translate an asset file by simply copying it to the appropriate translation output paths.
 */
export class AssetTranslationHandler implements TranslationHandler {
  constructor(private fs: FileSystem) {}

  canTranslate(_relativeFilePath: PathSegment|AbsoluteFsPath, _contents: Uint8Array): boolean {
    return true;
  }

  translate(
      diagnostics: Diagnostics, _sourceRoot: AbsoluteFsPath,
      relativeFilePath: PathSegment|AbsoluteFsPath, contents: Uint8Array,
      outputPathFn: OutputPathFn, translations: TranslationBundle[], sourceLocale?: string): void {
    for (const translation of translations) {
      this.writeAssetFile(
          diagnostics, outputPathFn, translation.locale, relativeFilePath, contents);
    }
    if (sourceLocale !== undefined) {
      this.writeAssetFile(diagnostics, outputPathFn, sourceLocale, relativeFilePath, contents);
    }
  }

  private writeAssetFile(
      diagnostics: Diagnostics, outputPathFn: OutputPathFn, locale: string,
      relativeFilePath: PathSegment|AbsoluteFsPath, contents: Uint8Array): void {
    try {
      const outputPath = absoluteFrom(outputPathFn(locale, relativeFilePath));
      this.fs.ensureDir(this.fs.dirname(outputPath));
      this.fs.writeFile(outputPath, contents);
    } catch (e) {
      diagnostics.error(e.message);
    }
  }
}
