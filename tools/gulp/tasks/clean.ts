import {task} from 'gulp';
import {buildConfig} from '../../package-tools';

const shelljs = require('shelljs');

/** Deletes the output directory. */
task('clean', done => {
  shelljs.rm('-rf', [buildConfig.outputDir]);
  done();
});
