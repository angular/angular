/**
 * Script that will be used by the markdown_to_html Bazel rule in order to transform
 * multiple markdown files into the equivalent HTML output.
 */

import {readFileSync, writeFileSync} from 'fs';
import * as marked from 'marked';
import {join} from 'path';
import {highlightCodeBlock} from '../highlight-files/highlight-code-block';
import {DocsMarkdownRenderer} from './docs-marked-renderer';

// Regular expression that matches the markdown extension of a given path.
const markdownExtension = /.md$/;

// Custom markdown renderer for transforming markdown files for the docs.
const markdownRenderer = new DocsMarkdownRenderer();

// Setup our custom docs renderer by default.
marked.setOptions({renderer: markdownRenderer, highlight: highlightCodeBlock});

if (require.main === module) {
  // The script expects the bazel-bin path as first argument. All remaining arguments will be
  // considered as markdown input files that need to be transformed.
  const [bazelBinPath, ...inputFiles] = process.argv.slice(2);

  // Walk through each input file and write transformed markdown output to the specified
  // Bazel bin directory.
  inputFiles.forEach(inputPath => {
    const outputPath = join(bazelBinPath, inputPath.replace(markdownExtension, '.html'));
    const htmlOutput = markdownRenderer.finalizeOutput(marked(readFileSync(inputPath, 'utf8')));

    writeFileSync(outputPath, htmlOutput);
  });
}
