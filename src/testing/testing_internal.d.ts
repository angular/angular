import { FunctionWithParamTokens } from './test_injector';
export { inject } from './test_injector';
export { expect, NgMatchers } from './matchers';
export declare var proxy: ClassDecorator;
export declare var afterEach: Function;
export declare type SyncTestFn = () => void;
export declare class AsyncTestCompleter {
    private _done;
    constructor(_done: Function);
    done(): void;
}
export declare function describe(...args: any[]): void;
export declare function ddescribe(...args: any[]): void;
export declare function xdescribe(...args: any[]): void;
export declare function beforeEach(fn: FunctionWithParamTokens | SyncTestFn): void;
/**
 * Allows overriding default providers defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * Example:
 *
 *   beforeEachBindings(() => [
 *     provide(Compiler, {useClass: MockCompiler}),
 *     provide(SomeToken, {useValue: myValue}),
 *   ]);
 */
export declare function beforeEachProviders(fn: any): void;
/**
 * @deprecated
 */
export declare function beforeEachBindings(fn: any): void;
export declare function it(name: any, fn: any, timeOut?: any): void;
export declare function xit(name: any, fn: any, timeOut?: any): void;
export declare function iit(name: any, fn: any, timeOut?: any): void;
export interface GuinessCompatibleSpy extends jasmine.Spy {
    /** By chaining the spy with and.returnValue, all calls to the function will return a specific
     * value. */
    andReturn(val: any): void;
    /** By chaining the spy with and.callFake, all calls to the spy will delegate to the supplied
     * function. */
    andCallFake(fn: Function): GuinessCompatibleSpy;
    /** removes all recorded calls */
    reset(): any;
}
export declare class SpyObject {
    constructor(type?: any);
    noSuchMethod(args: any): void;
    spy(name: any): any;
    prop(name: any, value: any): void;
    static stub(object?: any, config?: any, overrides?: any): any;
}
export declare function isInInnerZone(): boolean;
