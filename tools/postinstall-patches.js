/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const {set, cd, sed, rm} = require('shelljs');
const path = require('path');
const log = console.log;

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

// workaround to make our closure compiler integration tests in integration/i18n pass
// https://github.com/ReactiveX/rxjs/pull/3431
rm('-f', 'node_modules/rxjs/_esm2015/internal/umd.js');
rm('-f', 'node_modules/rxjs/_esm5/internal/umd.js');

log('===== finished running the postinstall-patches.js script =====');
