import {task, watch} from 'gulp';
import {readdirSync, statSync, readFileSync} from 'fs';
import * as path from 'path';

import {SOURCE_ROOT, DIST_COMPONENTS_ROOT, PROJECT_ROOT} from '../constants';
import {sassBuildTask, tsBuildTask, execNodeTask, copyTask, sequenceTask} from '../task_helpers';
import {writeFileSync} from 'fs';

// No typings for these.
const inlineResources = require('../../../scripts/release/inline-resources');
const rollup = require('rollup').rollup;

const componentsDir = path.join(SOURCE_ROOT, 'lib');


task(':watch:components', () => {
  watch(path.join(componentsDir, '**/*.ts'), [':build:components:ts']);
  watch(path.join(componentsDir, '**/*.scss'), [':build:components:scss']);
  watch(path.join(componentsDir, '**/*.html'), [':build:components:assets']);
});

task(':watch:components:spec', () => {
  watch(path.join(componentsDir, '**/*.ts'), [':build:components:spec']);
  watch(path.join(componentsDir, '**/*.scss'), [':build:components:scss']);
  watch(path.join(componentsDir, '**/*.html'), [':build:components:assets']);
});


task(':build:components:ts', tsBuildTask(componentsDir));
task(':build:components:spec', tsBuildTask(path.join(componentsDir, 'tsconfig-spec.json')));
task(':build:components:assets', copyTask([
  path.join(componentsDir, '**/*.!(ts|spec.ts)'),
  path.join(PROJECT_ROOT, 'README.md'),
], DIST_COMPONENTS_ROOT));
task(':build:components:scss', sassBuildTask(
  DIST_COMPONENTS_ROOT, componentsDir, [path.join(componentsDir, 'core/style')]
));
task(':build:components:rollup', [':build:components:inline'], () => {
  const globals: {[name: string]: string} = {
    // Angular dependencies
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/forms': 'ng.forms',
    '@angular/http': 'ng.http',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',

    // Rxjs dependencies
    'rxjs/Subject': 'Rx',
    'rxjs/add/observable/forkJoin': 'Rx.Observable',
    'rxjs/add/observable/of': 'Rx.Observable',
    'rxjs/add/operator/toPromise': 'Rx.Observable.prototype',
    'rxjs/add/operator/map': 'Rx.Observable.prototype',
    'rxjs/add/operator/filter': 'Rx.Observable.prototype',
    'rxjs/add/operator/do': 'Rx.Observable.prototype',
    'rxjs/add/operator/share': 'Rx.Observable.prototype',
    'rxjs/add/operator/finally': 'Rx.Observable.prototype',
    'rxjs/add/operator/catch': 'Rx.Observable.prototype',
    'rxjs/Observable': 'Rx'
  };

  // Rollup the @angular/material UMD bundle from all ES5 + imports JavaScript files built.
  return rollup({
    entry: path.join(DIST_COMPONENTS_ROOT, 'index.js'),
    context: 'this',
    external: Object.keys(globals)
  }).then((bundle: { generate: any }) => {
    const result = bundle.generate({
      moduleName: 'ng.material',
      format: 'umd',
      globals,
      sourceMap: true,
      dest: path.join(DIST_COMPONENTS_ROOT, 'material.umd.js')
    });

    // Add source map URL to the code.
    result.code += '\n\n//# sourceMappingURL=./material.umd.js.map\n';
    // Format mapping to show properly in the browser. Rollup by default will put the path
    // as relative to the file, and since that path is in src/lib and the file is in
    // dist/@angular/material, we need to kill a few `../`.
    result.map.sources = result.map.sources.map((s: string) => s.replace(/^(\.\.\/)+/, ''));

    writeFileSync(path.join(DIST_COMPONENTS_ROOT, 'material.umd.js'), result.code, 'utf8');
    writeFileSync(path.join(DIST_COMPONENTS_ROOT, 'material.umd.js.map'), result.map, 'utf8');
  });
});

task(':build:components:inline', [
  ':build:components:ts',
  ':build:components:scss',
  ':build:components:assets'
], () => {
  return inlineResources(DIST_COMPONENTS_ROOT);
});

task('build:components', sequenceTask(
  ':build:components:rollup',
));

task(':build:components:ngc', ['build:components'], execNodeTask(
  '@angular/compiler-cli', 'ngc', ['-p', path.relative(PROJECT_ROOT, path.join(componentsDir, 'tsconfig.json'))]
));
