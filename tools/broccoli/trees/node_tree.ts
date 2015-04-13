'use strict';

var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var path = require('path');
var renderLodashTemplate = require('broccoli-lodash');
var replace = require('broccoli-replace');
var stew = require('broccoli-stew');
var ts2dart = require('../broccoli-ts2dart');
var TraceurCompiler = require('../traceur');
var TypescriptCompiler = require('../typescript');

var projectRootDir = path.normalize(path.join(__dirname, '..', '..', '..'));


module.exports = function makeNodeTree() {
  // list of npm packages that this build will create
  var outputPackages = ['angular2', 'benchpress', 'rtts_assert'];

  var modulesTree = new Funnel('modules', {
    include: ['angular2/**', 'benchpress/**', 'rtts_assert/**', '**/e2e_test/**'],
    exclude: ['angular2/src/core/zone/vm_turn_zone.es6']
  });

  var nodeTree = new TraceurCompiler(modulesTree, '.js', '.map', {
    sourceMaps: true,
    annotations: true,      // parse annotations
    types: true,            // parse types
    script: false,          // parse as a module
    memberVariables: true,  // parse class fields
    typeAssertionModule: 'rtts_assert/rtts_assert',
    // Don't use type assertions since this is partly transpiled by typescript
    typeAssertions: false,
    modules: 'commonjs'
  });

  // Transform all tests to make them runnable in node
  nodeTree = replace(nodeTree, {
    files: ['**/test/**/*_spec.js'],
    patterns: [
      {
        // Override the default DOM adapter with Parse5 for all tests
        match: /"use strict";/,
        replacement:
            "'use strict'; var parse5Adapter = require('angular2/src/dom/parse5_adapter'); " +
                "parse5Adapter.Parse5DomAdapter.makeCurrent();"
      },
      {
        // Append main() to all tests since all of our tests are wrapped in exported main fn
        match: /$/g,
        replacement: "\r\n main();"
      }
    ]
  });

  // Now we add the LICENSE file into all the folders that will become npm packages
  outputPackages.forEach(function(destDir) {
    var license = new Funnel('.', {files: ['LICENSE'], destDir: destDir});
    nodeTree = mergeTrees([nodeTree, license]);
  });

  // Get all docs and related assets and prepare them for js build
  var docs = new Funnel(modulesTree, {include: ['**/*.md', '**/*.png'], exclude: ['**/*.dart.md']});
  docs = stew.rename(docs, 'README.js.md', 'README.md');

  // Generate shared package.json info
  var BASE_PACKAGE_JSON = require(path.join(projectRootDir, 'package.json'));
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
  var packageJsons = stew.rename(new Funnel(modulesTree, {include: ['**/package.json']}), '.json',
                                 '.json.template');
  packageJsons = renderLodashTemplate(
      packageJsons, {files: ["**/**"], context: {'packageJson': COMMON_PACKAGE_JSON}});


  var typescriptTree = new TypescriptCompiler(modulesTree, {
    target: 'ES5',
    sourceMap: true,
    mapRoot: '', /* force sourcemaps to use relative path */
    module: /*system.js*/ 'commonjs',
    allowNonTsExtensions: false,
    typescript: require('typescript'),
    // declarationFiles: true,
    noEmitOnError: true,
    outDir: 'angular2'
  });

  // For now, we just overwrite the Traceur-compiled files with their Typescript equivalent
  nodeTree = mergeTrees([nodeTree, typescriptTree], { overwrite: true });
  nodeTree = mergeTrees([nodeTree, docs, packageJsons]);

  return stew.mv(nodeTree, 'js/cjs');
};
