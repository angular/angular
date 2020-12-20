/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable:no-console

// TODO(alexeagle): why not import chalk from 'chalk'?
// Something to do with TS default export in UMD emit...
const chalk = require('chalk');
import * as minimist from 'minimist';
import * as path from 'path';

import {SerializationOptions, generateGoldenFile, verifyAgainstGoldenFile, discoverAllEntrypoints} from './main';

/** Name of the CLI */
const CMD = 'ts-api-guardian';

/** Name of the Bazel workspace that runs the CLI. */
const bazelWorkspaceName = process.env.BAZEL_WORKSPACE;
/**
 * Path to the Bazel workspace directory. Only set if the CLI is run with `bazel run`.
 * https://docs.bazel.build/versions/master/user-manual.html#run.
 */
const bazelWorkspaceDirectory = process.env.BUILD_WORKSPACE_DIRECTORY;
/**
 * Regular expression that matches Bazel manifest paths that start with the
 * current Bazel workspace, followed by a path delimiter.
 */
const bazelWorkspaceManifestPathRegex =
    bazelWorkspaceName ? new RegExp(`^${bazelWorkspaceName}[/\\\\]`) : null;

export function startCli() {
  const {argv, mode, errors} = parseArguments(process.argv.slice(2));

  const options: SerializationOptions = {
    stripExportPattern: [].concat(argv['stripExportPattern']),
    allowModuleIdentifiers: [].concat(argv['allowModuleIdentifiers']),
  };

  // Since the API guardian can be also used by other projects, we should not set up the default
  // Angular project tag rules unless specified explicitly through a given option.
  if (argv['useAngularTagRules']) {
    options.exportTags = {
      requireAtLeastOne: ['publicApi', 'codeGenApi'],
      banned: ['experimental'],
      toCopy: ['deprecated', 'codeGenApi']
    };
    options.memberTags = {
      requireAtLeastOne: [],
      banned: ['experimental', 'publicApi', 'codeGenApi'],
      toCopy: ['deprecated']
    };
    options.paramTags = {
      requireAtLeastOne: [],
      banned: ['experimental', 'publicApi', 'codeGenApi'],
      toCopy: ['deprecated']
    };
  }

  // In autoDiscoverEntrypoints mode we set the inputed files as the discovered entrypoints
  // for the rootDir
  let entrypoints: string[];
  if (argv['autoDiscoverEntrypoints']) {
    entrypoints = discoverAllEntrypoints(argv['rootDir']);
  } else {
    entrypoints = argv._.slice();
  }

  for (const error of errors) {
    console.warn(error);
  }

  if (mode === 'help') {
    printUsageAndExit(!!errors.length);
  } else {
    const targets = resolveFileNamePairs(argv, mode, entrypoints);

    if (mode === 'out') {
      for (const {entrypoint, goldenFile} of targets) {
        generateGoldenFile(entrypoint, goldenFile, options);
      }
    } else {  // mode === 'verify'
      let hasDiff = false;

      for (const {entrypoint, goldenFile} of targets) {
        const diff = verifyAgainstGoldenFile(entrypoint, goldenFile, options);
        if (diff) {
          hasDiff = true;
          const lines = diff.split('\n');
          if (lines.length) {
            lines.pop();  // Remove trailing newline
          }
          for (const line of lines) {
            const chalkMap:
                {[key: string]: any} = {'-': chalk.red, '+': chalk.green, '@': chalk.cyan};
            const chalkFunc = chalkMap[line[0]] || chalk.reset;
            console.log(chalkFunc(line));
          }
        }
      }

      if (hasDiff) {
        const bazelTarget = process.env['BAZEL_TARGET'];
        // Under bazel, give instructions how to use bazel run to accept the golden file.
        if (bazelTarget) {
          console.error('\n\nIf you modify a public API, you must accept the new golden file.');
          console.error('\n\nTo do so, execute the following Bazel target:');
          console.error(`  yarn bazel run ${bazelTarget.replace(/_bin$/, '')}.accept`);
          if (process.env['TEST_WORKSPACE'] === 'angular') {
            console.error('\n\nFor more information, see');
            console.error(
                '\n  https://github.com/angular/angular/blob/master/docs/PUBLIC_API.md#golden-files');
          }
        }

        process.exit(1);
      }
    }
  }
}

export function parseArguments(input: string[]):
    {argv: minimist.ParsedArgs, mode: string, errors: string[]} {
  let help = false;
  const errors: string[] = [];

  const argv = minimist(input, {
    string: [
      'out', 'outDir', 'verify', 'verifyDir', 'rootDir', 'stripExportPattern',
      'allowModuleIdentifiers'
    ],
    boolean: [
      'help', 'useAngularTagRules', 'autoDiscoverEntrypoints',
      // Options used by chalk automagically
      'color', 'no-color'
    ],
    alias: {'outFile': 'out', 'verifyFile': 'verify'},
    unknown: (option: string) => {
      if (option[0] === '-') {
        errors.push(`Unknown option: ${option}`);
        help = true;
        return false;  // do not add to argv._
      } else {
        return true;  // add to argv._
      }
    }
  });

  help = help || argv['help'];

  if (help) {
    return {argv, mode: 'help', errors};
  }

  let modes: string[] = [];

  if (argv['out']) {
    modes.push('out');
  }
  if (argv['outDir']) {
    modes.push('out');
  }
  if (argv['verify']) {
    modes.push('verify');
  }
  if (argv['verifyDir']) {
    modes.push('verify');
  }

  if (argv['autoDiscoverEntrypoints']) {
    if (!argv['rootDir']) {
      errors.push(`--rootDir must be provided with --autoDiscoverEntrypoints.`);
      modes = ['help'];
    }
    if (!argv['outDir'] && !argv['verifyDir']) {
      errors.push(`--outDir or --verifyDir must be used with --autoDiscoverEntrypoints.`);
      modes = ['help'];
    }
  } else {
    if (!argv._.length) {
      errors.push('No input file specified.');
      modes = ['help'];
    } else if (modes.length !== 1) {
      errors.push('Specify either --out[Dir] or --verify[Dir]');
      modes = ['help'];
    } else if (argv._.length > 1 && !argv['outDir'] && !argv['verifyDir']) {
      errors.push(`More than one input specified. Use --${modes[0]}Dir instead.`);
      modes = ['help'];
    }
  }

  return {argv, mode: modes[0], errors};
}

function printUsageAndExit(error = false) {
  const print = error ? console.warn.bind(console) : console.log.bind(console);
  print(`Usage:  ${CMD} [options] <file ...>
        ${CMD} --out <output file> <entrypoint .d.ts file>
        ${CMD} --outDir <output dir> [--rootDir .] <entrypoint .d.ts files>

        ${CMD} --verify <golden file> <entrypoint .d.ts file>
        ${CMD} --verifyDir <golden file dir> [--rootDir .] <entrypoint .d.ts files>

Options:
        --help                          Show this usage message

        --out <file>                    Write golden output to file
        --outDir <dir>                  Write golden file structure to directory

        --verify <file>                 Read golden input from file
        --verifyDir <dir>               Read golden file structure from directory

        --rootDir <dir>                 Specify the root directory of input files

        --useAngularTagRules <boolean>  Whether the Angular specific tag rules should be used.
        --stripExportPattern <regexp>   Do not output exports matching the pattern
        --allowModuleIdentifiers <identifier>
                                        Allow identifier for "* as foo" imports
        --autoDiscoverEntrypoints       Automatically find all entrypoints .d.ts files in the rootDir`);
  process.exit(error ? 1 : 0);
}

/**
 * Resolves a given path in the file system. If `ts-api-guardian` runs with Bazel, file paths
 * are resolved through runfiles. Additionally in Bazel, this method handles the case where
 * manifest file paths are not existing, but need to resolve to the Bazel workspace directory.
 * This happens commonly when goldens are approved, but the golden file does not exist yet.
 */
function resolveFilePath(fileName: string): string {
  // If an absolute path is specified, the path is already resolved.
  if (path.isAbsolute(fileName)) {
    return fileName;
  }
  // Outside of Bazel, file paths are resolved based on the current working directory.
  if (!bazelWorkspaceName) {
    return path.resolve(fileName);
  }
  // In Bazel, we first try to resolve the file through the runfiles. We do this by calling
  // the `require.resolve` function that is patched by the Bazel NodeJS rules. Note that we
  // need to catch errors because files inside tree artifacts cannot be resolved through
  // runfile manifests. Hence, we need to have alternative resolution logic when resolving
  // file paths. Additionally, it could happen that manifest paths which aren't part of the
  // runfiles are specified (i.e. golden is approved but does not exist in the workspace yet).
  try {
    return require.resolve(fileName);
  } catch {
  }
  // This handles cases where file paths cannot be resolved through runfiles. This happens
  // commonly when goldens are approved while the golden does not exist in the workspace yet.
  // In those cases, we want to build up a relative path based on the manifest path, and join
  // it with the absolute bazel workspace directory (which is only set in `bazel run`).
  // e.g. `angular/goldens/<..>/common` should become `{workspace_dir}/goldens/<...>/common`.
  if (bazelWorkspaceManifestPathRegex !== null && bazelWorkspaceDirectory &&
      bazelWorkspaceManifestPathRegex.test(fileName)) {
    return path.join(bazelWorkspaceDirectory, fileName.substr(bazelWorkspaceName.length + 1));
  }
  throw Error(`Could not resolve file path in runfiles: ${fileName}`);
}

function resolveFileNamePairs(argv: minimist.ParsedArgs, mode: string, entrypoints: string[]):
    {entrypoint: string, goldenFile: string}[] {
  if (argv[mode]) {
    return [{
      entrypoint: resolveFilePath(entrypoints[0]),
      goldenFile: resolveFilePath(argv[mode]),
    }];
  } else {  // argv[mode + 'Dir']
    let rootDir = argv['rootDir'] || '.';
    const goldenDir = argv[mode + 'Dir'];

    return entrypoints.map((fileName: string) => {
      return {
        entrypoint: resolveFilePath(fileName),
        goldenFile: resolveFilePath(path.join(goldenDir, path.relative(rootDir, fileName))),
      };
    });
  }
}
