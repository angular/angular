import { Injector, Provider } from 'angular2/core';
import { Type } from 'angular2/src/facade/lang';
export declare function createTestInjector(providers: Array<Type | Provider | any[]>): Injector;
export declare function createTestInjectorWithRuntimeCompiler(providers: Array<Type | Provider | any[]>): Injector;
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
 * - inject is currently a function because of some Traceur limitation the syntax should eventually
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
