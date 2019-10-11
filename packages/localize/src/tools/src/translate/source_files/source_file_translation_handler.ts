/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {parseSync, transformFromAstSync} from '@babel/core';
import {File, Program} from '@babel/types';
import {extname, join, resolve} from 'path';

import {Diagnostics} from '../../diagnostics';
import {FileUtils} from '../../file_utils';
import {OutputPathFn} from '../output_path';
import {TranslationBundle, TranslationHandler} from '../translator';

import {makeEs2015TranslatePlugin} from './es2015_translate_plugin';
import {makeEs5TranslatePlugin} from './es5_translate_plugin';
import {SourceMapStrategy, TranslatePluginOptions} from './source_file_utils';
import {SourceMapInfo, SourceMapType, ensureOriginalSourceContent, extractSourceMap, writeFileAndSourceMap} from './source_maps';

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
      const absoluteSourcePath = resolve(sourceRoot, relativeFilePath);
      const inputSourceMapInfo = extractSourceMap(diagnostics, absoluteSourcePath, sourceCode);
      const outputSourceMapType =
          getOutputSourceMapType(this.translationOptions.sourceMap, inputSourceMapInfo.type);

      const ast =
          parseSync(inputSourceMapInfo.source, {sourceRoot, sourceFileName: relativeFilePath});
      if (!ast) {
        diagnostics.error(`Unable to parse source file: ${join(sourceRoot, relativeFilePath)}`);
        return;
      }
      // Output a translated copy of the file for each locale.
      for (const translationBundle of translations) {
        this.translateFile(
            diagnostics, sourceCode, ast, translationBundle, sourceRoot, relativeFilePath,
            outputPathFn, this.translationOptions, inputSourceMapInfo, outputSourceMapType);
      }
      if (sourceLocale !== undefined) {
        // Also output a copy of the file for the source locale.
        // There will be no translations - by definition - so we "ignore" `missingTranslations`.
        this.translateFile(
            diagnostics, sourceCode, ast, {locale: sourceLocale, translations: {}}, sourceRoot,
            relativeFilePath, outputPathFn, this.sourceLocaleOptions, inputSourceMapInfo,
            outputSourceMapType);
      }
    }
  }

  private translateFile(
      diagnostics: Diagnostics, sourceCode: string, ast: File|Program,
      translationBundle: TranslationBundle, sourceRoot: string, filename: string,
      outputPathFn: OutputPathFn, options: TranslatePluginOptions,
      inputSourceMapInfo: SourceMapInfo, outputSourceMapType: SourceMapType) {
    const translated = transformFromAstSync(ast, undefined, {
      inputSourceMap: inputSourceMapInfo.map,
      sourceMaps: true,
      minified: true,
      filename: filename,
      plugins: [
        makeEs2015TranslatePlugin(diagnostics, translationBundle.translations, options),
        makeEs5TranslatePlugin(diagnostics, translationBundle.translations, options),
      ],
    });

    if (!translated || !translated.code) {
      return diagnostics.error(`Unable to translate source file: ${join(sourceRoot, filename)}`);
    }

    const translatedFilePath = outputPathFn(translationBundle.locale, filename);
    if (!translated.map) {
      FileUtils.writeFile(translatedFilePath, translated.code);
      if (outputSourceMapType !== 'none') {
        return diagnostics.error(
            `Unable to generate source map when translating ${join(sourceRoot, filename)}`);
      }
    } else {
      ensureOriginalSourceContent(translated.map, filename, sourceCode);
      writeFileAndSourceMap(
          translatedFilePath, translated.code, translated.map, outputSourceMapType);
    }
  }
}

function getOutputSourceMapType(
    strategy: SourceMapStrategy | undefined, inputType: SourceMapType): SourceMapType {
  return (strategy === undefined || strategy === 'inherit') ? inputType : strategy;
}
