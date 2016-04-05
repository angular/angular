'use strict';
const fs = require('fs');
const path = require('path');

// Import the require hook. Enables us to require TS files natively.
require('ts-node/register');

const mergeTrees = require('broccoli-merge-trees');
const BroccoliFunnel = require('broccoli-funnel');
const Angular2App = require('angular-cli/lib/broccoli/angular2-app');
const BroccoliSass = require('broccoli-sass');
const broccoliAutoprefixer = require('broccoli-autoprefixer');
const autoprefixerOptions = require('./build/autoprefixer-options');


module.exports = function(defaults) {
  var demoAppCssTree = new BroccoliSass(['src/demo-app'], './demo-app.scss', 'demo-app/demo-app.css');
  var demoCssTree = getCssTree('demo-app');
  var componentCssTree = getCssTree('components');
  var mainCssTree = new BroccoliSass(['src', 'src/core/style'], './main.scss', 'main.css');
  var angularAppTree = new Angular2App(defaults, {
    vendorNpmFiles: []
  });

  return mergeTrees([
    angularAppTree.toTree(),
    componentCssTree,
    mainCssTree,
    demoAppCssTree,
    demoCssTree
  ]);
};

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
