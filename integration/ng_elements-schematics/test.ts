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

shx.exec('ng version');
shx.rm('-rf', 'demo');
shx.exec('ng new demo --skip-git --skip-install --style=css');
shx.cd('demo');
shx.exec('ng add @angular/elements');
shx.exec(`yarn add --ignore-scripts --silent ${packages}`);
shx.exec('ng build');
