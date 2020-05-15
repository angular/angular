import {exec} from 'shelljs';

import {MergeConfig} from './dev-infra/pr/merge/config';

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

/**
 * Gets the name of the current patch branch. The patch branch is determined by
 * looking for upstream branches that follow the format of `{major}.{minor}.x`.
 */
const getPatchBranchName = (): string => {
  const branches =
      exec(
          `git ls-remote --heads https://github.com/${github.owner}/${github.name}.git`,
          {silent: true})
          .trim()
          .split('\n');

  for (let i = branches.length - 1; i >= 0; i--) {
    const branchName = branches[i];
    const matches = branchName.match(/refs\/heads\/([0-9]+\.[0-9]+\.x)/);
    if (matches !== null) {
      return matches[1];
    }
  }

  throw Error('Could not determine patch branch name.');
};

// Configuration for the `ng-dev pr merge` command. The command can be used
// for merging upstream pull requests into branches based on a PR target label.
const merge = () => {
  const patchBranch = getPatchBranchName();
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
        branches: [patchBranch],
      },
      {
        pattern: 'PR target: master & patch',
        branches: ['master', patchBranch],
      },
    ],
    requiredBaseCommits: {
      // PRs that target either `master` or the patch branch, need to be rebased
      // on top of the latest commit message validation fix.
      'master': '4341743b4a6d7e23c6f944aa9e34166b701369a1',
      [patchBranch]: '2a53f471592f424538802907aca1f60f1177a86d'
    },
  };
  return config;
};

// Export function to build ng-dev configuration object.
module.exports = {
  commitMessage,
  format,
  github,
  merge,
};
