import { Injector, Provider } from 'angular2/core';
import { Type } from 'angular2/src/facade/lang';
export declare class TestInjector {
    private _instantiated;
    private _injector;
    private _providers;
    reset(): void;
    platformProviders: Array<Type | Provider | any[]>;
    applicationProviders: Array<Type | Provider | any[]>;
    addProviders(providers: Array<Type | Provider | any[]>): void;
    createInjector(): Injector;
    execute(fn: FunctionWithParamTokens): any;
}
export declare function getTestInjector(): TestInjector;
/**
 * Set the providers that the test injector should use. These should be providers
 * common to every test in the suite.
 *
 * This may only be called once, to set up the common providers for the current test
 * suite on teh current platform. If you absolutely need to change the providers,
 * first use `resetBaseTestProviders`.
 *
 * Test Providers for individual platforms are available from
 * 'angular2/platform/testing/<platform_name>'.
 */
export declare function setBaseTestProviders(platformProviders: Array<Type | Provider | any[]>, applicationProviders: Array<Type | Provider | any[]>): void;
/**
 * Reset the providers for the test injector.
 */
export declare function resetBaseTestProviders(): void;
/**
 * Allows injecting dependencies in `beforeEach()` and `it()`.
 *
 * Example:
 *
 * ```
 * beforeEach(inject([Dependency, AClass], (dep, object) => {
 *   // some code that uses `dep` and `object`
 *   // ...
 * }));
 *
 * it('...', inject([AClass], (object) => {
 *   object.doSomething();
 *   expect(...);
 * })
 * ```
 *
 * Notes:
 * - inject is currently a function because of some Traceur limitation the syntax should
 * eventually
 *   becomes `it('...', @Inject (object: AClass, async: AsyncTestCompleter) => { ... });`
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
export declare function inject(tokens: any[], fn: Function): FunctionWithParamTokens;
/**
 * Allows injecting dependencies in `beforeEach()` and `it()`. The test must return
 * a promise which will resolve when all asynchronous activity is complete.
 *
 * Example:
 *
 * ```
 * it('...', injectAsync([AClass], (object) => {
 *   return object.doSomething().then(() => {
 *     expect(...);
 *   });
 * })
 * ```
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
export declare function injectAsync(tokens: any[], fn: Function): FunctionWithParamTokens;
export declare class FunctionWithParamTokens {
    private _tokens;
    private _fn;
    isAsync: boolean;
    constructor(_tokens: any[], _fn: Function, isAsync: boolean);
    /**
     * Returns the value of the executed function.
     */
    execute(injector: Injector): any;
    hasToken(token: any): boolean;
}
