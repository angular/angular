module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'scope-enum': [
      2, 'always',
      [
        'aio',
        'animations',
        'bazel',
        'benchpress',
        'common',
        'compiler',
        'compiler-cli',
        'core',
        'forms',
        'http',
        'language-service',
        'platform-browser',
        'platform-browser-dynamic',
        'platform-server',
        'platform-webworker',
        'platform-webworker-dynamic',
        'router',
        'service-worker',
        'upgrade',
        'packaging',
        'changelog'
      ]
    ]
  }
};
