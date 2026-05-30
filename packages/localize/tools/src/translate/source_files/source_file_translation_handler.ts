/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  absoluteFrom,
  AbsoluteFsPath,
  FileSystem,
  PathSegment,
} from '@angular/compiler-cli/private/localize';
import babel, {types as t} from '@babel/core';

import {Diagnostics} from '../../diagnostics';
import {TranslatePluginOptions} from '../../source_file_utils';
import {OutputPathFn} from '../output_path';
import {TranslationBundle, TranslationHandler} from '../translator';

import {makeEs2015TranslatePlugin} from './es2015_translate_plugin';
import {makeEs5TranslatePlugin} from './es5_translate_plugin';
import {makeLocalePlugin} from './locale_plugin';

/**
 * Translate a file by inlining all messages tagged by `$localize` with the appropriate translated
 * message.
 */
export class SourceFileTranslationHandler implements TranslationHandler {
  private sourceLocaleOptions: TranslatePluginOptions;

  constructor(
    private fs: FileSystem,
    private translationOptions: TranslatePluginOptions = {},
  ) {
    this.sourceLocaleOptions = {
      ...this.translationOptions,
      missingTranslation: 'ignore',
    };
  }

  canTranslate(relativeFilePath: PathSegment | AbsoluteFsPath, _contents: Uint8Array): boolean {
    return this.fs.extname(relativeFilePath) === '.js';
  }

  translate(
    diagnostics: Diagnostics,
    sourceRoot: AbsoluteFsPath,
    relativeFilePath: PathSegment,
    contents: Uint8Array,
    outputPathFn: OutputPathFn,
    translations: TranslationBundle[],
    sourceLocale?: string,
  ): void {
    const sourceCode = Buffer.from(contents).toString('utf8');
    // A short-circuit check to avoid parsing the file into an AST if it does not contain any
    // `$localize` identifiers.
    if (!sourceCode.includes('$localize')) {
      for (const translation of translations) {
        this.writeSourceFile(
          diagnostics,
          outputPathFn,
          translation.locale,
          relativeFilePath,
          contents,
        );
      }
      if (sourceLocale !== undefined) {
        this.writeSourceFile(diagnostics, outputPathFn, sourceLocale, relativeFilePath, contents);
      }
    } else {
      const ast = babel.parseSync(sourceCode, {sourceRoot, filename: relativeFilePath});
      if (!ast) {
        diagnostics.error(
          `Unable to parse source file: ${this.fs.join(sourceRoot, relativeFilePath)}`,
        );
        return;
      }
      // Output a translated copy of the file for each locale.
      for (const translationBundle of translations) {
        this.translateFile(
          diagnostics,
          ast,
          translationBundle,
          sourceRoot,
          relativeFilePath,
          outputPathFn,
          this.translationOptions,
        );
      }
      if (sourceLocale !== undefined) {
        // Also output a copy of the file for the source locale.
        // There will be no translations - by definition - so we "ignore" `missingTranslations`.
        this.translateFile(
          diagnostics,
          ast,
          {locale: sourceLocale, translations: {}},
          sourceRoot,
          relativeFilePath,
          outputPathFn,
          this.sourceLocaleOptions,
        );
      }
    }
  }

  private translateFile(
    diagnostics: Diagnostics,
    ast: t.File | t.Program,
    translationBundle: TranslationBundle,
    sourceRoot: AbsoluteFsPath,
    filename: PathSegment,
    outputPathFn: OutputPathFn,
    options: TranslatePluginOptions,
  ) {
    const translated = babel.transformFromAstSync(ast, undefined, {
      compact: true,
      generatorOpts: {minified: true},
      plugins: [
        makeLocalePlugin(translationBundle.locale),
        makeEs2015TranslatePlugin(diagnostics, translationBundle.translations, options, this.fs),
        makeEs5TranslatePlugin(diagnostics, translationBundle.translations, options, this.fs),
      ],
      cwd: sourceRoot,
      filename,
    });
    if (translated && translated.code) {
      this.writeSourceFile(
        diagnostics,
        outputPathFn,
        translationBundle.locale,
        filename,
        translated.code,
      );
      const outputPath = absoluteFrom(outputPathFn(translationBundle.locale, filename));
      this.fs.ensureDir(this.fs.dirname(outputPath));
      this.fs.writeFile(outputPath, translated.code);
    } else {
      diagnostics.error(`Unable to translate source file: ${this.fs.join(sourceRoot, filename)}`);
      return;
    }
  }

  private writeSourceFile(
    diagnostics: Diagnostics,
    outputPathFn: OutputPathFn,
    locale: string,
    relativeFilePath: PathSegment,
    contents: string | Uint8Array,
  ): void {
    try {
      const outputPath = absoluteFrom(outputPathFn(locale, relativeFilePath));
      this.fs.ensureDir(this.fs.dirname(outputPath));
      this.fs.writeFile(outputPath, contents);
    } catch (e) {
      diagnostics.error((e as Error).message);
    }
  }
}
