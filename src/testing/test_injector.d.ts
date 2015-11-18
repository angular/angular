import { Provider } from 'angular2/src/core/di';
import { Injector } from 'angular2/src/core/di';
import { Type } from 'angular2/src/facade/lang';
export declare function createTestInjector(providers: Array<Type | Provider | any[]>): Injector;
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
 * it('...', inject([AClass, AsyncTestCompleter], (object, async) => {
 *   object.doSomething().then(() => {
 *     expect(...);
 *     async.done();
 *   });
 * })
 * ```
 *
 * Notes:
 * - injecting an `AsyncTestCompleter` allow completing async tests - this is the equivalent of
 *   adding a `done` parameter in Jasmine,
 * - inject is currently a function because of some Traceur limitation the syntax should eventually
 *   becomes `it('...', @Inject (object: AClass, async: AsyncTestCompleter) => { ... });`
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
export declare function inject(tokens: any[], fn: Function): FunctionWithParamTokens;
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
