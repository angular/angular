var Funnel = require('broccoli-funnel');
var flatten = require('broccoli-flatten');
var mergeTrees = require('broccoli-merge-trees');
var stew = require('broccoli-stew');
var TraceurCompiler = require('./dist/broccoli/traceur');
var replace = require('broccoli-replace');
var htmlReplace = require('./tools/broccoli/html-replace');
var path = require('path');

var modulesTree = new Funnel('modules', {include: ['**/**'], exclude: ['**/*.cjs'], destDir: '/'});

// Use Traceur to transpile original sources to ES6
var es6DevTree = new TraceurCompiler(modulesTree, '.es6', '.map', {
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

// Call Traceur again to lower the ES6 build tree to ES5
var es5DevTree = new TraceurCompiler(es6DevTree, '.js', '.js.map', {modules: 'instantiate', sourceMaps: true});

// Now we add a few more files to the es6 tree that Traceur should not see
['angular2', 'benchmarks', 'benchmarks_external', 'benchpress', 'examples', 'rtts_assert'].forEach(
    function(destDir) {
      var extras = new Funnel('tools/build', {files: ['es5build.js'], destDir: destDir});
      es6DevTree = mergeTrees([es6DevTree, extras]);
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
    path.relative(__dirname, TraceurCompiler.RUNTIME_PATH)
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
// TODO(broccoli): are these needed here, if not loaded by a script tag??
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

es5DevTree = mergeTrees([es5DevTree, htmlTree]);

module.exports = mergeTrees([stew.mv(es6DevTree, 'js/dev/es6'), stew.mv(es5DevTree, 'js/dev/es5')]);
