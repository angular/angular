var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var stew = require('broccoli-stew');
var TraceurCompiler = require('./dist/broccoli/traceur');
var TypescriptCompiler = require('./dist/broccoli/typescript');
var renderLodashTemplate = require('broccoli-lodash');

var modulesTree = new Funnel(
    'modules', {include: ['**/**'], exclude: ['angular2/src/core/zone/vm_turn_zone.es6']});

// Use Traceur to transpile original sources to ES5
var traceurOpts = {
  sourceMaps: true,
  annotations: true,      // parse annotations
  types: true,            // parse types
  script: false,          // parse as a module
  memberVariables: true,  // parse class fields
  typeAssertionModule: 'rtts_assert/rtts_assert',
  // Don't use type assertions since this is partly transpiled by typescript
  typeAssertions: false,
  modules: 'commonjs'
};
var cjsTree = new TraceurCompiler(modulesTree, '.js', '.map', traceurOpts);

// Add the LICENSE file in each module
['angular2', 'benchmarks', 'benchmarks_external', 'benchpress', 'examples', 'rtts_assert'].forEach(
    function(destDir) {
      cjsTree = mergeTrees([cjsTree, new Funnel('.', {files: ['LICENSE'], destDir: destDir})]);
    });

extras = new Funnel(modulesTree, {include: ['**/*.md', '**/*.png'], exclude: ['**/*.dart.md']});
extras = stew.rename(extras, 'README.js.md', 'README.md');

var BASE_PACKAGE_JSON = require('./package.json');
var COMMON_PACKAGE_JSON = {
  version: BASE_PACKAGE_JSON.version,
  homepage: BASE_PACKAGE_JSON.homepage,
  bugs: BASE_PACKAGE_JSON.bugs,
  license: BASE_PACKAGE_JSON.license,
  contributors: BASE_PACKAGE_JSON.contributors,
  dependencies: BASE_PACKAGE_JSON.dependencies,
  devDependencies: {
    "yargs": BASE_PACKAGE_JSON.devDependencies['yargs'],
    "gulp-sourcemaps": BASE_PACKAGE_JSON.devDependencies['gulp-sourcemaps'],
    "gulp-traceur": BASE_PACKAGE_JSON.devDependencies['gulp-traceur'],
    "gulp": BASE_PACKAGE_JSON.devDependencies['gulp'],
    "gulp-rename": BASE_PACKAGE_JSON.devDependencies['gulp-rename'],
    "through2": BASE_PACKAGE_JSON.devDependencies['through2']
  }
};

// Add a .template extension since renderLodashTemplate strips one extension
var packageJsons =
    stew.rename(new Funnel(modulesTree, {include: ['**/package.json']}), '.json', '.json.template');
packageJsons = renderLodashTemplate(
    packageJsons, {files: ["**/**"], context: {'packageJson': COMMON_PACKAGE_JSON}});

var typescriptTree = new TypescriptCompiler(modulesTree, {
  target: 'ES5',
  sourceMap: true,
  mapRoot: '', /* force sourcemaps to use relative path */
  module: /*system.js*/'commonjs',
  allowNonTsExtensions: false,
  typescript: require('typescript'),
  //declarationFiles: true,
  noEmitOnError: true,
  outDir: 'angular2'
});

// For now, we just overwrite the Traceur-compiled files with their Typescript equivalent
cjsTree = mergeTrees([cjsTree, typescriptTree], { overwrite: true });
cjsTree = mergeTrees([cjsTree, extras, packageJsons]);

module.exports = stew.mv(cjsTree, 'js/cjs');
