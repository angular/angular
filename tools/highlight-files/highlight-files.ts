/**
 * Script that will be used by the highlight_files Bazel rule in order to highlight
 * multiple input files using highlight.js. The output will be HTML files.
 */

import {readFileSync, writeFileSync, ensureDirSync} from 'fs-extra';
import {dirname, extname, join, relative} from 'path';
import {highlightCodeBlock} from './highlight-code-block';
import {regionParser} from '../region-parser/region-parser';

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

function detectAndHighlightRegionBlocks(
  parsed: {contents: string; regions: {[p: string]: string}},
  basePath: string,
  outDir: string,
) {
  const fileExtension = extname(basePath).substring(1);
  for (const [regionName, regionSnippet] of Object.entries(parsed.regions)) {
    // Create files for each found region
    if (!regionName) {
      continue;
    }
    const highlightedRegion = highlightCodeBlock(regionSnippet, fileExtension);
    // Convert "my-component-example.ts" into "my-component-example_region-ts.html"
    const regionBaseOutputPath = basePath.replace(
      `.${fileExtension}`,
      `_${regionName}-${fileExtension}.html`,
    );
    const regionOutputPath = join(outDir, regionBaseOutputPath);
    ensureDirSync(dirname(regionOutputPath));
    writeFileSync(regionOutputPath, highlightedRegion);
  }
}

if (require.main === module) {
  // The script expects the output directory as first argument. Second is the name of the
  // package where this the highlight target is declared. All remaining arguments will be
  // considered as markdown input files that need to be transformed.
  const [outDir, packageName, ...inputFiles] = getBazelActionArguments();

  // Walk through each input file and write transformed markdown output
  // to the specified output directory.
  for (const execPath of inputFiles) {
    // Compute a relative path from the package to the actual input file.
    // e.g `src/components-examples/cdk/<..>/example.ts` becomes `cdk/<..>/example.ts`.
    const basePath = relative(packageName, execPath);
    const fileExtension = extname(basePath).substring(1);
    const parsed = regionParser(readFileSync(execPath, 'utf8'), fileExtension);
    detectAndHighlightRegionBlocks(parsed, basePath, outDir);
    // Convert "my-component-example.ts" into "my-component-example-ts.html"
    const baseOutputPath = basePath.replace(`.${fileExtension}`, `-${fileExtension}.html`);
    const outputPath = join(outDir, baseOutputPath);
    const htmlOutput = highlightCodeBlock(parsed.contents, fileExtension);

    ensureDirSync(dirname(outputPath));
    writeFileSync(outputPath, htmlOutput);
  }
}
