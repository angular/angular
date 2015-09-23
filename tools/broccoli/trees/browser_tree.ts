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


var projectRootDir = path.normalize(path.join(__dirname, '..', '..', '..', '..'));


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
  'examples/src/animate',
  'examples/src/benchpress',
  'examples/src/model_driven_forms',
  'examples/src/template_driven_forms',
  'examples/src/person_management',
  'examples/src/order_management',
  'examples/src/gestures',
  'examples/src/hello_world',
  'examples/src/http',
  'examples/src/jsonp',
  'examples/src/key_events',
  'examples/src/routing',
  'examples/src/sourcemap',
  'examples/src/todo',
  'examples/src/zippy_component',
  'examples/src/async',
  'examples/src/material/button',
  'examples/src/material/checkbox',
  'examples/src/material/dialog',
  'examples/src/material/grid_list',
  'examples/src/material/input',
  'examples/src/material/progress-linear',
  'examples/src/material/radio',
  'examples/src/material/switcher',
  'examples/src/web_workers/kitchen_sink',
  'examples/src/web_workers/todo',
  'examples/src/web_workers/images',
  'examples/src/web_workers/message_broker'
];


module.exports = function makeBrowserTree(options, destinationPath) {
  var modulesTree = new Funnel('modules', {
    include: ['**/**'],
    exclude: [
      '**/*.cjs',
      'benchmarks/e2e_test/**',
      'angular1_router/**',
      // Exclude ES6 polyfill typings when tsc target=ES6
      'angular2/manual_typings/traceur-runtime.d.ts',
      'angular2/typings/es6-promise/**'
    ],
    destDir: '/'
  });

  var rxJs = new Funnel('node_modules/@reactivex', {include: ['**/**'], destDir: '/@reactivex'});

  var es5ModulesTree = new Funnel('modules', {
    include: ['**/**'],
    exclude: ['**/*.cjs', 'angular1_router/**', 'benchmarks/e2e_test/**'],
    destDir: '/'
  });

  var scriptPathPatternReplacement = {
    match: '@@FILENAME_NO_EXT',
    replacement: function(replacement, relativePath) {
      return relativePath.replace(/\.\w+$/, '').replace(/\\/g, '/');
    }
  };

  modulesTree = replace(modulesTree, {
    files: ["examples*/**/*.js"],
    patterns: [{match: /\$SCRIPTS\$/, replacement: jsReplace('SCRIPTS')}]
  });

  // Use TypeScript to transpile the *.ts files to ES6
  var es6Tree = compileWithTypescript(modulesTree, {
    allowNonTsExtensions: false,
    declaration: false,
    emitDecoratorMetadata: true,
    mapRoot: '',  // force sourcemaps to use relative path
    noEmitOnError: false,
    rootDir: '.',
    sourceMap: true,
    sourceRoot: '.',
    target: 'ES6'
  });

  // Use TypeScript to transpile the *.ts files to ES5
  var es5Tree = compileWithTypescript(es5ModulesTree, {
    allowNonTsExtensions: false,
    declaration: false,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    mapRoot: '',  // force sourcemaps to use relative path
    module: 'CommonJS',
    moduleResolution: 1 /* classic */,
    noEmitOnError: false,
    rootDir: '.',
    sourceMap: true,
    sourceRoot: '.',
    target: 'ES5'
  });

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

  var htmlTree = new Funnel(modulesTree, {include: ['*/src/**/*.html'], destDir: '/'});
  htmlTree = replace(htmlTree, {
    files: ['examples*/**/*.html'],
    patterns: [
      {match: /\$SCRIPTS\$/, replacement: htmlReplace('SCRIPTS')},
      scriptPathPatternReplacement
    ]
  });


  htmlTree = replace(htmlTree, {
    files: ['benchmarks/**'],
    patterns: [
      {match: /\$SCRIPTS\$/, replacement: htmlReplace('SCRIPTS_benchmarks')},
      scriptPathPatternReplacement
    ]
  });

  htmlTree = replace(htmlTree, {
    files: ['benchmarks_external/**'],
    patterns: [
      {match: /\$SCRIPTS\$/, replacement: htmlReplace('SCRIPTS_benchmarks_external')},
      scriptPathPatternReplacement
    ]
  });

  var assetsTree =
      new Funnel(modulesTree, {include: ['**/*'], exclude: ['**/*.{html,ts,dart}'], destDir: '/'});

  var scripts = mergeTrees(servingTrees);
  var polymerFiles = new Funnel('.', {
    files: [
      'bower_components/polymer/lib/polymer.html',
      'tools/build/snippets/url_params_to_form.js'
    ]
  });
  var polymer = stew.mv(flatten(polymerFiles), 'benchmarks_external/src/tree/polymer');

  var reactFiles = new Funnel('.', {files: ['node_modules/react/dist/react.min.js']});
  var react = stew.mv(flatten(reactFiles), 'benchmarks_external/src/tree/react');

  htmlTree = mergeTrees([htmlTree, scripts, polymer, react]);

  es5Tree = mergeTrees([es5Tree, htmlTree, assetsTree, rxJs]);
  es6Tree = mergeTrees([es6Tree, htmlTree, assetsTree, rxJs]);

  var mergedTree = mergeTrees([stew.mv(es6Tree, '/es6'), stew.mv(es5Tree, '/es5')]);

  return destCopy(mergedTree, destinationPath);
};
