exports.config = {
  specs: [
    './e2e/**/*.e2e-spec.js'
  ],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      'args': ['--no-sandbox'],
      'binary': process.env.CHROME_BIN,
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:8000/',
  framework: 'jasmine',
  useAllAngular2AppRoots: true,
};
