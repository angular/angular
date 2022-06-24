/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, PathSegment, ReadonlyFileSystem,} from '@angular/compiler-cli/private/localize';
import {MessageId, ɵParsedTranslation} from '@angular/localize';

import {Diagnostics} from '../diagnostics';

import {OutputPathFn} from './output_path';

/**
 * An object that holds information to be used to translate files.
 */
export interface TranslationBundle {
  locale: string;
  translations: Record<MessageId, ɵParsedTranslation>;
  diagnostics?: Diagnostics;
}

/**
 * Implement this interface to provide a class that can handle translation for the given resource in
 * an appropriate manner.
 *
 * For example, source code files will need to be transformed if they contain `$localize` tagged
 * template strings, while most static assets will just need to be copied.
 */
export interface TranslationHandler {
  /**
   * Returns true if the given file can be translated by this handler.
   *
   * @param relativeFilePath A relative path from the sourceRoot to the resource file to handle.
   * @param contents The contents of the file to handle.
   */
  canTranslate(relativeFilePath: PathSegment|AbsoluteFsPath, contents: Uint8Array): boolean;

  /**
   * Translate the file at `relativeFilePath` containing `contents`, using the given `translations`,
   * and write the translated content to the path computed by calling `outputPathFn()`.
   *
   * @param diagnostics An object for collecting translation diagnostic messages.
   * @param sourceRoot An absolute path to the root of the files being translated.
   * @param relativeFilePath A relative path from the sourceRoot to the file to translate.
   * @param contents The contents of the file to translate.
   * @param outputPathFn A function that returns an absolute path where the output file should be
   * written.
   * @param translations A collection of translations to apply to this file.
   * @param sourceLocale The locale of the original application source. If provided then an
   * additional copy of the application is created under this locale just with the `$localize` calls
   * stripped out.
   */
  translate(
      diagnostics: Diagnostics, sourceRoot: AbsoluteFsPath,
      relativeFilePath: PathSegment|AbsoluteFsPath, contents: Uint8Array,
      outputPathFn: OutputPathFn, translations: TranslationBundle[], sourceLocale?: string): void;
}

/**
 * Translate each file (e.g. source file or static asset) using the given `TranslationHandler`s.
 * The file will be translated by the first handler that returns true for `canTranslate()`.
 */
export class Translator {
  constructor(
      private fs: ReadonlyFileSystem, private resourceHandlers: TranslationHandler[],
      private diagnostics: Diagnostics) {}

  translateFiles(
      inputPaths: PathSegment[], rootPath: AbsoluteFsPath, outputPathFn: OutputPathFn,
      translations: TranslationBundle[], sourceLocale?: string): void {
    inputPaths.forEach((inputPath) => {
      const absInputPath = this.fs.resolve(rootPath, inputPath);
      const contents = this.fs.readFileBuffer(absInputPath);
      const relativePath = this.fs.relative(rootPath, absInputPath);
      for (const resourceHandler of this.resourceHandlers) {
        if (resourceHandler.canTranslate(relativePath, contents)) {
          return resourceHandler.translate(
              this.diagnostics, rootPath, relativePath, contents, outputPathFn, translations,
              sourceLocale);
        }
      }
      this.diagnostics.error(`Unable to handle resource file: ${inputPath}`);
    });
  }
}
