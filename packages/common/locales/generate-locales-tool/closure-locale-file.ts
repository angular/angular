/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CldrData, CldrLocaleData} from './cldr-data';
import {fileHeader} from './file-header';
import {BaseCurrencies} from './locale-base-currencies';
import {generateLocale} from './locale-file';

interface ClosureLocale {
  /** Locale name to match with a Closure-supported locale. */
  closureLocaleName: string;
  /** Locale data. Can have a different locale name if this captures an aliased locale. */
  data: CldrLocaleData;
}

/**
 * Generate a file that contains all locale to import for closure.
 * Tree shaking will only keep the data for the `goog.LOCALE` locale.
 */
export function generateClosureLocaleFile(cldrData: CldrData, baseCurrencies: BaseCurrencies) {
  const locales: ClosureLocale[] =
      [...cldrData.availableLocales.map(data => ({closureLocaleName: data.locale, data}))];
  const aliases = cldrData.getLanguageAliases();

  // We also generate locale data for aliases known within CLDR. Closure compiler does not
  // limit its locale identifiers to CLDR-canonical identifiers/or BCP47 identifiers.
  // To ensure deprecated/historical locale identifiers which are supported by Closure
  // can work with closure-compiled Angular applications, we respect CLDR locale aliases.
  for (const [aliasName, data] of Object.entries(aliases)) {
    // We skip bibliographic aliases as those have never been supported by Closure compiler.
    if (data._reason === 'bibliographic') {
      continue;
    }

    const localeData = cldrData.getLocaleData(data._replacement);

    // If CLDR does not provide data for the replacement locale, we skip this alias.
    if (localeData === null) {
      continue;
    }

    locales.push({closureLocaleName: aliasName, data: localeData});
  }

  return `${fileHeader}

import {registerLocaleData} from '../src/i18n/locale_data';

const u = undefined;

${locales.map(locale => `${generateLocaleConstant(locale)}`).join('\n')}

let l: any;

switch (goog.LOCALE) {
${locales.map(locale => generateCase(locale)).join('')}}

if (l) {
  registerLocaleData(l);
}
`;

  function generateLocaleConstant(locale: ClosureLocale): string {
    const localeNameFormattedForJs = formatLocale(locale.closureLocaleName);
    return generateLocale(locale.closureLocaleName, locale.data, baseCurrencies)
        .replace(`${fileHeader}\n`, '')
        .replace('export default ', `export const locale_${localeNameFormattedForJs} = `)
        .replace('function plural', `function plural_${localeNameFormattedForJs}`)
        .replace(/,\s+plural/, `, plural_${localeNameFormattedForJs}`)
        .replace(/\s*const u = undefined;\s*/, '');
  }

  function generateCase(locale: ClosureLocale) {
    return `case '${locale.closureLocaleName}':\n` +
        `l = locale_${formatLocale(locale.closureLocaleName)};\n` +
        `break;\n`;
  }
}

function formatLocale(locale: string): string {
  return locale.replace(/-/g, '_');
}
