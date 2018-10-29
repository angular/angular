/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Type} from '@angular/core';

/**
 * Workaround for https://github.com/angular/material2/issues/12760. In order to work around
 * the issue where classes which extend external classes do not have the proper metadata in
 * ES2015, we just manually inherit the metadata for the constructor parameters.
 * TODO(devversion): check if we can remove the workaround after ivy landed.
 */
export function _inheritCtorParametersMetadata(target: Type<any>, base: Type<any>) {
  (target as any)['ctorParameters'] = () => {
    const baseParameters = (base as any)['ctorParameters'];
    return (typeof baseParameters === 'function' ? baseParameters() : baseParameters) || [];
  };
}
