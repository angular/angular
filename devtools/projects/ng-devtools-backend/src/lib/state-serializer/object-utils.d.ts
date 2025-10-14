/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare function getKeys(obj: {}): string[];
/**
 * This helper function covers the common scenario as well as the getters and setters
 * @param instance The target object
 * @param propName The string representation of the target property name
 * @returns The Descriptor object of the property
 */
export declare const getDescriptor: (instance: any, propName: string) => PropertyDescriptor | undefined;
