module.exports = {
  setupFilesAfterEnv: ['./jest-zone.js'],
  testEnvironment: './zone-jsdom-environment.js',
  testMatch: ['**/*.spec.js'],
};
