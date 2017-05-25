/**
 * Entry point for the Firebase functions of the Screenshot tool. Firebase functions only support
 * JavaScript files and therefore the TypeScript files needs to be transpiled. Using ts-node
 * seems to be more elegant for now, because Firebase requires the `node_modules` to be copied
 * to the output directory and when using TSC the `node_modules` won't be copied to the destination.
 */

'use strict';

const path = require('path');

// Enable TypeScript compilation at runtime using ts-node.
require('ts-node').register({
  project: path.join(__dirname, 'tsconfig.json')
});

const functionExports = require('./screenshot-functions');

// Re-export every firebase function from TypeScript
Object.keys(functionExports).forEach(fnName => {
  module.exports[fnName] = functionExports[fnName];
});
