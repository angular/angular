/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* tslint:disable:no-console  */
import {spawn} from 'child_process';
import {existsSync, mkdirSync, writeFileSync} from 'fs';

import {TSC, TscWatch, reportError} from './tsc_watch';

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
const BaseConfig = {
  start: 'File change detected. Starting incremental compilation...',
  error: 'error',
  complete: 'Compilation complete. Watching for file changes.'
};

if (platform == 'node') {
  tscWatch = new TscWatch(Object.assign(
      {
        tsconfig: 'packages/tsconfig.json',
        onChangeCmds: [[
          'node', 'dist/tools/cjs-jasmine', '--', '@angular/**/*_spec.js',
          '@angular/compiler-cli/test/**/*_spec.js', '@angular/benchpress/test/**/*_spec.js'
        ]]
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
} else if (platform == 'tools') {
  tscWatch = new TscWatch(Object.assign(
      {
        tsconfig: 'tools/tsconfig.json',
        onChangeCmds: [[
          'node', 'dist/tools/cjs-jasmine/index-tools', '--',
          '@angular/tsc-wrapped/**/*{_,.}spec.js'
        ]]
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
