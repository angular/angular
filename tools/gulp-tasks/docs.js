
module.exports = {
  generate: (gulp) => () => {
    const path = require('path');
    const Dgeni = require('dgeni');
    const angularDocsPackage = require(path.resolve(__dirname, '../docs/angular.io-package'));
    const dgeni = new Dgeni([angularDocsPackage]);
    return dgeni.generate();
  },

  test: (gulp) => () => {
    const execSync = require('child_process').execSync;
    execSync(
        'node dist/tools/cjs-jasmine/index-tools ../../tools/docs/**/*.spec.js',
        {stdio: ['inherit', 'inherit', 'inherit']});
  }
};
