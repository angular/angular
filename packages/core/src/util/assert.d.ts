/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare function assertNumber(actual: any, msg: string): asserts actual is number;
export declare function assertNumberInRange(actual: any, minInclusive: number, maxInclusive: number): asserts actual is number;
export declare function assertString(actual: any, msg: string): asserts actual is string;
export declare function assertFunction(actual: any, msg: string): asserts actual is Function;
export declare function assertEqual<T>(actual: T, expected: T, msg: string): void;
export declare function assertNotEqual<T>(actual: T, expected: T, msg: string): asserts actual is T;
export declare function assertSame<T>(actual: T, expected: T, msg: string): asserts actual is T;
export declare function assertNotSame<T>(actual: T, expected: T, msg: string): void;
export declare function assertLessThan<T>(actual: T, expected: T, msg: string): asserts actual is T;
export declare function assertLessThanOrEqual<T>(actual: T, expected: T, msg: string): asserts actual is T;
export declare function assertGreaterThan<T>(actual: T, expected: T, msg: string): asserts actual is T;
export declare function assertGreaterThanOrEqual<T>(actual: T, expected: T, msg: string): asserts actual is T;
export declare function assertNotDefined<T>(actual: T, msg: string): void;
export declare function assertDefined<T>(actual: T | null | undefined, msg: string): asserts actual is T;
export declare function throwError(msg: string): never;
export declare function throwError(msg: string, actual: any, expected: any, comparison: string): never;
export declare function assertDomNode(node: any): asserts node is Node;
export declare function assertElement(node: any): asserts node is Element;
export declare function assertIndexInRange(arr: any[], index: number): void;
export declare function assertOneOf(value: any, ...validValues: any[]): boolean;
export declare function assertNotReactive(fn: string): void;
