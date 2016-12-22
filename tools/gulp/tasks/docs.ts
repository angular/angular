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

gulp.task('docs', () => {
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
      .pipe(transform((content: string) =>
          content.toString().replace(EXAMPLE_PATTERN, (match: string, name: string) =>
              `<div material-docs-example="${name}"></div>`)))
      .pipe(gulp.dest('dist/docs'));
});

task('api', () => {
  const Dgeni = require('dgeni');
  const docsPackage = require(path.resolve(__dirname, '../../dgeni'));
  const dgeni = new Dgeni([docsPackage]);
  return dgeni.generate();
});
