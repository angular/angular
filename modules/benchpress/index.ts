require('reflect-metadata');
require('traceur/bin/traceur-runtime');
module.exports = require('./benchpress.js');
// when bundling benchpress to one file, this is used
// for getting exports out of browserify's scope.
global.__benchpressExports = module.exports;
