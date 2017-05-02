// #docplaster
// #docregion without-missing-translation
import { TRANSLATIONS, TRANSLATIONS_FORMAT, LOCALE_ID, MissingTranslationStrategy } from '@angular/core';
import { CompilerConfig } from '@angular/compiler';

export function getTranslationProviders(): Promise<Object[]> {

  // Get the locale id from the global
  const locale = document['locale'] as string;

  // return no providers if fail to get translation file for locale
  const noProviders: Object[] = [];

  // No locale or U.S. English: no translation providers
  if (!locale || locale === 'en-US') {
    return Promise.resolve(noProviders);
  }

  // Ex: 'locale/messages.es.xlf`
  const translationFile = `./locale/messages.${locale}.xlf`;

  // #docregion missing-translation
  return getTranslationsWithSystemJs(translationFile)
    .then( (translations: string ) => [
      { provide: TRANSLATIONS, useValue: translations },
      { provide: TRANSLATIONS_FORMAT, useValue: 'xlf' },
      { provide: LOCALE_ID, useValue: locale },
      // #enddocregion without-missing-translation
      { provide: CompilerConfig, useValue: new CompilerConfig({ missingTranslation: MissingTranslationStrategy.Error }) }
      // #docregion without-missing-translation
    ])
    .catch(() => noProviders); // ignore if file not found
    // #enddocregion missing-translation
}

declare var System: any;

function getTranslationsWithSystemJs(file: string) {
  return System.import(file + '!text'); // relies on text plugin
}
// #enddocregion without-missing-translation
