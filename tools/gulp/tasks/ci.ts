import {task} from 'gulp';

// Gulp sometimes does not exit properly on CI. This is to prevent that.
// TODO(devversion): look if there is some blocking child process.
task('ci:test', ['test:single-run'], () => process.exit(0));
