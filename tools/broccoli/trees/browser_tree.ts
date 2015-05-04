'use strict';

var Funnel = require('broccoli-funnel');
var flatten = require('broccoli-flatten');
var htmlReplace = require('../html-replace');
var mergeTrees = require('broccoli-merge-trees');
var path = require('path');
var replace = require('broccoli-replace');
var stew = require('broccoli-stew');
var ts2dart = require('../broccoli-ts2dart');

import compileWithTypescript from '../broccoli-typescript';
import destCopy from '../broccoli-dest-copy';
import {default as transpileWithTraceur, TRACEUR_RUNTIME_PATH} from '../traceur/index';


var projectRootDir = path.normalize(path.join(__dirname, '..', '..', '..', '..'));


module.exports = function makeBrowserTree(options, destinationPath) {
  var modulesTree = new Funnel(
      'modules',
      {include: ['**/**'], exclude: ['**/*.cjs', 'benchmarks/e2e_test/**'], destDir: '/'});

  // Use Traceur to transpile *.js sources to ES6
  var traceurTree = transpileWithTraceur(modulesTree, {
    destExtension: '.es6',
    destSourceMapExtension: '.map',
    traceurOptions: {
      sourceMaps: true,
      annotations: true,      // parse annotations
      types: true,            // parse types
      script: false,          // parse as a module
      memberVariables: true,  // parse class fields
      modules: 'instantiate',
      // typeAssertionModule: 'rtts_assert/rtts_assert',
      // typeAssertions: options.typeAssertions,
      outputLanguage: 'es6'
    }
  });

  // Use TypeScript to transpile the *.ts files to ES6
  // We don't care about errors: we let the TypeScript compilation to ES5
  // in node_tree.ts do the type-checking.
  var typescriptTree = compileWithTypescript(modulesTree, {
    allowNonTsExtensions: false,
    declaration: true,
    emitDecoratorMetadata: true,
    mapRoot: '',           // force sourcemaps to use relative path
    noEmitOnError: false,  // temporarily ignore errors, we type-check only via cjs build
    rootDir: '.',
    sourceMap: true,
    sourceRoot: '.',
    target: 'ES6'
  });
  typescriptTree = stew.rename(typescriptTree, '.js', '.es6');

  var es6Tree = mergeTrees([traceurTree, typescriptTree]);

  // TODO(iminar): tree differ seems to have issues with trees created by mergeTrees, investigate!
  //   ENOENT error is thrown while doing fs.readdirSync on inputRoot
  //   in the meantime, we just do noop mv to create a new tree
  es6Tree = stew.mv(es6Tree, '');

  // Call Traceur again to lower the ES6 build tree to ES5
  var es5Tree = transpileWithTraceur(es6Tree, {
    destExtension: '.js',
    destSourceMapExtension: '.js.map',
    traceurOptions: {modules: 'instantiate', sourceMaps: true}
  });

  // Now we add a few more files to the es6 tree that Traceur should not see
  ['angular2', 'rtts_assert'].forEach(function(destDir) {
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
      'node_modules/rx/dist/rx.js',
      'node_modules/reflect-metadata/Reflect.js',
      'tools/build/snippets/runtime_paths.js',
      path.relative(projectRootDir, TRACEUR_RUNTIME_PATH)
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

  var reactFiles = new Funnel('.', {files: ['node_modules/react/dist/react.min.js']});
  var react = stew.mv(flatten(reactFiles), 'benchmarks_external/src/tree/react');

  htmlTree = mergeTrees([htmlTree, scripts, polymer, css, react]);

  es5Tree = mergeTrees([es5Tree, htmlTree]);

  var mergedTree = mergeTrees([stew.mv(es6Tree, '/es6'), stew.mv(es5Tree, '/es5')]);

  // TODO(iminar): tree differ seems to have issues with trees created by mergeTrees, investigate!
  //   ENOENT error is thrown while doing fs.readdirSync on inputRoot
  //   in the meantime, we just do noop mv to create a new tree
  mergedTree = stew.mv(mergedTree, '');

  return destCopy(mergedTree, destinationPath);
};
