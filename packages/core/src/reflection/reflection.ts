/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReflectionCapabilities} from './reflection_capabilities';
import {Reflector} from './reflector';

export {Reflector} from './reflector';

/**
 * The {@link Reflector} used internally in Angular to access metadata
 * about symbols.
 */
export const reflector = new Reflector(new ReflectionCapabilities());
