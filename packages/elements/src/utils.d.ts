/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector, Type } from '@angular/core';
/**
 * Provide methods for scheduling the execution of a callback.
 */
export declare const scheduler: {
    /**
     * Schedule a callback to be called after some delay.
     *
     * Returns a function that when executed will cancel the scheduled function.
     */
    schedule(taskFn: () => void, delay: number): () => void;
};
/**
 * Convert a camelCased string to kebab-cased.
 */
export declare function camelToDashCase(input: string): string;
/**
 * Check whether the input is an `Element`.
 */
export declare function isElement(node: Node | null): node is Element;
/**
 * Check whether the input is a function.
 */
export declare function isFunction(value: any): value is Function;
/**
 * Convert a kebab-cased string to camelCased.
 */
export declare function kebabToCamelCase(input: string): string;
/**
 * Check whether an `Element` matches a CSS selector.
 * NOTE: this is duplicated from @angular/upgrade, and can
 * be consolidated in the future
 */
export declare function matchesSelector(el: any, selector: string): boolean;
/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 */
export declare function strictEquals(value1: any, value2: any): boolean;
/** Gets a map of default set of attributes to observe and the properties they affect. */
export declare function getDefaultAttributeToPropertyInputs(inputs: {
    propName: string;
    templateName: string;
    transform?: (value: any) => any;
}[]): {
    [key: string]: [propName: string, transform: ((value: any) => any) | undefined];
};
/**
 * Gets a component's set of inputs. Uses the injector to get the component factory where the inputs
 * are defined.
 */
export declare function getComponentInputs(component: Type<any>, injector: Injector): {
    propName: string;
    templateName: string;
    transform?: (value: any) => any;
    isSignal: boolean;
}[];
