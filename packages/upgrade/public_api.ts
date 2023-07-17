/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of this package. allowing
 * Angular 1 and Angular 2+ to run side by side in the same application.
 */
export {VERSION} from './src/common/src/version';
export {UpgradeAdapter, UpgradeAdapterRef} from './src/dynamic/src/upgrade_adapter';

// This file only re-exports content of the `src` folder. Keep it that way.
