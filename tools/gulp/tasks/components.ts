import {task, watch} from 'gulp';
import {readdirSync, statSync, writeFileSync} from 'fs';
import * as path from 'path';

import {SOURCE_ROOT, DIST_COMPONENTS_ROOT, PROJECT_ROOT} from '../constants';
import {sassBuildTask, tsBuildTask, execNodeTask, copyTask, sequenceTask} from '../task_helpers';

// No typings for these.
const inlineResources = require('../../../scripts/release/inline-resources');
const rollup = require('rollup').rollup;

const componentsDir = path.join(SOURCE_ROOT, 'lib');


function camelCase(str: string) {
  return str.replace(/-(\w)/g, (_: any, letter: string) => {
    return letter.toUpperCase();
  })
}


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
task(':build:components:assets',
     copyTask(path.join(componentsDir, '*/**/*.!(ts|spec.ts)'), DIST_COMPONENTS_ROOT));
task(':build:components:scss', sassBuildTask(
  DIST_COMPONENTS_ROOT, componentsDir, [path.join(componentsDir, 'core/style')]
));
task(':build:components:rollup', [':build:components:ts'], () => {
  const components = readdirSync(componentsDir)
    .filter(componentName => (statSync(path.join(componentsDir, componentName))).isDirectory());

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
  components.forEach(name => {
    globals[`@angular2-material/${name}`] = `md.${camelCase(name)}`
  });

  // Build all of them asynchronously.
  return components.reduce((previous, name) => {
    return previous
      .then(() => {
        return rollup({
          entry: path.join(DIST_COMPONENTS_ROOT, name, 'index.js'),
          context: 'window',
          external: [
            ...Object.keys(globals),
            ...components.map(name => `@angular2-material/${name}`)
          ]
        });
      })
      .then((bundle: any) => {
        const result = bundle.generate({
          moduleName: `md.${camelCase(name)}`,
          format: 'umd',
          globals
        });
        const outputPath = path.join(DIST_COMPONENTS_ROOT, name, `${name}.umd.js`);
        writeFileSync( outputPath, result.code );
      });
  }, Promise.resolve());
});

task('build:components', sequenceTask(
  ':build:components:rollup',
  ':build:components:assets',
  ':build:components:scss',
  ':inline-resources',
));

task(':build:components:ngc', ['build:components'], execNodeTask(
  '@angular/compiler-cli', 'ngc', ['-p', path.relative(PROJECT_ROOT, path.join(componentsDir, 'tsconfig.json'))]
));

task(':inline-resources', () => {
  inlineResources([DIST_COMPONENTS_ROOT]);
});
