import { FunctionWithParamTokens } from './test_injector';
export { inject, injectAsync } from './test_injector';
export { expect, NgMatchers } from './matchers';
/**
 * Run a function (with an optional asynchronous callback) after each test case.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='afterEach'}
 */
export declare var afterEach: Function;
/**
 * Group test cases together under a common description prefix.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='describeIt'}
 */
export declare var describe: Function;
/**
 * See {@link fdescribe}.
 */
export declare var ddescribe: Function;
/**
 * Like {@link describe}, but instructs the test runner to only run
 * the test cases in this group. This is useful for debugging.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='fdescribe'}
 */
export declare var fdescribe: Function;
/**
 * Like {@link describe}, but instructs the test runner to exclude
 * this group of test cases from execution. This is useful for
 * debugging, or for excluding broken tests until they can be fixed.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='xdescribe'}
 */
export declare var xdescribe: Function;
/**
 * Signature for a synchronous test function (no arguments).
 */
export declare type SyncTestFn = () => void;
/**
 * Signature for an asynchronous test function which takes a
 * `done` callback.
 */
export declare type AsyncTestFn = (done: () => void) => void;
/**
 * Signature for any simple testing function.
 */
export declare type AnyTestFn = SyncTestFn | AsyncTestFn;
/**
 * Allows overriding default providers of the test injector,
 * which are defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='beforeEachProviders'}
 */
export declare function beforeEachProviders(fn: any): void;
/**
 * Wrapper around Jasmine beforeEach function.
 *
 * beforeEach may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='beforeEach'}
 */
export declare function beforeEach(fn: FunctionWithParamTokens | AnyTestFn): void;
/**
 * Define a single test case with the given test name and execution function.
 *
 * The test function can be either a synchronous function, an asynchronous function
 * that takes a completion callback, or an injected function created via {@link inject}
 * or {@link injectAsync}. The test will automatically wait for any asynchronous calls
 * inside the injected test function to complete.
 *
 * Wrapper around Jasmine it function. See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='describeIt'}
 */
export declare function it(name: string, fn: FunctionWithParamTokens | AnyTestFn, timeOut?: number): void;
/**
 * Like {@link it}, but instructs the test runner to exclude this test
 * entirely. Useful for debugging or for excluding broken tests until
 * they can be fixed.
 *
 * Wrapper around Jasmine xit function. See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='xit'}
 */
export declare function xit(name: string, fn: FunctionWithParamTokens | AnyTestFn, timeOut?: number): void;
/**
 * See {@link fit}.
 */
export declare function iit(name: string, fn: FunctionWithParamTokens | AnyTestFn, timeOut?: number): void;
/**
 * Like {@link it}, but instructs the test runner to only run this test.
 * Useful for debugging.
 *
 * Wrapper around Jasmine fit function. See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='fit'}
 */
export declare function fit(name: string, fn: FunctionWithParamTokens | AnyTestFn, timeOut?: number): void;
