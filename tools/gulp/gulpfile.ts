import {createPackageBuildTasks} from 'material2-build-tools';
import {
  cdkPackage,
  examplesPackage,
  experimentalPackage,
  materialPackage,
  momentAdapterPackage
} from './packages';

createPackageBuildTasks(cdkPackage);
createPackageBuildTasks(materialPackage);
createPackageBuildTasks(experimentalPackage);
createPackageBuildTasks(examplesPackage);
createPackageBuildTasks(momentAdapterPackage);

import './tasks/aot';
import './tasks/changelog';
import './tasks/ci';
import './tasks/clean';
import './tasks/coverage';
import './tasks/default';
import './tasks/development';
import './tasks/docs';
import './tasks/e2e';
import './tasks/examples';
import './tasks/lint';
import './tasks/material-release';
import './tasks/payload';
import './tasks/publish';
import './tasks/screenshots';
import './tasks/unit-test';
import './tasks/universal';
import './tasks/validate-release';
