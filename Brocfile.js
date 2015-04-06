/**
 * Build pipeline for Angular2.
 * First time setup:
 * $ npm install --global broccoli-cli
 */
var merge = require('merge');
var TraceurCompiler = require('./tools/broccoli/traceur');
var Funnel = require('broccoli-funnel');
var stew = require('broccoli-stew');

var _COMPILER_CONFIG_JS_DEFAULT = {
  sourceMaps: true,
  annotations: true,      // parse annotations
  types: true,            // parse types
  script: false,          // parse as a module
  memberVariables: true,  // parse class fields
  modules: 'instantiate'
};

var modulesTree = new Funnel('modules', {include: ['**/**'], destDir: '/'});

var transpiledTree = new TraceurCompiler(modulesTree, merge(true, _COMPILER_CONFIG_JS_DEFAULT, {
  typeAssertionModule: 'rtts_assert/rtts_assert',
  typeAssertions: true,
  outputLanguage: 'es6'
}));

transpiledTree = stew.rename(transpiledTree, function(relativePath) {
  return relativePath.replace(/\.(js|es6)\.map$/, '.map')
              .replace(/\.js$/, '.es6');
});
transpiledTree = stew.mv(transpiledTree, 'js/dev/es6')

//transpiledTree = stew.log(transpiledTree);


module.exports = transpiledTree;

