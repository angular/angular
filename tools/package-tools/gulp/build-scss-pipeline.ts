import {src} from 'gulp';
import {join} from 'path';
import {buildConfig} from '../build-config';

// These imports lack of type definitions.
const gulpSass = require('gulp-dart-sass');
const sass = require('sass');
const sassIncludePaths = [join(buildConfig.projectDir, 'node_modules/')];

// Set the compiler to our version of `sass`, rather than the one that `gulp-dart-sass` depends on.
gulpSass.compiler = sass;

/** Create a gulp task that builds SCSS files. */
export function buildScssPipeline(sourceDir: string) {
  return src(join(sourceDir, '**/!(test-*).scss'))
    .pipe(gulpSass({includePaths: sassIncludePaths}).on('error', gulpSass.logError));
}
