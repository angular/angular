/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* tslint:disable:no-console  */
import {existsSync, mkdirSync} from 'fs';

import {TscWatch} from './tsc_watch';

export * from './tsc_watch';
import 'reflect-metadata';

function md(dir: string, folders: string[]) {
  if (folders.length) {
    const next = folders.shift();
    const path = dir + '/' + next;
    if (!existsSync(path)) {
      mkdirSync(path);
    }
    md(path, folders);
  }
}

let tscWatch: TscWatch = null;
const platform = process.argv.length >= 3 ? process.argv[2] : null;
const runMode: string = process.argv.length >= 4 ? process.argv[3] : null;
const debugMode = process.argv.some(arg => arg === '--debug');
const BaseConfig = {
  start: 'File change detected. Starting incremental compilation...',
  // This regex uses a negative lookbehind group (?<! 0 ), which causes it to not match a string
  // containing " 0 error" but to match anything else containing "error". It requires the --harmony
  // flag to run under node versions < 9.
  error: /(?<! 0 )error/,
  complete: 'Found 0 errors. Watching for file changes.',
};

if (platform == 'node') {
  const specFiles = ['@angular/**/*_spec.js'];
  tscWatch = new TscWatch(Object.assign(
      {
        tsconfig: 'packages/tsconfig.json',
        onChangeCmds: [createNodeTestCommand(specFiles, debugMode)]
      },
      BaseConfig));
} else if (platform == 'browser') {
  tscWatch = new TscWatch(Object.assign(
      {
        tsconfig: 'packages/tsconfig.json',
        onStartCmds: [
          [
            'node', 'node_modules/karma/bin/karma', 'start', '--no-auto-watch', '--port=9876',
            'karma-js.conf.js'
          ],
          [
            'node', 'node_modules/karma/bin/karma', 'start', '--no-auto-watch', '--port=9877',
            'packages/router/karma.conf.js'
          ],
        ],
        onChangeCmds: [
          ['node', 'node_modules/karma/bin/karma', 'run', 'karma-js.conf.js', '--port=9876'],
          ['node', 'node_modules/karma/bin/karma', 'run', '--port=9877'],
        ]
      },
      BaseConfig));
} else if (platform == 'router') {
  tscWatch = new TscWatch(Object.assign(
      {
        tsconfig: 'packages/tsconfig.json',
        onStartCmds: [
          [
            'node', 'node_modules/karma/bin/karma', 'start', '--no-auto-watch', '--port=9877',
            'packages/router/karma.conf.js'
          ],
        ],
        onChangeCmds: [
          ['node', 'node_modules/karma/bin/karma', 'run', '--port=9877'],
        ]
      },
      BaseConfig));
} else if (platform == 'browserNoRouter') {
  tscWatch = new TscWatch(Object.assign(
      {
        tsconfig: 'packages/tsconfig.json',
        onStartCmds: [[
          'node', 'node_modules/karma/bin/karma', 'start', '--no-auto-watch', '--port=9876',
          'karma-js.conf.js'
        ]],
        onChangeCmds: [
          ['node', 'node_modules/karma/bin/karma', 'run', 'karma-js.conf.js', '--port=9876'],
        ]
      },
      BaseConfig));
} else {
  throw new Error(`unknown platform: ${platform}`);
}

if (runMode === 'watch') {
  tscWatch.watch();
} else if (runMode === 'runCmdsOnly') {
  tscWatch.runCmdsOnly();
} else {
  tscWatch.run();
}

function createNodeTestCommand(specFiles: string[], debugMode: boolean) {
  return ['node']
      .concat(debugMode ? ['--inspect'] : [])
      .concat('dist/tools/cjs-jasmine', '--')
      .concat(specFiles);
}
