/**
 * Script that will be dispatched by the "package_docs_content" rule and is responsible for
 * copying input files to a new location. The new location will be computed within the Bazel
 * rule implementation so that we don't need to compute the output paths with their sections
 * multiple times.
 */

import {readFileSync, writeFileSync} from 'fs';

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
  // Process all file pairs that have been passed to this executable. Each argument will
  // consist of the input file path and the desired output location.
  getBazelActionArguments().forEach(argument => {
    // Each argument that has been passed consists of an input file path and the expected
    // output path. e.g. {path_to_input_file},{expected_output_path}
    const [inputFilePath, outputPath] = argument.split(',', 2);

    writeFileSync(outputPath, readFileSync(inputFilePath, 'utf8'));
  });
}
