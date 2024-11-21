import {CommitMessageConfig} from '@angular/ng-dev';

/**
 * The configuration for `ng-dev commit-message` commands.
 */
export const commitMessage: CommitMessageConfig = {
  maxLineLength: Infinity,
  minBodyLength: 20,
  minBodyLengthTypeExcludes: ['docs'],
  // If you update this, also update the docs.
  // https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md#scope
  scopes: [
    'animations',
    'bazel',
    'benchpress',
    'changelog',
    'common',
    'compiler',
    'compiler-cli',
    'core',
    'dev-infra',
    'devtools',
    'docs-infra',
    'elements',
    'forms',
    'http',
    'language-service',
    'localize',
    'migrations',
    'packaging',
    'platform-browser',
    'platform-browser-dynamic',
    'platform-server',
    'router',
    'service-worker',
    'upgrade',
    'zone.js',
  ],
};
