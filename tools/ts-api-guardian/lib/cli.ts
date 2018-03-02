import chalk from 'chalk';
import * as minimist from 'minimist';
import {ParsedArgs} from 'minimist';
import * as path from 'path';

import {SerializationOptions, generateGoldenFile, verifyAgainstGoldenFile} from './main';

// Examples:
//
// ```sh
// # Generate one declaration file
// ts-api-guardian --out api_guard.d.ts index.d.ts
//
// # Generate multiple declaration files // # (output location like typescript)
// ts-api-guardian --outDir api_guard [--rootDir .] core/index.d.ts core/testing.d.ts
//
// # Print usage
// ts-api-guardian --help
//
// # Check against one declaration file
// ts-api-guardian --verify api_guard.d.ts index.d.ts
//
// # Check against multiple declaration files
// ts-api-guardian --verifyDir api_guard [--rootDir .] core/index.d.ts core/testing.d.ts
// ```

const CMD = 'ts-api-guardian';

export function startCli() {
  const {argv, mode, errors} = parseArguments(process.argv.slice(2));

  const options: SerializationOptions = {
    stripExportPattern: argv['stripExportPattern'],
    allowModuleIdentifiers: [].concat(argv['allowModuleIdentifiers']),
    onStabilityMissing: argv['onStabilityMissing'] || 'none'
  };

  if (['warn', 'error', 'none'].indexOf(options.onStabilityMissing) < 0) {
    throw new Error(
        'Argument for "--onStabilityMissing" option must be one of: "warn", "error", "none"');
  }

  for (const error of errors) {
    console.warn(error);
  }

  if (mode === 'help') {
    printUsageAndExit(!!errors.length);
  } else {
    const targets = generateFileNamePairs(argv, mode);

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
            const chalkMap = {'-': chalk.red, '+': chalk.green, '@': chalk.cyan};
            const chalkFunc = chalkMap[line[0]] || chalk.reset;
            console.log(chalkFunc(line));
          }
        }
      }

      if (hasDiff) {
        process.exit(1);
      }
    }
  }
}

export function parseArguments(input: string[]):
    {argv: ParsedArgs, mode: string, errors?: string[]} {
  let help = false;
  const errors = [];

  const argv = minimist(input, {
    string: [
      'out', 'outDir', 'verify', 'verifyDir', 'rootDir', 'stripExportPattern',
      'allowModuleIdentifiers', 'onStabilityMissing'
    ],
    boolean: [
      'help',
      // Options used by chalk automagically
      'color', 'no-color'
    ],
    alias: {'outFile': 'out', 'verifyFile': 'verify'},
    unknown: option => {
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

        --stripExportPattern <regexp>   Do not output exports matching the pattern
        --allowModuleIdentifiers <identifier>
                                        Whitelist identifier for "* as foo" imports
        --onStabilityMissing <warn|error|none>
                                        Warn or error if an export has no stability
                                        annotation`);
  process.exit(error ? 1 : 0);
}

export function generateFileNamePairs(
    argv: ParsedArgs, mode: string): {entrypoint: string, goldenFile: string}[] {
  if (argv[mode]) {
    return [{entrypoint: argv._[0], goldenFile: argv[mode]}];

  } else {  // argv[mode + 'Dir']
    let rootDir = argv['rootDir'] || '.';
    const goldenDir = argv[mode + 'Dir'];

    return argv._.map(fileName => {
      return {
        entrypoint: fileName,
        goldenFile: path.join(goldenDir, path.relative(rootDir, fileName))
      };
    });
  }
}
