import path from 'node:path';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers'
import {constructExampleSandbox} from './example-sandbox.mjs';

if (!process.env.BUILD_WORKSPACE_DIRECTORY) {
  console.error(
    'Not running script as part of `bazel run`.'
  )
  process.exit(1);
}
const sourceRoot = process.env.BUILD_WORKSPACE_DIRECTORY;
const runfilesRoot = path.join(process.env.RUNFILES, 'angular');
const playgroundRoot = path.join(sourceRoot, 'aio', 'content', 'example-playground');

/**
 * Create an example playground with shared example deps and optionally linked local
 * angular packages in the source tree under content/examples/example-playground. This
 * script is intended to only be run under bazel as it has the localPackage arguments
 * and example hardcoded into the binary via starlark.
 *
 * Usage: bazel run //aio/tools/examples:create-example-playground-{EXAMPLE}
 *
 */

async function main(args) {
  const options =
    yargs(args)
    // Note: localPackage not listed above in usage as it's hardcoded in by the nodejs_binary
    .option('localPackage', {
      array: true,
      type: 'string',
      default: [],
      describe: 'Locally built package to substitute, in the form `packageName#packagePath`'
    })
    .option('example', {
      type: 'string',
      describe: 'Name of the example'
    })
    .demandOption('example')
    .strict()
    .version(false)
    .argv;

  const localPackages = options.localPackage.reduce((pkgs, pkgNameAndPath) => {
    const [pkgName, pkgPath] = pkgNameAndPath.split('#');
    pkgs[pkgName] = path.resolve(pkgPath);
    return pkgs;
  }, {});

  const exampleName = options.example;

  // Note: the example sources plus boilerplate are merged into a target named after the example
  const fullExamplePath = path.join(runfilesRoot, 'aio', 'content', 'examples', exampleName, exampleName);

  const destPath = path.join(playgroundRoot, exampleName);
  const nodeModules = path.join(runfilesRoot, '..', 'aio_example_deps', 'node_modules');

  await constructExampleSandbox(fullExamplePath, destPath, nodeModules, localPackages);

  console.log(`A playground folder for ${exampleName} has been set up at\n\n  ${destPath}\n`);
}

(async () => await main(hideBin(process.argv)))();
