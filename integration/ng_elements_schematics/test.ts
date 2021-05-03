#!/usr/bin/env node

import {cd, exec, rm, set} from 'shelljs';
import * as fs from 'fs';

// Fail on first error
set('-e');

// Install Angular packages that are built locally from HEAD.
// This also gets around the bug whereby yarn caches local `file://` urls.
// See https://github.com/yarnpkg/yarn/issues/2165
// The below packages are all required in a default CLI project.
const ngPackages = [
  'animations',
  'core',
  'common',
  'compiler',
  'forms',
  'platform-browser',
  'platform-browser-dynamic',
  'router',
  'compiler-cli',
  'language-service',
];

// Keep typescript, tslib, and @types/node versions in sync with the ones used in this repo
const nodePackages = [
  '@types/node',
  'tslib',
  'typescript',
];

// Under Bazel integration tests are sand-boxed and cannot reference
// reference `../../dist/*` packages and should not do so as these are not
// inputs to the test. The npm_integeration_test rule instead provides a manifest
// file that contains all of the npm package mappings available to the test.
const bazelMappings: { [key: string]: string } = fs.existsSync('NPM_PACKAGE_MANIFEST.json') ? require('./NPM_PACKAGE_MANIFEST.json') : {};

const packages: { [key: string]: string } = {};
for (let p of ngPackages) {
  const n = `@angular/${p}`;
  packages[n] = `file:${bazelMappings[n]}` || `file:${__dirname}/../../dist/packages-dist/${p}`;
}
for (let p of nodePackages) {
  packages[p] = `file:${bazelMappings[p]}` || `file:${__dirname}/../../node_modules/${p}`;
}

// Clean up previously run test
cd(__dirname);
rm('-rf', `demo`);

// Set up demo project
exec('ng version');
exec('ng new demo --skip-git --skip-install --style=css --no-interactive');
cd('demo');
// Use a local yarn cache folder so we don't access the global yarn cache
exec('mkdir .yarn_local_cache');

// Install Angular packages that are built locally from HEAD and npm packages
// from root node modules that are to be kept in sync
const packageList = Object.keys(packages).map(p => `${p}@${packages[p]}`).join(' ');
exec(`yarn add --ignore-scripts --silent ${packageList} --cache-folder ./.yarn_local_cache`);

// Add @angular/elements
const schematicPath = bazelMappings
  ? `${bazelMappings['@angular/elements']}`
  : `${__dirname}/../../dist/packages-dist/elements`;

exec(`ng add "${schematicPath}" --skip-confirmation`);

// Test that build is successful after adding elements
exec('ng build --no-source-map --configuration=development');
