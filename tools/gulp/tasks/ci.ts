import {task} from 'gulp';
import {sequenceTask} from 'material2-build-tools';
import {allBuildPackages} from '../packages';

task('ci:lint', ['lint']);

// Travis sometimes does not exit the process and times out. This is to prevent that.
task('ci:test', ['test:single-run'], () => process.exit(0));

task('ci:e2e', ['e2e']);

/**
 * Task to verify that all components work with AOT compilation. This task requires the
 * release output to be built already.
 */
task('ci:aot', ['build-aot:no-release-build']);

/** Task that verifies if all Material components are working with platform-server. */
task('ci:prerender', ['prerender']);

/** Task that builds all release packages. */
task('ci:build-release-packages', sequenceTask(
  'clean',
  allBuildPackages.map(buildPackage => `${buildPackage.name}:build-release`)
));
