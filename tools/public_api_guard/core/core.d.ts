export interface AfterContentChecked {
    ngAfterContentChecked(): void;
}

export interface AfterContentInit {
    ngAfterContentInit(): void;
}

export interface AfterViewChecked {
    ngAfterViewChecked(): void;
}

export interface AfterViewInit {
    ngAfterViewInit(): void;
}

export declare const ANALYZE_FOR_ENTRY_COMPONENTS: InjectionToken<any>;

export declare const APP_BOOTSTRAP_LISTENER: InjectionToken<((compRef: ComponentRef<any>) => void)[]>;

export declare const APP_ID: InjectionToken<string>;

export declare const APP_INITIALIZER: InjectionToken<(() => void)[]>;

export declare class ApplicationInitStatus {
    readonly done = false;
    readonly donePromise: Promise<any>;
    constructor(appInits: (() => any)[]);
}

export declare class ApplicationModule {
    constructor(appRef: ApplicationRef);
}

export declare class ApplicationRef {
    readonly componentTypes: Type<any>[];
    readonly components: ComponentRef<any>[];
    readonly isStable: Observable<boolean>;
    readonly viewCount: number;
    attachView(viewRef: ViewRef): void;
    bootstrap<C>(componentOrFactory: ComponentFactory<C> | Type<C>, rootSelectorOrNode?: string | any): ComponentRef<C>;
    detachView(viewRef: ViewRef): void;
    tick(): void;
}

export declare function asNativeElements(debugEls: DebugElement[]): any;

export declare function assertPlatform(requiredToken: any): PlatformRef;

export declare const Attribute: AttributeDecorator;

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

export interface ClassProvider extends ClassSansProvider {
    multi?: boolean;
    provide: any;
}

/** @deprecated */
export interface CollectionChangeRecord<V> extends IterableChangeRecord<V> {
}

export declare class Compiler {
    clearCache(): void;
    clearCacheFor(type: Type<any>): void;
    compileModuleAndAllComponentsAsync<T>(moduleType: Type<T>): Promise<ModuleWithComponentFactories<T>>;
    compileModuleAndAllComponentsSync<T>(moduleType: Type<T>): ModuleWithComponentFactories<T>;
    compileModuleAsync<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>>;
    compileModuleSync<T>(moduleType: Type<T>): NgModuleFactory<T>;
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

export declare const Component: ComponentDecorator;

export interface ComponentDecorator {
    (obj: Component): TypeDecorator;
    new (obj: Component): Component;
}

export declare abstract class ComponentFactory<C> {
    abstract readonly componentType: Type<any>;
    abstract readonly inputs: {
        propName: string;
        templateName: string;
    }[];
    abstract readonly ngContentSelectors: string[];
    abstract readonly outputs: {
        propName: string;
        templateName: string;
    }[];
    abstract readonly selector: string;
    abstract create(injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string | any, ngModule?: NgModuleRef<any>): ComponentRef<C>;
}

export declare abstract class ComponentFactoryResolver {
    abstract resolveComponentFactory<T>(component: Type<T>): ComponentFactory<T>;
    static NULL: ComponentFactoryResolver;
}

export declare abstract class ComponentRef<C> {
    abstract readonly changeDetectorRef: ChangeDetectorRef;
    abstract readonly componentType: Type<any>;
    abstract readonly hostView: ViewRef;
    abstract readonly injector: Injector;
    abstract readonly instance: C;
    abstract readonly location: ElementRef;
    abstract destroy(): void;
    abstract onDestroy(callback: Function): void;
}

export interface ConstructorSansProvider {
    deps?: any[];
}

export declare const ContentChild: ContentChildDecorator;

export interface ContentChildDecorator {
    (selector: Type<any> | Function | string, opts?: {
        read?: any;
    }): any;
    new (selector: Type<any> | Function | string, opts?: {
        read?: any;
    }): ContentChild;
}

export declare const ContentChildren: ContentChildrenDecorator;

export interface ContentChildrenDecorator {
    (selector: Type<any> | Function | string, opts?: {
        descendants?: boolean;
        read?: any;
    }): any;
    new (selector: Type<any> | Function | string, opts?: {
        descendants?: boolean;
        read?: any;
    }): Query;
}

export declare function createInjector(defType: any, parent?: Injector | null, additionalProviders?: StaticProvider[] | null): Injector;

export declare function createPlatform(injector: Injector): PlatformRef;

export declare function createPlatformFactory(parentPlatformFactory: ((extraProviders?: StaticProvider[]) => PlatformRef) | null, name: string, providers?: StaticProvider[]): (extraProviders?: StaticProvider[]) => PlatformRef;

export declare const CUSTOM_ELEMENTS_SCHEMA: SchemaMetadata;

export declare class DebugElement extends DebugNode {
    attributes: {
        [key: string]: string | null;
    };
    childNodes: DebugNode[];
    readonly children: DebugElement[];
    classes: {
        [key: string]: boolean;
    };
    name: string;
    nativeElement: any;
    properties: {
        [key: string]: any;
    };
    styles: {
        [key: string]: string | null;
    };
    constructor(nativeNode: any, parent: any, _debugContext: DebugContext);
    addChild(child: DebugNode): void;
    insertBefore(refChild: DebugNode, newChild: DebugNode): void;
    insertChildrenAfter(child: DebugNode, newChildren: DebugNode[]): void;
    query(predicate: Predicate<DebugElement>): DebugElement;
    queryAll(predicate: Predicate<DebugElement>): DebugElement[];
    queryAllNodes(predicate: Predicate<DebugNode>): DebugNode[];
    removeChild(child: DebugNode): void;
    triggerEventHandler(eventName: string, eventObj: any): void;
}

export declare class DebugNode {
    readonly componentInstance: any;
    readonly context: any;
    readonly injector: Injector;
    listeners: EventListener[];
    nativeNode: any;
    parent: DebugElement | null;
    readonly providerTokens: any[];
    readonly references: {
        [key: string]: any;
    };
    constructor(nativeNode: any, parent: DebugNode | null, _debugContext: DebugContext);
}

/** @deprecated */
export declare class DefaultIterableDiffer<V> implements IterableDiffer<V>, IterableChanges<V> {
    readonly collection: V[] | Iterable<V> | null;
    readonly isDirty: boolean;
    readonly length: number;
    constructor(trackByFn?: TrackByFunction<V>);
    check(collection: NgIterable<V>): boolean;
    diff(collection: NgIterable<V>): DefaultIterableDiffer<V> | null;
    forEachAddedItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachIdentityChange(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachMovedItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachOperation(fn: (item: IterableChangeRecord<V>, previousIndex: number | null, currentIndex: number | null) => void): void;
    forEachPreviousItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachRemovedItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    onDestroy(): void;
}

export declare function defineInjectable<T>(opts: {
    providedIn?: Type<any> | 'root' | 'any' | null;
    factory: () => T;
}): never;

export declare function defineInjector(options: {
    factory: () => any;
    providers?: any[];
    imports?: any[];
}): never;

export declare function destroyPlatform(): void;

export declare const Directive: DirectiveDecorator;

export interface DirectiveDecorator {
    (obj: Directive): TypeDecorator;
    new (obj: Directive): Directive;
}

export interface DoBootstrap {
    ngDoBootstrap(appRef: ApplicationRef): void;
}

export interface DoCheck {
    ngDoCheck(): void;
}

export declare class ElementRef<T = any> {
    nativeElement: T;
    constructor(nativeElement: T);
}

export declare abstract class EmbeddedViewRef<C> extends ViewRef {
    abstract readonly context: C;
    abstract readonly rootNodes: any[];
}

export declare function enableProdMode(): void;

export declare class ErrorHandler {
    handleError(error: any): void;
}

export declare class EventEmitter<T> extends Subject<T> {
    __isAsync: boolean;
    constructor(isAsync?: boolean);
    emit(value?: T): void;
    subscribe(generatorOrNext?: any, error?: any, complete?: any): any;
}

export interface ExistingProvider extends ExistingSansProvider {
    multi?: boolean;
    provide: any;
}

export interface FactoryProvider extends FactorySansProvider {
    multi?: boolean;
    provide: any;
}

export declare function forwardRef(forwardRefFn: ForwardRefFn): Type<any>;

export interface ForwardRefFn {
    (): any;
}

export declare function getDebugNode(nativeNode: any): DebugNode | null;

export declare function getModuleFactory(id: string): NgModuleFactory<any>;

export declare function getPlatform(): PlatformRef | null;

export interface GetTestability {
    addToWindow(registry: TestabilityRegistry): void;
    findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean): Testability | null;
}

export declare const Host: HostDecorator;

export declare const HostBinding: HostBindingDecorator;

export interface HostDecorator {
    (): any;
    new (): Host;
}

export declare const HostListener: HostListenerDecorator;

export declare function inject<T>(token: Type<T> | InjectionToken<T>): T;
export declare function inject<T>(token: Type<T> | InjectionToken<T>, flags?: InjectFlags): T | null;

export declare const Inject: InjectDecorator;

export declare const Injectable: InjectableDecorator;

export interface InjectableDecorator {
    (): any;
    (options?: {
        providedIn: Type<any> | 'root' | null;
    } & InjectableProvider): any;
    new (): Injectable;
    new (options?: {
        providedIn: Type<any> | 'root' | null;
    } & InjectableProvider): Injectable;
}

export declare type InjectableProvider = ValueSansProvider | ExistingSansProvider | StaticClassSansProvider | ConstructorSansProvider | FactorySansProvider | ClassSansProvider;

export interface InjectableType<T> extends Type<T> {
    ngInjectableDef: never;
}

export interface InjectDecorator {
    (token: any): any;
    new (token: any): Inject;
}

export declare const enum InjectFlags {
    Default = 0,
    Host = 1,
    Self = 2,
    SkipSelf = 4,
    Optional = 8
}

export declare class InjectionToken<T> {
    protected _desc: string;
    readonly ngInjectableDef: never | undefined;
    constructor(_desc: string, options?: {
        providedIn?: Type<any> | 'root' | null;
        factory: () => T;
    });
    toString(): string;
}

export declare abstract class Injector {
    abstract get<T>(token: Type<T> | InjectionToken<T>, notFoundValue?: T, flags?: InjectFlags): T;
    /** @deprecated */ abstract get(token: any, notFoundValue?: any): any;
    static NULL: Injector;
    static THROW_IF_NOT_FOUND: Object;
    static ngInjectableDef: never;
    /** @deprecated */ static create(providers: StaticProvider[], parent?: Injector): Injector;
    static create(options: {
        providers: StaticProvider[];
        parent?: Injector;
        name?: string;
    }): Injector;
}

export declare const INJECTOR: InjectionToken<Injector>;

export interface InjectorType<T> extends Type<T> {
    ngInjectorDef: never;
}

export declare const Input: InputDecorator;

export declare function isDevMode(): boolean;

export interface IterableChangeRecord<V> {
    readonly currentIndex: number | null;
    readonly item: V;
    readonly previousIndex: number | null;
    readonly trackById: any;
}

export interface IterableChanges<V> {
    forEachAddedItem(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachIdentityChange(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachItem(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachMovedItem(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachOperation(fn: (record: IterableChangeRecord<V>, previousIndex: number | null, currentIndex: number | null) => void): void;
    forEachPreviousItem(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachRemovedItem(fn: (record: IterableChangeRecord<V>) => void): void;
}

export interface IterableDiffer<V> {
    diff(object: NgIterable<V>): IterableChanges<V> | null;
}

export interface IterableDifferFactory {
    create<V>(trackByFn?: TrackByFunction<V>): IterableDiffer<V>;
    supports(objects: any): boolean;
}

export declare class IterableDiffers {
    /** @deprecated */ factories: IterableDifferFactory[];
    constructor(factories: IterableDifferFactory[]);
    find(iterable: any): IterableDifferFactory;
    static ngInjectableDef: never;
    static create(factories: IterableDifferFactory[], parent?: IterableDiffers): IterableDiffers;
    static extend(factories: IterableDifferFactory[]): StaticProvider;
}

export interface KeyValueChangeRecord<K, V> {
    readonly currentValue: V | null;
    readonly key: K;
    readonly previousValue: V | null;
}

export interface KeyValueChanges<K, V> {
    forEachAddedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachChangedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachPreviousItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachRemovedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
}

export interface KeyValueDiffer<K, V> {
    diff(object: Map<K, V>): KeyValueChanges<K, V> | null;
    diff(object: {
        [key: string]: V;
    }): KeyValueChanges<string, V> | null;
}

export interface KeyValueDifferFactory {
    create<K, V>(): KeyValueDiffer<K, V>;
    supports(objects: any): boolean;
}

export declare class KeyValueDiffers {
    /** @deprecated */ factories: KeyValueDifferFactory[];
    constructor(factories: KeyValueDifferFactory[]);
    find(kv: any): KeyValueDifferFactory;
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

export interface ModuleWithProviders<T = any /** TODO(alxhub): remove default when callers pass explicit type param */> {
    ngModule: Type<T>;
    providers?: Provider[];
}

export declare type NgIterable<T> = Array<T> | Iterable<T>;

export declare const NgModule: NgModuleDecorator;

export declare abstract class NgModuleFactory<T> {
    abstract readonly moduleType: Type<T>;
    abstract create(parentInjector: Injector | null): NgModuleRef<T>;
}

export declare abstract class NgModuleFactoryLoader {
    abstract load(path: string): Promise<NgModuleFactory<any>>;
}

export declare abstract class NgModuleRef<T> {
    abstract readonly componentFactoryResolver: ComponentFactoryResolver;
    abstract readonly injector: Injector;
    abstract readonly instance: T;
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
    constructor({ enableLongStackTrace }: {
        enableLongStackTrace?: boolean | undefined;
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

export interface OnChanges {
    ngOnChanges(changes: SimpleChanges): void;
}

export interface OnDestroy {
    ngOnDestroy(): void;
}

export interface OnInit {
    ngOnInit(): void;
}

export declare const Optional: OptionalDecorator;

export interface OptionalDecorator {
    (): any;
    new (): Optional;
}

export declare const Output: OutputDecorator;

export declare const PACKAGE_ROOT_URL: InjectionToken<string>;

export declare const Pipe: PipeDecorator;

export interface PipeTransform {
    transform(value: any, ...args: any[]): any;
}

export declare const PLATFORM_ID: InjectionToken<Object>;

export declare const PLATFORM_INITIALIZER: InjectionToken<(() => void)[]>;

export declare const platformCore: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;

export declare class PlatformRef {
    readonly destroyed: boolean;
    readonly injector: Injector;
    bootstrapModule<M>(moduleType: Type<M>, compilerOptions?: (CompilerOptions & BootstrapOptions) | Array<CompilerOptions & BootstrapOptions>): Promise<NgModuleRef<M>>;
    bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>, options?: BootstrapOptions): Promise<NgModuleRef<M>>;
    destroy(): void;
    onDestroy(callback: () => void): void;
}

export interface Predicate<T> {
    (value: T): boolean;
}

export declare type Provider = TypeProvider | ValueProvider | ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider | any[];

export declare abstract class Query {
}

export declare class QueryList<T> {
    readonly changes: Observable<any>;
    readonly dirty = true;
    readonly first: T;
    readonly last: T;
    readonly length: number;
    destroy(): void;
    filter(fn: (item: T, index: number, array: T[]) => boolean): T[];
    find(fn: (item: T, index: number, array: T[]) => boolean): T | undefined;
    forEach(fn: (item: T, index: number, array: T[]) => void): void;
    map<U>(fn: (item: T, index: number, array: T[]) => U): U[];
    notifyOnChanges(): void;
    reduce<U>(fn: (prevValue: U, curValue: T, curIndex: number, array: T[]) => U, init: U): U;
    reset(res: Array<T | any[]>): void;
    setDirty(): void;
    some(fn: (value: T, index: number, array: T[]) => boolean): boolean;
    toArray(): T[];
    toString(): string;
}

/** @deprecated */
export declare abstract class ReflectiveInjector implements Injector {
    abstract readonly parent: Injector | null;
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
    static readonly numberOfKeys: number;
    static get(token: Object): ReflectiveKey;
}

/** @deprecated */
export declare class RenderComponentType {
    animations: any;
    encapsulation: ViewEncapsulation;
    id: string;
    slotCount: number;
    styles: Array<string | any[]>;
    templateUrl: string;
    constructor(id: string, templateUrl: string, slotCount: number, encapsulation: ViewEncapsulation, styles: Array<string | any[]>, animations: any);
}

/** @deprecated */
export declare abstract class Renderer {
    abstract animate(element: any, startingStyles: any, keyframes: any[], duration: number, delay: number, easing: string, previousPlayers?: any[]): any;
    abstract attachViewAfter(node: any, viewRootNodes: any[]): void;
    abstract createElement(parentElement: any, name: string, debugInfo?: RenderDebugInfo): any;
    abstract createTemplateAnchor(parentElement: any, debugInfo?: RenderDebugInfo): any;
    abstract createText(parentElement: any, value: string, debugInfo?: RenderDebugInfo): any;
    abstract createViewRoot(hostElement: any): any;
    abstract destroyView(hostElement: any, viewAllNodes: any[]): void;
    abstract detachView(viewRootNodes: any[]): void;
    abstract invokeElementMethod(renderElement: any, methodName: string, args?: any[]): void;
    abstract listen(renderElement: any, name: string, callback: Function): Function;
    abstract listenGlobal(target: string, name: string, callback: Function): Function;
    abstract projectNodes(parentElement: any, nodes: any[]): void;
    abstract selectRootElement(selectorOrNode: string | any, debugInfo?: RenderDebugInfo): any;
    abstract setBindingDebugInfo(renderElement: any, propertyName: string, propertyValue: string): void;
    abstract setElementAttribute(renderElement: any, attributeName: string, attributeValue?: string): void;
    abstract setElementClass(renderElement: any, className: string, isAdd: boolean): void;
    abstract setElementProperty(renderElement: any, propertyName: string, propertyValue: any): void;
    abstract setElementStyle(renderElement: any, styleName: string, styleValue?: string): void;
    abstract setText(renderNode: any, text: string): void;
}

export declare abstract class Renderer2 {
    abstract readonly data: {
        [key: string]: any;
    };
    destroyNode: ((node: any) => void) | null;
    abstract addClass(el: any, name: string): void;
    abstract appendChild(parent: any, newChild: any): void;
    abstract createComment(value: string): any;
    abstract createElement(name: string, namespace?: string | null): any;
    abstract createText(value: string): any;
    abstract destroy(): void;
    abstract insertBefore(parent: any, newChild: any, refChild: any): void;
    abstract listen(target: 'window' | 'document' | 'body' | any, eventName: string, callback: (event: any) => boolean | void): () => void;
    abstract nextSibling(node: any): any;
    abstract parentNode(node: any): any;
    abstract removeAttribute(el: any, name: string, namespace?: string | null): void;
    abstract removeChild(parent: any, oldChild: any): void;
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

export interface RendererType2 {
    data: {
        [kind: string]: any;
    };
    encapsulation: ViewEncapsulation;
    id: string;
    styles: (string | any[])[];
}

export declare class ResolvedReflectiveFactory {
    dependencies: ReflectiveDependency[];
    factory: Function;
    constructor(
    factory: Function,
    dependencies: ReflectiveDependency[]);
}

export interface ResolvedReflectiveProvider {
    key: ReflectiveKey;
    multiProvider: boolean;
    resolvedFactories: ResolvedReflectiveFactory[];
}

export declare function resolveForwardRef<T>(type: T): T;

/** @deprecated */
export declare abstract class RootRenderer {
    abstract renderComponent(componentType: RenderComponentType): Renderer;
}

export declare abstract class Sanitizer {
    abstract sanitize(context: SecurityContext, value: {} | string | null): string | null;
}

export interface SchemaMetadata {
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

export declare const Self: SelfDecorator;

export interface SelfDecorator {
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

export interface SimpleChanges {
    [propName: string]: SimpleChange;
}

export declare const SkipSelf: SkipSelfDecorator;

export interface SkipSelfDecorator {
    (): any;
    new (): SkipSelf;
}

export declare type StaticProvider = ValueProvider | ExistingProvider | StaticClassProvider | ConstructorProvider | FactoryProvider | any[];

export declare class SystemJsNgModuleLoader implements NgModuleFactoryLoader {
    constructor(_compiler: Compiler, config?: SystemJsNgModuleLoaderConfig);
    load(path: string): Promise<NgModuleFactory<any>>;
}

export declare abstract class SystemJsNgModuleLoaderConfig {
    factoryPathPrefix: string;
    factoryPathSuffix: string;
}

export declare abstract class TemplateRef<C> {
    abstract readonly elementRef: ElementRef;
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

export interface TrackByFunction<T> {
    (index: number, item: T): any;
}

export declare const TRANSLATIONS: InjectionToken<string>;

export declare const TRANSLATIONS_FORMAT: InjectionToken<string>;

export declare const Type: FunctionConstructor;

export interface TypeDecorator {
    (target: Object, propertyKey?: string | symbol, parameterIndex?: number): void;
    <T extends Type<any>>(type: T): T;
}

export interface TypeProvider extends Type<any> {
}

export interface ValueProvider extends ValueSansProvider {
    multi?: boolean;
    provide: any;
}

export declare class Version {
    full: string;
    readonly major: string;
    readonly minor: string;
    readonly patch: string;
    constructor(full: string);
}

export declare const VERSION: Version;

export declare const ViewChild: ViewChildDecorator;

export interface ViewChildDecorator {
    (selector: Type<any> | Function | string, opts?: {
        read?: any;
    }): any;
    new (selector: Type<any> | Function | string, opts?: {
        read?: any;
    }): ViewChild;
}

export declare const ViewChildren: ViewChildrenDecorator;

export interface ViewChildrenDecorator {
    (selector: Type<any> | Function | string, opts?: {
        read?: any;
    }): any;
    new (selector: Type<any> | Function | string, opts?: {
        read?: any;
    }): ViewChildren;
}

export declare abstract class ViewContainerRef {
    abstract readonly element: ElementRef;
    abstract readonly injector: Injector;
    abstract readonly length: number;
    /** @deprecated */ abstract readonly parentInjector: Injector;
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
    Native = 1,
    None = 2,
    ShadowDom = 3
}

export declare abstract class ViewRef extends ChangeDetectorRef {
    abstract readonly destroyed: boolean;
    abstract destroy(): void;
    abstract onDestroy(callback: Function): any /** TODO #9100 */;
}

export declare class WrappedValue {
    /** @deprecated */ wrapped: any;
    constructor(value: any);
    static isWrapped(value: any): value is WrappedValue;
    static unwrap(value: any): any;
    static wrap(value: any): WrappedValue;
}

export declare const wtfCreateScope: (signature: string, flags?: any) => WtfScopeFn;

export declare const wtfEndTimeRange: (range: any) => void;

export declare const wtfLeave: <T>(scope: any, returnValue?: T) => T;

export interface WtfScopeFn {
    (arg0?: any, arg1?: any): any;
}

export declare const wtfStartTimeRange: (rangeType: string, action: string) => any;
