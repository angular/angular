'use strict';
var fs = require('fs');
var path = require('path');

// Import the require hook. Enables us to require TS files natively.
require('ts-node/register');

const detect = require('./tools/build/dart').detect;

var mergeTrees = require('broccoli-merge-trees');
var Angular2App = require('angular-cli/lib/broccoli/angular2-app');
var BroccoliSass = require('broccoli-sass');
var broccoliAutoprefixer = require('broccoli-autoprefixer');

const BroccoliTs2Dart = require('./tools/broccoli/broccoli-ts2dart').default;
const BroccoliDartFmt = require('./tools/broccoli/broccoli-dartfmt').default;
const BroccoliFunnel = require('broccoli-funnel');

var autoprefixerOptions = require('./build/autoprefixer-options');

/**
 * Almost the same as using a plain string for a tree; but unlike a plain
 * string, Broccoli won't watch this. Used only internally.
 */
class UnwatchedTree {
  constructor(dir) { this.dir = dir; }
  read() { return this.dir; }
  cleanup() { /* DoNothing */ }
}


module.exports = function(defaults) {
  var demoAppCssTree = new BroccoliSass(['src/demo-app'], './demo-app.scss', 'demo-app/demo-app.css');
  var demoCssTree = getCssTree('demo-app');
  var componentCssTree = getCssTree('components');
  var mainCssTree = new BroccoliSass(['src', 'src/core/style'], './main.scss', 'main.css');
  var angularAppTree = new Angular2App(defaults, {
    vendorNpmFiles: []
  });

  var dartAppTree = getDartTree('src/');
  return mergeTrees([
    angularAppTree.toTree(),
    componentCssTree,
    mainCssTree,
    demoAppCssTree,
    demoCssTree
  ].concat(dartAppTree || []));
};

/** Gets the Dart tree - Transpile Dart files and format them afterward. */
function getDartTree(root) {
  const dartSDK = detect();
  if (!dartSDK) {
    console.warn('---------------------------------------');
    console.warn('You do not have the Dart SDK installed.');
    console.warn('In order to contribute to this repo, please refer to');
    console.warn('https://github.com/angular/material2/blob/master/CONTRIBUTING.md');
    console.warn('');
    console.warn('You can still build and serve the demo app without dart support.');
    return null;
  }

  const ts2dart = new BroccoliTs2Dart([root], {
    generateLibraryName: true,
    generateSourceMap: false,
    translateBuiltins: true,
    basePath: path.join(__dirname, root),
    typingsRoot: '../typings/browser/ambient/',
    additionalFiles: [path.join(process.cwd(), root, 'typings.d.ts')]
  });

  const formatter = new BroccoliDartFmt([ts2dart], { dartSDK });

  const dartSources = new BroccoliFunnel(root, {
    include: ['**/*.dart'],
    destDir: 'dart/lib',
  });

  const allDartFiles = mergeTrees([
    dartSources,
    formatter
  ]);

  const pubSpecTree = new BroccoliFunnel(new UnwatchedTree('.'), {
    files: ['pubspec.yaml'],
    destDir: 'dart'
  });

  // Publishes the Dart files and pubspec inside a
  return mergeTrees([
    pubSpecTree,
    new BroccoliFunnel(formatter, { destDir: 'dart/lib' }),
    allDartFiles
  ]);
}

/** Gets the tree for all of the components' CSS. */
function getCssTree(folder) {
  var srcPath = `src/${folder}/`;
  var components = fs.readdirSync(srcPath)
    .filter(file => fs.statSync(path.join(srcPath, file)).isDirectory());

  var componentCssTrees = components.reduce((trees, component) => {
    // We want each individual scss file to be compiled into a corresponding css file
    // so that they can be individually included in styleUrls.
    var scssFiles = fs.readdirSync(path.join(srcPath, component))
        .filter(file => path.extname(file) === '.scss')
        .map(file => path.basename(file, '.scss'));

    return scssFiles.map(fileName => {
      return BroccoliSass(
          [`${srcPath}/${component}`, 'src/core/style'], // Directories w/ scss sources
          `./${fileName}.scss`,                              // Root scss input file
          `${folder}/${component}/${fileName}.css`);        // Css output file
    }).concat(trees);
  }, []);
  return broccoliAutoprefixer(mergeTrees(componentCssTrees), autoprefixerOptions);
}
