/**
 * Script that will be used by the highlight_files Bazel rule in order to highlight
 * multiple input files using highlight.js. The output will be HTML files.
 */

import {readFileSync, writeFileSync} from 'fs';
import {extname, join} from 'path';
import {highlightCodeBlock} from './highlight-code-block';

/**
 * Determines the command line arguments for the current Bazel action. Since this action can
 * have a large set of input files, Bazel may write the arguments into a parameter file.
 * This function is responsible for handling normal argument passing or Bazel parameter files.
 * Read more here: https://docs.bazel.build/versions/master/skylark/lib/Args.html#use_param_file
 */
function getBazelActionArguments() {
  const args = process.argv.slice(2);

  // If Bazel uses a parameter file, we've specified that it passes the file in the following
  // format: "arg0 arg1 --param-file={path_to_param_file}"
  if (args[0].startsWith('--param-file=')) {
    return readFileSync(args[0].split('=')[1], 'utf8').trim().split('\n');
  }

  return args;
}

if (require.main === module) {
  // The script expects the bazel-bin path as first argument. All remaining arguments will be
  // considered as markdown input files that need to be transformed.
  const [bazelBinPath, ...inputFiles] = getBazelActionArguments();

  // Walk through each input file and write transformed markdown output to the specified
  // Bazel bin directory.
  inputFiles.forEach(inputPath => {
    const fileExtension = extname(inputPath).substring(1);
    // Convert "my-component-example.ts" into "my-component-example-ts.html"
    const baseOutputPath = inputPath.replace(`.${fileExtension}`, `-${fileExtension}.html`);
    const outputPath = join(bazelBinPath, baseOutputPath);
    const htmlOutput = highlightCodeBlock(readFileSync(inputPath, 'utf8'), fileExtension);

    writeFileSync(outputPath, htmlOutput);
  });

}
