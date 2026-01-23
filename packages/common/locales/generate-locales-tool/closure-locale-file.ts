/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CldrData, CldrLocaleData} from './cldr-data';
import {fileHeader} from './file-header';
import {BaseCurrencies} from './locale-base-currencies';
import {generateLocaleExtraDataArrayCode} from './locale-extra-file';
import {generateLocale} from './locale-file';

interface ClosureLocale {
  /** Closure-supported locale names that resolve to this locale. */
  closureLocaleNames: string[];
  /** Canonical locale name that is used to resolve the CLDR data. */
  canonicalLocaleName: string;
  /** Locale data. Can have a different locale name if this captures an aliased locale. */
  data: CldrLocaleData;
}

/**
 * Locales used by closure that need to be captured within the Closure Locale file. Extracted from:
 * https://github.com/google/closure-library/blob/c7445058af72f679ef3273274e936d5d5f40b55a/closure/goog/i18n/datetimepatterns.js#L2450
 */
const closureLibraryLocales = [
  'af',
  'am',
  'ar',
  'ar-DZ',
  'az',
  'be',
  'bg',
  'bn',
  'br',
  'bs',
  'ca',
  'chr',
  'cs',
  'cy',
  'da',
  'de',
  'de-AT',
  'de-CH',
  'el',
  'en-AU',
  'en-CA',
  'en-GB',
  'en-IE',
  'en-IN',
  'en-SG',
  'en-ZA',
  'es',
  'es-419',
  'es-MX',
  'es-US',
  'et',
  'eu',
  'fa',
  'fi',
  'fr',
  'fr-CA',
  'ga',
  'gl',
  'gsw',
  'gu',
  'haw',
  'hi',
  'hr',
  'hu',
  'hy',
  'id',
  'is',
  'it',
  'he',
  'ja',
  'ka',
  'kk',
  'km',
  'kn',
  'ko',
  'ky',
  'ln',
  'lo',
  'lt',
  'lv',
  'mk',
  'ml',
  'mn',
  'ro-MD',
  'mr',
  'ms',
  'mt',
  'my',
  'ne',
  'nl',
  'nb',
  'or',
  'pa',
  'pl',
  'pt',
  'pt-PT',
  'ro',
  'ru',
  'sr-Latn',
  'si',
  'sk',
  'sl',
  'sq',
  'sr',
  'sv',
  'sw',
  'ta',
  'te',
  'th',
  'fil',
  'tr',
  'uk',
  'ur',
  'uz',
  'vi',
  'zh',
  'zh-Hans',
  'zh-Hant-HK',
  'zh-Hant',
  'zu',
] as const;

/** Union type matching possible Closure Library locales. */
type ClosureLibraryLocaleName = (typeof closureLibraryLocales)[number];

/**
 * Locale ID aliases to support deprecated locale ids used by Closure. Maps locales supported
 * by Closure library to a list of aliases that match the same locale data.
 */
const closureLibraryAliases: {[l in ClosureLibraryLocaleName]?: string[]} = {
  'id': ['in'],
  'he': ['iw'],
  'ro-MD': ['mo'],
  'nb': ['no', 'no-NO'],
  'sr-Latn': ['sh'],
  'fil': ['tl'],
  'pt': ['pt-BR'],
  'zh-Hans': ['zh-Hans-CN', 'zh-CN'],
  'zh-Hant-HK': ['zh-HK'],
  'zh-Hant': ['zh-Hant-TW', 'zh-TW'],
};

/**
 * Generate a file that contains all locale to import for closure.
 * Tree shaking will only keep the data for the `goog.LOCALE` locale.
 */
export function generateClosureLocaleFile(cldrData: CldrData, baseCurrencies: BaseCurrencies) {
  const locales: ClosureLocale[] = closureLibraryLocales.map((localeName) => {
    const data = cldrData.getLocaleData(localeName);

    if (data === null) {
      throw Error(`Missing locale data for Closure locale: ${localeName}`);
    }

    return {
      data,
      canonicalLocaleName: localeName,
      closureLocaleNames: computeEquivalentLocaleNames(localeName),
    };
  });

  return `${fileHeader}

import {registerLocaleData} from '../src/i18n/locale_data';

const u = undefined;

${locales.map((locale) => generateLocaleConstants(locale)).join('\n')}

let l: any;
let e: any;
let locales: string[] = [];

switch (goog.LOCALE) {
${locales.map((locale) => generateCase(locale)).join('')}}

if (l) {
  locales.forEach(locale => registerLocaleData(l, locale, e));
}
`;

  /**
   * Generates locale data constants for all locale names within the specified
   * Closure Library locale.
   */
  function generateLocaleConstants(locale: ClosureLocale): string {
    // Closure Locale names contain both the dashed and underscore variant. We filter out
    // the dashed variant as otherwise we would end up with the same constant twice. e.g.
    // https://github.com/google/closure-library/blob/c7445058af72f679ef3273274e936d5d5f40b55a/closure/goog/i18n/datetimepatternsext.js#L11659-L11660.
    const localeNamesToExpose = locale.closureLocaleNames.filter((d) => !d.includes('-'));
    const localeConstantNames = localeNamesToExpose.map((d) => `locale_${formatLocale(d)}`);
    const extraLocaleConstantNames = localeNamesToExpose.map(
      (d) => `locale_extra_${formatLocale(d)}`,
    );

    const dataConstantName = localeConstantNames[0];
    const extraDataConstantName = extraLocaleConstantNames[0];
    const aliasDataConstantNames = localeConstantNames.slice(1);
    const aliasExtraDataConstantNames = extraLocaleConstantNames.slice(1);

    // We only generate the locale data once. All other constants just refer to the
    // first constant with the actual locale data. This reduces the Closure Locale file
    // size and potentially speeds up compilation with Closure Compiler.
    // NOTE: The locale constants and aliases are exported as these could be used
    // directly (e.g. in tests).
    return `
${generateLocaleConstant(locale, dataConstantName)}
${generateLocaleExtraDataConstant(locale, extraDataConstantName)}

${aliasDataConstantNames.map((d) => `export const ${d} = ${dataConstantName};`).join('\n')}
${aliasExtraDataConstantNames
  .map((d) => `export const ${d} = ${extraDataConstantName};`)
  .join('\n')}`;
  }

  /** Generates a locale data constant for the specified locale. */
  function generateLocaleConstant(locale: ClosureLocale, constantName: string): string {
    return generateLocale(locale.canonicalLocaleName, locale.data, baseCurrencies)
      .replace(`${fileHeader}\n`, '')
      .replace('export default ', `export const ${constantName} = `)
      .replace('function plural', `function plural_${constantName}`)
      .replace(/,\s+plural/, `, plural_${constantName}`)
      .replace(/\s*const u = undefined;\s*/, '')
      .trim();
  }

  /** Creates a locale extra data constant for the given locale. */
  function generateLocaleExtraDataConstant(locale: ClosureLocale, constantName: string): string {
    return `export const ${constantName} = ${generateLocaleExtraDataArrayCode(
      locale.canonicalLocaleName,
      locale.data,
    )};`;
  }

  /** Generates a TypeScript `switch` case for the specified locale. */
  function generateCase(locale: ClosureLocale): string {
    const localeIdentifier = formatLocale(locale.canonicalLocaleName);

    return `
${locale.closureLocaleNames.map((l) => `case '${l}':`).join('\n')}
  l = locale_${localeIdentifier};
  e = locale_extra_${localeIdentifier};
  locales = [${locale.closureLocaleNames.map((n) => `"${n}"`).join(', ')}];
  break;`;
  }
}

function computeEquivalentLocaleNames(localeName: ClosureLibraryLocaleName): string[] {
  const equivalents = new Set<string>([localeName, formatLocale(localeName)]);

  closureLibraryAliases[localeName]?.forEach((aliasName) => {
    equivalents.add(aliasName);
    equivalents.add(formatLocale(aliasName));
  });

  return Array.from(equivalents);
}

function formatLocale(locale: string): string {
  return locale.replace(/-/g, '_');
}
