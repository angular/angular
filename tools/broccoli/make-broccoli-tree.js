'use strict';

var Funnel = require('broccoli-funnel');
var flatten = require('broccoli-flatten');
var htmlReplace = require('./html-replace');
var mergeTrees = require('broccoli-merge-trees');
var path = require('path');
var renderLodashTemplate = require('broccoli-lodash');
var replace = require('broccoli-replace');
var stew = require('broccoli-stew');
var ts2dart;
var TraceurCompiler;
var TypescriptCompiler;

var projectRootDir = path.normalize(path.join(__dirname, '..', '..'));


module.exports = function makeBroccoliTree(name) {
  if (!TraceurCompiler) TraceurCompiler = require('../../dist/broccoli/traceur');
  if (!TypescriptCompiler) TypescriptCompiler = require('../../dist/broccoli/typescript');
  if (!ts2dart) ts2dart = require('../../dist/broccoli/broccoli-ts2dart');

  switch (name) {
    case 'dev': return makeBrowserTree({name: name, typeAssertions: true});
    case 'prod': return makeBrowserTree({name: name, typeAssertions: false});
    case 'cjs': return makeCjsTree();
    case 'dart': return makeDartTree();
    default: throw new Error('Unknown build type: ' + name);
  }
};


function makeBrowserTree(options) {
  var modulesTree = new Funnel('modules', {
    include: ['**/**'],
    exclude: ['**/*.cjs', 'benchmarks/e2e_test/**'],
    destDir: '/'
  });

  // Use Traceur to transpile original sources to ES6
  var es6Tree = new TraceurCompiler(modulesTree, '.es6', '.map', {
    sourceMaps: true,
    annotations: true,      // parse annotations
    types: true,            // parse types
    script: false,          // parse as a module
    memberVariables: true,  // parse class fields
    modules: 'instantiate',
    typeAssertionModule: 'rtts_assert/rtts_assert',
    typeAssertions: options.typeAssertions,
    outputLanguage: 'es6'
  });


  // Call Traceur again to lower the ES6 build tree to ES5
  var es5Tree = new TraceurCompiler(es6Tree, '.js',  '.js.map', {modules: 'instantiate', sourceMaps: true});

  // Now we add a few more files to the es6 tree that Traceur should not see
  ['angular2', 'rtts_assert'].forEach(
    function (destDir) {
      var extras = new Funnel('tools/build', {files: ['es5build.js'], destDir: destDir});
      es6Tree = mergeTrees([es6Tree, extras]);
    });


  var vendorScriptsTree = flatten(new Funnel('.', {
    files: [
      'node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js',
      'node_modules/zone.js/zone.js',
      'node_modules/zone.js/long-stack-trace-zone.js',
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/systemjs/lib/extension-register.js',
      'node_modules/systemjs/lib/extension-cjs.js',
      'node_modules/rx/dist/rx.all.js',
      'tools/build/snippets/runtime_paths.js',
      path.relative(projectRootDir, TraceurCompiler.RUNTIME_PATH)
    ]
  }));
  var vendorScripts_benchmark =
    new Funnel('tools/build/snippets', {files: ['url_params_to_form.js'], destDir: '/'});
  var vendorScripts_benchmarks_external =
    new Funnel('node_modules/angular', {files: ['angular.js'], destDir: '/'});

  var servingTrees = [];

  function copyVendorScriptsTo(destDir) {
    servingTrees.push(new Funnel(vendorScriptsTree, {srcDir: '/', destDir: destDir}));
    if (destDir.indexOf('benchmarks') > -1) {
      servingTrees.push(new Funnel(vendorScripts_benchmark, {srcDir: '/', destDir: destDir}));
    }
    if (destDir.indexOf('benchmarks_external') > -1) {
      servingTrees.push(
        new Funnel(vendorScripts_benchmarks_external, {srcDir: '/', destDir: destDir}));
    }
  }

  function writeScriptsForPath(relativePath, result) {
    copyVendorScriptsTo(path.dirname(relativePath));
    return result.replace('@@FILENAME_NO_EXT', relativePath.replace(/\.\w+$/, ''));
  }

  var htmlTree = new Funnel(modulesTree, {include: ['*/src/**/*.html'], destDir: '/'});
  htmlTree = replace(htmlTree, {
    files: ['examples*/**'],
    patterns: [{match: /\$SCRIPTS\$/, replacement: htmlReplace('SCRIPTS')}],
    replaceWithPath: writeScriptsForPath
  });
  htmlTree = replace(htmlTree, {
    files: ['benchmarks/**'],
    patterns: [{match: /\$SCRIPTS\$/, replacement: htmlReplace('SCRIPTS_benchmarks')}],
    replaceWithPath: writeScriptsForPath
  });
  htmlTree = replace(htmlTree, {
    files: ['benchmarks_external/**'],
    patterns: [{match: /\$SCRIPTS\$/, replacement: htmlReplace('SCRIPTS_benchmarks_external')}],
    replaceWithPath: writeScriptsForPath
  });

  // Copy all vendor scripts into all examples and benchmarks
  ['benchmarks/src', 'benchmarks_external/src', 'examples/src/benchpress'].forEach(
    copyVendorScriptsTo);

  var scripts = mergeTrees(servingTrees, {overwrite: true});
  var css = new Funnel(modulesTree, {include: ["**/*.css"]});
  var polymerFiles = new Funnel('.', {
    files: [
      'bower_components/polymer/lib/polymer.html',
      'tools/build/snippets/url_params_to_form.js'
    ]
  });
  var polymer = stew.mv(flatten(polymerFiles), 'benchmarks_external/src/tree/polymer');
  htmlTree = mergeTrees([htmlTree, scripts, polymer, css]);

  es5Tree = mergeTrees([es5Tree, htmlTree]);

  return mergeTrees([
    stew.mv(es6Tree, 'js/' + options.name + '/es6'),
    stew.mv(es5Tree, 'js/' + options.name + '/es5')
  ]);
}


function makeCjsTree() {
  // list of npm packages that this build will create
  var outputPackages = ['angular2', 'benchpress', 'rtts_assert'];

  var modulesTree = new Funnel('modules', {
    // TODO(broccoli): this is wrong. it should be just
    // include: ['angular2/**', 'benchpress/**', 'rtts_assert/**', 'benchmarks/e2e_test/**'],
    include: ['**/**'],
    exclude: ['angular2/src/core/zone/vm_turn_zone.es6']
  });

  // Use Traceur to transpile original sources to ES6
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
  }

  var cjsTree = new TraceurCompiler(modulesTree, '.js', '.map', traceurOpts);

  // Now we add the LICENSE file into all the folders that will become npm packages
  outputPackages.forEach(
    function(destDir) {
      var license = new Funnel('.', {files: ['LICENSE'], destDir: destDir});
      cjsTree = mergeTrees([cjsTree, license]);
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
  var packageJsons = stew.rename(new Funnel(modulesTree, {include: ['**/package.json']}), '.json', '.json.template');
  packageJsons = renderLodashTemplate(packageJsons, {
    files: ["**/**"],
    context: { 'packageJson': COMMON_PACKAGE_JSON }
  });


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
  cjsTree = mergeTrees([cjsTree, typescriptTree], { overwrite: true });
  cjsTree = mergeTrees([cjsTree, docs, packageJsons]);

  return stew.mv(cjsTree, 'js/cjs');
}


function makeDartTree() {
  // Transpile everything in 'modules'...
  var modulesTree = new Funnel('modules', {
    include: ['**/*.js', '**/*.ts', '**/*.dart'],  // .dart file available means don't translate.
    exclude: ['rtts_assert/**/*'],  // ... except for the rtts_asserts (don't apply to Dart).
    destDir: '/'                    // Remove the 'modules' prefix.
  });

  // Transpile to dart.
  var dartTree = ts2dart.transpile(modulesTree);

  // Move around files to match Dart's layout expectations.
  dartTree = stew.rename(dartTree, function(relativePath) {
    // If a file matches the `pattern`, insert the given `insertion` as the second path part.
    var replacements = [
      {pattern: /^benchmarks\/test\//, insertion: ''},
      {pattern: /^benchmarks\//, insertion: 'web'},
      {pattern: /^benchmarks_external\/test\//, insertion: ''},
      {pattern: /^benchmarks_external\//, insertion: 'web'},
      {pattern: /^example.?\//, insertion: 'web/'},
      {pattern: /^example.?\/test\//, insertion: ''},
      {pattern: /^[^\/]*\/test\//, insertion: ''},
      {pattern: /^./, insertion: 'lib'},  // catch all.
    ];

    for (var i = 0; i < replacements.length; i++) {
      var repl = replacements[i];
      if (relativePath.match(repl.pattern)) {
        var parts = relativePath.split('/');
        parts.splice(1, 0, repl.insertion);
        return path.join.apply(path, parts);
      }
    }
    throw new Error('Failed to match any path', relativePath);
  });

  // Move the tree under the 'dart' folder.
  return stew.mv(dartTree, 'dart');
}
