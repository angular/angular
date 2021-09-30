/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleFactory} from './ng_module_factory';

/**
 * Used to load ng module factories.
 */
export abstract class NgModuleFactoryLoader {
  abstract load(path: string): Promise<NgModuleFactory<any>>;
}
