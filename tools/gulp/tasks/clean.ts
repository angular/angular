import {task, src} from 'gulp';
import {buildConfig} from '../../package-tools';

// This import lacks type definitions.
const gulpClean = require('gulp-clean');

/** Deletes the output directory. */
task('clean', () => src(buildConfig.outputDir, { read: false }).pipe(gulpClean(null)));
