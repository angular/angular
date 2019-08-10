/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {TranslationBundle} from '../translation_files/translation_bundle';
import {OutputPathFn} from './output_path';

/**
 * Implement this interface to provide a class that can handle translation for the given resource in
 * an appropriate manner.
 *
 * For example, source code files will need to be transformed if they contain `$localize` tagged
 * template strings, while most static assets will just need to be copied.
 */
export interface ResourceHandler {
  /**
   * Returns true if the given file can be handled by this handler.
   *
   * @param relativeFilePath A relative path from the sourceRoot to the resource file to handle.
   * @param contents The contents of the file to handle.
   */
  canHandle(relativeFilePath: string, contents: Buffer): boolean;

  /**
   * Handles given resource file.
   *
   * @param sourceRoot An absolute path to the root of the resource files being handled.
   * @param relativeFilePath A relative path from the sourceRoot to the resource file to handle.
   * @param contents The contents of the file to handle.
   * @param outputPathFn A function that returns an absolute path where the handled file should be
   * written.
   * @param translations A collection of translations to apply to this resource file.
   */
  handle(
      sourceRoot: string, relativeFilePath: string, contents: Buffer, outputPathFn: OutputPathFn,
      translations: TranslationBundle[]): void;
}
