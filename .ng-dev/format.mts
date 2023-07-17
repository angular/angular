import {FormatConfig} from '@angular/ng-dev';

/**
 * Configuration for the `ng-dev format` command.
 */
export const format: FormatConfig = {
  'prettier': {
    'matchers': ['**/*.{yaml,yml}'],
  },
  'clang-format': {
    'matchers': [
      '**/*.{js,ts}',
      // TODO: burn down format failures and remove aio and integration exceptions.
      '!aio/**',
      '!integration/**',
      // Both third_party and .yarn are directories containing copied code which should
      // not be modified.
      '!third_party/**',
      '!.yarn/**',
      // Do not format d.ts files as they are generated
      '!**/*.d.ts',
      // Do not format generated ng-dev script
      '!dev-infra/ng-dev.js',
      '!dev-infra/build-worker.js',
      // Do not format compliance test-cases since they must match generated code
      '!packages/compiler-cli/test/compliance/test_cases/**/*.js',
      // Do not format the locale files which are checked-in for Google3, but generated using
      // the `generate-locales-tool` from `packages/common/locales`.
      '!packages/core/src/i18n/locale_en.ts',
      '!packages/common/locales/closure-locale.ts',
      '!packages/common/src/i18n/currencies.ts',
    ],
  },
  'buildifier': true,
};
