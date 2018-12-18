import {writeFileSync} from 'fs';
import {join} from 'path';


const Bundler = require('scss-bundle').Bundler;
const minimist = require('minimist');

/** The root of the bazel workspace (sandbox). */
const workspaceRoot = process.cwd();

/**
 * Bundles sass partials into a single file using the `scss-bundle` package. This does not use the
 * default CLI for `scss-bundle` to give us a place to introspect / debug values coming from
 * bazel if necessary.
 */
export async function main(args: string[]): Promise<number> {
  const parsedArgs: {srcs: string, output: string, entry: string} = minimist(args);
  const inputFiles = parsedArgs.srcs.split(',');

  return new Bundler().Bundle(join(workspaceRoot, parsedArgs.entry), inputFiles).then(result => {
    writeFileSync(parsedArgs.output, result.bundledContent);
    return 0;
  }).catch(error => {
    console.error('Sass bundling failed');
    console.dir(error);
    return 1;
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  main(args).then(exitCode => {
    process.exitCode = exitCode;
  });
}
