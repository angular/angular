var fs = require('fs');
var path = require('path');

var mergeTrees = require('broccoli-merge-trees');
var Angular2App = require('angular-cli/lib/broccoli/angular2-app');
var BroccoliSass = require('broccoli-sass');
var broccoliAutoprefixer = require('broccoli-autoprefixer');

var autoprefixerOptions = require('./build/autoprefixer-options');

module.exports = function(defaults) {
  var demoAppCssTree = new BroccoliSass(['src/demo-app'], './demo-app.scss', 'demo-app/demo-app.css');
  var componentCssTree = getComponentsCssTree();
  var angularAppTree = new Angular2App(defaults);

  return mergeTrees([
    angularAppTree.toTree(),
    componentCssTree,
    demoAppCssTree,
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
        `./${component}.scss`,                             // Root scss input file
        `components/${component}/${fileName}.css`);        // Css output file
    }).concat(trees);
  }, []);

  return broccoliAutoprefixer(mergeTrees(componentCssTrees), autoprefixerOptions);
}
