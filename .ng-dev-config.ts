// The configuration for `ng-dev commit-message` commands.
const commitMessage = {
  'maxLength': 120,
  'minBodyLength': 100,
  'types': [
    'build',
    'ci',
    'docs',
    'feat',
    'fix',
    'perf',
    'refactor',
    'release',
    'style',
    'test',
  ],
  'scopes': [
    'animations',
    'bazel',
    'benchpress',
    'changelog',
    'common',
    'compiler',
    'compiler-cli',
    'core',
    'dev-infra',
    'docs-infra',
    'elements',
    'forms',
    'http',
    'language-service',
    'localize',
    'ngcc',
    'packaging',
    'platform-browser',
    'platform-browser-dynamic',
    'platform-server',
    'platform-webworker',
    'platform-webworker-dynamic',
    'router',
    'service-worker',
    'upgrade',
    've',
    'zone.js',
  ]
};

// The configuration for `ng-dev format` commands.
const format = {
  'clang-format': {
    'matchers': [
      'dev-infra/**/*.{js,ts}',
      'packages/**/*.{js,ts}',
      '!packages/zone.js',
      '!packages/common/locales/**/*.{js,ts}',
      '!packages/common/src/i18n/available_locales.ts',
      '!packages/common/src/i18n/currencies.ts',
      '!packages/common/src/i18n/locale_en.ts',
      'modules/benchmarks/**/*.{js,ts}',
      'modules/playground/**/*.{js,ts}',
      'tools/**/*.{js,ts}',
      '!tools/gulp-tasks/cldr/extract.js',
      '!tools/public_api_guard/**/*.d.ts',
      '!tools/ts-api-guardian/test/fixtures/**',
      '*.{js,ts}',
      '!**/node_modules/**',
      '!**/dist/**',
      '!**/built/**',
      '!shims_for_IE.js',
    ]
  },
  'buildifier': true
};

// Github metadata information for `ng-dev` commands.
const github = {
  owner: 'angular',
  name: 'angular',
};

// Export function to build ng-dev configuration object.
module.exports = {
  commitMessage,
  format,
  github,
};
