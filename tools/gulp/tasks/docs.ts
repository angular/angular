import {task, src, dest} from 'gulp';
import {Dgeni} from 'dgeni';
import * as path from 'path';
import {HTML_MINIFIER_OPTIONS} from '../constants';

// There are no type definitions available for these imports.
const markdown = require('gulp-markdown');
const transform = require('gulp-transform');
const highlight = require('gulp-highlight-files');
const rename = require('gulp-rename');
const flatten = require('gulp-flatten');
const htmlmin = require('gulp-htmlmin');
const hljs = require('highlight.js');
const dom  = require('gulp-dom');

// Our docs contain comments of the form `<!-- example(...) -->` which serve as placeholders where
// example code should be inserted. We replace these comments with divs that have a
// `material-docs-example` attribute which can be used to locate the divs and initialize the example
// viewer.
const EXAMPLE_PATTERN = /<!--\W*example\(([^)]+)\)\W*-->/g;

// Markdown files can contain links to other markdown files.
// Most of those links don't work in the Material docs, because the paths are invalid in the
// documentation page. Using a RegExp to rewrite links in HTML files to work in the docs.
const LINK_PATTERN = /(<a[^>]*) href="([^"]*)"/g;

// HTML tags in the markdown generated files that should receive a .docs-markdown-${tagName} class
// for styling purposes.
const MARKDOWN_TAGS_TO_CLASS_ALIAS = [
  'a',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'li',
  'ol',
  'p',
  'table',
  'tbody',
  'td',
  'th',
  'tr',
  'ul'
];

task('docs', ['markdown-docs', 'highlight-docs', 'api-docs', 'minify-html-docs']);

task('markdown-docs', () => {
  return src(['src/lib/**/*.md', 'guides/*.md'])
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
      .pipe(dom(createTagNameAliaser('docs-markdown')))
      .pipe(dest('dist/docs/markdown'));
});

task('highlight-docs', () => {
  // rename files to fit format: [filename]-[filetype].html
  const renameFile = (path: any) => {
    const extension = path.extname.slice(1);
    path.basename = `${path.basename}-${extension}`;
  };

  return src('src/examples/**/*.+(html|css|ts)')
      .pipe(flatten())
      .pipe(rename(renameFile))
      .pipe(highlight())
      .pipe(dest('dist/docs/examples'));
});

task('api-docs', () => {
  const docsPackage = require(path.resolve(__dirname, '../../dgeni'));
  const docs = new Dgeni([docsPackage]);
  return docs.generate();
});

task('minify-html-docs', ['api-docs'], () => {
  return src('dist/docs/api/*.html')
    .pipe(htmlmin(HTML_MINIFIER_OPTIONS))
    .pipe(dest('dist/docs/api/'));
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
  // As for now, only markdown links that are relative and inside of the guides/ directory
  // will be rewritten.
  if (!filePath.includes(path.normalize('guides/')) || link.startsWith('http')) {
    return link;
  }

  let baseName = path.basename(link, path.extname(link));

  // Temporary link the file to the /guide URL because that's the route where the
  // guides can be loaded in the Material docs.
  return `guide/${baseName}`;
}

/**
 * Returns a function to be called with an HTML document as its context that aliases HTML tags by
 * adding a class consisting of a prefix + the tag name.
 * @param classPrefix The prefix to use for the alias class.
 */
function createTagNameAliaser(classPrefix: string) {
  return function() {
    MARKDOWN_TAGS_TO_CLASS_ALIAS.forEach(tag => {
      for (let el of this.querySelectorAll(tag)) {
        el.classList.add(`${classPrefix}-${tag}`);
      }
    });

    return this;
  };
}
