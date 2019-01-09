/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleDef} from '../../decorators/ng_module';
import {Type} from '../../interfaces/type';

export interface NgModuleType<T = any> extends Type<T> { ngModuleDef: NgModuleDef<T>; }
