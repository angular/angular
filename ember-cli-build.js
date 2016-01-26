var fs = require('fs');
var path = require('path');

// Import the require hook. Enables us to require TS files natively.
require('ts-node/register');

var mergeTrees = require('broccoli-merge-trees');
var Angular2App = require('angular-cli/lib/broccoli/angular2-app');
var BroccoliSass = require('broccoli-sass');
var broccoliAutoprefixer = require('broccoli-autoprefixer');
var BroccoliTs2Dart = require('./tools/broccoli/broccoli-ts2dart').default;

var autoprefixerOptions = require('./build/autoprefixer-options');

module.exports = function(defaults) {
  var demoAppCssTree = new BroccoliSass(['src/demo-app'], './demo-app.scss', 'demo-app/demo-app.css');
  var componentCssTree = getComponentsCssTree();
  var angularAppTree = new Angular2App(defaults);
  var dartAppTree = new BroccoliTs2Dart('src/', {
    generateLibraryName: true,
    generateSourceMap: false,
    translateBuiltins: true,
  });

  return mergeTrees([
    angularAppTree.toTree(),
    componentCssTree,
    demoAppCssTree,
    dartAppTree,
  ]);
};


/** Gets the tree for all of the components' CSS. */
function getComponentsCssTree() {
  // Assume that the list of components is all directories in `src/components/`
  var componentsSrc = 'src/components/';
  var components = fs.readdirSync(componentsSrc)
      .filter(file => fs.statSync(path.join(componentsSrc, file)).isDirectory());

  var componentCssTrees = components.reduce((trees, component) => {
    // We want each individual scss file to be compiled into a corresponding css file
    // so that they can be individually included in styleUrls.
    var scssFiles = fs.readdirSync(path.join(componentsSrc, component))
        .filter(file => path.extname(file) === '.scss')
        .map(file => path.basename(file, '.scss'));

    return scssFiles.map(fileName => {
      return BroccoliSass(
        [`src/components/${component}`, 'src/core/style'], // Directories w/ scss sources
        `./${fileName}.scss`,                              // Root scss input file
        `components/${component}/${fileName}.css`);        // Css output file
    }).concat(trees);
  }, []);

  return broccoliAutoprefixer(mergeTrees(componentCssTrees), autoprefixerOptions);
}
