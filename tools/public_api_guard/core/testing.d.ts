export declare var afterEach: Function;

export declare function async(fn: Function): Function;

export declare function beforeEach(fn: Function): void;

export declare function beforeEachProviders(fn: () => Array<any>): void;

export declare function clearPendingTimers(): void;

export declare var ddescribe: Function;

export declare var describe: Function;

export declare function discardPeriodicTasks(): void;

export declare var expect: Function;

export declare function fakeAsync(fn: Function): Function;

export declare var fdescribe: Function;

export declare function fit(name: string, fn: Function, timeOut?: number): void;

export declare function flushMicrotasks(): void;

export declare function getTestInjector(): TestInjector;

export declare function getTypeOf(instance: any): any;

export declare function iit(name: string, fn: Function, timeOut?: number): void;

export declare function inject(tokens: any[], fn: Function): Function;

export declare function injectAsync(tokens: any[], fn: Function): Function;

export declare class InjectSetupWrapper {
    constructor(_providers: () => any);
    inject(tokens: any[], fn: Function): Function;
    injectAsync(tokens: any[], fn: Function): Function;
}

export declare function instantiateType(type: Function, params?: any[]): any;

export declare function it(name: string, fn: Function, timeOut?: number): void;

export declare class Log {
    logItems: any[];
    constructor();
    add(value: any): void;
    fn(value: any): (a1?: any, a2?: any, a3?: any, a4?: any, a5?: any) => void;
    clear(): void;
    result(): string;
}

export declare class MockApplicationRef extends ApplicationRef {
    registerBootstrapListener(listener: (ref: ComponentRef<any>) => void): void;
    registerDisposeListener(dispose: () => void): void;
    bootstrap<C>(componentFactory: ComponentFactory<C>): ComponentRef<C>;
    injector: Injector;
    zone: NgZone;
    run(callback: Function): any;
    waitForAsyncInitializers(): Promise<any>;
    dispose(): void;
    tick(): void;
    componentTypes: Type[];
}

export declare class MockNgZone extends NgZone {
    constructor();
    onStable: EventEmitter<any>;
    run(fn: Function): any;
    runOutsideAngular(fn: Function): any;
    simulateZoneExit(): void;
}

export declare function resetBaseTestProviders(): void;

export declare function setBaseTestProviders(platformProviders: Array<Type | Provider | any[]>, applicationProviders: Array<Type | Provider | any[]>): void;

export declare class TestInjector {
    reset(): void;
    platformProviders: Array<Type | Provider | any[] | any>;
    applicationProviders: Array<Type | Provider | any[] | any>;
    addProviders(providers: Array<Type | Provider | any[] | any>): void;
    createInjector(): ReflectiveInjector;
    get(token: any): any;
    execute(tokens: any[], fn: Function): any;
}

export declare function tick(millis?: number): void;

export declare function withProviders(providers: () => any): InjectSetupWrapper;

export declare var xdescribe: Function;

export declare function xit(name: string, fn: Function, timeOut?: number): void;
