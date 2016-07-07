/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AppModuleFactory} from './app_module_factory';

/**
 * Used to load app moduled factories.
 * @experimental
 */
export abstract class AppModuleFactoryLoader {
  abstract load(path: string): Promise<AppModuleFactory<any>>;
}