import {join} from 'path';

import {MergeConfig} from '../dev-infra/pr/merge/config';
import {exec} from '../dev-infra/utils/shelljs';

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

/** Github metadata information for `ng-dev` commands. */
const github = {
  owner: 'angular',
  name: 'angular',
};

// Configuration for the `ng-dev pr merge` command. The command can be used
// for merging upstream pull requests into branches based on a PR target label.
const merge = () => {
  // TODO: resume dynamically determining patch branch
  const patch = '10.0.x';
  const config: MergeConfig = {
    githubApiMerge: false,
    claSignedLabel: 'cla: yes',
    mergeReadyLabel: /^PR action: merge(-assistance)?/,
    commitMessageFixupLabel: 'commit message fixup',
    labels: [
      {
        pattern: 'PR target: master-only',
        branches: ['master'],
      },
      {
        pattern: 'PR target: patch-only',
        branches: [patch],
      },
      {
        pattern: 'PR target: master & patch',
        branches: ['master', patch],
      },
    ],
    requiredBaseCommits: {
      // PRs that target either `master` or the patch branch, need to be rebased
      // on top of the latest commit message validation fix.
      'master': '4341743b4a6d7e23c6f944aa9e34166b701369a1',
      [patch]: '2a53f471592f424538802907aca1f60f1177a86d'
    },
  };
  return config;
};

// The configuration for `ng-dev release` commands.
const release = {
  angular: () => ({
    changelog: {
      changelogPath: join(__dirname, './CHANGELOG.md'),
      gitCommitOptions: {
        extendedRegexp: true,
        grep: (() => {
          const ignoredScopes = [
            'aio',
            'dev-infra',
            'docs-infra',
            'zone.js',
          ];
          return `^[^(]+\\((${ignoredScopes.join('|')})\\)`;
        })(),
        invertGrep: true,
      }
    }
  }),
  'zone.js': () => {
    /** The working directory for getting the version of zone.js */
    const cwd = join(__dirname, './packages/zone.js');
    /** The new version of zone.js. */
    const version = exec(`npm version patch --no-git-tag-version`, {cwd}).trim().slice(1);
    /** The previous version of zone.js */
    const previousTag = exec(`git tag -l 'zone.js-0.10.*' | tail -n1`, {silent: true}).trim();
    /** The new git tag for changelog processing */
    const tag = `zone.js-${version}`;
    return {
      changelog: {
        changelogPath: join(__dirname, './packages/zone.js/CHANGELOG.md'),
        context: {
          linkCompare: true,
          previousTag: previousTag,
          currentTag: tag,
          version,
        },
        gitCommitOptions: {
          extendedRegexp: true,
          grep: '^[^(]+\\(zone\\.js\\)',
          from: previousTag,
          to: 'HEAD',
        }
      }
    };
  },
};

// Export function to build ng-dev configuration object.
module.exports = {
  commitMessage,
  format,
  github,
  merge,
  release,
};
