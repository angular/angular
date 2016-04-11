'use strict';
const fs = require('fs');
const path = require('path');

// Import the require hook. Enables us to require TS files natively.
require('ts-node/register');


const Angular2App = require('angular-cli/lib/broccoli/angular2-app');
const Funnel = require('broccoli-funnel');
const MergeTree = require('broccoli-merge-trees');
const autoPrefixerTree = require('broccoli-autoprefixer');


module.exports = function(defaults) {
  var angularAppTree = new Angular2App(defaults, {
    sourceDir: 'src/',
    sassCompiler: {
      includePaths: [
        'src/core/style'
      ]
    },
    vendorNpmFiles: []
  });

  const ngTree = angularAppTree.toTree();
  const cssAutoprefixed = autoPrefixerTree(new Funnel(ngTree, {
    include: [ '**/*.css' ]
  }));

  return new MergeTree([
    new Funnel('src', { include: ['**/*.scss']}),
    angularAppTree.toTree(),
    cssAutoprefixed
  ], { overwrite: true });
};
