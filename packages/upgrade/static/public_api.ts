/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {getAngularJSGlobal, getAngularLib, setAngularJSGlobal, setAngularLib} from '../src/common/src/angular1.js';
export {downgradeComponent} from '../src/common/src/downgrade_component.js';
export {downgradeInjectable} from '../src/common/src/downgrade_injectable.js';
export {VERSION} from '../src/common/src/version.js';
export {downgradeModule} from './src/downgrade_module.js';
export {UpgradeComponent} from './src/upgrade_component.js';
export {UpgradeModule} from './src/upgrade_module.js';


// This file only re-exports items to appear in the public api. Keep it that way.
