import {FormatConfig} from '@angular/ng-dev';

/**
 * Configuration for the `ng-dev format` command.
 */
export const format: FormatConfig = {
  'prettier': {
    'matchers': [
      '**/*.{yaml,yml}',
      '**/*.{js,ts,mjs,mts,cjs,cts,tsx}',
      'devtools/**/*.{js,ts,mjs,mts,cjs,cts,html,scss}',

      // Do not format d.ts files as they are generated
      '!**/*.d.ts',
      // Both third_party and .yarn are directories containing copied code which should
      // not be modified.
      '!third_party/**',
      '!.yarn/**',
      // Do not format the locale files which are checked-in for Google3, but generated using
      // the `generate-locales-tool` from `packages/common/locales`.
      '!packages/core/src/i18n/locale_en.ts',
      '!packages/common/locales/closure-locale.ts',
      '!packages/common/src/i18n/currencies.ts',
      // Test cases contain non valid code.
      '!packages/compiler-cli/test/compliance/test_cases/**/*.{js,ts,mjs,mts,cjs,cts}',

      // Ignore generated javascript file(s)
      '!.github/actions/deploy-docs-site/main.js',
    ],
  },
  'buildifier': true,
};
