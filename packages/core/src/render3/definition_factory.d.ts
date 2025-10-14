/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../interface/type';
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
export declare function getFactoryDef<T>(type: any, throwNotFound: true): FactoryFn<T>;
export declare function getFactoryDef<T>(type: any): FactoryFn<T> | null;
