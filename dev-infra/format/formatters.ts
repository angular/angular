/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';
import {getAngularDevConfig, getRepoBaseDir} from '../utils/config';
import {FormatConfig} from './config';

// A callback function to determine if the result of the formatter shows the file as failing.
export type CallbackFunc = (file: string, code: number, stdout: string, stderr: string) => boolean;

// The metadata of a formatter needed for execution of the formatter on files.
export interface FormatterMetadata {
  name: string;
  matcher: () => string[];
  commands: {
    format: string,
    check: string,
  };
  callbacks: {
    format: CallbackFunc,
    check: CallbackFunc,
  };
}


/**
 * Bazel formatter
 *
 * This formatter is meant to format files related to bazel, notably BUILD, .bazel,
 * .bzl and WORKSPACE files.
 */
// The warning flag for buildifier copied from angular/angular's usage.
const BAZEL_WARNING_FLAG = `--warnings=attr-cfg,attr-license,attr-non-empty,attr-output-default,` +
    `attr-single-file,constant-glob,ctx-args,depset-iteration,depset-union,dict-concatenation,` +
    `duplicated-name,filetype,git-repository,http-archive,integer-division,load,load-on-top,` +
    `native-build,native-package,output-group,package-name,package-on-top,positional-args,` +
    `redefined-variable,repository-name,same-origin-load,string-iteration,unused-variable`;

// Path to the binary for formatting bazel related files.
const BAZEL_BINARY = join(getRepoBaseDir(), 'node_modules/.bin/buildifier');

// Formatter metadata for formatting bazel related files.
export const BAZEL_FORMATTER: FormatterMetadata = {
  name: 'buildifier',
  matcher: () => {
    let matcher = ['**/*.bzl', '**/BUILD.bazel', '**/WORKSPACE', '**/BUILD'];
    try {
      matcher = getAngularDevConfig<'format', FormatConfig>().format.matchers.bazel || matcher;
    } catch {
    }
    return matcher;
  },
  commands: {
    check: `${BAZEL_BINARY} ${BAZEL_WARNING_FLAG} --lint=warn --mode=check --format=json`,
    format: `${BAZEL_BINARY} ${BAZEL_WARNING_FLAG} --lint=fix --mode=fix`,
  },
  callbacks: {
    check: (_, code, stdout) => {
      return code !== 0 || !JSON.parse(stdout)['success'];
    },
    format: (file, code, _, stderr) => {
      if (code !== 0) {
        console.error(`Error running buildifier on: ${file}`);
        console.error(stderr);
        console.error();
        return true;
      }
      return false;
    }
  },
};

/**
 * Javascript/Typescript formatter
 *
 * This formatter is meant to format Javscript and Typescript files.
 */
// Path to the binary for formatting Javascript and Typescript files.
const JS_TS_BINARY = join(getRepoBaseDir(), 'node_modules/.bin/clang-format');

// Formatter metadata for formatting Javascript and Typescript files.
export const JS_TS_FORMATTER: FormatterMetadata = {
  name: 'clang-format',
  matcher: () => {
    let matcher = ['**/*.{t,j}s'];
    try {
      matcher = getAngularDevConfig<'format', FormatConfig>().format.matchers.jsTs || matcher;
    } catch {
    }
    return matcher;
  },
  commands: {
    check: `${JS_TS_BINARY} --Werror -n -style=file`,
    format: `${JS_TS_BINARY} -i -style=file`,
  },
  callbacks: {
    check: (_, code) => {
      return code !== 0;
    },
    format: (file, code, _, stderr) => {
      if (code !== 0) {
        console.error(`Error running clang-format on: ${file}`);
        console.error(stderr);
        console.error();
        return true;
      }
      return false;
    }
  },
};
