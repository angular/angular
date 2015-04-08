var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var stew = require('broccoli-stew');
var TraceurCompiler = require('./tools/broccoli/traceur');

var modulesTree = new Funnel('modules', {include: ['**/**'], destDir: '/'});

// First, use Traceur to transpile original sources to ES6
var es6DevTree = new TraceurCompiler(modulesTree, '.es6', {
  sourceMaps: true,
  annotations: true,      // parse annotations
  types: true,            // parse types
  script: false,          // parse as a module
  memberVariables: true,  // parse class fields
  modules: 'instantiate',
  typeAssertionModule: 'rtts_assert/rtts_assert',
  typeAssertions: true,
  outputLanguage: 'es6'
});
es6DevTree = stew.rename(es6DevTree, function(relativePath) {
  return relativePath.replace(/\.(js|es6)\.map$/, '.map').replace(/\.js$/, '.es6');
});

// Call Traceur again to lower the ES6 build tree to ES5
var es5DevTree = new TraceurCompiler(es6DevTree, '.js', {modules: 'instantiate', sourceMaps: true});
es5DevTree = stew.rename(es5DevTree, '.es6.map', '.js.map');

module.exports = mergeTrees([stew.mv(es6DevTree, 'js/dev/es6'), stew.mv(es5DevTree, 'js/dev/es5')]);
