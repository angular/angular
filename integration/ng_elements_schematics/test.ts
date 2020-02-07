#!/usr/bin/env node

import {cd, exec, rm, set} from 'shelljs';

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
].map(p => `"@angular/${p}@file:${__dirname}/../../dist/packages-dist/${p}"`);

// Keep typescript, tslib, and @types/node versions in sync with the ones used in this repo
const nodePackages = [
  '@types/node',
  'tslib',
  'typescript',
].map(p => `"${p}@file:${__dirname}/../../node_modules/${p}"`);

const packages = [
  ...ngPackages,
  ...nodePackages,
].join(' ');

// Clean up previously run test
cd(__dirname);
rm('-rf', `demo`);

// Set up demo project
exec('ng version');
exec('ng new demo --skip-git --skip-install --style=css --no-interactive');
cd('demo');

// Install Angular packages that are built locally from HEAD
exec(`yarn add --ignore-scripts --silent ${packages}`);

// Add @angular/elements
exec(`ng add "${__dirname}/../../dist/packages-dist/elements"`);

// Test that build is successful after adding elements
exec('ng build --no-source-map');
