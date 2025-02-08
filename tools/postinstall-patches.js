/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

try {
  require.resolve('shelljs');
} catch (e) {
  // We are in an bazel managed external node_modules repository
  // and the resolve has failed because node did not preserve the symlink
  // when loading the script.
  // This can be fixed using the --preserve-symlinks-main flag which
  // is introduced in node 10.2.0
  console.warn(
    `Running postinstall-patches.js script in an external repository requires --preserve-symlinks-main node flag introduced in node 10.2.0. ` +
      `Current node version is ${process.version}. Node called with '${process.argv.join(' ')}'.`,
  );
  process.exit(0);
}

const {set, cd, sed, echo, ls, rm} = require('shelljs');
const {readFileSync, writeFileSync} = require('fs');
const path = require('path');
const log = console.info;

// COMMENTED OUT BECAUSE WE CURRENTLY REQUIRE NO PATCHES
// UNCOMMENT TO REENABLE PATCHING AND LOG OUTPUT
//
log('===== about to run the postinstall-patches.js script     =====');
// fail on first error
set('-e');
// print commands as being executed
set('-v');
// jump to project root
cd(path.join(__dirname, '../'));

/* EXAMPLE PATCH:
// https://github.com/ReactiveX/rxjs/pull/3302
// make node_modules/rxjs compilable with Typescript 2.7
// remove when we update to rxjs v6
log('\n# patch: reactivex/rxjs#3302 make node_modules/rxjs compilable with Typescript 2.7');
sed('-i', '(\'response\' in xhr)', '(\'response\' in (xhr as any))',
    'node_modules/rxjs/src/observable/dom/AjaxObservable.ts');
*/

log('\n# patch: delete d.ts files referring to rxjs-compat');
// more info in https://github.com/angular/angular/pull/33786
rm('-rf', [
  'node_modules/rxjs/add/',
  'node_modules/rxjs/observable/',
  'node_modules/rxjs/operator/',
  // rxjs/operators is a public entry point that also contains files to support legacy deep import
  // paths, so we need to preserve index.* and package.json files that are required for module
  // resolution.
  'node_modules/rxjs/operators/!(index.*|package.json)',
  'node_modules/rxjs/scheduler/',
  'node_modules/rxjs/symbol/',
  'node_modules/rxjs/util/',
  'node_modules/rxjs/internal/Rx.d.ts',
  'node_modules/rxjs/AsyncSubject.*',
  'node_modules/rxjs/BehaviorSubject.*',
  'node_modules/rxjs/InnerSubscriber.*',
  'node_modules/rxjs/interfaces.*',
  'node_modules/rxjs/Notification.*',
  'node_modules/rxjs/Observable.*',
  'node_modules/rxjs/Observer.*',
  'node_modules/rxjs/Operator.*',
  'node_modules/rxjs/OuterSubscriber.*',
  'node_modules/rxjs/ReplaySubject.*',
  'node_modules/rxjs/Rx.*',
  'node_modules/rxjs/Scheduler.*',
  'node_modules/rxjs/Subject.*',
  'node_modules/rxjs/SubjectSubscription.*',
  'node_modules/rxjs/Subscriber.*',
  'node_modules/rxjs/Subscription.*',
]);

log('===== finished running the postinstall-patches.js script =====');
