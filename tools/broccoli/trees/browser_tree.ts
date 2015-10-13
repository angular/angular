'use strict';

var Funnel = require('broccoli-funnel');
var htmlReplace = require('../html-replace');
var jsReplace = require('../js-replace');
var path = require('path');
var stew = require('broccoli-stew');

import compileWithTypescript from '../broccoli-typescript';
import destCopy from '../broccoli-dest-copy';
import flatten from '../broccoli-flatten';
import mergeTrees from '../broccoli-merge-trees';
import replace from '../broccoli-replace';


const kServedPaths = [
  // Relative (to /modules) paths to benchmark directories
  'benchmarks/src',
  'benchmarks/src/change_detection',
  'benchmarks/src/compiler',
  'benchmarks/src/costs',
  'benchmarks/src/di',
  'benchmarks/src/element_injector',
  'benchmarks/src/largetable',
  'benchmarks/src/naive_infinite_scroll',
  'benchmarks/src/tree',
  'benchmarks/src/static_tree',

  // Relative (to /modules) paths to external benchmark directories
  'benchmarks_external/src',
  'benchmarks_external/src/compiler',
  'benchmarks_external/src/largetable',
  'benchmarks_external/src/naive_infinite_scroll',
  'benchmarks_external/src/tree',
  'benchmarks_external/src/tree/react',
  'benchmarks_external/src/static_tree',

  // Relative (to /modules) paths to example directories
  'playground/src/animate',
  'playground/src/benchpress',
  'playground/src/model_driven_forms',
  'playground/src/template_driven_forms',
  'playground/src/person_management',
  'playground/src/order_management',
  'playground/src/gestures',
  'playground/src/hello_world',
  'playground/src/http',
  'playground/src/jsonp',
  'playground/src/key_events',
  'playground/src/routing',
  'playground/src/sourcemap',
  'playground/src/todo',
  'playground/src/upgrade',
  'playground/src/zippy_component',
  'playground/src/async',
  'playground/src/material/button',
  'playground/src/material/checkbox',
  'playground/src/material/dialog',
  'playground/src/material/grid_list',
  'playground/src/material/input',
  'playground/src/material/progress-linear',
  'playground/src/material/radio',
  'playground/src/material/switcher',
  'playground/src/web_workers/kitchen_sink',
  'playground/src/web_workers/todo',
  'playground/src/web_workers/images',
  'playground/src/web_workers/message_broker'
];


module.exports = function makeBrowserTree(options, destinationPath) {
  var modulesTree = new Funnel('modules', {
    include: ['**/**'],
    exclude: [
      '**/*.cjs',
      'benchmarks/e2e_test/**',
      'angular1_router/**',
      // Exclude ES6 polyfill typings when tsc target=ES6
      'angular2/typings/es6-*/**',
    ],
    destDir: '/'
  });

  var clientModules = new Funnel(
      'node_modules', {include: ['@reactivex/**/**', 'parse5/**/**', 'css/**/**'], destDir: '/'});

  var es5ModulesTree = new Funnel('modules', {
    include: ['**/**'],
    exclude: ['**/*.cjs', 'angular1_router/**', 'benchmarks/e2e_test/**'],
    destDir: '/'
  });

  var scriptPathPatternReplacement = {
    match: '@@PATH',
    replacement: function(replacement, relativePath) {
      var parts = relativePath.replace(/\\/g, '/').split('/');
      return parts.splice(0, parts.length - 1).join('/');
    }
  };

  var scriptFilePatternReplacement = {
    match: '@@FILENAME',
    replacement: function(replacement, relativePath) {
      var parts = relativePath.replace(/\\/g, '/').split('/');
      return parts[parts.length - 1].replace('html', 'js');
    }
  };

  modulesTree = replace(modulesTree, {
    files: ["playground*/**/*.js"],
    patterns: [{match: /\$SCRIPTS\$/, replacement: jsReplace('SCRIPTS')}]
  });

  // Use TypeScript to transpile the *.ts files to ES6
  var es6Tree = compileWithTypescript(modulesTree, {
    declaration: false,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    mapRoot: '',  // force sourcemaps to use relative path
    noEmitOnError: false,
    rootDir: '.',
    rootFilePaths: ['angular2/manual_typings/globals-es6.d.ts'],
    sourceMap: true,
    sourceRoot: '.',
    target: 'es6'
  });

  // Use TypeScript to transpile the *.ts files to ES5
  var typescriptOptions = {
    declaration: false,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    mapRoot: '',  // force sourcemaps to use relative path
    module: 'commonjs',
    moduleResolution: 'classic',
    noEmitOnError: true,
    rootDir: '.',
    rootFilePaths: ['angular2/manual_typings/globals.d.ts'],
    sourceMap: true,
    sourceRoot: '.',
    target: 'es5'
  };
  var es5Tree = compileWithTypescript(es5ModulesTree, typescriptOptions);

  // Now we add a few more files to the es6 tree that the es5 tree should not see
  var extras = new Funnel('tools/build', {files: ['es5build.js'], destDir: 'angular2'});
  es6Tree = mergeTrees([es6Tree, extras]);

  var vendorScriptsTree = flatten(new Funnel('.', {
    files: [
      'node_modules/es6-shim/es6-shim.js',
      'node_modules/zone.js/dist/zone-microtask.js',
      'node_modules/zone.js/dist/long-stack-trace-zone.js',
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/base64-js/lib/b64.js',
      'node_modules/reflect-metadata/Reflect.js'
    ]
  }));

  var vendorScripts_benchmark =
      new Funnel('tools/build/snippets', {files: ['url_params_to_form.js'], destDir: '/'});
  var vendorScripts_benchmarks_external =
      new Funnel('node_modules/angular', {files: ['angular.js'], destDir: '/'});

  // Get scripts for each benchmark or example
  let servingTrees = kServedPaths.reduce(getServedFunnels, []);
  function getServedFunnels(funnels, destDir) {
    let options = {srcDir: '/', destDir: destDir};
    funnels.push(new Funnel(vendorScriptsTree, options));
    if (destDir.indexOf('benchmarks') > -1) {
      funnels.push(new Funnel(vendorScripts_benchmark, options));
    }
    if (destDir.indexOf('benchmarks_external') > -1) {
      funnels.push(new Funnel(vendorScripts_benchmarks_external, options));
    }
    return funnels;
  }

  var htmlTree = new Funnel(
      modulesTree, {include: ['*/src/**/*.html', '**/playground/**/*.html'], destDir: '/'});
  htmlTree = replace(htmlTree, {
    files: ['playground*/**/*.html'],
    patterns: [
      {match: /\$SCRIPTS\$/, replacement: htmlReplace('SCRIPTS')},
      scriptPathPatternReplacement,
      scriptFilePatternReplacement
    ]
  });


  htmlTree = replace(htmlTree, {
    files: ['benchmarks/**'],
    patterns: [
      {match: /\$SCRIPTS\$/, replacement: htmlReplace('SCRIPTS_benchmarks')},
      scriptPathPatternReplacement,
      scriptFilePatternReplacement
    ]
  });

  htmlTree = replace(htmlTree, {
    files: ['benchmarks_external/**'],
    patterns: [
      {match: /\$SCRIPTS\$/, replacement: htmlReplace('SCRIPTS_benchmarks_external')},
      scriptPathPatternReplacement,
      scriptFilePatternReplacement
    ]
  });

  // We need to replace the regular angular bundle with the web-worker bundle
  // for web-worker e2e tests.
  htmlTree = replace(htmlTree, {
    files: ['playground*/**/web_workers/**/*.html'],
    patterns: [{match: "/bundle/angular2.dev.js", replacement: "/bundle/web_worker/ui.dev.js"}]
  });

  var assetsTree =
      new Funnel(modulesTree, {include: ['**/*'], exclude: ['**/*.{html,ts,dart}'], destDir: '/'});

  var scripts = mergeTrees(servingTrees);
  var polymerFiles = new Funnel('.', {
    files: [
      'bower_components/polymer/polymer.html',
      'bower_components/polymer/polymer-micro.html',
      'bower_components/polymer/polymer-mini.html',
      'tools/build/snippets/url_params_to_form.js'
    ]
  });
  var polymer = stew.mv(flatten(polymerFiles), 'benchmarks_external/src/tree/polymer');

  var reactFiles = new Funnel('.', {files: ['node_modules/react/dist/react.min.js']});
  var react = stew.mv(flatten(reactFiles), 'benchmarks_external/src/tree/react');

  htmlTree = mergeTrees([htmlTree, scripts, polymer, react]);

  es5Tree = mergeTrees([es5Tree, htmlTree, assetsTree, clientModules]);
  es6Tree = mergeTrees([es6Tree, htmlTree, assetsTree, clientModules]);

  var mergedTree = mergeTrees([stew.mv(es6Tree, '/es6'), stew.mv(es5Tree, '/es5')]);

  return destCopy(mergedTree, destinationPath);
};
