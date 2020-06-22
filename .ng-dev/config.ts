import {MergeConfig} from '../dev-infra/pr/merge/config';

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
    'migrations',
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
      '**/*.{js,ts}',
      // TODO: burn down format failures and remove aio and integration exceptions.
      '!aio/**',
      '!integration/**',
      // TODO: remove this exclusion as part of IE deprecation.
      '!shims_for_IE.js',
      // Both third_party and .yarn are directories containing copied code which should
      // not be modified.
      '!third_party/**',
      '!.yarn/**',
      // Do not format d.ts files as they are generated
      '!**/*.d.ts',
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
    caretakerNoteLabel: 'PR action: merge-assistance',
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
      // These SHAs are the commits that update the required license text in the header.
      'master': '5aeb9a4124922d8ac08eb73b8f322905a32b0b3a',
      [patch]: '27b95ba64a5d99757f4042073fd1860e20e3ed24'
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
