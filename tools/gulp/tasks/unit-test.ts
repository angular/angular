import {join} from 'path';
import {task} from 'gulp';
import {buildConfig, sequenceTask} from '../../package-tools';

// There are no type definitions available for these imports.
const shelljs = require('shelljs');

/** Builds everything that is necessary for karma. */
task(':test:build', sequenceTask(
  'clean',
  'cdk:build-no-bundles',
  'material:build-no-bundles',
  'cdk-experimental:build-no-bundles',
  'material-experimental:build-no-bundles',
  'youtube-player:build-no-bundles',
  'material-moment-adapter:build-no-bundles',
  'google-maps:build-no-bundles',
  ':test:build-system-config'
));

/**
 * Runs the unit tests. Does not watch for changes.
 * This task should be used when running tests on the CI server.
 */
task('test:single-run', [':test:build'], (done: () => void) => {
  // Load karma not outside. Karma pollutes Promise with a different implementation.
  const karma = require('karma');

  new karma.Server({
    configFile: join(buildConfig.projectDir, 'test/karma.conf.js'),
    autoWatch: false,
    singleRun: true
  }, (exitCode: number) => {
    // Immediately exit the process if Karma reported errors, because due to
    // potential still running tunnel-browsers gulp won't exit properly.
    exitCode === 0 ? done() : process.exit(exitCode);
  }).start();
});

/**
 * Tasks that builds the SystemJS configuration which is needed for the Karma
 * legacy unit tests.
 */
task(':test:build-system-config', () => {
  const configOutputPath = join(buildConfig.outputDir, 'karma-system-config.js');
  shelljs.cd(buildConfig.projectDir);
  const bazelGenfilesDir = shelljs.exec('yarn -s bazel info bazel-genfiles').stdout.trim();
  shelljs.exec('yarn -s bazel build //test:system-config.js');
  shelljs.cp(join(bazelGenfilesDir, 'test/system-config.js'), configOutputPath);
  shelljs.chmod('u+w', configOutputPath);
});
