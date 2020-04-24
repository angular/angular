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

// Default configuration for any fields not provided.
const DEFAULT_CONFIG: FormatConfig = {
  matchers: {
    bazel: ['**/*.bzl', '**/BUILD.bazel', '**/WORKSPACE', '**/BUILD'],
    jsTs: ['**/*.{t,j}s'],
  },
};

// Active config used for execution, created from a merge of the default
// config with the loaded config.
const config: FormatConfig = {
  matchers: {},
  ...getAngularDevConfig<'format', FormatConfig>().format
};

// The metadata of a formatter needed for execution of the formatter on files.
export interface FormatterMetadata {
  name: string;
  matcher: string[];
  commands: {
    format: string,
    check: string,
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
  matcher: config.matchers.bazel || DEFAULT_CONFIG.matchers.bazel || [],
  commands: {
    check: `${BAZEL_BINARY} ${BAZEL_WARNING_FLAG} --lint=warn --mode=check --format=json`,
    format: `${BAZEL_BINARY} ${BAZEL_WARNING_FLAG} --lint=fix --mode=fix`,
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
  matcher: config.matchers.jsTs || DEFAULT_CONFIG.matchers.jsTs || [],
  commands: {
    check: `${JS_TS_BINARY} --Werror -n -style=file`,
    format: `${JS_TS_BINARY} -i -style=file`,
  },
};
