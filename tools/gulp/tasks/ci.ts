import {task, series} from 'gulp';

// Gulp sometimes does not exit properly on CI. This is to prevent that.
// TODO(devversion): look if there is some blocking child process.
task('ci:test', series('test:single-run', done => {
  done();
  process.exit(0);
}));
