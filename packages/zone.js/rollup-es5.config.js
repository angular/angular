const node = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

// Parse the stamp file produced by Bazel from the version control system
let version = '<unknown>';
if (bazel_stamp_file) {
  const versionTag = require('fs')
                         .readFileSync(bazel_stamp_file, {encoding: 'utf-8'})
                         .split('\n')
                         .find(s => s.startsWith('BUILD_SCM_VERSION'));
  // Don't assume BUILD_SCM_VERSION exists
  if (versionTag) {
    version = versionTag.split(' ')[1].trim();
  }
}

const banner = `/**
* @license Angular v${version}
* (c) 2010-2020 Google LLC. https://angular.io/
* License: MIT
*/`;

module.exports = {
  plugins: [
    node({
      mainFields: ['es2015', 'module', 'jsnext:main', 'main'],
    }),
    commonjs(),
  ],
  external: id => {
    if (/build-esm/.test(id)) {
      return false;
    }
    return /rxjs/.test(id) || /electron/.test(id);
  },
  output: {
    globals: {
      electron: 'electron',
      'rxjs/Observable': 'Rx',
      'rxjs/Subscriber': 'Rx',
      'rxjs/Subscription': 'Rx',
      'rxjs/Scheduler': 'Rx.Scheduler',
      'rxjs/scheduler/asap': 'Rx.Scheduler',
      'rxjs/scheduler/async': 'Rx.Scheduler',
      'rxjs/symbol/rxSubscriber': 'Rx.Symbol'
    },
    banner
  },
}
