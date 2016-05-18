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
  // The Angular Application tree.
  const appTree = _buildAppTree(defaults);

  // The CSS tree that is auto prefixed with browser support.
  const cssAutoprefixed = autoPrefixerTree(new Funnel(appTree, {
    include: [ '**/*.css' ]
  }));

  return new MergeTree([appTree, cssAutoprefixed], { overwrite: true });
};


/**
 * Build the Broccoli Tree containing all the files used as the input to the Angular2App.
 */
function _buildDemoAppInputTree() {
  return new MergeTree([
    new Funnel('typings', {
      destDir: 'typings'
    }),
    new Funnel('src', {
      include: ['components/**/*', 'core/**/*'],
      destDir: 'src/demo-app'
    }),
    new Funnel('src/demo-app', {
      destDir: 'src/demo-app'
    })
  ]);
}

/**
 * Build the Broccoli Tree that contains the Angular2 App. This picks between E2E, Example or Demo
 * app.
 * @param defaults The default objects from AngularCLI (deprecated).
 * @returns {Angular2App}
 */
function _buildAppTree(defaults) {
  let inputNode = _buildDemoAppInputTree();

  return new Angular2App(defaults, inputNode, {
    sourceDir: 'src/demo-app',
    tsCompiler: {
    },
    sassCompiler: {
      includePaths: [
        'src/core/style'
      ]
    },
    vendorNpmFiles: [
      'systemjs/dist/system-polyfills.js',
      'systemjs/dist/system.src.js',
      'zone.js/dist/*.js',
      'es6-shim/es6-shim.js',
      'reflect-metadata/*.js',
      'rxjs/**/*.js',
      '@angular/**/*.js'
    ]
  });
}
