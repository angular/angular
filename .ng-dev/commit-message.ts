import {CommitMessageConfig} from '../dev-infra/commit-message/config';

/**
 * The configuration for `ng-dev commit-message` commands.
 */
export const commitMessage: CommitMessageConfig = {
  maxLineLength: Infinity,
  minBodyLength: 20,
  minBodyLengthTypeExcludes: ['docs'],
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
