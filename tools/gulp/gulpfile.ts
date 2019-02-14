import {task} from 'gulp';
import {createPackageBuildTasks, sequenceTask} from 'material2-build-tools';
import {
  allBuildPackages,
  cdkExperimentalPackage,
  cdkPackage,
  examplesPackage,
  materialExperimentalPackage,
  materialPackage,
  momentAdapterPackage
} from './packages';

createPackageBuildTasks(cdkPackage);
createPackageBuildTasks(cdkExperimentalPackage);
createPackageBuildTasks(materialPackage);
createPackageBuildTasks(materialExperimentalPackage);
createPackageBuildTasks(examplesPackage, ['build-examples-module']);
createPackageBuildTasks(momentAdapterPackage);

import './tasks/aot';
import './tasks/breaking-changes';
import './tasks/ci';
import './tasks/clean';
import './tasks/default';
import './tasks/development';
import './tasks/example-module';
import './tasks/lint';
import './tasks/material-release';
import './tasks/unit-test';
import './tasks/universal';

/** Task that builds all available release packages. */
task('build-release-packages', sequenceTask(
  'clean',
  allBuildPackages.map(buildPackage => `${buildPackage.name}:build-release`)
));
