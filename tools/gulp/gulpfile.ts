import {createPackageBuildTasks} from 'material2-build-tools';
import {
  cdkExperimentalPackage,
  cdkPackage,
  googleMapsPackage,
  materialExperimentalPackage,
  materialPackage,
  momentAdapterPackage,
  youTubePlayerPackage
} from './packages';

import './tasks/ci';
import './tasks/clean';
import './tasks/unit-test';

createPackageBuildTasks(cdkPackage);
createPackageBuildTasks(cdkExperimentalPackage);
createPackageBuildTasks(materialPackage);
createPackageBuildTasks(materialExperimentalPackage);
createPackageBuildTasks(momentAdapterPackage);
createPackageBuildTasks(youTubePlayerPackage);
createPackageBuildTasks(googleMapsPackage);

