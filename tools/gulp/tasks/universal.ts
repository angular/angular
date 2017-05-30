import {task} from 'gulp';
import {DIST_RELEASES, DIST_ROOT, SOURCE_ROOT} from '../build-config';
import {ngcBuildTask, tsBuildTask, copyTask, sequenceTask, execTask} from '../util/task_helpers';
import {join} from 'path';
import {copySync} from 'fs-extra';

const appDir = join(SOURCE_ROOT, 'universal-app');
const outDir = join(DIST_ROOT, 'packages', 'universal-app');

/** Path to the universal-app tsconfig files. */
const tsconfigAppPath = join(appDir, 'tsconfig-build.json');
const tsconfigPrerenderPath = join(outDir, 'tsconfig-prerender.json');

/** Glob that matches all assets that need to copied to the dist. */
const assetsGlob = join(appDir, '**/*.+(html|css|json)');

/** Path to the file that prerenders the universal app using platform-server. */
const prerenderFile = join(appDir, 'prerender.ts');

/** Path to the compiled prerender file. Running this file just dumps the HTML output for now. */
const prerenderOutFile = join(outDir, 'prerender.js');

task('universal:test-prerender', ['universal:build'], execTask('node', [prerenderOutFile]));

task('universal:build', sequenceTask(
  'clean',
  ['material:build-release', 'cdk:build-release'],
  'universal:copy-release',
  ['universal:build-app-ts', 'universal:copy-app-assets', 'universal:copy-prerender-source'],
  'universal:build-prerender-ts'
));

task('universal:build-app-ts', ngcBuildTask(tsconfigAppPath));
task('universal:copy-app-assets', copyTask(assetsGlob, outDir));

task('universal:build-prerender-ts', tsBuildTask(tsconfigPrerenderPath));
task('universal:copy-prerender-source', copyTask(prerenderFile, outDir));

// As a workaround for https://github.com/angular/angular/issues/12249, we need to
// copy the Material and CDK ESM output inside of the universal-app output.
task('universal:copy-release', () => {
  copySync(join(DIST_RELEASES, 'material'), join(outDir, 'material'));
  copySync(join(DIST_RELEASES, 'cdk'), join(outDir, 'cdk'));
});
