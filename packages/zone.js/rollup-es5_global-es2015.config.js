const node = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const banner = `/**
* @license Angular v0.0.0-PLACEHOLDER
* (c) 2010-2019 Google LLC. https://angular.io/
* License: MIT
*/`;

module.exports = {
  plugins: [
    node({
      mainFields: ['es2015', 'module', 'jsnext:main', 'main'],
    }),
    commonjs(),
  ],
  output: {name: 'Zone', banner},
}
