import {createPackageBuildTasks} from './util/package-tasks';

/** Create gulp tasks to build the different packages in the project. */
createPackageBuildTasks('cdk');
createPackageBuildTasks('material', ['cdk']);
createPackageBuildTasks('material-examples', ['material']);

import './tasks/ci';
import './tasks/clean';
import './tasks/default';
import './tasks/development';
import './tasks/docs';
import './tasks/e2e';
import './tasks/lint';
import './tasks/publish';
import './tasks/screenshots';
import './tasks/unit-test';
import './tasks/aot';
import './tasks/payload';
import './tasks/coverage';
import './tasks/material-release';
