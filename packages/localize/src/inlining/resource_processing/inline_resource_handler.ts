/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {parseSync, transformFromAstSync} from '@babel/core';
import {extname, join} from 'path';

import {makeEs2015Plugin} from '../code_transformers/es2015_plugin';
import {makeEs5Plugin} from '../code_transformers/es5_plugin';
import {writeFile} from '../file';
import {TranslationBundle} from '../translation_files/translation_bundle';

import {OutputPathFn} from './output_path';
import {ResourceHandler} from './resource_handler';

export class InlineResourceHandler implements ResourceHandler {
  canHandle(relativeFilePath: string, contents: Buffer): boolean {
    return extname(relativeFilePath) === '.js';
  }
  handle(
      sourceRoot: string, relativeFilePath: string, contents: Buffer, outputPathFn: OutputPathFn,
      translations: TranslationBundle[]): void {
    const sourceCode = contents.toString('utf8');
    if (sourceCode.indexOf('$localize') === -1) {
      // The file does not contain any `$localize` identifiers so just write it out
      // without wasting time parsing the code into an AST.
      for (const translation of translations) {
        writeFile(outputPathFn(translation.locale, relativeFilePath), contents);
      }
    } else {
      const ast = parseSync(sourceCode, {sourceRoot, filename: relativeFilePath});
      if (!ast) {
        throw new Error(`Unable to parse source file: ${join(sourceRoot, relativeFilePath)}`);
      }
      for (const translationBundle of translations) {
        const translated = transformFromAstSync(ast, sourceCode, {
          plugins: [
            makeEs2015Plugin(translationBundle.translations),
            makeEs5Plugin(translationBundle.translations)
          ],
          filename: relativeFilePath,

        });
        if (!translated || !translated.code) {
          throw new Error(`Unable to transform source file: ${join(sourceRoot, relativeFilePath)}`);
        }
        writeFile(outputPathFn(translationBundle.locale, relativeFilePath), translated.code);
      }
    }
  }
}
