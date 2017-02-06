import gulp = require('gulp');
const markdown = require('gulp-markdown');
const transform = require('gulp-transform');
const hljs = require('highlight.js');
import {task} from 'gulp';
import * as path from 'path';

// Our docs contain comments of the form `<!-- example(...) -->` which serve as placeholders where
// example code should be inserted. We replace these comments with divs that have a
// `material-docs-example` attribute which can be used to locate the divs and initialize the example
// viewer.
const EXAMPLE_PATTERN = /<!--\W*example\(([^)]+)\)\W*-->/g;

// Markdown files can contain links to other markdown files.
// Most of those links don't work in the Material docs, because the paths are invalid in the
// documentation page. Using a RegExp to rewrite links in HTML files to work in the docs.
const LINK_PATTERN = /(<a[^>]*) href="([^"]*)"/g;

gulp.task('docs', ['markdown-docs', 'api-docs'])

gulp.task('markdown-docs', () => {
  return gulp.src(['src/lib/**/*.md', 'guides/*.md'])
      .pipe(markdown({
        // Add syntax highlight using highlight.js
        highlight: (code: string, language: string) => {
          if (language) {
            // highlight.js expects "typescript" written out, while Github supports "ts".
            let lang = language.toLowerCase() === 'ts' ? 'typescript' : language;
            return hljs.highlight(lang, code).value;
          }

          return code;
        }
      }))
      .pipe(transform(transformMarkdownFiles))
      .pipe(gulp.dest('dist/docs/markdown'));
});

task('api-docs', () => {
  const Dgeni = require('dgeni');
  const docsPackage = require(path.resolve(__dirname, '../../dgeni'));
  const dgeni = new Dgeni([docsPackage]);
  return dgeni.generate();
});

/** Updates the markdown file's content to work inside of the docs app. */
function transformMarkdownFiles(buffer: Buffer, file: any): string {
  let content = buffer.toString('utf-8');

  /* Replace <!-- example(..) --> comments with HTML elements. */
  content = content.replace(EXAMPLE_PATTERN, (match: string, name: string) =>
    `<div material-docs-example="${name}"></div>`
  );

  /* Replaces the URL in anchor elements inside of compiled markdown files. */
  content = content.replace(LINK_PATTERN, (match: string, head: string, link: string) =>
    // The head is the first match of the RegExp and is necessary to ensure that the RegExp matches
    // an anchor element. The head will be then used to re-create the existing anchor element.
    // If the head is not prepended to the replaced value, then the first match will be lost.
    `${head} href="${fixMarkdownDocLinks(link, file.path)}"`
  );

  return content;
}

/** Fixes paths in the markdown files to work in the material-docs-io. */
function fixMarkdownDocLinks(link: string, filePath: string): string {
  if (link.startsWith('http') && filePath.indexOf('guides/') === -1) {
    return link;
  }

  let baseName = path.basename(link, path.extname(link));

  // Temporary link the file to the /guide URL because that's the route where the
  // guides can be loaded in the Material docs.
  return `guide/${baseName}`;
}
