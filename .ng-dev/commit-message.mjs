/**
 * The configuration for `ng-dev commit-message` commands.
 *
 * @type { import("@angular/ng-dev").CommitMessageConfig }
 */
export const commitMessage = {
  maxLineLength: Infinity,
  minBodyLength: 20,
  minBodyLengthTypeExcludes: ['docs'],
  // If you update this, also update the docs.
  // https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md#scope
  scopes: [
    'animations',
    'benchpress',
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
    'language-server',
    'localize',
    'migrations',
    'platform-browser',
    'platform-browser-dynamic',
    'platform-server',
    'router',
    'service-worker',
    'upgrade',
    'vscode-extension',
    'zone.js',
  ],
};
