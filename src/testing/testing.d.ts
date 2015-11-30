import { FunctionWithParamTokens } from './test_injector';
export { inject, injectAsync } from './test_injector';
export { expect, NgMatchers } from './matchers';
/**
 * See http://jasmine.github.io/
 */
export declare var afterEach: Function;
/**
 * See http://jasmine.github.io/
 */
export declare var describe: Function;
/**
 * See http://jasmine.github.io/
 */
export declare var ddescribe: Function;
/**
 * See http://jasmine.github.io/
 */
export declare var fdescribe: Function;
/**
 * See http://jasmine.github.io/
 */
export declare var xdescribe: Function;
export declare type SyncTestFn = () => void;
export declare type AsyncTestFn = (done: () => void) => void;
export declare type AnyTestFn = SyncTestFn | AsyncTestFn;
/**
 * Allows overriding default providers of the test injector,
 * which are defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * Example:
 *
 * ```
 *   beforeEachProviders(() => [
 *     bind(Compiler).toClass(MockCompiler),
 *     bind(SomeToken).toValue(myValue),
 *   ]);
 * ```
 */
export declare function beforeEachProviders(fn: any): void;
/**
 * Wrapper around Jasmine beforeEach function.
 * See http://jasmine.github.io/
 *
 * beforeEach may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
export declare function beforeEach(fn: FunctionWithParamTokens | AnyTestFn): void;
/**
 * Wrapper around Jasmine it function.
 * See http://jasmine.github.io/
 *
 * it may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
export declare function it(name: string, fn: FunctionWithParamTokens | AnyTestFn, timeOut?: number): void;
/**
 * Wrapper around Jasmine xit (skipped it) function.
 * See http://jasmine.github.io/
 *
 * it may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
export declare function xit(name: string, fn: FunctionWithParamTokens | AnyTestFn, timeOut?: number): void;
/**
 * Wrapper around Jasmine iit (focused it) function.
 * See http://jasmine.github.io/
 *
 * it may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
export declare function iit(name: string, fn: FunctionWithParamTokens | AnyTestFn, timeOut?: number): void;
/**
 * Wrapper around Jasmine fit (focused it) function.
 * See http://jasmine.github.io/
 *
 * it may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
export declare function fit(name: string, fn: FunctionWithParamTokens | AnyTestFn, timeOut?: number): void;
