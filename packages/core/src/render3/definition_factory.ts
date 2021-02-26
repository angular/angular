/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {stringify} from '../util/stringify';
import {NG_FACTORY_DEF} from './fields';


/**
 * Definition of what a factory function should look like.
 */
export type FactoryFn<T> = {
  /**
   * Subclasses without an explicit constructor call through to the factory of their base
   * definition, providing it with their own constructor to instantiate.
   */
  <U extends T>(t?: Type<U>): U;

  /**
   * If no constructor to instantiate is provided, an instance of type T itself is created.
   */
  (t?: undefined): T;
};


export function getFactoryDef<T>(type: any, throwNotFound: true): FactoryFn<T>;
export function getFactoryDef<T>(type: any): FactoryFn<T>|null;
export function getFactoryDef<T>(type: any, throwNotFound?: boolean): FactoryFn<T>|null {
  const hasFactoryDef = type.hasOwnProperty(NG_FACTORY_DEF);
  if (!hasFactoryDef && throwNotFound === true && ngDevMode) {
    throw new Error(`Type ${stringify(type)} does not have 'ɵfac' property.`);
  }
  return hasFactoryDef ? type[NG_FACTORY_DEF] : null;
}
