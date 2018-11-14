/**
 * Script that will be used by the markdown_to_html Bazel rule in order to transform
 * multiple markdown files into the equivalent HTML output.
 */

import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

// These types lack type definitions.
const marked = require('marked');
const highlightJs = require('highlight.js');

// Regular expression that matches the markdown extension of a given path.
const markdownExtension = /.md$/;

// Setup the default options for converting markdown to HTML.
marked.setOptions({
  // Implement a highlight function that converts the code block into a highlighted
  // HTML snippet that uses HighlightJS.
  highlight: (code: string, language: string): string => {
    if (language) {
      return highlightJs.highlight(
          language.toLowerCase() === 'ts' ? 'typescript' : language, code).value;
    }
    return code;
  }
});

if (require.main === module) {
  // The script expects the bazel-bin path as first argument. All remaining arguments will be
  // considered as markdown input files that need to be transformed.
  const [bazelBinPath, ...inputFiles] = process.argv.slice(2);

  // Walk through each input file and write transformed markdown output to the specified
  // Bazel bin directory.
  inputFiles.forEach(inputPath => {
    const outputPath = join(bazelBinPath, inputPath.replace(markdownExtension, '.html'));
    writeFileSync(outputPath, marked(readFileSync(inputPath, 'utf8')));
  });
}
