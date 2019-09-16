import {task} from 'gulp';
import {createPackageBuildTasks, sequenceTask} from 'material2-build-tools';
import {
  allBuildPackages,
  cdkExperimentalPackage,
  cdkPackage,
  examplesPackage,
  googleMapsPackage,
  materialExperimentalPackage,
  materialPackage,
  momentAdapterPackage,
  youTubePlayerPackage
} from './packages';

createPackageBuildTasks(cdkPackage);
createPackageBuildTasks(cdkExperimentalPackage);
createPackageBuildTasks(materialPackage);
createPackageBuildTasks(materialExperimentalPackage);
createPackageBuildTasks(examplesPackage, ['build-examples-module']);
createPackageBuildTasks(momentAdapterPackage);
createPackageBuildTasks(youTubePlayerPackage);
createPackageBuildTasks(googleMapsPackage);

import './tasks/ci';
import './tasks/clean';
import './tasks/default';
import './tasks/example-module';
import './tasks/lint';
import './tasks/material-release';
import './tasks/unit-test';

/** Task that builds all available release packages. */
task('build-release-packages', sequenceTask(
  'clean',
  allBuildPackages.map(buildPackage => `${buildPackage.name}:build-release`)
));
