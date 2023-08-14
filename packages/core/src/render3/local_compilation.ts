/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';

import {DependencyTypeList, RawScopeInfoFromDecorator} from './interfaces/definition';

export function ɵɵgetComponentDepsFactory(
    type: Type<any>, rawImports?: RawScopeInfoFromDecorator): () => DependencyTypeList {
  // TODO(pmvald): Implement this runtime using deps tracker.
  return () => [];
}
