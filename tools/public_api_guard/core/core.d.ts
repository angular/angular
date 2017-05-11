/** @stable */
export interface AfterContentChecked {
    ngAfterContentChecked(): void;
}

/** @stable */
export interface AfterContentInit {
    ngAfterContentInit(): void;
}

/** @stable */
export interface AfterViewChecked {
    ngAfterViewChecked(): void;
}

/** @stable */
export interface AfterViewInit {
    ngAfterViewInit(): void;
}

/** @experimental */
export declare const ANALYZE_FOR_ENTRY_COMPONENTS: InjectionToken<any>;

/** @deprecated */
export declare function animate(timings: string | number, styles?: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata): AnimationAnimateMetadata;

/** @deprecated */
export interface AnimationAnimateMetadata extends AnimationMetadata {
    styles: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata | null;
    timings: string | number | AnimateTimings;
}

/** @deprecated */
export declare type AnimationEntryMetadata = any;

/** @deprecated */
export interface AnimationGroupMetadata extends AnimationMetadata {
    steps: AnimationMetadata[];
}

/** @deprecated */
export declare type AnimationKeyframe = any;

/** @deprecated */
export interface AnimationKeyframesSequenceMetadata extends AnimationMetadata {
    steps: AnimationStyleMetadata[];
}

/** @deprecated */
export interface AnimationMetadata {
    type: AnimationMetadataType;
}

/** @deprecated */
export declare type AnimationPlayer = any;

/** @deprecated */
export interface AnimationSequenceMetadata extends AnimationMetadata {
    steps: AnimationMetadata[];
}

/** @deprecated */
export interface AnimationStateMetadata extends AnimationMetadata {
    name: string;
    styles: AnimationStyleMetadata;
}

/** @deprecated */
export declare type AnimationStateTransitionMetadata = any;

/** @deprecated */
export interface AnimationStyleMetadata extends AnimationMetadata {
    offset?: number;
    styles: {
        [key: string]: string | number;
    } | {
        [key: string]: string | number;
    }[];
}

/** @deprecated */
export declare type AnimationStyles = any;

/** @deprecated */
export interface AnimationTransitionEvent {
    element: any;
    fromState: string;
    phaseName: string;
    toState: string;
    totalTime: number;
    triggerName: string;
}

/** @deprecated */
export interface AnimationTransitionMetadata extends AnimationMetadata {
    animation: AnimationMetadata | AnimationMetadata[];
    expr: string | ((fromState: string, toState: string) => boolean);
}

/** @deprecated */
export interface AnimationTriggerMetadata {
    definitions: AnimationMetadata[];
    name: string;
}

/** @experimental */
export declare const APP_BOOTSTRAP_LISTENER: InjectionToken<((compRef: ComponentRef<any>) => void)[]>;

/** @experimental */
export declare const APP_ID: InjectionToken<string>;

/** @experimental */
export declare const APP_INITIALIZER: InjectionToken<(() => void)[]>;

/** @experimental */
export declare class ApplicationInitStatus {
    readonly done: boolean;
    readonly donePromise: Promise<any>;
    constructor(appInits: (() => any)[]);
}

/** @experimental */
export declare class ApplicationModule {
    constructor(appRef: ApplicationRef);
}

/** @stable */
export declare abstract class ApplicationRef {
    readonly abstract componentTypes: Type<any>[];
    readonly abstract components: ComponentRef<any>[];
    readonly abstract isStable: Observable<boolean>;
    readonly abstract viewCount: number;
    abstract attachView(view: ViewRef): void;
    abstract bootstrap<C>(componentFactory: ComponentFactory<C> | Type<C>, rootSelectorOrNode?: string | any): ComponentRef<C>;
    abstract detachView(view: ViewRef): void;
    abstract tick(): void;
}

/** @experimental */
export declare function asNativeElements(debugEls: DebugElement[]): any;

/** @experimental */
export declare function assertPlatform(requiredToken: any): PlatformRef;

/** @stable */
export declare const Attribute: AttributeDecorator;

/** @deprecated */
export declare const AUTO_STYLE = "*";

/** @stable */
export declare enum ChangeDetectionStrategy {
    OnPush = 0,
    Default = 1,
}

/** @stable */
export declare abstract class ChangeDetectorRef {
    abstract checkNoChanges(): void;
    abstract detach(): void;
    abstract detectChanges(): void;
    abstract markForCheck(): void;
    abstract reattach(): void;
}

/** @stable */
export declare function Class(clsDef: ClassDefinition): Type<any>;

/** @stable */
export declare type ClassDefinition = {
    extends?: Type<any>;
    constructor: Function | any[];
} & {
    [x: string]: Type<any> | Function | any[];
};

/** @stable */
export interface ClassProvider {
    multi?: boolean;
    provide: any;
    useClass: Type<any>;
}

/** @deprecated */
export interface CollectionChangeRecord<V> extends IterableChangeRecord<V> {
}

/** @stable */
export declare class Compiler {
    clearCache(): void;
    clearCacheFor(type: Type<any>): void;
    compileModuleAndAllComponentsAsync<T>(moduleType: Type<T>): Promise<ModuleWithComponentFactories<T>>;
    compileModuleAndAllComponentsSync<T>(moduleType: Type<T>): ModuleWithComponentFactories<T>;
    compileModuleAsync<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>>;
    compileModuleSync<T>(moduleType: Type<T>): NgModuleFactory<T>;
    /** @deprecated */ getNgContentSelectors(component: Type<any>): string[];
}

/** @experimental */
export declare const COMPILER_OPTIONS: InjectionToken<CompilerOptions[]>;

/** @experimental */
export declare abstract class CompilerFactory {
    abstract createCompiler(options?: CompilerOptions[]): Compiler;
}

/** @experimental */
export declare type CompilerOptions = {
    /** @deprecated */ useDebug?: boolean;
    useJit?: boolean;
    defaultEncapsulation?: ViewEncapsulation;
    providers?: any[];
    missingTranslation?: MissingTranslationStrategy;
    enableLegacyTemplate?: boolean;
};

/** @stable */
export declare const Component: ComponentDecorator;

/** @stable */
export interface ComponentDecorator {
    /** @stable */ (obj: Component): TypeDecorator;
    new (obj: Component): Component;
}

/** @stable */
export declare abstract class ComponentFactory<C> {
    readonly abstract componentType: Type<any>;
    readonly abstract inputs: {
        propName: string;
        templateName: string;
    }[];
    readonly abstract ngContentSelectors: string[];
    readonly abstract outputs: {
        propName: string;
        templateName: string;
    }[];
    readonly abstract selector: string;
    abstract create(injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string | any, ngModule?: NgModuleRef<any>): ComponentRef<C>;
}

/** @stable */
export declare abstract class ComponentFactoryResolver {
    abstract resolveComponentFactory<T>(component: Type<T>): ComponentFactory<T>;
    static NULL: ComponentFactoryResolver;
}

/** @stable */
export declare abstract class ComponentRef<C> {
    readonly abstract changeDetectorRef: ChangeDetectorRef;
    readonly abstract componentType: Type<any>;
    readonly abstract hostView: ViewRef;
    readonly abstract injector: Injector;
    readonly abstract instance: C;
    readonly abstract location: ElementRef;
    abstract destroy(): void;
    abstract onDestroy(callback: Function): void;
}

/** @stable */
export declare const ContentChild: ContentChildDecorator;

/** @stable */
export interface ContentChildDecorator {
    /** @stable */ (selector: Type<any> | Function | string, {read}?: {
        read?: any;
    }): any;
    new (selector: Type<any> | Function | string, {read}?: {
        read?: any;
    }): ContentChild;
}

/** @stable */
export declare const ContentChildren: ContentChildrenDecorator;

/** @stable */
export interface ContentChildrenDecorator {
    /** @stable */ (selector: Type<any> | Function | string, {descendants, read}?: {
        descendants?: boolean;
        read?: any;
    }): any;
    new (selector: Type<any> | Function | string, {descendants, read}?: {
        descendants?: boolean;
        read?: any;
    }): Query;
}

/** @experimental */
export declare function createPlatform(injector: Injector): PlatformRef;

/** @experimental */
export declare function createPlatformFactory(parentPlatformFactory: ((extraProviders?: Provider[]) => PlatformRef) | null, name: string, providers?: Provider[]): (extraProviders?: Provider[]) => PlatformRef;

/** @stable */
export declare const CUSTOM_ELEMENTS_SCHEMA: SchemaMetadata;

/** @experimental */
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

/** @experimental */
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
    /** @deprecated */ readonly source: string;
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
    toString(): string;
}

/** @experimental */
export declare function destroyPlatform(): void;

/** @stable */
export declare const Directive: DirectiveDecorator;

/** @stable */
export interface DirectiveDecorator {
    /** @stable */ (obj: Directive): TypeDecorator;
    new (obj: Directive): Directive;
}

/** @stable */
export interface DoCheck {
    ngDoCheck(): void;
}

/** @stable */
export declare class ElementRef {
    /** @stable */ nativeElement: any;
    constructor(nativeElement: any);
}

/** @experimental */
export declare abstract class EmbeddedViewRef<C> extends ViewRef {
    readonly abstract context: C;
    readonly abstract rootNodes: any[];
}

/** @stable */
export declare function enableProdMode(): void;

/** @stable */
export declare class ErrorHandler {
    constructor(
        deprecatedParameter?: boolean);
    handleError(error: any): void;
}

/** @stable */
export declare class EventEmitter<T> extends Subject<T> {
    __isAsync: boolean;
    constructor(isAsync?: boolean);
    emit(value?: T): void;
    subscribe(generatorOrNext?: any, error?: any, complete?: any): any;
}

/** @stable */
export interface ExistingProvider {
    multi?: boolean;
    provide: any;
    useExisting: any;
}

/** @stable */
export interface FactoryProvider {
    deps?: any[];
    multi?: boolean;
    provide: any;
    useFactory: Function;
}

/** @experimental */
export declare function forwardRef(forwardRefFn: ForwardRefFn): Type<any>;

/** @experimental */
export interface ForwardRefFn {
    (): any;
}

/** @experimental */
export declare function getDebugNode(nativeNode: any): DebugNode | null;

/** @experimental */
export declare function getModuleFactory(id: string): NgModuleFactory<any>;

/** @experimental */
export declare function getPlatform(): PlatformRef | null;

/** @experimental */
export interface GetTestability {
    addToWindow(registry: TestabilityRegistry): void;
    findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean): Testability | null;
}

/** @deprecated */
export declare function group(steps: AnimationMetadata[]): AnimationGroupMetadata;

/** @stable */
export declare const Host: HostDecorator;

/** @stable */
export declare const HostBinding: HostBindingDecorator;

/** @stable */
export interface HostDecorator {
    /** @stable */ (): any;
    new (): Host;
}

/** @stable */
export declare const HostListener: HostListenerDecorator;

/** @stable */
export declare const Inject: InjectDecorator;

/** @stable */
export declare const Injectable: InjectableDecorator;

/** @stable */
export interface InjectableDecorator {
    /** @stable */ (): any;
    new (): Injectable;
}

/** @stable */
export interface InjectDecorator {
    /** @stable */ (token: any): any;
    new (token: any): Inject;
}

/** @stable */
export declare class InjectionToken<T> extends OpaqueToken {
    constructor(desc: string);
    toString(): string;
}

/** @stable */
export declare abstract class Injector {
    abstract get<T>(token: Type<T> | InjectionToken<T>, notFoundValue?: T): T;
    /** @deprecated */ abstract get(token: any, notFoundValue?: any): any;
    static NULL: Injector;
    static THROW_IF_NOT_FOUND: Object;
}

/** @stable */
export declare const Input: InputDecorator;

/** @experimental */
export declare function isDevMode(): boolean;

/** @stable */
export interface IterableChangeRecord<V> {
    readonly currentIndex: number | null;
    readonly item: V;
    readonly previousIndex: number | null;
    readonly trackById: any;
}

/** @stable */
export interface IterableChanges<V> {
    forEachAddedItem(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachIdentityChange(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachItem(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachMovedItem(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachOperation(fn: (record: IterableChangeRecord<V>, previousIndex: number, currentIndex: number) => void): void;
    forEachPreviousItem(fn: (record: IterableChangeRecord<V>) => void): void;
    forEachRemovedItem(fn: (record: IterableChangeRecord<V>) => void): void;
}

/** @stable */
export interface IterableDiffer<V> {
    diff(object: NgIterable<V>): IterableChanges<V> | null;
}

/** @stable */
export interface IterableDifferFactory {
    create<V>(trackByFn?: TrackByFunction<V>): IterableDiffer<V>;
    /** @deprecated */ create<V>(_cdr?: ChangeDetectorRef | TrackByFunction<V>, trackByFn?: TrackByFunction<V>): IterableDiffer<V>;
    supports(objects: any): boolean;
}

/** @stable */
export declare class IterableDiffers {
    /** @deprecated */ factories: IterableDifferFactory[];
    constructor(factories: IterableDifferFactory[]);
    find(iterable: any): IterableDifferFactory;
    static create(factories: IterableDifferFactory[], parent?: IterableDiffers): IterableDiffers;
    static extend(factories: IterableDifferFactory[]): Provider;
}

/** @deprecated */
export declare function keyframes(steps: AnimationStyleMetadata[]): AnimationKeyframesSequenceMetadata;

/** @stable */
export interface KeyValueChangeRecord<K, V> {
    readonly currentValue: V | null;
    readonly key: K;
    readonly previousValue: V | null;
}

/** @stable */
export interface KeyValueChanges<K, V> {
    forEachAddedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachChangedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachPreviousItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    forEachRemovedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
}

/** @stable */
export interface KeyValueDiffer<K, V> {
    diff(object: Map<K, V>): KeyValueChanges<K, V>;
    diff(object: {
        [key: string]: V;
    }): KeyValueChanges<string, V>;
}

/** @stable */
export interface KeyValueDifferFactory {
    create<K, V>(): KeyValueDiffer<K, V>;
    /** @deprecated */ create<K, V>(_cdr?: ChangeDetectorRef): KeyValueDiffer<K, V>;
    supports(objects: any): boolean;
}

/** @stable */
export declare class KeyValueDiffers {
    /** @deprecated */ factories: KeyValueDifferFactory[];
    constructor(factories: KeyValueDifferFactory[]);
    find(kv: any): KeyValueDifferFactory;
    static create<S>(factories: KeyValueDifferFactory[], parent?: KeyValueDiffers): KeyValueDiffers;
    static extend<S>(factories: KeyValueDifferFactory[]): Provider;
}

/** @experimental */
export declare const LOCALE_ID: InjectionToken<string>;

/** @experimental */
export declare enum MissingTranslationStrategy {
    Error = 0,
    Warning = 1,
    Ignore = 2,
}

/** @experimental */
export declare class ModuleWithComponentFactories<T> {
    componentFactories: ComponentFactory<any>[];
    ngModuleFactory: NgModuleFactory<T>;
    constructor(ngModuleFactory: NgModuleFactory<T>, componentFactories: ComponentFactory<any>[]);
}

/** @stable */
export interface ModuleWithProviders {
    ngModule: Type<any>;
    providers?: Provider[];
}

/** @stable */
export declare type NgIterable<T> = Array<T> | Iterable<T>;

/** @stable */
export declare const NgModule: NgModuleDecorator;

/** @experimental */
export declare abstract class NgModuleFactory<T> {
    readonly abstract moduleType: Type<T>;
    abstract create(parentInjector: Injector | null): NgModuleRef<T>;
}

/** @stable */
export declare abstract class NgModuleFactoryLoader {
    abstract load(path: string): Promise<NgModuleFactory<any>>;
}

/** @stable */
export declare abstract class NgModuleRef<T> {
    readonly abstract componentFactoryResolver: ComponentFactoryResolver;
    readonly abstract injector: Injector;
    readonly abstract instance: T;
    abstract destroy(): void;
    abstract onDestroy(callback: () => void): void;
}

/** @experimental */
export declare class NgProbeToken {
    name: string;
    token: any;
    constructor(name: string, token: any);
}

/** @experimental */
export declare class NgZone {
    readonly hasPendingMacrotasks: boolean;
    readonly hasPendingMicrotasks: boolean;
    readonly isStable: boolean;
    readonly onError: EventEmitter<any>;
    readonly onMicrotaskEmpty: EventEmitter<any>;
    readonly onStable: EventEmitter<any>;
    readonly onUnstable: EventEmitter<any>;
    constructor({enableLongStackTrace}: {
        enableLongStackTrace?: boolean;
    });
    run(fn: () => any): any;
    runGuarded(fn: () => any): any;
    runOutsideAngular(fn: () => any): any;
    static assertInAngularZone(): void;
    static assertNotInAngularZone(): void;
    static isInAngularZone(): boolean;
}

/** @experimental */
export declare const NO_ERRORS_SCHEMA: SchemaMetadata;

/** @stable */
export interface OnChanges {
    ngOnChanges(changes: SimpleChanges): void;
}

/** @stable */
export interface OnDestroy {
    ngOnDestroy(): void;
}

/** @stable */
export interface OnInit {
    ngOnInit(): void;
}

/** @deprecated */
export declare class OpaqueToken {
    protected _desc: string;
    constructor(_desc: string);
    toString(): string;
}

/** @stable */
export declare const Optional: OptionalDecorator;

/** @stable */
export interface OptionalDecorator {
    /** @stable */ (): any;
    new (): Optional;
}

/** @stable */
export declare const Output: OutputDecorator;

/** @experimental */
export declare const PACKAGE_ROOT_URL: InjectionToken<string>;

/** @stable */
export declare const Pipe: PipeDecorator;

/** @stable */
export interface PipeTransform {
    transform(value: any, ...args: any[]): any;
}

/** @experimental */
export declare const PLATFORM_ID: InjectionToken<Object>;

/** @experimental */
export declare const PLATFORM_INITIALIZER: InjectionToken<(() => void)[]>;

/** @experimental */
export declare const platformCore: (extraProviders?: Provider[] | undefined) => PlatformRef;

/** @stable */
export declare abstract class PlatformRef {
    readonly abstract destroyed: boolean;
    readonly abstract injector: Injector;
    /** @stable */ abstract bootstrapModule<M>(moduleType: Type<M>, compilerOptions?: CompilerOptions | CompilerOptions[]): Promise<NgModuleRef<M>>;
    /** @experimental */ abstract bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>): Promise<NgModuleRef<M>>;
    abstract destroy(): void;
    abstract onDestroy(callback: () => void): void;
}

/** @experimental */
export interface Predicate<T> {
    (value: T): boolean;
}

/** @stable */
export declare type Provider = TypeProvider | ValueProvider | ClassProvider | ExistingProvider | FactoryProvider | any[];

/** @stable */
export declare abstract class Query {
}

/** @stable */
export declare class QueryList<T> {
    readonly changes: Observable<any>;
    readonly dirty: boolean;
    readonly first: T;
    readonly last: T;
    readonly length: number;
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

/** @stable */
export declare abstract class ReflectiveInjector implements Injector {
    readonly abstract parent: Injector | null;
    abstract createChildFromResolved(providers: ResolvedReflectiveProvider[]): ReflectiveInjector;
    abstract get(token: any, notFoundValue?: any): any;
    abstract instantiateResolved(provider: ResolvedReflectiveProvider): any;
    abstract resolveAndCreateChild(providers: Provider[]): ReflectiveInjector;
    abstract resolveAndInstantiate(provider: Provider): any;
    /** @experimental */ static fromResolvedProviders(providers: ResolvedReflectiveProvider[], parent?: Injector): ReflectiveInjector;
    static resolve(providers: Provider[]): ResolvedReflectiveProvider[];
    static resolveAndCreate(providers: Provider[], parent?: Injector): ReflectiveInjector;
}

/** @experimental */
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
    abstract setElementAttribute(renderElement: any, attributeName: string, attributeValue: string): void;
    abstract setElementClass(renderElement: any, className: string, isAdd: boolean): void;
    abstract setElementProperty(renderElement: any, propertyName: string, propertyValue: any): void;
    abstract setElementStyle(renderElement: any, styleName: string, styleValue: string): void;
    abstract setText(renderNode: any, text: string): void;
}

/** @experimental */
export declare abstract class Renderer2 {
    readonly abstract data: {
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
    abstract selectRootElement(selectorOrNode: string | any): any;
    abstract setAttribute(el: any, name: string, value: string, namespace?: string | null): void;
    abstract setProperty(el: any, name: string, value: any): void;
    abstract setStyle(el: any, style: string, value: any, flags?: RendererStyleFlags2): void;
    abstract setValue(node: any, value: string): void;
}

/** @experimental */
export declare abstract class RendererFactory2 {
    abstract begin?(): void;
    abstract createRenderer(hostElement: any, type: RendererType2 | null): Renderer2;
    abstract end?(): void;
}

/** @experimental */
export declare enum RendererStyleFlags2 {
    Important = 1,
    DashCase = 2,
}

/** @experimental */
export interface RendererType2 {
    data: {
        [kind: string]: any;
    };
    encapsulation: ViewEncapsulation;
    id: string;
    styles: (string | any[])[];
}

/** @experimental */
export declare class ResolvedReflectiveFactory {
    dependencies: ReflectiveDependency[];
    factory: Function;
    constructor(
        factory: Function,
        dependencies: ReflectiveDependency[]);
}

/** @experimental */
export interface ResolvedReflectiveProvider {
    key: ReflectiveKey;
    multiProvider: boolean;
    resolvedFactories: ResolvedReflectiveFactory[];
}

/** @experimental */
export declare function resolveForwardRef(type: any): any;

/** @deprecated */
export declare abstract class RootRenderer {
    abstract renderComponent(componentType: RenderComponentType): Renderer;
}

/** @stable */
export declare abstract class Sanitizer {
    abstract sanitize(context: SecurityContext, value: {} | string | null): string | null;
}

/** @experimental */
export interface SchemaMetadata {
    name: string;
}

/** @stable */
export declare enum SecurityContext {
    NONE = 0,
    HTML = 1,
    STYLE = 2,
    SCRIPT = 3,
    URL = 4,
    RESOURCE_URL = 5,
}

/** @stable */
export declare const Self: SelfDecorator;

/** @stable */
export interface SelfDecorator {
    /** @stable */ (): any;
    new (): Self;
}

/** @deprecated */
export declare function sequence(steps: AnimationMetadata[]): AnimationSequenceMetadata;

/** @experimental */
export declare function setTestabilityGetter(getter: GetTestability): void;

/** @stable */
export declare class SimpleChange {
    currentValue: any;
    firstChange: boolean;
    previousValue: any;
    constructor(previousValue: any, currentValue: any, firstChange: boolean);
    isFirstChange(): boolean;
}

/** @stable */
export interface SimpleChanges {
    [propName: string]: SimpleChange;
}

/** @stable */
export declare const SkipSelf: SkipSelfDecorator;

/** @stable */
export interface SkipSelfDecorator {
    /** @stable */ (): any;
    new (): SkipSelf;
}

/** @deprecated */
export declare function state(name: string, styles: AnimationStyleMetadata): AnimationStateMetadata;

/** @deprecated */
export declare function style(tokens: {
    [key: string]: string | number;
} | Array<{
    [key: string]: string | number;
}>): AnimationStyleMetadata;

/** @experimental */
export declare class SystemJsNgModuleLoader implements NgModuleFactoryLoader {
    constructor(_compiler: Compiler, config?: SystemJsNgModuleLoaderConfig);
    load(path: string): Promise<NgModuleFactory<any>>;
}

/** @experimental */
export declare abstract class SystemJsNgModuleLoaderConfig {
    factoryPathPrefix: string;
    factoryPathSuffix: string;
}

/** @stable */
export declare abstract class TemplateRef<C> {
    readonly abstract elementRef: ElementRef;
    abstract createEmbeddedView(context: C): EmbeddedViewRef<C>;
}

/** @experimental */
export declare class Testability implements PublicTestability {
    constructor(_ngZone: NgZone);
    decreasePendingRequestCount(): number;
    /** @deprecated */ findBindings(using: any, provider: string, exactMatch: boolean): any[];
    findProviders(using: any, provider: string, exactMatch: boolean): any[];
    getPendingRequestCount(): number;
    increasePendingRequestCount(): number;
    isStable(): boolean;
    whenStable(callback: Function): void;
}

/** @experimental */
export declare class TestabilityRegistry {
    constructor();
    findTestabilityInTree(elem: Node, findInAncestors?: boolean): Testability | null;
    getAllRootElements(): any[];
    getAllTestabilities(): Testability[];
    getTestability(elem: any): Testability | null;
    registerApplication(token: any, testability: Testability): void;
}

/** @deprecated */
export interface TrackByFn {
    (index: number, item: any): any;
}

/** @stable */
export interface TrackByFunction<T> {
    (index: number, item: T): any;
}

/** @deprecated */
export declare function transition(stateChangeExpr: string | ((fromState: string, toState: string) => boolean), steps: AnimationMetadata | AnimationMetadata[]): AnimationTransitionMetadata;

/** @experimental */
export declare const TRANSLATIONS: InjectionToken<string>;

/** @experimental */
export declare const TRANSLATIONS_FORMAT: InjectionToken<string>;

/** @deprecated */
export declare function trigger(name: string, definitions: AnimationMetadata[]): AnimationTriggerMetadata;

/** @stable */
export declare const Type: FunctionConstructor;

/** @stable */
export interface TypeDecorator {
    annotations: any[];
    (target: Object, propertyKey?: string | symbol, parameterIndex?: number): void;
    <T extends Type<any>>(type: T): T;
    Class(obj: ClassDefinition): Type<any>;
}

/** @stable */
export interface TypeProvider extends Type<any> {
}

/** @stable */
export interface ValueProvider {
    multi?: boolean;
    provide: any;
    useValue: any;
}

/** @stable */
export declare class Version {
    full: string;
    readonly major: string;
    readonly minor: string;
    readonly patch: string;
    constructor(full: string);
}

/** @stable */
export declare const VERSION: Version;

/** @stable */
export declare const ViewChild: ViewChildDecorator;

/** @stable */
export interface ViewChildDecorator {
    /** @stable */ (selector: Type<any> | Function | string, {read}?: {
        read?: any;
    }): any;
    new (selector: Type<any> | Function | string, {read}?: {
        read?: any;
    }): ViewChild;
}

/** @stable */
export declare const ViewChildren: ViewChildrenDecorator;

/** @stable */
export interface ViewChildrenDecorator {
    /** @stable */ (selector: Type<any> | Function | string, {read}?: {
        read?: any;
    }): any;
    new (selector: Type<any> | Function | string, {read}?: {
        read?: any;
    }): ViewChildren;
}

/** @stable */
export declare abstract class ViewContainerRef {
    readonly abstract element: ElementRef;
    readonly abstract injector: Injector;
    readonly abstract length: number;
    readonly abstract parentInjector: Injector;
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

/** @stable */
export declare enum ViewEncapsulation {
    Emulated = 0,
    Native = 1,
    None = 2,
}

/** @stable */
export declare abstract class ViewRef extends ChangeDetectorRef {
    readonly abstract destroyed: boolean;
    abstract destroy(): void;
    abstract onDestroy(callback: Function): any;
}

/** @stable */
export declare class WrappedValue {
    wrapped: any;
    constructor(wrapped: any);
    static wrap(value: any): WrappedValue;
}

/** @experimental */
export declare const wtfCreateScope: (signature: string, flags?: any) => WtfScopeFn;

/** @experimental */
export declare const wtfEndTimeRange: (range: any) => void;

/** @experimental */
export declare const wtfLeave: <T>(scope: any, returnValue?: T) => T;

/** @experimental */
export interface WtfScopeFn {
    (arg0?: any, arg1?: any): any;
}

/** @experimental */
export declare const wtfStartTimeRange: (rangeType: string, action: string) => any;
