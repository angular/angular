/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵMessageId, ɵParsedTranslation} from '@angular/localize/private';
import {parseSync, transformFromAstSync} from '@babel/core';
import {File, Program} from '@babel/types';
import {extname, join} from 'path';

import {Diagnostics} from '../../diagnostics';
import {FileUtils} from '../../file_utils';
import {OutputPathFn} from '../output_path';
import {TranslationBundle, TranslationHandler} from '../translator';

import {makeEs2015TranslatePlugin} from './es2015_translate_plugin';
import {makeEs5TranslatePlugin} from './es5_translate_plugin';
import {TranslatePluginOptions} from './source_file_utils';


/**
 * Translate a file by inlining all messages tagged by `$localize` with the appropriate translated
 * message.
 */
export class SourceFileTranslationHandler implements TranslationHandler {
  private sourceLocaleOptions:
      TranslatePluginOptions = {...this.translationOptions, missingTranslation: 'ignore'};
  constructor(private translationOptions: TranslatePluginOptions = {}) {}

  canTranslate(relativeFilePath: string, _contents: Buffer): boolean {
    return extname(relativeFilePath) === '.js';
  }

  translate(
      diagnostics: Diagnostics, sourceRoot: string, relativeFilePath: string, contents: Buffer,
      outputPathFn: OutputPathFn, translations: TranslationBundle[], sourceLocale?: string): void {
    const sourceCode = contents.toString('utf8');
    // A short-circuit check to avoid parsing the file into an AST if it does not contain any
    // `$localize` identifiers.
    if (!sourceCode.includes('$localize')) {
      for (const translation of translations) {
        FileUtils.writeFile(outputPathFn(translation.locale, relativeFilePath), contents);
      }
      if (sourceLocale !== undefined) {
        FileUtils.writeFile(outputPathFn(sourceLocale, relativeFilePath), contents);
      }
    } else {
      const ast = parseSync(sourceCode, {sourceRoot, filename: relativeFilePath});
      if (!ast) {
        diagnostics.error(`Unable to parse source file: ${join(sourceRoot, relativeFilePath)}`);
        return;
      }
      // Output a translated copy of the file for each locale.
      for (const translationBundle of translations) {
        this.translateFile(
            diagnostics, ast, translationBundle, sourceRoot, relativeFilePath, outputPathFn,
            this.translationOptions);
      }
      if (sourceLocale !== undefined) {
        // Also output a copy of the file for the source locale.
        // There will be no translations - by definition - so we "ignore" `missingTranslations`.
        this.translateFile(
            diagnostics, ast, {locale: sourceLocale, translations: {}}, sourceRoot,
            relativeFilePath, outputPathFn, this.sourceLocaleOptions);
      }
    }
  }

  private translateFile(
      diagnostics: Diagnostics, ast: File|Program, translationBundle: TranslationBundle,
      sourceRoot: string, filename: string, outputPathFn: OutputPathFn,
      options: TranslatePluginOptions) {
    const translated = transformFromAstSync(ast, undefined, {
      compact: true,
      generatorOpts: {minified: true},
      plugins: [
        makeEs2015TranslatePlugin(diagnostics, translationBundle.translations, options),
        makeEs5TranslatePlugin(diagnostics, translationBundle.translations, options),
      ],
      filename,
    });
    if (translated && translated.code) {
      FileUtils.writeFile(outputPathFn(translationBundle.locale, filename), translated.code);
    } else {
      diagnostics.error(`Unable to translate source file: ${join(sourceRoot, filename)}`);
      return;
    }
  }
}
