import {FormatConfig} from '@angular/ng-dev';

/**
 * Configuration for the `ng-dev format` command.
 */
export const format: FormatConfig = {
  'prettier': {
    'matchers': [
      '**/*.{yaml,yml}',
      'adev/**/*.{js,ts}',
      'devtools/**/*.{js,ts}',
      'integration/**/*.{js,ts}',
      'tools/**/*.{js,ts}',
      'modules/**/*.{js,ts}',
      'scripts/**/*.{js,ts}',
      'packages/animations/**/*.{js,ts}',
      'packages/bazel/**/*.{js,ts}',
      'packages/benchpress/**/*.{js,ts}',
      'packages/common/**/*.{js,ts}',
      'packages/compiler/**/*.{js,ts}',
      'packages/core/primitives/**/*.{js,ts}',
      'packages/docs/**/*.{js,ts}',
      'packages/elements/**/*.{js,ts}',
      'packages/examples/**/*.{js,ts}',
      'packages/forms/**/*.{js,ts}',
      'packages/language-service/**/*.{js,ts}',
      'packages/localize/**/*.{js,ts}',
      'packages/platform-browser/**/*.{js,ts}',
      'packages/platform-browser-dynamic/**/*.{js,ts}',
      'packages/platform-server/**/*.{js,ts}',
      'packages/misc/**/*.{js,ts}',
      'packages/private/**/*.{js,ts}',
      'packages/router/**/*.{js,ts}',
      'packages/service-worker/**/*.{js,ts}',
      'packages/upgrade/**/*.{js,ts}',

      // Do not format d.ts files as they are generated
      '!**/*.d.ts',
      // Both third_party and .yarn are directories containing copied code which should
      // not be modified.
      '!third_party/**',
      '!.yarn/**',
    ],
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
      // Temporarily disable formatting for adev
      '!adev/**',

      // Migrated to prettier
      '!devtools/**/*.{js,ts}',
      '!tools/**/*.{js,ts}',
      '!modules/**/*.{js,ts}',
      '!scripts/**/*.{js,ts}',
      '!packages/animations/**/*.{js,ts}',
      '!packages/bazel/**/*.{js,ts}',
      '!packages/benchpress/**/*.{js,ts}',
      '!packages/common/**/*.{js,ts}',
      '!packages/compiler/**/*.{js,ts}',
      '!packages/core/primitives/**/*.{js,ts}',
      '!packages/docs/**/*.{js,ts}',
      '!packages/elements/**/*.{js,ts}',
      '!packages/examples/**/*.{js,ts}',
      '!packages/forms/**/*.{js,ts}',
      '!packages/language-service/**/*.{js,ts}',
      '!packages/localize/**/*.{js,ts}',
      '!packages/platform-browser/**/*.{js,ts}',
      '!packages/platform-browser-dynamic/**/*.{js,ts}',
      '!packages/platform-server/**/*.{js,ts}',
      '!packages/misc/**/*.{js,ts}',
      '!packages/private/**/*.{js,ts}',
      '!packages/router/**/*.{js,ts}',
      '!packages/service-worker/**/*.{js,ts}',
      '!packages/upgrade/**/*.{js,ts}',
    ],
  },
  'buildifier': true,
};
