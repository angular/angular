/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';

import {getRepoBaseDir} from '../../utils/config';
import {error} from '../../utils/console';

import {Formatter} from './base-formatter';

/**
 * Formatter for running buildifier against bazel related files.
 */
export class Buildifier extends Formatter {
  name = 'buildifier';

  binaryFilePath = join(getRepoBaseDir(), 'node_modules/.bin/buildifier');

  defaultFileMatcher = ['**/*.bzl', '**/BUILD.bazel', '**/WORKSPACE', '**/BUILD'];

  actions = {
    check: {
      commandFlags: `${BAZEL_WARNING_FLAG} --lint=warn --mode=check --format=json`,
      callback:
          (_: string, code: number, stdout: string) => {
            return code !== 0 || !(JSON.parse(stdout) as {success: string}).success;
          },
    },
    format: {
      commandFlags: `${BAZEL_WARNING_FLAG} --lint=fix --mode=fix`,
      callback:
          (file: string, code: number, _: string, stderr: string) => {
            if (code !== 0) {
              error(`Error running buildifier on: ${file}`);
              error(stderr);
              error();
              return true;
            }
            return false;
          }
    }
  };
}

// The warning flag for buildifier copied from angular/angular's usage.
const BAZEL_WARNING_FLAG = `--warnings=attr-cfg,attr-license,attr-non-empty,attr-output-default,` +
    `attr-single-file,constant-glob,ctx-args,depset-iteration,depset-union,dict-concatenation,` +
    `duplicated-name,filetype,git-repository,http-archive,integer-division,load,load-on-top,` +
    `native-build,native-package,output-group,package-name,package-on-top,positional-args,` +
    `redefined-variable,repository-name,same-origin-load,string-iteration,unused-variable`;
