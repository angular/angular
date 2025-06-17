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
  getFileSystem,
  runInEachFileSystem,
} from '@angular/compiler-cli';
import {ɵParsedTranslation, ɵparseTranslation} from '../../../../index';

import {DiagnosticHandlingStrategy, Diagnostics} from '../../../src/diagnostics';
import {TranslationLoader} from '../../../src/translate/translation_files/translation_loader';
import {SimpleJsonTranslationParser} from '../../../src/translate/translation_files/translation_parsers/simple_json_translation_parser';
import {
  ParseAnalysis,
  TranslationParser,
} from '../../../src/translate/translation_files/translation_parsers/translation_parser';

runInEachFileSystem(() => {
  describe('TranslationLoader', () => {
    describe('loadBundles()', () => {
      const alwaysCanParse = () => true;
      const neverCanParse = () => false;

      let fs: FileSystem;
      let enTranslationPath: AbsoluteFsPath;
      const enTranslationContent = '{"locale": "en", "translations": {"a": "A"}}';
      let frTranslationPath: AbsoluteFsPath;
      const frTranslationContent = '{"locale": "fr", "translations": {"a": "A"}}';
      let frExtraTranslationPath: AbsoluteFsPath;
      const frExtraTranslationContent = '{"locale": "fr", "translations": {"b": "B"}}';
      let jsonParser: SimpleJsonTranslationParser;

      beforeEach(() => {
        fs = getFileSystem();
        enTranslationPath = absoluteFrom('/src/locale/messages.en.json');
        frTranslationPath = absoluteFrom('/src/locale/messages.fr.json');
        frExtraTranslationPath = absoluteFrom('/src/locale/extra.fr.json');
        fs.ensureDir(absoluteFrom('/src/locale'));
        fs.writeFile(enTranslationPath, enTranslationContent);
        fs.writeFile(frTranslationPath, frTranslationContent);
        fs.writeFile(frExtraTranslationPath, frExtraTranslationContent);
        jsonParser = new SimpleJsonTranslationParser();
      });

      it('should call `analyze()` and `parse()` for each file', () => {
        const diagnostics = new Diagnostics();
        const parser = new MockTranslationParser(alwaysCanParse, 'fr');
        const loader = new TranslationLoader(fs, [parser], 'error', diagnostics);
        loader.loadBundles([[enTranslationPath], [frTranslationPath]], []);
        expect(parser.log).toEqual([
          `canParse(${enTranslationPath}, ${enTranslationContent})`,
          `parse(${enTranslationPath}, ${enTranslationContent})`,
          `canParse(${frTranslationPath}, ${frTranslationContent})`,
          `parse(${frTranslationPath}, ${frTranslationContent})`,
        ]);
      });

      it('should stop at the first parser that can parse each file', () => {
        const diagnostics = new Diagnostics();
        const parser1 = new MockTranslationParser(neverCanParse);
        const parser2 = new MockTranslationParser(alwaysCanParse, 'fr');
        const parser3 = new MockTranslationParser(alwaysCanParse, 'en');
        const loader = new TranslationLoader(fs, [parser1, parser2, parser3], 'error', diagnostics);
        loader.loadBundles([[enTranslationPath], [frTranslationPath]], []);
        expect(parser1.log).toEqual([
          `canParse(${enTranslationPath}, ${enTranslationContent})`,
          `canParse(${frTranslationPath}, ${frTranslationContent})`,
        ]);
        expect(parser2.log).toEqual([
          `canParse(${enTranslationPath}, ${enTranslationContent})`,
          `parse(${enTranslationPath}, ${enTranslationContent})`,
          `canParse(${frTranslationPath}, ${frTranslationContent})`,
          `parse(${frTranslationPath}, ${frTranslationContent})`,
        ]);
      });

      it('should return locale and translations parsed from each file', () => {
        const translations = {};
        const diagnostics = new Diagnostics();
        const parser = new MockTranslationParser(alwaysCanParse, 'pl', translations);
        const loader = new TranslationLoader(fs, [parser], 'error', diagnostics);
        const result = loader.loadBundles([[enTranslationPath], [frTranslationPath]], []);
        expect(result).toEqual([
          {locale: 'pl', translations, diagnostics: new Diagnostics()},
          {locale: 'pl', translations, diagnostics: new Diagnostics()},
        ]);
      });

      it('should return the provided locale if there is no parsed locale', () => {
        const translations = {};
        const diagnostics = new Diagnostics();
        const parser = new MockTranslationParser(alwaysCanParse, undefined, translations);
        const loader = new TranslationLoader(fs, [parser], 'error', diagnostics);
        const result = loader.loadBundles([[enTranslationPath], [frTranslationPath]], ['en', 'fr']);
        expect(result).toEqual([
          {locale: 'en', translations, diagnostics: new Diagnostics()},
          {locale: 'fr', translations, diagnostics: new Diagnostics()},
        ]);
      });

      it('should merge multiple translation files, if given, for a each locale', () => {
        const diagnostics = new Diagnostics();
        const loader = new TranslationLoader(fs, [jsonParser], 'error', diagnostics);
        const result = loader.loadBundles([[frTranslationPath, frExtraTranslationPath]], []);
        expect(result).toEqual([
          {
            locale: 'fr',
            translations: {'a': ɵparseTranslation('A'), 'b': ɵparseTranslation('B')},
            diagnostics: new Diagnostics(),
          },
        ]);
      });

      const allDiagnosticModes: DiagnosticHandlingStrategy[] = ['ignore', 'warning', 'error'];
      allDiagnosticModes.forEach((mode) =>
        it(`should ${mode} on duplicate messages when merging multiple translation files`, () => {
          const diagnostics = new Diagnostics();
          const loader = new TranslationLoader(fs, [jsonParser], mode, diagnostics);
          // Change the fs-extra file to have the same translations as fr.
          fs.writeFile(frExtraTranslationPath, frTranslationContent);
          const result = loader.loadBundles([[frTranslationPath, frExtraTranslationPath]], []);
          expect(result).toEqual([
            {
              locale: 'fr',
              translations: {'a': ɵparseTranslation('A')},
              diagnostics: jasmine.any(Diagnostics),
            },
          ]);

          if (mode === 'error' || mode === 'warning') {
            expect(diagnostics.messages).toEqual([
              {
                type: mode,
                message: `Duplicate translations for message "a" when merging "${frExtraTranslationPath}".`,
              },
            ]);
          }
        }),
      );

      it('should warn if the provided locales do not match the parsed locales', () => {
        const diagnostics = new Diagnostics();
        const loader = new TranslationLoader(fs, [jsonParser], 'error', diagnostics);
        loader.loadBundles([[enTranslationPath], [frTranslationPath]], [undefined, 'es']);
        expect(diagnostics.messages.length).toEqual(1);
        expect(diagnostics.messages).toContain({
          type: 'warning',
          message: `The provided locale "es" does not match the target locale "fr" found in the translation file "${frTranslationPath}".`,
        });
      });

      it('should warn on differing target locales when merging multiple translation files', () => {
        const diagnostics = new Diagnostics();

        const fr1 = absoluteFrom('/src/locale/messages-1.fr.json');
        fs.writeFile(fr1, '{"locale":"fr", "translations": {"a": "A"}}');

        const fr2 = absoluteFrom('/src/locale/messages-2.fr.json');
        fs.writeFile(fr2, '{"locale":"fr", "translations": {"b": "B"}}');

        const de = absoluteFrom('/src/locale/messages.de.json');
        fs.writeFile(de, '{"locale":"de", "translations": {"c": "C"}}');

        const loader = new TranslationLoader(fs, [jsonParser], 'error', diagnostics);

        const result = loader.loadBundles([[fr1, fr2, de]], []);
        expect(result).toEqual([
          {
            locale: 'fr',
            translations: {
              'a': ɵparseTranslation('A'),
              'b': ɵparseTranslation('B'),
              'c': ɵparseTranslation('C'),
            },
            diagnostics: jasmine.any(Diagnostics),
          },
        ]);

        expect(diagnostics.messages).toEqual([
          {
            type: 'warning',
            message:
              `When merging multiple translation files, the target locale "de" found in "${de}" ` +
              `does not match the target locale "fr" found in earlier files ["${fr1}", "${fr2}"].`,
          },
        ]);
      });

      it('should throw an error if there is no provided nor parsed target locale', () => {
        const translations = {};
        const diagnostics = new Diagnostics();
        const parser = new MockTranslationParser(alwaysCanParse, undefined, translations);
        const loader = new TranslationLoader(fs, [parser], 'error', diagnostics);
        expect(() => loader.loadBundles([[enTranslationPath]], [])).toThrowError(
          `The translation file "${enTranslationPath}" does not contain a target locale and no explicit locale was provided for this file.`,
        );
      });

      it('should error if none of the parsers can parse the file', () => {
        const diagnostics = new Diagnostics();
        const parser = new MockTranslationParser(neverCanParse);
        const loader = new TranslationLoader(fs, [parser], 'error', diagnostics);
        expect(() =>
          loader.loadBundles([[enTranslationPath], [frTranslationPath]], []),
        ).toThrowError(
          `There is no "TranslationParser" that can parse this translation file: ${enTranslationPath}.\n` +
            `MockTranslationParser cannot parse translation file.\n` +
            `WARNINGS:\n - This is a mock failure warning.`,
        );
      });
    });
  });

  class MockTranslationParser implements TranslationParser {
    log: string[] = [];
    constructor(
      private _canParse: (filePath: string) => boolean,
      private _locale?: string,
      private _translations: Record<string, ɵParsedTranslation> = {},
    ) {}

    analyze(filePath: string, fileContents: string): ParseAnalysis<true> {
      const diagnostics = new Diagnostics();
      diagnostics.warn('This is a mock failure warning.');
      this.log.push(`canParse(${filePath}, ${fileContents})`);
      return this._canParse(filePath)
        ? {canParse: true, hint: true, diagnostics}
        : {canParse: false, diagnostics};
    }

    parse(filePath: string, fileContents: string) {
      this.log.push(`parse(${filePath}, ${fileContents})`);
      return {
        locale: this._locale,
        translations: this._translations,
        diagnostics: new Diagnostics(),
      };
    }
  }
});
