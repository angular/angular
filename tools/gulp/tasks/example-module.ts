import {sync as glob} from 'glob';
import {task} from 'gulp';
import {buildConfig} from 'material2-build-tools';
import * as path from 'path';
import {generateExampleModule} from '../../example-module/generate-example-module';

const {packagesDir} = buildConfig;

/** Path to find the examples */
const examplesPath = path.join(packagesDir, 'material-examples');

/** Output path of the module that is being created */
const outputModuleFilename = path.join(examplesPath, 'example-module.ts');

/**
 * Creates the examples module and metadata
 */
task('build-examples-module', () => {
  generateExampleModule(glob(path.join(examplesPath, '**/*.ts')), outputModuleFilename);
});
