import { FunctionWithParamTokens } from './test_injector';
export { inject, injectAsync } from './test_injector';
export { expect, NgMatchers } from './matchers';
export declare var afterEach: Function;
export declare var describe: Function;
export declare var ddescribe: Function;
export declare var fdescribe: Function;
export declare var xdescribe: Function;
export declare type SyncTestFn = () => void;
export declare type AsyncTestFn = (done: () => void) => void;
export declare type AnyTestFn = SyncTestFn | AsyncTestFn;
/**
 * Allows overriding default providers of the test injector,
 * defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * Example:
 *
 *   beforeEachProviders(() => [
 *     bind(Compiler).toClass(MockCompiler),
 *     bind(SomeToken).toValue(myValue),
 *   ]);
 */
export declare function beforeEachProviders(fn: any): void;
export declare function beforeEach(fn: FunctionWithParamTokens | AnyTestFn): void;
export declare function it(name: string, fn: FunctionWithParamTokens | AnyTestFn, timeOut?: number): void;
export declare function xit(name: string, fn: FunctionWithParamTokens | AnyTestFn, timeOut?: number): void;
export declare function iit(name: string, fn: FunctionWithParamTokens | AnyTestFn, timeOut?: number): void;
export declare function fit(name: string, fn: FunctionWithParamTokens | AnyTestFn, timeOut?: number): void;
