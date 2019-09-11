import {task} from 'gulp';

task('ci:lint', ['lint']);

// Gulp sometimes does not exit properly on CI. This is to prevent that.
// TODO(devversion): look if there is some blocking child process.
task('ci:test', ['test:single-run'], () => process.exit(0));

/**
 * Task to verify that all components work with AOT compilation. This task requires the
 * release output to be built already.
 */
task('ci:aot', ['build-aot:no-release-build']);
