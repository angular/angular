/**
 * @license Angular v22.3.0-next.0+sha-95e8dec
 * (c) 2010-2026 Google LLC. https://angular.dev/
 * License: MIT
 */

import './_formatter-chunk.js';
import './_event_dispatcher-chunk.js';
import { InjectionToken, Type, ProviderToken, InjectOptions } from './core.js';
import { DeferBlockState, DeferBlockBehavior } from './_debug_node-chunk.js';
import { ɵDeferBlockDetails as DeferBlockDetails, ComponentRef, DebugElement, ElementRef, ChangeDetectorRef, NgZone, SchemaMetadata, PlatformRef, NgModule, Component, Directive, Pipe, Binding, ɵNavigation as Navigation, ɵNavigationHistoryEntry as NavigationHistoryEntry, ɵNavigationNavigateOptions as NavigationNavigateOptions, ɵNavigationResult as NavigationResult, ɵNavigationOptions as NavigationOptions, ɵNavigateEvent as NavigateEvent, ɵNavigationDestination as NavigationDestination, ɵNavigationCurrentEntryChangeEvent as NavigationCurrentEntryChangeEvent, ɵNavigationTransition as NavigationTransition, ɵNavigationUpdateCurrentEntryOptions as NavigationUpdateCurrentEntryOptions, ɵNavigationReloadOptions as NavigationReloadOptions } from './core.js';
import * as _angular_core from '@angular/core';
import 'rxjs';
import './_effect-chunk.js';
import '@angular/core/primitives/di';

/**
 * Wraps a test function in an asynchronous test zone. The test will automatically
 * complete when all asynchronous calls within this zone are done. Can be used
 * to wrap an {@link inject} call.
 *
 * Example:
 *
 * ```ts
 * it('...', waitForAsync(inject([AClass], (object) => {
 *   object.doSomething.then(() => {
 *     expect(...);
 *   })
 * })));
 * ```
 *
 * @publicApi
 */
declare function waitForAsync(fn: Function): (done: any) => any;

/**
 * Represents an individual defer block for testing purposes.
 *
 * @publicApi
 */
declare class DeferBlockFixture {
    private block;
    private componentFixture;
    /** @docs-private */
    constructor(block: DeferBlockDetails, componentFixture: ComponentFixture<unknown>);
    /**
     * Renders the specified state of the defer fixture.
     * @param state the defer state to render
     */
    render(state: DeferBlockState): Promise<void>;
    /**
     * Retrieves all nested child defer block fixtures
     * in a given defer block.
     */
    getDeferBlocks(): Promise<DeferBlockFixture[]>;
}

declare abstract class AbstractFixture<E> {
    protected readonly hostRef: ComponentRef<unknown>;
    /**
     * The DebugElement associated with the root element of this component.
     */
    debugElement: DebugElement;
    /**
     * The native element at the root of the component.
     */
    nativeElement: E;
    /**
     * The ElementRef for the element at the root of the component.
     */
    elementRef: ElementRef<E>;
    private _renderer;
    private _isDestroyed;
    private readonly _testAppRef;
    private readonly pendingTasks;
    private readonly appErrorHandler;
    private readonly zonelessEnabled;
    private readonly scheduler;
    private readonly rootEffectScheduler;
    private readonly autoDetectDefault;
    private autoDetect;
    private subscriptions;
    private readonly hostView;
    readonly changeDetectorRef: ChangeDetectorRef;
    /** @docs-private */
    constructor(hostRef: ComponentRef<unknown>);
    /**
     * Trigger a change detection cycle for the component.
     */
    detectChanges(checkNoChanges?: boolean): void;
    /**
     * Do a change detection run to make sure there were no changes.
     */
    checkNoChanges(): void;
    /**
     * Set whether the fixture should autodetect changes.
     *
     * Also runs detectChanges once so that any existing change is detected.
     *
     * @param autoDetect Whether to autodetect changes. By default, `true`.
     * @deprecated For `autoDetect: true`, use `autoDetectChanges()`.
     * We have not seen a use-case for `autoDetect: false` but `changeDetectorRef.detach()` is a close equivalent.
     */
    autoDetectChanges(autoDetect: boolean): void;
    /**
     * Enables automatically synchronizing the view, as it would in an application.
     *
     * Also runs detectChanges once so that any existing change is detected.
     */
    autoDetectChanges(): void;
    /**
     * Return whether the fixture is currently stable or has async tasks that have not been completed
     * yet.
     */
    isStable(): boolean;
    /**
     * Get a promise that resolves when the fixture is stable.
     *
     * This can be used to resume testing after events have triggered asynchronous activity or
     * asynchronous change detection.
     */
    whenStable(): Promise<any>;
    private _getRenderer;
    /**
     * Get a promise that resolves when the ui state is stable following animations.
     */
    whenRenderingDone(): Promise<any>;
    /**
     * Trigger component destruction.
     */
    destroy(): void;
}
/**
 * Fixture for debugging and testing a component.
 *
 * @publicApi
 */
declare class ComponentFixture<T> extends AbstractFixture<any> {
    componentRef: ComponentRef<T>;
    /**
     * The instance of the root component class.
     */
    componentInstance: T;
    ngZone: NgZone | null;
    /** @docs-private */
    constructor(componentRef: ComponentRef<T>);
    /**
     * Retrieves all defer block fixtures in the component fixture.
     */
    getDeferBlocks(): Promise<DeferBlockFixture[]>;
}
/**
 * Fixture for debugging and testing a directive.
 *
 * @publicApi
 */
declare class DirectiveFixture<T> extends AbstractFixture<Element> {
    /**
     * The instance of the directive class.
     */
    readonly directiveInstance: T;
    constructor(hostRef: ComponentRef<unknown>, directiveInstance: T);
    /** Registers a callback that will be invoked when the fixture is destroyed. */
    onDestroy(callback: () => void): void;
}

/**
 * IMPORTANT: This API requires Zone.js and cannot be used with the Vitest test runner
 *
 * Clears out the shared fake async zone for a test.
 * To be called in a global `beforeEach`.
 *
 * @publicApi
 */
declare function resetFakeAsyncZone(): void;
/**
 * IMPORTANT: This API requires Zone.js and cannot be used with the Vitest test runner
 *
 * Wraps a function to be executed in the `fakeAsync` zone:
 * - Microtasks are manually executed by calling `flushMicrotasks()`.
 * - Timers are synchronous; `tick()` simulates the asynchronous passage of time.
 *
 * Can be used to wrap `inject()` calls.
 *
 * @param fn The function that you want to wrap in the `fakeAsync` zone.
 * @param options
 *   - flush: When true, will drain the macrotask queue after the test function completes.
 *     When false, will throw an exception at the end of the function if there are pending timers.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 *
 * @returns The function wrapped to be executed in the `fakeAsync` zone.
 * Any arguments passed when calling this returned function will be passed through to the `fn`
 * function in the parameters when it is called.
 *
 * @publicApi
 */
declare function fakeAsync(fn: Function, options?: {
    flush?: boolean;
}): (...args: any[]) => any;
/**
 * IMPORTANT: This API requires Zone.js and cannot be used with the Vitest test runner
 *
 * Simulates the asynchronous passage of time for the timers in the `fakeAsync` zone.
 *
 * The microtasks queue is drained at the very start of this function and after any timer callback
 * has been executed.
 *
 * @param millis The number of milliseconds to advance the virtual timer.
 * @param tickOptions The options to pass to the `tick()` function.
 *
 * @usageNotes
 *
 * The `tick()` option is a flag called `processNewMacroTasksSynchronously`,
 * which determines whether or not to invoke new macroTasks.
 *
 * If you provide a `tickOptions` object, but do not specify a
 * `processNewMacroTasksSynchronously` property (`tick(100, {})`),
 * then `processNewMacroTasksSynchronously` defaults to true.
 *
 * If you omit the `tickOptions` parameter (`tick(100))`), then
 * `tickOptions` defaults to `{processNewMacroTasksSynchronously: true}`.
 *
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 * The following example includes a nested timeout (new macroTask), and
 * the `tickOptions` parameter is allowed to default. In this case,
 * `processNewMacroTasksSynchronously` defaults to true, and the nested
 * function is executed on each tick.
 *
 * ```ts
 * it ('test with nested setTimeout', fakeAsync(() => {
 *   let nestedTimeoutInvoked = false;
 *   function funcWithNestedTimeout() {
 *     setTimeout(() => {
 *       nestedTimeoutInvoked = true;
 *     });
 *   };
 *   setTimeout(funcWithNestedTimeout);
 *   tick();
 *   expect(nestedTimeoutInvoked).toBe(true);
 * }));
 * ```
 *
 * In the following case, `processNewMacroTasksSynchronously` is explicitly
 * set to false, so the nested timeout function is not invoked.
 *
 * ```ts
 * it ('test with nested setTimeout', fakeAsync(() => {
 *   let nestedTimeoutInvoked = false;
 *   function funcWithNestedTimeout() {
 *     setTimeout(() => {
 *       nestedTimeoutInvoked = true;
 *     });
 *   };
 *   setTimeout(funcWithNestedTimeout);
 *   tick(0, {processNewMacroTasksSynchronously: false});
 *   expect(nestedTimeoutInvoked).toBe(false);
 * }));
 * ```
 *
 *
 * @publicApi
 */
declare function tick(millis?: number, tickOptions?: {
    processNewMacroTasksSynchronously: boolean;
}): void;
/**
 * IMPORTANT: This API requires Zone.js and cannot be used with the Vitest test runner
 *
 * Flushes any pending microtasks and simulates the asynchronous passage of time for the timers in
 * the `fakeAsync` zone by
 * draining the macrotask queue until it is empty.
 *
 * @param maxTurns The maximum number of times the scheduler attempts to clear its queue before
 *     throwing an error.
 * @returns The simulated time elapsed, in milliseconds.
 *
 * @publicApi
 */
declare function flush(maxTurns?: number): number;
/**
 * IMPORTANT: This API requires Zone.js and cannot be used with the Vitest test runner
 *
 * Discard all remaining periodic tasks.
 *
 * @publicApi
 */
declare function discardPeriodicTasks(): void;
/**
 * IMPORTANT: This API requires Zone.js and cannot be used with the Vitest test runner
 *
 * Flush any pending microtasks.
 *
 * @publicApi
 */
declare function flushMicrotasks(): void;

/**
 * Type used for modifications to metadata
 *
 * @publicApi
 */
type MetadataOverride<T> = {
    add?: Partial<T>;
    remove?: Partial<T>;
    set?: Partial<T>;
};

/**
 * An abstract class for inserting the root test component element in a platform independent way.
 *
 * @publicApi
 */
declare class TestComponentRenderer {
    insertRootElement(rootElementId: string, tagName?: string): void;
    removeAllRootElements?(): void;
}
/**
 * @publicApi
 */
declare const ComponentFixtureAutoDetect: InjectionToken<boolean>;
/**
 * @publicApi
 */
declare const ComponentFixtureNoNgZone: InjectionToken<boolean>;
/**
 * @publicApi
 */
interface TestModuleMetadata {
    providers?: any[];
    declarations?: any[];
    imports?: any[];
    schemas?: Array<SchemaMetadata | any[]>;
    teardown?: ModuleTeardownOptions;
    /**
     * Whether NG0304 runtime errors should be thrown when unknown elements are present in component's
     * template. Defaults to `false`, where the error is simply logged. If set to `true`, the error is
     * thrown.
     * @see [NG8001](/errors/NG8001) for the description of the problem and how to fix it
     */
    errorOnUnknownElements?: boolean;
    /**
     * Whether errors should be thrown when unknown properties are present in component's template.
     * Defaults to `false`, where the error is simply logged.
     * If set to `true`, the error is thrown.
     * @see [NG8002](/errors/NG8002) for the description of the error and how to fix it
     */
    errorOnUnknownProperties?: boolean;
    /**
     * Whether errors that happen during application change detection should be rethrown.
     *
     * When `true`, errors that are caught during application change detection will
     * be reported to the `ErrorHandler` and rethrown to prevent them from going
     * unnoticed in tests.
     *
     * When `false`, errors are only forwarded to the `ErrorHandler`, which by default
     * simply logs them to the console.
     *
     * Defaults to `true`.
     */
    rethrowApplicationErrors?: boolean;
    /**
     * Whether defer blocks should behave with manual triggering or play through normally.
     * Defaults to `manual`.
     */
    deferBlockBehavior?: DeferBlockBehavior;
    /**
     * Whether to infer the tag name of test components from their selectors.
     * Otherwise `div` will be used as the tag name for test components.
     */
    inferTagName?: boolean;
    /**
     * Whether animate.enter / animate.leave should trigger as normal or be disabled.
     * Defaults to `false`.
     */
    animationsEnabled?: boolean;
}
/**
 * @publicApi
 */
interface TestEnvironmentOptions {
    /**
     * Configures the test module teardown behavior in `TestBed`.
     */
    teardown?: ModuleTeardownOptions;
    /**
     * Whether errors should be thrown when unknown elements are present in component's template.
     * Defaults to `false`, where the error is simply logged.
     * If set to `true`, the error is thrown.
     * @see [NG8001](/errors/NG8001) for the description of the error and how to fix it
     */
    errorOnUnknownElements?: boolean;
    /**
     * Whether errors should be thrown when unknown properties are present in component's template.
     * Defaults to `false`, where the error is simply logged.
     * If set to `true`, the error is thrown.
     * @see [NG8002](/errors/NG8002) for the description of the error and how to fix it
     */
    errorOnUnknownProperties?: boolean;
}
/**
 * Configures the test module teardown behavior in `TestBed`.
 * @publicApi
 */
interface ModuleTeardownOptions {
    /** Whether the test module should be destroyed after every test. Defaults to `true`. */
    destroyAfterEach: boolean;
    /** Whether errors during test module destruction should be re-thrown. Defaults to `true`. */
    rethrowErrors?: boolean;
}

/**
 * Static methods implemented by the `TestBed`.
 *
 * @publicApi
 */
interface TestBedStatic extends TestBed {
    new (...args: any[]): TestBed;
}
/**
 * Options that can be configured for a test component.
 *
 * @publicApi
 */
interface TestComponentOptions {
    /** Bindings to apply to the test component. */
    bindings?: Binding[];
    /**
     * Whether to infer the tag name of the test component from its selector.
     * Otherwise `div` will be used as its tag name.
     */
    inferTagName?: boolean;
}
/**
 * Options that can be configured for a test directive.
 *
 * @publicApi 22.2
 */
interface TestDirectiveOptions {
    tagName?: string;
    /** Bindings to apply to the test directive. */
    bindings?: Binding[];
}
/**
 * Returns a singleton of the `TestBed` class.
 *
 * @publicApi
 */
declare function getTestBed(): TestBed;
/**
 * @publicApi
 */
interface TestBed {
    get platform(): PlatformRef;
    get ngModule(): Type<any> | Type<any>[];
    /**
     * Initialize the environment for testing with a compiler factory, a PlatformRef, and an
     * angular module. These are common to every test in the suite.
     *
     * This may only be called once, to set up the common providers for the current test
     * suite on the current platform. If you absolutely need to change the providers,
     * first use `resetTestEnvironment`.
     *
     * Test modules and platforms for individual platforms are available from
     * '@angular/<platform_name>/testing'.
     */
    initTestEnvironment(ngModule: Type<any> | Type<any>[], platform: PlatformRef, options?: TestEnvironmentOptions): void;
    /**
     * Reset the providers for the test injector.
     */
    resetTestEnvironment(): void;
    resetTestingModule(): TestBed;
    configureCompiler(config: {
        providers?: any[];
        useJit?: boolean;
    }): void;
    configureTestingModule(moduleDef: TestModuleMetadata): TestBed;
    compileComponents(): Promise<any>;
    inject<T>(token: ProviderToken<T>, notFoundValue: undefined, options: InjectOptions & {
        optional?: false;
    }): T;
    inject<T>(token: ProviderToken<T>, notFoundValue: null | undefined, options: InjectOptions): T | null;
    inject<T>(token: ProviderToken<T>, notFoundValue?: T, options?: InjectOptions): T;
    /**
     * Runs the given function in the `EnvironmentInjector` context of `TestBed`.
     *
     * @see {@link https://angular.dev/api/core/EnvironmentInjector#runInContext}
     */
    runInInjectionContext<T>(fn: () => T): T;
    execute(tokens: any[], fn: Function, context?: any): any;
    overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): TestBed;
    overrideComponent(component: Type<any>, override: MetadataOverride<Component>): TestBed;
    overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>): TestBed;
    overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): TestBed;
    overrideTemplate(component: Type<any>, template: string): TestBed;
    /**
     * Overwrites all providers for the given token with the given provider definition.
     */
    overrideProvider(token: any, provider: {
        useFactory: Function;
        deps: any[];
        multi?: boolean;
    }): TestBed;
    overrideProvider(token: any, provider: {
        useValue: any;
        multi?: boolean;
    }): TestBed;
    overrideProvider(token: any, provider: {
        useFactory?: Function;
        useValue?: any;
        deps?: any[];
        multi?: boolean;
    }): TestBed;
    overrideTemplateUsingTestingModule(component: Type<any>, template: string): TestBed;
    createComponent<T>(component: Type<T>, options?: TestComponentOptions): ComponentFixture<T>;
    createDirective<T>(directive: Type<T>, options?: TestDirectiveOptions): DirectiveFixture<T>;
    /**
     * Returns the most recently created `ComponentFixture`, or throws an error if one has not
     * yet been created.
     */
    getLastFixture<T = unknown>(): ComponentFixture<T>;
    /**
     * Execute any pending effects.
     *
     * @deprecated use `TestBed.tick()` instead
     */
    flushEffects(): void;
    /**
     * Execute any pending work required to synchronize model to the UI.
     *
     * @publicApi 20.0
     */
    tick(): void;
}
/**
 * @description
 * Configures and initializes environment for unit testing and provides methods for
 * creating components and services in unit tests.
 *
 * `TestBed` is the primary api for writing unit tests for Angular applications and libraries.
 *
 * @publicApi
 */
declare const TestBed: TestBedStatic;
/**
 * Allows injecting dependencies in `beforeEach()` and `it()`. Note: this function
 * (imported from the `@angular/core/testing` package) can **only** be used to inject dependencies
 * in tests. To inject dependencies in your application code, use the [`inject`](api/core/inject)
 * function from the `@angular/core` package instead.
 *
 * Example:
 *
 * ```ts
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
 * @publicApi
 */
declare function inject(tokens: any[], fn: Function): () => any;
/**
 * @publicApi
 */
declare class InjectSetupWrapper {
    private _moduleDef;
    constructor(_moduleDef: () => TestModuleMetadata);
    private _addModule;
    inject(tokens: any[], fn: Function): () => any;
}
/**
 * @publicApi
 */
declare function withModule(moduleDef: TestModuleMetadata): InjectSetupWrapper;
declare function withModule(moduleDef: TestModuleMetadata, fn: Function): () => any;

declare class MetadataOverrider {
    private _references;
    /**
     * Creates a new instance for the given metadata class
     * based on an old instance and overrides.
     */
    overrideMetadata<C extends T, T>(metadataClass: {
        new (options: T): C;
    }, oldMetadata: C, override: MetadataOverride<T>): C;
}

/**
 * Fake implementation of user agent history and navigation behavior. This is a
 * high-fidelity implementation of browser behavior that attempts to emulate
 * things like traversal delay.
 */
declare class FakeNavigation implements Navigation {
    /**
     * The fake implementation of an entries array. Only same-document entries
     * allowed.
     */
    private readonly entriesArr;
    /**
     * The current active entry index into `entriesArr`.
     */
    private currentEntryIndex;
    /**
     * A Map of pending traversals, so that traversals to the same entry can be
     * re-used.
     */
    private readonly traversalQueue;
    /**
     * A Promise that resolves when the previous traversals have finished. Used to
     * simulate the cross-process communication necessary for traversals.
     */
    private nextTraversal;
    /**
     * A prospective current active entry index, which includes unresolved
     * traversals. Used by `go` to determine where navigations are intended to go.
     */
    private propsectiveTraversalDestinations;
    /**
     * A test-only option to make traversals synchronous, rather than emulate
     * cross-process communication.
     */
    private synchronousTraversals;
    /** Whether to allow a call to setInitialEntryForTesting. */
    private canSetInitialEntry;
    readonly activation: NavigationActivation | null;
    /** The next unique id for created entries. Replace recreates this id. */
    private nextId;
    /** The next unique key for created entries. Replace inherits this id. */
    private nextKey;
    /** Whether this fake is disposed. */
    private disposed;
    /**
     * Equivalent to `navigation.currentEntry`.
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-currententry
     */
    get currentEntry(): FakeNavigationHistoryEntry;
    /**
     * Equivalent to `navigation.canGoBack`.
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-cangoback
     */
    get canGoBack(): boolean;
    /**
     * Equivalent to `navigation.canGoForward`.
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-cangoforward
     */
    get canGoForward(): boolean;
    private readonly createEventTarget;
    private readonly _window;
    get window(): Pick<Window, 'addEventListener' | 'removeEventListener'>;
    constructor(doc: Document, startURL: `http${string}`);
    /**
     * Sets the initial entry.
     */
    setInitialEntryForTesting(url: `http${string}`, options?: {
        historyState: unknown;
        state?: unknown;
    }): void;
    /** Returns whether the initial entry is still eligible to be set. */
    canSetInitialEntryForTesting(): boolean;
    /**
     * Sets whether to emulate traversals as synchronous rather than
     * asynchronous.
     */
    setSynchronousTraversalsForTesting(synchronousTraversals: boolean): void;
    /**
     * Equivalent to `navigation.entries()`.
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-entries
     */
    entries(): FakeNavigationHistoryEntry[];
    /**
     * Equivalent to `navigation.navigate()`.
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-navigate
     */
    navigate(url: string, options?: NavigationNavigateOptions): FakeNavigationResult;
    /** Equivalent to `history.pushState()`. */
    pushState(data: unknown, title: string, url?: string): void;
    /** Equivalent to `history.replaceState()`. */
    replaceState(data: unknown, title: string, url?: string): void;
    private pushOrReplaceState;
    /**
     * Equivalent to `navigation.traverseTo()`.
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-traverseto
     */
    traverseTo(key: string, options?: NavigationOptions): FakeNavigationResult;
    /**
     * Equivalent to `navigation.back()`.
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-back
     */
    back(options?: NavigationOptions): FakeNavigationResult;
    /**
     * Equivalent to `navigation.forward()`.
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-forward
     */
    forward(options?: NavigationOptions): FakeNavigationResult;
    /**
     * Equivalent to `history.go()`.
     * Note that this method does not actually work precisely to how Chrome
     * does, instead choosing a simpler model with less unexpected behavior.
     * Chrome has a few edge case optimizations, for instance with repeated
     * `back(); forward()` chains it collapses certain traversals.
     */
    go(direction: number): void;
    /** Creates a FakeNavigationDestination matching a given history entry. */
    private createDestinationFromEntry;
    /**
     * Implementation of "performing a non-traverse navigation" from the spec.
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-navigate
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-reload
     */
    private performNonTraverseNavigation;
    /** Runs a traversal synchronously or asynchronously */
    private runTraversal;
    /** Equivalent to `navigation.addEventListener()`. */
    addEventListener(type: string, callback: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): void;
    /** Equivalent to `navigation.removeEventListener()`. */
    removeEventListener(type: string, callback: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): void;
    /** Equivalent to `navigation.dispatchEvent()` */
    dispatchEvent(event: Event): boolean;
    /** Cleans up resources. */
    dispose(): void;
    /** Returns whether this fake is disposed. */
    isDisposed(): boolean;
    abortOngoingNavigation(eventToAbort: InternalFakeNavigateEvent, reason?: Error): void;
    /**
     * Implementation for all navigations and traversals.
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#navigate-event-firing
     * @returns true if the event was intercepted, otherwise false
     */
    private userAgentNavigate;
    /** Utility method for finding entries with the given `key`. */
    private findEntry;
    private _onnavigate;
    /**
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#handler-navigation-onnavigate
     */
    get onnavigate(): ((this: Navigation, ev: NavigateEvent) => any) | null;
    set onnavigate(handler: ((this: Navigation, ev: NavigateEvent) => any) | null);
    private _oncurrententrychange;
    /**
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#handler-navigation-oncurrententrychange
     */
    get oncurrententrychange(): // tslint:disable-next-line:no-any
    ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any) | null;
    set oncurrententrychange(handler: // tslint:disable-next-line:no-any
    ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any) | null);
    private _onnavigatesuccess;
    /**
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#handler-navigation-onnavigatesuccess
     */
    get onnavigatesuccess(): ((this: Navigation, ev: Event) => any) | null;
    set onnavigatesuccess(handler: ((this: Navigation, ev: Event) => any) | null);
    private _onnavigateerror;
    /**
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#handler-navigation-onnavigateerror
     */
    get onnavigateerror(): ((this: Navigation, ev: ErrorEvent) => any) | null;
    set onnavigateerror(handler: ((this: Navigation, ev: ErrorEvent) => any) | null);
    private _transition;
    get transition(): NavigationTransition | null;
    /**
     * Equivalent to `navigation.updateCurrentEntry()`.
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-updatecurrententry
     */
    updateCurrentEntry(options: NavigationUpdateCurrentEntryOptions): void;
    /**
     * Equivalent to `navigation.reload()`.
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-reload
     */
    reload(options?: NavigationReloadOptions): FakeNavigationResult;
}
/**
 * Fake equivalent of the `NavigationResult` interface with
 * `FakeNavigationHistoryEntry`.
 */
interface FakeNavigationResult extends NavigationResult {
    readonly committed: Promise<FakeNavigationHistoryEntry>;
    readonly finished: Promise<FakeNavigationHistoryEntry>;
}
/**
 * Fake equivalent of `NavigationHistoryEntry`.
 * https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-navigationhistoryentry-interface
 */
declare class FakeNavigationHistoryEntry implements NavigationHistoryEntry {
    private eventTarget;
    readonly url: string | null;
    readonly sameDocument: boolean;
    readonly id: string;
    readonly key: string;
    readonly index: number;
    private state;
    private readonly historyState;
    private _ondispose;
    /**
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigationhistoryentry-ondispose
     */
    get ondispose(): ((this: NavigationHistoryEntry, ev: Event) => any) | null;
    set ondispose(handler: ((this: NavigationHistoryEntry, ev: Event) => any) | null);
    constructor(eventTarget: EventTarget, url: string | null, { id, key, index, sameDocument, state, historyState, }: {
        id: string;
        key: string;
        index: number;
        sameDocument: boolean;
        historyState: unknown;
        state?: unknown;
    });
    /**
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigationhistoryentry-getstate
     */
    getState(): unknown;
    getHistoryState(): unknown;
    addEventListener(type: string, callback: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): void;
    removeEventListener(type: string, callback: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): void;
    dispatchEvent(event: Event): boolean;
    /**
     * internal
     * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigationhistoryentry-ondispose
     */
    dispose(): void;
}
/**
 * Fake equivalent of `NavigateEvent`.
 * https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-navigateevent-interface
 */
interface FakeNavigateEvent extends NavigateEvent {
    readonly destination: FakeNavigationDestination;
}
interface InternalFakeNavigateEvent extends FakeNavigateEvent {
    readonly sameDocument: boolean;
    readonly result: InternalNavigationResult;
    interceptionState: 'none' | 'intercepted' | 'committed' | 'scrolled' | 'finished';
    scrollBehavior: 'after-transition' | 'manual' | null;
    focusResetBehavior: 'after-transition' | 'manual' | null;
    abortController: AbortController;
    abort(reason: Error): void;
}
/**
 * Fake equivalent of `NavigationDestination`.
 * https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-navigationdestination-interface
 */
declare class FakeNavigationDestination implements NavigationDestination {
    url: string;
    readonly sameDocument: boolean;
    readonly key: string;
    readonly id: string;
    readonly index: number;
    state?: unknown;
    private readonly historyState;
    constructor({ url, sameDocument, historyState, state, key, id, index, }: {
        url: string;
        sameDocument: boolean;
        historyState: unknown;
        state?: unknown;
        key?: string | null;
        id?: string | null;
        index?: number;
    });
    getState(): unknown;
    getHistoryState(): unknown;
}
/**
 * Internal utility class for representing the result of a navigation.
 * Generally equivalent to the "apiMethodTracker" in the spec.
 */
declare class InternalNavigationResult {
    readonly navigation: FakeNavigation;
    committedTo: FakeNavigationHistoryEntry | null;
    committedResolve: (entry: FakeNavigationHistoryEntry) => void;
    committedReject: (reason: Error) => void;
    finishedResolve: () => void;
    finishedReject: (reason: Error) => void;
    readonly committed: Promise<FakeNavigationHistoryEntry>;
    readonly finished: Promise<FakeNavigationHistoryEntry>;
    get signal(): AbortSignal;
    private readonly abortController;
    constructor(navigation: FakeNavigation);
}

declare function getCleanupHook(expectedTeardownValue: boolean): VoidFunction;

declare class Log<T = string> {
    logItems: T[];
    constructor();
    add(value: T): void;
    fn(value: T): () => void;
    clear(): void;
    result(): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<Log<any>, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<any>;
}

export { ComponentFixture, ComponentFixtureAutoDetect, ComponentFixtureNoNgZone, DeferBlockBehavior, DeferBlockFixture, DeferBlockState, DirectiveFixture, InjectSetupWrapper, TestBed, TestComponentRenderer, discardPeriodicTasks, fakeAsync, flush, flushMicrotasks, getTestBed, inject, resetFakeAsyncZone, tick, waitForAsync, withModule, FakeNavigation as ɵFakeNavigation, Log as ɵLog, MetadataOverrider as ɵMetadataOverrider, getCleanupHook as ɵgetCleanupHook };
export type { MetadataOverride, ModuleTeardownOptions, TestBedStatic, TestComponentOptions, TestDirectiveOptions, TestEnvironmentOptions, TestModuleMetadata };
