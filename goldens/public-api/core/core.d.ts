export declare interface AbstractType<T> extends Function {
    prototype: T;
}

export declare interface AfterContentChecked {
    ngAfterContentChecked(): void;
}

export declare interface AfterContentInit {
    ngAfterContentInit(): void;
}

export declare interface AfterViewChecked {
    ngAfterViewChecked(): void;
}

export declare interface AfterViewInit {
    ngAfterViewInit(): void;
}

/** @deprecated */
export declare const ANALYZE_FOR_ENTRY_COMPONENTS: InjectionToken<any>;

export declare const APP_BOOTSTRAP_LISTENER: InjectionToken<((compRef: ComponentRef<any>) => void)[]>;

export declare const APP_ID: InjectionToken<string>;

export declare const APP_INITIALIZER: InjectionToken<readonly (() => Observable<unknown> | Promise<unknown> | void)[]>;

export declare class ApplicationInitStatus {
    readonly done = false;
    readonly donePromise: Promise<any>;
    constructor(appInits: ReadonlyArray<() => Observable<unknown> | Promise<unknown> | void>);
}

export declare class ApplicationModule {
    constructor(appRef: ApplicationRef);
}

export declare class ApplicationRef {
    readonly componentTypes: Type<any>[];
    readonly components: ComponentRef<any>[];
    readonly isStable: Observable<boolean>;
    get viewCount(): number;
    attachView(viewRef: ViewRef): void;
    bootstrap<C>(componentOrFactory: ComponentFactory<C> | Type<C>, rootSelectorOrNode?: string | any): ComponentRef<C>;
    detachView(viewRef: ViewRef): void;
    tick(): void;
}

export declare function asNativeElements(debugEls: DebugElement[]): any;

export declare function assertPlatform(requiredToken: any): PlatformRef;

export declare interface Attribute {
    attributeName: string;
}

export declare const Attribute: AttributeDecorator;

export declare interface AttributeDecorator {
    (name: string): any;
    new (name: string): Attribute;
}

export declare enum ChangeDetectionStrategy {
    OnPush = 0,
    Default = 1
}

export declare abstract class ChangeDetectorRef {
    abstract checkNoChanges(): void;
    abstract detach(): void;
    abstract detectChanges(): void;
    abstract markForCheck(): void;
    abstract reattach(): void;
}

export declare interface ClassProvider extends ClassSansProvider {
    multi?: boolean;
    provide: any;
}

export declare interface ClassSansProvider {
    useClass: Type<any>;
}

export declare class Compiler {
    compileModuleAndAllComponentsAsync: <T>(moduleType: Type<T>) => Promise<ModuleWithComponentFactories<T>>;
    compileModuleAndAllComponentsSync: <T>(moduleType: Type<T>) => ModuleWithComponentFactories<T>;
    compileModuleAsync: <T>(moduleType: Type<T>) => Promise<NgModuleFactory<T>>;
    compileModuleSync: <T>(moduleType: Type<T>) => NgModuleFactory<T>;
    clearCache(): void;
    clearCacheFor(type: Type<any>): void;
    getModuleId(moduleType: Type<any>): string | undefined;
}

export declare const COMPILER_OPTIONS: InjectionToken<CompilerOptions[]>;

export declare abstract class CompilerFactory {
    abstract createCompiler(options?: CompilerOptions[]): Compiler;
}

export declare type CompilerOptions = {
    useJit?: boolean;
    defaultEncapsulation?: ViewEncapsulation;
    providers?: StaticProvider[];
    missingTranslation?: MissingTranslationStrategy;
    preserveWhitespaces?: boolean;
};

export declare interface Component extends Directive {
    animations?: any[];
    changeDetection?: ChangeDetectionStrategy;
    encapsulation?: ViewEncapsulation;
    /** @deprecated */ entryComponents?: Array<Type<any> | any[]>;
    interpolation?: [string, string];
    moduleId?: string;
    preserveWhitespaces?: boolean;
    styleUrls?: string[];
    styles?: string[];
    template?: string;
    templateUrl?: string;
    viewProviders?: Provider[];
}

export declare const Component: ComponentDecorator;

export declare interface ComponentDecorator {
    (obj: Component): TypeDecorator;
    new (obj: Component): Component;
}

export declare abstract class ComponentFactoryResolver {
    abstract resolveComponentFactory<T>(component: Type<T>): ComponentFactory<T>;
    static NULL: ComponentFactoryResolver;
}

export declare abstract class ComponentRef<C> {
    abstract get changeDetectorRef(): ChangeDetectorRef;
    abstract get componentType(): Type<any>;
    abstract get hostView(): ViewRef;
    abstract get injector(): Injector;
    abstract get instance(): C;
    abstract get location(): ElementRef;
    abstract destroy(): void;
    abstract onDestroy(callback: Function): void;
}

export declare interface ConstructorProvider extends ConstructorSansProvider {
    multi?: boolean;
    provide: Type<any>;
}

export declare interface ConstructorSansProvider {
    deps?: any[];
}

export declare type ContentChild = Query;

export declare interface ContentChildDecorator {
    (selector: Type<any> | InjectionToken<unknown> | Function | string, opts?: {
        read?: any;
        static?: boolean;
    }): any;
    new (selector: Type<any> | InjectionToken<unknown> | Function | string, opts?: {
        read?: any;
        static?: boolean;
    }): ContentChild;
}

export declare type ContentChildren = Query;

export declare interface ContentChildrenDecorator {
    (selector: Type<any> | InjectionToken<unknown> | Function | string, opts?: {
        descendants?: boolean;
        emitDistinctChangesOnly?: boolean;
        read?: any;
    }): any;
    new (selector: Type<any> | InjectionToken<unknown> | Function | string, opts?: {
        descendants?: boolean;
        emitDistinctChangesOnly?: boolean;
        read?: any;
    }): Query;
}

export declare function createPlatform(injector: Injector): PlatformRef;

export declare function createPlatformFactory(parentPlatformFactory: ((extraProviders?: StaticProvider[]) => PlatformRef) | null, name: string, providers?: StaticProvider[]): (extraProviders?: StaticProvider[]) => PlatformRef;

export declare const CUSTOM_ELEMENTS_SCHEMA: SchemaMetadata;

export declare interface DebugElement extends DebugNode {
    readonly attributes: {
        [key: string]: string | null;
    };
    readonly childNodes: DebugNode[];
    readonly children: DebugElement[];
    readonly classes: {
        [key: string]: boolean;
    };
    readonly name: string;
    readonly nativeElement: any;
    readonly properties: {
        [key: string]: any;
    };
    readonly styles: {
        [key: string]: string | null;
    };
    query(predicate: Predicate<DebugElement>): DebugElement;
    queryAll(predicate: Predicate<DebugElement>): DebugElement[];
    queryAllNodes(predicate: Predicate<DebugNode>): DebugNode[];
    triggerEventHandler(eventName: string, eventObj: any): void;
}

export declare const DebugElement: {
    new (...args: any[]): DebugElement;
};

export declare class DebugEventListener {
    callback: Function;
    name: string;
    constructor(name: string, callback: Function);
}

export declare interface DebugNode {
    readonly componentInstance: any;
    readonly context: any;
    readonly injector: Injector;
    readonly listeners: DebugEventListener[];
    readonly nativeNode: any;
    readonly parent: DebugElement | null;
    readonly providerTokens: any[];
    readonly references: {
        [key: string]: any;
    };
}

export declare const DebugNode: {
    new (...args: any[]): DebugNode;
};

export declare const DEFAULT_CURRENCY_CODE: InjectionToken<string>;

/** @deprecated */
export declare class DefaultIterableDiffer<V> implements IterableDiffer<V>, IterableChanges<V> {
    readonly collection: V[] | Iterable<V> | null;
    get isDirty(): boolean;
    readonly length: number;
    constructor(trackByFn?: TrackByFunction<V>);
    check(collection: NgIterable<V>): boolean;
    diff(collection: NgIterable<V> | null | undefined): DefaultIterableDiffer<V> | null;
    forEachAddedItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachIdentityChange(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachMovedItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachOperation(fn: (item: IterableChangeRecord<V>, previousIndex: number | null, currentIndex: number | null) => void): void;
    forEachPreviousItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachRemovedItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    onDestroy(): void;
}

/** @deprecated */
export declare const defineInjectable: typeof ɵɵdefineInjectable;

export declare function destroyPlatform(): void;

export declare interface Directive {
    exportAs?: string;
    host?: {
        [key: string]: string;
    };
    inputs?: string[];
    jit?: true;
    outputs?: string[];
    providers?: Provider[];
    queries?: {
        [key: string]: any;
    };
    selector?: string;
}

export declare const Directive: DirectiveDecorator;

export declare interface DirectiveDecorator {
    (obj?: Directive): TypeDecorator;
    new (obj?: Directive): Directive;
}

export declare interface DoBootstrap {
    ngDoBootstrap(appRef: ApplicationRef): void;
}

export declare interface DoCheck {
    ngDoCheck(): void;
}

export declare class ElementRef<T = any> {
    nativeElement: T;
    constructor(nativeElement: T);
}

export declare abstract class EmbeddedViewRef<C> extends ViewRef {
    abstract context: C;
    abstract get rootNodes(): any[];
}

export declare function enableProdMode(): void;

export declare class ErrorHandler {
    handleError(error: any): void;
}

export declare interface EventEmitter<T> extends Subject<T> {
    new (isAsync?: boolean): EventEmitter<T>;
    emit(value?: T): void;
    subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
    subscribe(observerOrNext?: any, error?: any, complete?: any): Subscription;
}

export declare const EventEmitter: {
    new (isAsync?: boolean): EventEmitter<any>;
    new <T>(isAsync?: boolean): EventEmitter<T>;
    readonly prototype: EventEmitter<any>;
};

export declare interface ExistingProvider extends ExistingSansProvider {
    multi?: boolean;
    provide: any;
}

export declare interface ExistingSansProvider {
    useExisting: any;
}

export declare interface FactoryProvider extends FactorySansProvider {
    multi?: boolean;
    provide: any;
}

export declare interface FactorySansProvider {
    deps?: any[];
    useFactory: Function;
}

export declare function forwardRef(forwardRefFn: ForwardRefFn): Type<any>;

export declare interface ForwardRefFn {
    (): any;
}

export declare const getDebugNode: (nativeNode: any) => DebugNode | null;

export declare const getModuleFactory: (id: string) => NgModuleFactory<any>;

export declare function getPlatform(): PlatformRef | null;

export declare interface GetTestability {
    addToWindow(registry: TestabilityRegistry): void;
    findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean): Testability | null;
}

export declare interface Host {
}

export declare const Host: HostDecorator;

export declare interface HostBinding {
    hostPropertyName?: string;
}

export declare const HostBinding: HostBindingDecorator;

export declare interface HostBindingDecorator {
    (hostPropertyName?: string): any;
    new (hostPropertyName?: string): any;
}

export declare interface HostDecorator {
    (): any;
    new (): Host;
}

export declare interface HostListener {
    args?: string[];
    eventName?: string;
}

export declare const HostListener: HostListenerDecorator;

export declare interface HostListenerDecorator {
    (eventName: string, args?: string[]): any;
    new (eventName: string, args?: string[]): any;
}

export declare const inject: typeof ɵɵinject;

export declare interface Inject {
    token: any;
}

export declare const Inject: InjectDecorator;

export declare interface Injectable {
    providedIn?: Type<any> | 'root' | 'platform' | 'any' | null;
}

export declare const Injectable: InjectableDecorator;

export declare interface InjectableDecorator {
    (): TypeDecorator;
    (options?: {
        providedIn: Type<any> | 'root' | 'platform' | 'any' | null;
    } & InjectableProvider): TypeDecorator;
    new (): Injectable;
    new (options?: {
        providedIn: Type<any> | 'root' | 'platform' | 'any' | null;
    } & InjectableProvider): Injectable;
}

export declare type InjectableProvider = ValueSansProvider | ExistingSansProvider | StaticClassSansProvider | ConstructorSansProvider | FactorySansProvider | ClassSansProvider;

export declare interface InjectableType<T> extends Type<T> {
    ɵprov: unknown;
}

export declare interface InjectDecorator {
    (token: any): any;
    new (token: any): Inject;
}

export declare enum InjectFlags {
    Default = 0,
    Host = 1,
    Self = 2,
    SkipSelf = 4,
    Optional = 8
}

export declare class InjectionToken<T> {
    protected _desc: string;
    readonly ɵprov: unknown;
    constructor(_desc: string, options?: {
        providedIn?: Type<any> | 'root' | 'platform' | 'any' | null;
        factory: () => T;
    });
    toString(): string;
}

export declare abstract class Injector {
    abstract get<T>(token: Type<T> | AbstractType<T> | InjectionToken<T>, notFoundValue?: T, flags?: InjectFlags): T;
    /** @deprecated */ abstract get(token: any, notFoundValue?: any): any;
    static NULL: Injector;
    static THROW_IF_NOT_FOUND: {};
    static ɵprov: unknown;
    /** @deprecated */ static create(providers: StaticProvider[], parent?: Injector): Injector;
    static create(options: {
        providers: StaticProvider[];
        parent?: Injector;
        name?: string;
    }): Injector;
}

export declare const INJECTOR: InjectionToken<Injector>;

export declare interface InjectorType<T> extends Type<T> {
    ɵfac?: unknown;
    ɵinj: unknown;
}

export declare interface Input {
    bindingPropertyName?: string;
}

export declare const Input: InputDecorator;

export declare interface InputDecorator {
    (bindingPropertyName?: string): any;
    new (bindingPropertyName?: string): any;
}

export declare function isDevMode(): boolean;

export declare interface IterableChangeRecord<V> {
    readonly currentIndex: number | null;
    readonly item: V;
    readonly previousIndex: number | null;
    readonly trackById: any;
}

export declare interface IterableChanges<V> {
    forEachAddedItem(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachIdentityChange(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachItem(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachMovedItem(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachOperation(fn: (record: IterableChangeRecord<V>, previousIndex: number | null, currentIndex: number | null) => void): void;
    forEachPreviousItem(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachRemovedItem(fn: (record: IterableChangeRecord<V>) => void): void;
}

export declare interface IterableDiffer<V> {
    diff(object: NgIterable<V> | undefined | null): IterableChanges<V> | null;
}

export declare interface IterableDifferFactory {
    create<V>(trackByFn?: TrackByFunction<V>): IterableDiffer<V>;
    supports(objects: any): boolean;
}

export declare class IterableDiffers {
    /** @deprecated */ factories: IterableDifferFactory[];
    constructor(factories: IterableDifferFactory[]);
    find(iterable: any): IterableDifferFactory;
    static ɵprov: unknown;
    static create(factories: IterableDifferFactory[], parent?: IterableDiffers): IterableDiffers;
    static extend(factories: IterableDifferFactory[]): StaticProvider;
}

export declare interface KeyValueChangeRecord<K, V> {
    readonly currentValue: V | null;
    readonly key: K;
    readonly previousValue: V | null;
}

export declare interface KeyValueChanges<K, V> {
    forEachAddedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachChangedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachPreviousItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachRemovedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
}

export declare interface KeyValueDiffer<K, V> {
    diff(object: Map<K, V>): KeyValueChanges<K, V> | null;
    diff(object: {
        [key: string]: V;
    }): KeyValueChanges<string, V> | null;
}

export declare interface KeyValueDifferFactory {
    create<K, V>(): KeyValueDiffer<K, V>;
    supports(objects: any): boolean;
}

export declare class KeyValueDiffers {
    /** @deprecated */ factories: KeyValueDifferFactory[];
    constructor(factories: KeyValueDifferFactory[]);
    find(kv: any): KeyValueDifferFactory;
    static ɵprov: unknown;
    static create<S>(factories: KeyValueDifferFactory[], parent?: KeyValueDiffers): KeyValueDiffers;
    static extend<S>(factories: KeyValueDifferFactory[]): StaticProvider;
}

export declare const LOCALE_ID: InjectionToken<string>;

export declare enum MissingTranslationStrategy {
    Error = 0,
    Warning = 1,
    Ignore = 2
}

export declare class ModuleWithComponentFactories<T> {
    componentFactories: ComponentFactory<any>[];
    ngModuleFactory: NgModuleFactory<T>;
    constructor(ngModuleFactory: NgModuleFactory<T>, componentFactories: ComponentFactory<any>[]);
}

export declare interface ModuleWithProviders<T> {
    ngModule: Type<T>;
    providers?: Provider[];
}

export declare type NgIterable<T> = Array<T> | Iterable<T>;

export declare interface NgModule {
    bootstrap?: Array<Type<any> | any[]>;
    declarations?: Array<Type<any> | any[]>;
    /** @deprecated */ entryComponents?: Array<Type<any> | any[]>;
    exports?: Array<Type<any> | any[]>;
    id?: string;
    imports?: Array<Type<any> | ModuleWithProviders<{}> | any[]>;
    jit?: true;
    providers?: Provider[];
    schemas?: Array<SchemaMetadata | any[]>;
}

export declare const NgModule: NgModuleDecorator;

export declare interface NgModuleDecorator {
    (obj?: NgModule): TypeDecorator;
    new (obj?: NgModule): NgModule;
}

export declare abstract class NgModuleFactory<T> {
    abstract get moduleType(): Type<T>;
    abstract create(parentInjector: Injector | null): NgModuleRef<T>;
}

/** @deprecated */
export declare abstract class NgModuleFactoryLoader {
    abstract load(path: string): Promise<NgModuleFactory<any>>;
}

export declare abstract class NgModuleRef<T> {
    abstract get componentFactoryResolver(): ComponentFactoryResolver;
    abstract get injector(): Injector;
    abstract get instance(): T;
    abstract destroy(): void;
    abstract onDestroy(callback: () => void): void;
}

export declare class NgProbeToken {
    name: string;
    token: any;
    constructor(name: string, token: any);
}

export declare class NgZone {
    readonly hasPendingMacrotasks: boolean;
    readonly hasPendingMicrotasks: boolean;
    readonly isStable: boolean;
    readonly onError: EventEmitter<any>;
    readonly onMicrotaskEmpty: EventEmitter<any>;
    readonly onStable: EventEmitter<any>;
    readonly onUnstable: EventEmitter<any>;
    constructor({ enableLongStackTrace, shouldCoalesceEventChangeDetection, shouldCoalesceRunChangeDetection }: {
        enableLongStackTrace?: boolean | undefined;
        shouldCoalesceEventChangeDetection?: boolean | undefined;
        shouldCoalesceRunChangeDetection?: boolean | undefined;
    });
    run<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T;
    runGuarded<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T;
    runOutsideAngular<T>(fn: (...args: any[]) => T): T;
    runTask<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[], name?: string): T;
    static assertInAngularZone(): void;
    static assertNotInAngularZone(): void;
    static isInAngularZone(): boolean;
}

export declare const NO_ERRORS_SCHEMA: SchemaMetadata;

export declare interface OnChanges {
    ngOnChanges(changes: SimpleChanges): void;
}

export declare interface OnDestroy {
    ngOnDestroy(): void;
}

export declare interface OnInit {
    ngOnInit(): void;
}

export declare interface Optional {
}

export declare const Optional: OptionalDecorator;

export declare interface OptionalDecorator {
    (): any;
    new (): Optional;
}

export declare interface Output {
    bindingPropertyName?: string;
}

export declare const Output: OutputDecorator;

export declare interface OutputDecorator {
    (bindingPropertyName?: string): any;
    new (bindingPropertyName?: string): any;
}

/** @codeGenApi */
export declare function ɵɵdefineInjectable<T>(opts: {
    token: unknown;
    providedIn?: Type<any> | 'root' | 'platform' | 'any' | null;
    factory: () => T;
}): unknown;

/** @codeGenApi */
export declare function ɵɵinject<T>(token: Type<T> | AbstractType<T> | InjectionToken<T>): T;
export declare function ɵɵinject<T>(token: Type<T> | AbstractType<T> | InjectionToken<T>, flags?: InjectFlags): T | null;

/** @codeGenApi */
export declare interface ɵɵInjectableDef<T> {
    factory: (t?: Type<any>) => T;
    providedIn: InjectorType<any> | 'root' | 'platform' | 'any' | null;
    token: unknown;
    value: T | undefined;
}

/** @codeGenApi */
export declare function ɵɵinjectAttribute(attrNameToInject: string): string | null;

export declare const PACKAGE_ROOT_URL: InjectionToken<string>;

export declare interface Pipe {
    name: string;
    pure?: boolean;
}

export declare const Pipe: PipeDecorator;

export declare interface PipeDecorator {
    (obj: Pipe): TypeDecorator;
    new (obj: Pipe): Pipe;
}

export declare interface PipeTransform {
    transform(value: any, ...args: any[]): any;
}

export declare const PLATFORM_ID: InjectionToken<Object>;

export declare const PLATFORM_INITIALIZER: InjectionToken<(() => void)[]>;

export declare const platformCore: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;

export declare class PlatformRef {
    get destroyed(): boolean;
    get injector(): Injector;
    bootstrapModule<M>(moduleType: Type<M>, compilerOptions?: (CompilerOptions & BootstrapOptions) | Array<CompilerOptions & BootstrapOptions>): Promise<NgModuleRef<M>>;
    bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>, options?: BootstrapOptions): Promise<NgModuleRef<M>>;
    destroy(): void;
    onDestroy(callback: () => void): void;
}

export declare interface Predicate<T> {
    (value: T): boolean;
}

export declare type Provider = TypeProvider | ValueProvider | ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider | any[];

export declare interface Query {
    descendants: boolean;
    emitDistinctChangesOnly: boolean;
    first: boolean;
    isViewQuery: boolean;
    read: any;
    selector: any;
    static?: boolean;
}

export declare abstract class Query {
}

export declare class QueryList<T> implements Iterable<T> {
    [Symbol.iterator]: () => Iterator<T>;
    get changes(): Observable<any>;
    readonly dirty = true;
    readonly first: T;
    readonly last: T;
    readonly length: number;
    constructor(_emitDistinctChangesOnly?: boolean);
    destroy(): void;
    filter(fn: (item: T, index: number, array: T[]) => boolean): T[];
    find(fn: (item: T, index: number, array: T[]) => boolean): T | undefined;
    forEach(fn: (item: T, index: number, array: T[]) => void): void;
    get(index: number): T | undefined;
    map<U>(fn: (item: T, index: number, array: T[]) => U): U[];
    notifyOnChanges(): void;
    reduce<U>(fn: (prevValue: U, curValue: T, curIndex: number, array: T[]) => U, init: U): U;
    reset(resultsTree: Array<T | any[]>, identityAccessor?: (value: T) => unknown): void;
    setDirty(): void;
    some(fn: (value: T, index: number, array: T[]) => boolean): boolean;
    toArray(): T[];
    toString(): string;
}

/** @deprecated */
export declare abstract class ReflectiveInjector implements Injector {
    abstract get parent(): Injector | null;
    abstract createChildFromResolved(providers: ResolvedReflectiveProvider[]): ReflectiveInjector;
    abstract get(token: any, notFoundValue?: any): any;
    abstract instantiateResolved(provider: ResolvedReflectiveProvider): any;
    abstract resolveAndCreateChild(providers: Provider[]): ReflectiveInjector;
    abstract resolveAndInstantiate(provider: Provider): any;
    static fromResolvedProviders(providers: ResolvedReflectiveProvider[], parent?: Injector): ReflectiveInjector;
    static resolve(providers: Provider[]): ResolvedReflectiveProvider[];
    static resolveAndCreate(providers: Provider[], parent?: Injector): ReflectiveInjector;
}

/** @deprecated */
export declare class ReflectiveKey {
    readonly displayName: string;
    id: number;
    token: Object;
    constructor(token: Object, id: number);
    static get numberOfKeys(): number;
    static get(token: Object): ReflectiveKey;
}

export declare abstract class Renderer2 {
    abstract get data(): {
        [key: string]: any;
    };
    destroyNode: ((node: any) => void) | null;
    abstract addClass(el: any, name: string): void;
    abstract appendChild(parent: any, newChild: any): void;
    abstract createComment(value: string): any;
    abstract createElement(name: string, namespace?: string | null): any;
    abstract createText(value: string): any;
    abstract destroy(): void;
    abstract insertBefore(parent: any, newChild: any, refChild: any, isMove?: boolean): void;
    abstract listen(target: 'window' | 'document' | 'body' | any, eventName: string, callback: (event: any) => boolean | void): () => void;
    abstract nextSibling(node: any): any;
    abstract parentNode(node: any): any;
    abstract removeAttribute(el: any, name: string, namespace?: string | null): void;
    abstract removeChild(parent: any, oldChild: any, isHostElement?: boolean): void;
    abstract removeClass(el: any, name: string): void;
    abstract removeStyle(el: any, style: string, flags?: RendererStyleFlags2): void;
    abstract selectRootElement(selectorOrNode: string | any, preserveContent?: boolean): any;
    abstract setAttribute(el: any, name: string, value: string, namespace?: string | null): void;
    abstract setProperty(el: any, name: string, value: any): void;
    abstract setStyle(el: any, style: string, value: any, flags?: RendererStyleFlags2): void;
    abstract setValue(node: any, value: string): void;
}

export declare abstract class RendererFactory2 {
    abstract begin?(): void;
    abstract createRenderer(hostElement: any, type: RendererType2 | null): Renderer2;
    abstract end?(): void;
    abstract whenRenderingDone?(): Promise<any>;
}

export declare enum RendererStyleFlags2 {
    Important = 1,
    DashCase = 2
}

export declare interface RendererType2 {
    data: {
        [kind: string]: any;
    };
    encapsulation: ViewEncapsulation;
    id: string;
    styles: (string | any[])[];
}

export declare class ResolvedReflectiveFactory {
    dependencies: ɵangular_packages_core_core_e[];
    factory: Function;
    constructor(
    factory: Function,
    dependencies: ɵangular_packages_core_core_e[]);
}

export declare interface ResolvedReflectiveProvider {
    key: ReflectiveKey;
    multiProvider: boolean;
    resolvedFactories: ResolvedReflectiveFactory[];
}

export declare function resolveForwardRef<T>(type: T): T;

export declare abstract class Sanitizer {
    abstract sanitize(context: SecurityContext, value: {} | string | null): string | null;
    static ɵprov: unknown;
}

export declare interface SchemaMetadata {
    name: string;
}

export declare enum SecurityContext {
    NONE = 0,
    HTML = 1,
    STYLE = 2,
    SCRIPT = 3,
    URL = 4,
    RESOURCE_URL = 5
}

export declare interface Self {
}

export declare const Self: SelfDecorator;

export declare interface SelfDecorator {
    (): any;
    new (): Self;
}

export declare function setTestabilityGetter(getter: GetTestability): void;

export declare class SimpleChange {
    currentValue: any;
    firstChange: boolean;
    previousValue: any;
    constructor(previousValue: any, currentValue: any, firstChange: boolean);
    isFirstChange(): boolean;
}

export declare interface SimpleChanges {
    [propName: string]: SimpleChange;
}

export declare interface SkipSelf {
}

export declare const SkipSelf: SkipSelfDecorator;

export declare interface SkipSelfDecorator {
    (): any;
    new (): SkipSelf;
}

export declare interface StaticClassProvider extends StaticClassSansProvider {
    multi?: boolean;
    provide: any;
}

export declare interface StaticClassSansProvider {
    deps: any[];
    useClass: Type<any>;
}

export declare type StaticProvider = ValueProvider | ExistingProvider | StaticClassProvider | ConstructorProvider | FactoryProvider | any[];

/** @deprecated */
export declare class SystemJsNgModuleLoader implements NgModuleFactoryLoader {
    constructor(_compiler: Compiler, config?: SystemJsNgModuleLoaderConfig);
    load(path: string): Promise<NgModuleFactory<any>>;
}

/** @deprecated */
export declare abstract class SystemJsNgModuleLoaderConfig {
    factoryPathPrefix: string;
    factoryPathSuffix: string;
}

export declare abstract class TemplateRef<C> {
    abstract get elementRef(): ElementRef;
    abstract createEmbeddedView(context: C): EmbeddedViewRef<C>;
}

export declare class Testability implements PublicTestability {
    constructor(_ngZone: NgZone);
    /** @deprecated */ decreasePendingRequestCount(): number;
    findProviders(using: any, provider: string, exactMatch: boolean): any[];
    /** @deprecated */ getPendingRequestCount(): number;
    /** @deprecated */ increasePendingRequestCount(): number;
    isStable(): boolean;
    whenStable(doneCb: Function, timeout?: number, updateCb?: Function): void;
}

export declare class TestabilityRegistry {
    constructor();
    findTestabilityInTree(elem: Node, findInAncestors?: boolean): Testability | null;
    getAllRootElements(): any[];
    getAllTestabilities(): Testability[];
    getTestability(elem: any): Testability | null;
    registerApplication(token: any, testability: Testability): void;
    unregisterAllApplications(): void;
    unregisterApplication(token: any): void;
}

export declare interface TrackByFunction<T> {
    (index: number, item: T): any;
}

export declare const TRANSLATIONS: InjectionToken<string>;

export declare const TRANSLATIONS_FORMAT: InjectionToken<string>;

export declare const Type: FunctionConstructor;

export declare interface TypeDecorator {
    (target: Object, propertyKey?: string | symbol, parameterIndex?: number): void;
    <T extends Type<any>>(type: T): T;
}

export declare interface TypeProvider extends Type<any> {
}

export declare interface ValueProvider extends ValueSansProvider {
    multi?: boolean;
    provide: any;
}

export declare interface ValueSansProvider {
    useValue: any;
}

export declare class Version {
    full: string;
    readonly major: string;
    readonly minor: string;
    readonly patch: string;
    constructor(full: string);
}

export declare const VERSION: Version;

export declare type ViewChild = Query;

export declare interface ViewChildDecorator {
    (selector: Type<any> | InjectionToken<unknown> | Function | string, opts?: {
        read?: any;
        static?: boolean;
    }): any;
    new (selector: Type<any> | InjectionToken<unknown> | Function | string, opts?: {
        read?: any;
        static?: boolean;
    }): ViewChild;
}

export declare type ViewChildren = Query;

export declare interface ViewChildrenDecorator {
    (selector: Type<any> | InjectionToken<unknown> | Function | string, opts?: {
        read?: any;
        emitDistinctChangesOnly?: boolean;
    }): any;
    new (selector: Type<any> | InjectionToken<unknown> | Function | string, opts?: {
        read?: any;
        emitDistinctChangesOnly?: boolean;
    }): ViewChildren;
}

export declare abstract class ViewContainerRef {
    abstract get element(): ElementRef;
    abstract get injector(): Injector;
    abstract get length(): number;
    /** @deprecated */ abstract get parentInjector(): Injector;
    abstract clear(): void;
    abstract createComponent<C>(componentFactory: ComponentFactory<C>, index?: number, injector?: Injector, projectableNodes?: any[][], ngModule?: NgModuleRef<any>): ComponentRef<C>;
    abstract createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number): EmbeddedViewRef<C>;
    abstract detach(index?: number): ViewRef | null;
    abstract get(index: number): ViewRef | null;
    abstract indexOf(viewRef: ViewRef): number;
    abstract insert(viewRef: ViewRef, index?: number): ViewRef;
    abstract move(viewRef: ViewRef, currentIndex: number): ViewRef;
    abstract remove(index?: number): void;
}

export declare enum ViewEncapsulation {
    Emulated = 0,
    None = 2,
    ShadowDom = 3
}

export declare abstract class ViewRef extends ChangeDetectorRef {
    abstract get destroyed(): boolean;
    abstract destroy(): void;
    abstract onDestroy(callback: Function): any /** TODO #9100 */;
}

/** @deprecated */
export declare class WrappedValue {
    /** @deprecated */ wrapped: any;
    constructor(value: any);
    static isWrapped(value: any): value is WrappedValue;
    static unwrap(value: any): any;
    static wrap(value: any): WrappedValue;
}
