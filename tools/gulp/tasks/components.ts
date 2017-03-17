import {task, watch, src, dest} from 'gulp';
import {ScriptTarget, ModuleKind} from 'typescript';
import * as path from 'path';

import {
  DIST_COMPONENTS_ROOT, PROJECT_ROOT, COMPONENTS_DIR, HTML_MINIFIER_OPTIONS, LICENSE_BANNER
} from '../constants';
import {
  sassBuildTask, tsBuildTask, execNodeTask, sequenceTask,
  triggerLivereload
} from '../util/task_helpers';

// There are no type definitions available for these imports.
const inlineResources = require('../../../scripts/release/inline-resources');
const gulpRollup = require('gulp-better-rollup');
const gulpMinifyHtml = require('gulp-htmlmin');
const gulpIf = require('gulp-if');

/** Path to tsconfig file for the components. */
const tsconfigPath = path.join(COMPONENTS_DIR, 'tsconfig.json');

/** Asset files to be added to the components output. */
const assetFiles = [
  path.join(COMPONENTS_DIR, '**/*.html'),
  path.join(COMPONENTS_DIR, 'package.json'),
  path.join(PROJECT_ROOT, 'README.md'),
  path.join(PROJECT_ROOT, 'LICENSE'),
];

/** Builds components to UMD bundle. */
task('build:components', [':build:components:bundle:umd']);

/** Builds components for Angular Material releases */
task(':build:components:release', sequenceTask(
  ':build:components:bundle:umd',
  ':build:components:bundle:esm',
  ':build:components:ngc'
));

/** Builds components typescript in ES5, ES6 target. For specs Karma needs CJS output. */
task(':build:components:ts:es5', tsBuildTask(tsconfigPath, { target: ScriptTarget.ES5 }));
task(':build:components:ts:es6', tsBuildTask(tsconfigPath, { target: ScriptTarget.ES6 }));
task(':build:components:ts:spec', tsBuildTask(tsconfigPath, {
  target: ScriptTarget.ES5, module: ModuleKind.CommonJS
}));

/** Tasks to create a UMD or ES bundle */
task(':build:components:bundle:umd', sequenceTask(
  ':build:components:ts:es5', ':build:components:inline', ':build:components:rollup:umd'
));

task(':build:components:bundle:esm', sequenceTask(
  ':build:components:ts:es6', ':build:components:inline', ':build:components:rollup:esm'
));

/** Copies all component assets to the build output. */
task(':build:components:assets', () => {
  return src(assetFiles)
    .pipe(gulpIf(/.html$/, gulpMinifyHtml(HTML_MINIFIER_OPTIONS)))
    .pipe(dest(DIST_COMPONENTS_ROOT));
});

/** Compiles the components SCSS into minified CSS. */
task(':build:components:scss', sassBuildTask(DIST_COMPONENTS_ROOT, COMPONENTS_DIR, true));

/** Builds a ES6 bundle for all components. */
task(':build:components:rollup:esm', () => {
  return src(path.join(DIST_COMPONENTS_ROOT, 'index.js'))
    .pipe(createRollupBundle('es', 'material.js'))
    .pipe(dest(path.join(DIST_COMPONENTS_ROOT, 'bundles')));
});

/** Builds a UMD bundle (ES5) for all components. */
task(':build:components:rollup:umd', () => {
  return src(path.join(DIST_COMPONENTS_ROOT, 'index.js'))
  .pipe(createRollupBundle('umd', 'material.umd.js'))
  .pipe(dest(path.join(DIST_COMPONENTS_ROOT, 'bundles')));
});


/** Builds components with resources (html, css) inlined into the built JS. */
task(':build:components:inline', sequenceTask(
  [':build:components:scss', ':build:components:assets'],
  ':inline-resources',
));

/** Inlines resources (html, css) into the JS output. */
task(':inline-resources', () => inlineResources(DIST_COMPONENTS_ROOT));

/** Generates metadata.json files for all of the components. */
task(':build:components:ngc', ['build:components'], execNodeTask(
  '@angular/compiler-cli', 'ngc', ['-p', tsconfigPath]
));

/** [Watch task] Rebuilds (ESM output) whenever ts, scss, or html sources change. */
task(':watch:components', () => {
  watch(path.join(COMPONENTS_DIR, '**/*.ts'), ['build:components', triggerLivereload]);
  watch(path.join(COMPONENTS_DIR, '**/*.scss'), ['build:components', triggerLivereload]);
  watch(path.join(COMPONENTS_DIR, '**/*.html'), ['build:components', triggerLivereload]);
});

const ROLLUP_GLOBALS = {
  // Angular dependencies
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
  '@angular/forms': 'ng.forms',
  '@angular/http': 'ng.http',
  '@angular/platform-browser': 'ng.platformBrowser',
  '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',

  // Rxjs dependencies
  'rxjs/Subject': 'Rx',
  'rxjs/add/observable/fromEvent': 'Rx.Observable',
  'rxjs/add/observable/forkJoin': 'Rx.Observable',
  'rxjs/add/observable/of': 'Rx.Observable',
  'rxjs/add/observable/merge': 'Rx.Observable',
  'rxjs/add/observable/throw': 'Rx.Observable',
  'rxjs/add/operator/auditTime': 'Rx.Observable.prototype',
  'rxjs/add/operator/toPromise': 'Rx.Observable.prototype',
  'rxjs/add/operator/map': 'Rx.Observable.prototype',
  'rxjs/add/operator/filter': 'Rx.Observable.prototype',
  'rxjs/add/operator/do': 'Rx.Observable.prototype',
  'rxjs/add/operator/share': 'Rx.Observable.prototype',
  'rxjs/add/operator/finally': 'Rx.Observable.prototype',
  'rxjs/add/operator/catch': 'Rx.Observable.prototype',
  'rxjs/add/operator/first': 'Rx.Observable.prototype',
  'rxjs/add/operator/startWith': 'Rx.Observable.prototype',
  'rxjs/add/operator/switchMap': 'Rx.Observable.prototype',
  'rxjs/Observable': 'Rx'
};

/** Creates a rollup bundles of the Material components.*/
function createRollupBundle(format: string, outFile: string) {
  let rollupOptions = {
    context: 'this',
    external: Object.keys(ROLLUP_GLOBALS)
  };

  let rollupGenerateOptions = {
    // Keep the moduleId empty because we don't want to force developers to a specific moduleId.
    moduleId: '',
    moduleName: 'ng.material',
    banner: LICENSE_BANNER,
    format: format,
    dest: outFile,
    globals: ROLLUP_GLOBALS,
  };

  return gulpRollup(rollupOptions, rollupGenerateOptions);
}
