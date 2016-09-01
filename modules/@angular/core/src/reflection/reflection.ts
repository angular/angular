/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReflectionCapabilities} from './reflection_capabilities';
import {Reflector} from './reflector';

export {ReflectionInfo, Reflector} from './reflector';


/**
 * The {@link Reflector} used internally in Angular to access metadata
 * about symbols.
 */
export var reflector = new Reflector(new ReflectionCapabilities());
