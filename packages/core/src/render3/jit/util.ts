/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModuleWithProviders} from '../../di/interface/provider';
import {Type} from '../../interface/type';
import {NgModuleDef} from '../../metadata/ng_module_def';
import {getNgModuleDef} from '../definition';

export function isModuleWithProviders(value: any): value is ModuleWithProviders<{}> {
  return (value as {ngModule?: any}).ngModule !== undefined;
}

export function isNgModule<T>(value: Type<T>): value is Type<T>&{ɵmod: NgModuleDef<T>} {
  return !!getNgModuleDef(value);
}
