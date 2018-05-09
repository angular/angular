/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineInjectable} from '../../di/defs';
import {inject} from '../../di/injector';
import {defineNgModule} from '../../metadata/ng_module';
import * as r3 from '../index';


/**
 * A mapping of the @angular/core API surface used in generated expressions to the actual symbols.
 *
 * This should be kept up to date with the public exports of @angular/core.
 */
export const angularCoreEnv = {
  'ɵdefineComponent': r3.defineComponent,
  'defineInjectable': defineInjectable,
  'ɵdefineNgModule': defineNgModule,
  'ɵdirectiveInject': r3.directiveInject,
  'inject': inject,
  'ɵC': r3.C,
  'ɵE': r3.E,
  'ɵe': r3.e,
  'ɵi1': r3.i1,
  'ɵi2': r3.i2,
  'ɵi3': r3.i3,
  'ɵi4': r3.i4,
  'ɵi5': r3.i5,
  'ɵi6': r3.i6,
  'ɵi7': r3.i7,
  'ɵi8': r3.i8,
  'ɵT': r3.T,
  'ɵt': r3.t,
};
