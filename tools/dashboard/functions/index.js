/**
 * Entry point for the Firebase functions of the dashboard app. Firebase functions only support
 * JavaScript files and therefore the TypeScript files needs to be transpiled.
 */

'use strict';

const path = require('path');

// Enable TypeScript compilation at runtime using ts-node.
require('ts-node').register({
  project: path.join(__dirname, 'tsconfig.json')
});

// Export all functions from the TypeScript source.
Object.assign(exports, require('./functions'));
