import {createPackageBuildTasks} from 'material2-build-tools';
import {cdkPackage, examplesPackage, materialPackage, momentAdapterPackage} from './packages';

createPackageBuildTasks(cdkPackage);
createPackageBuildTasks(materialPackage);
createPackageBuildTasks(examplesPackage);
createPackageBuildTasks(momentAdapterPackage);

import './tasks/ci';
import './tasks/clean';
import './tasks/default';
import './tasks/development';
import './tasks/docs';
import './tasks/e2e';
import './tasks/lint';
import './tasks/publish';
import './tasks/screenshots';
import './tasks/examples';
import './tasks/unit-test';
import './tasks/aot';
import './tasks/payload';
import './tasks/coverage';
import './tasks/material-release';
import './tasks/universal';
import './tasks/validate-release';
import './tasks/changelog';
