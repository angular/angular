#!/usr/bin/env node

import * as shx from 'shelljs';

// Install Angular packages that are built locally from HEAD.
// This also gets around the bug whereby yarn caches local `file://` urls.
// See https://github.com/yarnpkg/yarn/issues/2165
const pwd = process.cwd();
const ngPackages = [
  'animations',
  'common',
  'compiler',
  'forms',
  'platform-browser',
  'platform-browser-dynamic',
  'router',
  'elements',
  'compiler-cli',
  'language-service',
].map(p => `"@angular/${p}@file:${pwd}/../../dist/packages-dist/${p}"`);

// Keep typescript, tslib, and @types/node versions in sync with the ones used in this repo
const nodePackages = [
  '@types/node',
  'tslib',
  'typescript',
].map(p => `"${p}@file:${pwd}/../../node_modules/${p}"`);

const packages = [
  ...ngPackages,
  ...nodePackages,
].join(' ');

// Clean up previously run test
shx.rm('-rf', 'demo');

// Set up demo project.
shx.exec('ng version');
shx.exec('ng new demo --skip-git --skip-install --style=css');
shx.cd('demo');

// Add @angular/elements
shx.exec('ng add "../../../dist/packages-dist/elements"');

// Install Angular packages that are built locally from HEAD.
shx.exec(`yarn add --ignore-scripts --silent ${packages}`);

// Test that build is successful after adding elements.
shx.exec('ng build --no-source-map');
