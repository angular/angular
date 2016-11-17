import gulp = require('gulp');
const markdown = require('gulp-markdown');
const transform = require('gulp-transform');
import {task} from 'gulp';
import * as path from 'path';

import {SOURCE_ROOT, PROJECT_ROOT} from '../constants';
import {
    execNodeTask
} from '../task_helpers';

const typedocPath = path.relative(PROJECT_ROOT, path.join(SOURCE_ROOT, 'lib/typedoc.json'));

// Our docs contain comments of the form `<!-- example(...) -->` which serve as placeholders where
// example code should be inserted. We replace these comments with divs that have a
// `material-docs-example` attribute which can be used to locate the divs and initialize the example
// viewer.
const EXAMPLE_PATTERN = /<!--\W*example\(([^)]+)\)\W*-->/g;

gulp.task('docs', () => {
  return gulp.src(['src/lib/**/*.md'])
      .pipe(markdown())
      .pipe(transform((content: string) =>
          content.toString().replace(EXAMPLE_PATTERN, (match: string, name: string) =>
              `<div material-docs-example="${name}"></div>`)))
      .pipe(gulp.dest('dist/docs'));
});

task('api', execNodeTask('typedoc', ['--options', typedocPath, './src/lib']));
