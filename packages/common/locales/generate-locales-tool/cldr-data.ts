/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runfiles} from '@bazel/runfiles';
import {CldrStatic} from 'cldrjs';
import {sync as globSync} from 'glob';

// TypeScript doesn't allow us to import the default export without the `esModuleInterop`. We use
// the NodeJS require function instead as specifying a custom tsconfig complicates the setup
// unnecessarily.
// TODO: See if we can improve this by having better types for `cldrjs`.
const cldrjs: typeof import('cldrjs') = require('cldrjs');

/**
 * Globs that match CLDR JSON data files that should be fetched. We limit these intentionally
 * as loading unused data results in significant slow-down of the generation
 * (noticeable in local development if locale data is re-generated).
 */
const CLDR_DATA_GLOBS = [
  'cldr-core-37.0.0/scriptMetadata.json',
  'cldr-core-37.0.0/supplemental/**/*.json',
  'cldr-dates-full-37.0.0/main/**/*.json',
  'cldr-numbers-full-37.0.0/main/**/*.json',
];

/** Path to the CLDR available locales file. */
const CLDR_AVAILABLE_LOCALES_PATH = 'cldr-core-37.0.0/availableLocales.json';

/** Path to the CLDR locale aliases file. */
const CLDR_LOCALE_ALIASES_PATH = 'cldr-core-37.0.0/supplemental/aliases.json';

/**
 * Instance providing access to a locale's CLDR data. This type extends the `cldrjs`
 * instance type with the missing `bundle` attribute property.
 */
export type CldrLocaleData = CldrStatic&{
  attributes: {
    /**
     * Resolved bundle name for the locale.
     * More details: http://www.unicode.org/reports/tr35/#Bundle_vs_Item_Lookup
     */
    bundle: string;
  }
};

/**
 * Possible reasons for an alias in the CLDR supplemental data. See:
 * https://unicode.org/reports/tr35/tr35-info.html#Appendix_Supplemental_Metadata.
 */
export type CldrLocaleAliasReason =
    'deprecated'|'overlong'|'macrolanguage'|'legacy'|'bibliographic';

/**
 * Class that provides access to the CLDR data downloaded as part of
 * the `@cldr_data` Bazel repository.
 */
export class CldrData {
  /** Path to the CLDR data Bazel repository. i.e. `@cldr_data//`. */
  readonly cldrDataDir = runfiles.resolve('cldr_data');

  /** List of all available locales CLDR provides data for. */
  readonly availableLocales: readonly CldrLocaleData[];

  constructor() {
    this._loadAndPopulateCldrData();
    this.availableLocales = this._getAvailableLocales();
  }

  /** Gets the CLDR data for the specified locale. */
  getLocaleData(localeName: string): CldrLocaleData|null {
    // Cast to `CldrLocaleData` because the default `cldrjs` types from `DefinitelyTyped`
    // are outdated and do not capture the `bundle` attribute. See:
    // https://github.com/rxaviers/cldrjs#instantiate-a-locale-and-get-it-normalized.
    const localeData = new cldrjs(localeName) as CldrLocaleData;

    // In case a locale has been requested for which no data is available, we return
    // `null` immediately instead of returning an empty `CldrStatic` instance.
    if (localeData.attributes.bundle === null) {
      return null;
    }

    return localeData;
  }

  /**
   * Gets the CLDR language aliases.
   * http://cldr.unicode.org/index/cldr-spec/language-tag-equivalences.
   */
  getLanguageAliases():
      {[localeName: string]: {_reason: CldrLocaleAliasReason, _replacement: string}} {
    return require(`${this.cldrDataDir}/${CLDR_LOCALE_ALIASES_PATH}`)
        .supplemental.metadata.alias.languageAlias;
  }

  /** Gets a list of all locales CLDR provides data for. */
  private _getAvailableLocales(): CldrLocaleData[] {
    const allLocales =
        require(`${this.cldrDataDir}/${CLDR_AVAILABLE_LOCALES_PATH}`).availableLocales.full;
    const localesWithData: CldrLocaleData[] = [];

    for (const localeName of allLocales) {
      const localeData = this.getLocaleData(localeName);

      // If `cldrjs` is unable to resolve a `bundle` for the current locale, then there is no data
      // for this locale, and it should not be generated. This can happen as with older versions of
      // CLDR where `availableLocales.json` specifies locales for which no data is available
      // (even within the `full` tier packages). See:
      // http://cldr.unicode.org/development/development-process/design-proposals/json-packaging.
      // TODO(devversion): Remove if we update to CLDR v39 where this seems fixed. Note that this
      //  worked before in the Gulp tooling without such a check because the `cldr-data-downloader`
      //  overwrote the `availableLocales` to only capture locales with data.
      if (localeData !== null) {
        localesWithData.push(localeData);
      }
    }

    return localesWithData;
  }

  /** Loads the CLDR data and populates the `cldrjs` library with it. */
  private _loadAndPopulateCldrData() {
    const localeData = this._readCldrDataFromRepository();

    if (localeData.length === 0) {
      throw Error('No CLDR data could be found.');
    }

    // Populate the `cldrjs` library with the locale data. Note that we need this type cast
    // to satisfy the first `cldrjs.load` parameter which cannot be undefined.
    cldrjs.load(...localeData as [object, ...object[]]);
  }

  /**
   * Reads the CLDR JSON data from the Bazel repository.
   * @returns a list of read JSON objects representing the CLDR data.
   */
  private _readCldrDataFromRepository(): object[] {
    const jsonFiles =
        CLDR_DATA_GLOBS.map(pattern => globSync(pattern, {cwd: this.cldrDataDir, absolute: true}))
            .reduce((acc, dataFiles) => [...acc, ...dataFiles], []);

    // Read the JSON for all determined CLDR json files.
    return jsonFiles.map(filePath => {
      const parsed = require(filePath);

      // Guards against cases where non-CLDR data files are accidentally picked up
      // by the glob above and would throw-off the bundle lookup in `cldrjs`.
      if (parsed.main !== undefined && typeof parsed.main !== 'object') {
        throw Error('Unexpected CLDR json file with "main" field which is not an object.');
      }

      return parsed;
    });
  }
}
