/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵinject, ɵɵinvalidFactoryDep} from '../injector_compatibility';
import {ɵɵdefineInjectable, ɵɵdefineInjector} from '../interface/defs';

/**
 * A mapping of the @angular/core API surface used in generated expressions to the actual symbols.
 *
 * This should be kept up to date with the public exports of @angular/core.
 */
export const angularCoreDiEnv: {[name: string]: Function} = {
  'ɵɵdefineInjectable': ɵɵdefineInjectable,
  'ɵɵdefineInjector': ɵɵdefineInjector,
  'ɵɵinject': ɵɵinject,
  'ɵɵinvalidFactoryDep': ɵɵinvalidFactoryDep,
};
