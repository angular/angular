import {task} from 'gulp';


task('ci:lint', ['ci:forbidden-identifiers', 'lint']);

task('ci:extract-metadata', [':build:components:ngc']);
task('ci:forbidden-identifiers', function() {
  require('../../../scripts/ci/forbidden-identifiers.js');
});

// Travis sometimes does not exit the process and times out. This is to prevent that.
task('ci:test', ['test:single-run'], () => process.exit(0));

task('ci:e2e', ['e2e:single-run']);
