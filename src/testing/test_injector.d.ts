import { Injector, Provider } from 'angular2/core';
import { Type } from 'angular2/src/facade/lang';
/**
 * Configures an injector suitable for testing.
 */
export declare class TestInjector {
    private _instantiated;
    private _injector;
    private _providers;
    reset(): void;
    addProviders(providers: Array<Type | Provider | any[]>): void;
    createInjector(): Injector;
    execute(fn: FunctionWithParamTokens): any;
}
/**
 * Retrieve the {@link TestInjector}, possibly creating one if it doesn't
 * exist yet.
 */
export declare function getTestInjector(): TestInjector;
/**
 * Allows injecting dependencies in `beforeEach()` and `it()`. When using with the
 * `angular2/testing` library, the test function will be run within a zone and will
 * automatically complete when all asynchronous tests have finished.
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
 *   object.doSomething().then(() => {
 *     expect(...);
 *   });
 * })
 * ```
 *
 * Notes:
 * - inject is currently a function because of some Traceur limitation the syntax should eventually
 *   becomes `it('...', @Inject (object: AClass, async: AsyncTestCompleter) => { ... });`
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
export declare function inject(tokens: any[], fn: Function): FunctionWithParamTokens;
/**
 * Use {@link inject} instead, which now supports both synchronous and asynchronous tests.
 *
 * @deprecated
 */
export declare function injectAsync(tokens: any[], fn: Function): FunctionWithParamTokens;
/**
 * A testing function with parameters which will be injected. See {@link inject} for details.
 */
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
