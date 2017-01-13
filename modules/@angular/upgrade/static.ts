/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of the upgrade/static package, allowing
 * Angular 1 and Angular 2+ to run side by side in the same application.
 */
export {downgradeInjectable} from './src/common/downgrade_injectable';
export {downgradeComponent} from './src/static/downgrade_component';
export {UpgradeComponent} from './src/static/upgrade_component';
export {UpgradeModule} from './src/static/upgrade_module';

// This file only re-exports content of the `src` folder. Keep it that way.
