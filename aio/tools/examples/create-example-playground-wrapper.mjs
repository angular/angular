import shelljs from 'shelljs';
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers';
import {getNativeBinary as getNativeBazelBinary} from '@bazel/bazelisk';
import {getNativeBinary as getNativeIBazelBinary} from '@bazel/ibazel';

shelljs.set('-e')
shelljs.set('-v')

/**
 * Create an example playground with shared example deps and optionally linked local
 * angular packages in the source tree under content/examples/example-playground. This
 * is a wrapper around the equivalent bazel binary but adds the --local option to link
 * local packages.
 *   
 * Usage: node ./tools/examples/create-example-playground-wrapper.mjs <example> [options]
 *
 * Args:
 *  example: name of the example
 * 
 * Flags:
 *  --local: use locally built angular packages
 *  --watch: update playground when source files change
 */

const options = yargs(hideBin(process.argv))
  .command('$0 <example>', 'Set up a playground for <example> in the source tree for manual testing')
  .option('local', {default: false, type: 'boolean'})
  .option('watch', {default: false, type: 'boolean'})
  .version(false)
  .strict()
  .argv;

const cmd = [
  options.watch ? getNativeIBazelBinary() : getNativeBazelBinary(),
  'run',
  `//aio/tools/examples:create-example-playground-${options.example}`,
];

if (options.local) {
  cmd.splice(2, 0, '--config=aio_local_deps');
}

shelljs.exec(cmd.join(' '));
