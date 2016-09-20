/** @stable */
export declare abstract class AfterContentChecked {
    abstract ngAfterContentChecked(): void;
}

/** @stable */
export declare abstract class AfterContentInit {
    abstract ngAfterContentInit(): void;
}

/** @stable */
export declare abstract class AfterViewChecked {
    abstract ngAfterViewChecked(): void;
}

/** @stable */
export declare abstract class AfterViewInit {
    abstract ngAfterViewInit(): void;
}

/** @experimental */
export declare const ANALYZE_FOR_ENTRY_COMPONENTS: OpaqueToken;

/** @experimental */
export declare function animate(timing: string | number, styles?: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata): AnimationAnimateMetadata;

/** @experimental */
export declare class AnimationAnimateMetadata extends AnimationMetadata {
    styles: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata;
    timings: string | number;
    constructor(timings: string | number, styles: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata);
}

/** @experimental */
export declare class AnimationEntryMetadata {
    definitions: AnimationStateMetadata[];
    name: string;
    constructor(name: string, definitions: AnimationStateMetadata[]);
}

/** @experimental */
export declare class AnimationGroupMetadata extends AnimationWithStepsMetadata {
    steps: AnimationMetadata[];
    constructor(_steps: AnimationMetadata[]);
}

/** @experimental */
export declare class AnimationKeyframesSequenceMetadata extends AnimationMetadata {
    steps: AnimationStyleMetadata[];
    constructor(steps: AnimationStyleMetadata[]);
}

/** @experimental */
export declare abstract class AnimationMetadata {
}

/** @experimental */
export declare abstract class AnimationPlayer {
    parentPlayer: AnimationPlayer;
    abstract destroy(): void;
    abstract finish(): void;
    abstract getPosition(): number;
    abstract hasStarted(): boolean;
    abstract init(): void;
    abstract onDone(fn: () => void): void;
    abstract onStart(fn: () => void): void;
    abstract pause(): void;
    abstract play(): void;
    abstract reset(): void;
    abstract restart(): void;
    abstract setPosition(p: any): void;
}

/** @experimental */
export declare class AnimationSequenceMetadata extends AnimationWithStepsMetadata {
    steps: AnimationMetadata[];
    constructor(_steps: AnimationMetadata[]);
}

/** @experimental */
export declare class AnimationStateDeclarationMetadata extends AnimationStateMetadata {
    stateNameExpr: string;
    styles: AnimationStyleMetadata;
    constructor(stateNameExpr: string, styles: AnimationStyleMetadata);
}

/** @experimental */
export declare abstract class AnimationStateMetadata {
}

/** @experimental */
export declare class AnimationStateTransitionMetadata extends AnimationStateMetadata {
    stateChangeExpr: string;
    steps: AnimationMetadata;
    constructor(stateChangeExpr: string, steps: AnimationMetadata);
}

/** @experimental */
export declare class AnimationStyleMetadata extends AnimationMetadata {
    offset: number;
    styles: Array<string | {
        [key: string]: string | number;
    }>;
    constructor(styles: Array<string | {
        [key: string]: string | number;
    }>, offset?: number);
}

/** @experimental */
export declare class AnimationTransitionEvent {
    fromState: string;
    toState: string;
    totalTime: number;
    constructor({fromState, toState, totalTime}: {
        fromState: string;
        toState: string;
        totalTime: number;
    });
}

/** @experimental */
export declare abstract class AnimationWithStepsMetadata extends AnimationMetadata {
    steps: AnimationMetadata[];
    constructor();
}

/** @experimental */
export declare const APP_BOOTSTRAP_LISTENER: OpaqueToken;

/** @experimental */
export declare const APP_ID: any;

/** @experimental */
export declare const APP_INITIALIZER: any;

/** @experimental */
export declare class ApplicationInitStatus {
    done: boolean;
    donePromise: Promise<any>;
    constructor(appInits: (() => any)[]);
}

/** @experimental */
export declare class ApplicationModule {
}

/** @stable */
export declare abstract class ApplicationRef {
    componentTypes: Type<any>[];
    components: ComponentRef<any>[];
    abstract bootstrap<C>(componentFactory: ComponentFactory<C> | Type<C>): ComponentRef<C>;
    abstract tick(): void;
}

/** @experimental */
export declare function asNativeElements(debugEls: DebugElement[]): any;

/** @experimental */
export declare function assertPlatform(requiredToken: any): PlatformRef;

/** @stable */
export declare const Attribute: AttributeDecorator;

/** @experimental */
export declare const AUTO_STYLE: string;

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
export interface ClassDefinition {
    constructor: Function | any[];
    extends?: Type<any>;
    [x: string]: Type<any> | Function | any[];
}

/** @stable */
export interface ClassProvider {
    multi?: boolean;
    provide: any;
    useClass: Type<any>;
}

/** @stable */
export declare class CollectionChangeRecord {
    currentIndex: number;
    item: any;
    previousIndex: number;
    trackById: any;
    constructor(item: any, trackById: any);
    toString(): string;
}

/** @stable */
export declare class Compiler {
    clearCache(): void;
    clearCacheFor(type: Type<any>): void;
    compileModuleAndAllComponentsAsync<T>(moduleType: Type<T>): Promise<ModuleWithComponentFactories<T>>;
    compileModuleAndAllComponentsSync<T>(moduleType: Type<T>): ModuleWithComponentFactories<T>;
    compileModuleAsync<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>>;
    compileModuleSync<T>(moduleType: Type<T>): NgModuleFactory<T>;
}

/** @experimental */
export declare const COMPILER_OPTIONS: OpaqueToken;

/** @experimental */
export declare abstract class CompilerFactory {
    abstract createCompiler(options?: CompilerOptions[]): Compiler;
}

/** @experimental */
export declare type CompilerOptions = {
    useDebug?: boolean;
    useJit?: boolean;
    defaultEncapsulation?: ViewEncapsulation;
    providers?: any[];
};

/** @stable */
export declare const Component: ComponentDecorator;

/** @stable */
export interface ComponentDecorator {
    /** @stable */ (obj: Component): TypeDecorator;
    new (obj: Component): Component;
}

/** @stable */
export declare class ComponentFactory<C> {
    componentType: Type<any>;
    selector: string;
    constructor(selector: string, _viewFactory: Function, _componentType: Type<any>);
    create(injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string | any): ComponentRef<C>;
}

/** @stable */
export declare abstract class ComponentFactoryResolver {
    abstract resolveComponentFactory<T>(component: Type<T>): ComponentFactory<T>;
    static NULL: ComponentFactoryResolver;
}

/** @stable */
export declare abstract class ComponentRef<C> {
    changeDetectorRef: ChangeDetectorRef;
    componentType: Type<any>;
    hostView: ViewRef;
    injector: Injector;
    instance: C;
    location: ElementRef;
    abstract destroy(): void;
    abstract onDestroy(callback: Function): void;
}

/** @stable */
export declare const ContentChild: ContentChildDecorator;

/** @stable */
export interface ContentChildDecorator {
    (selector: Type<any> | Function | string, {read}?: {
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
export declare function createPlatformFactory(parentPlaformFactory: (extraProviders?: Provider[]) => PlatformRef, name: string, providers?: Provider[]): (extraProviders?: Provider[]) => PlatformRef;

/** @stable */
export declare const CUSTOM_ELEMENTS_SCHEMA: SchemaMetadata;

/** @experimental */
export declare class DebugElement extends DebugNode {
    attributes: {
        [key: string]: string;
    };
    childNodes: DebugNode[];
    children: DebugElement[];
    classes: {
        [key: string]: boolean;
    };
    name: string;
    nativeElement: any;
    properties: {
        [key: string]: any;
    };
    styles: {
        [key: string]: string;
    };
    constructor(nativeNode: any, parent: any, _debugInfo: RenderDebugInfo);
    addChild(child: DebugNode): void;
    insertChildrenAfter(child: DebugNode, newChildren: DebugNode[]): void;
    query(predicate: Predicate<DebugElement>): DebugElement;
    queryAll(predicate: Predicate<DebugElement>): DebugElement[];
    queryAllNodes(predicate: Predicate<DebugNode>): DebugNode[];
    removeChild(child: DebugNode): void;
    triggerEventHandler(eventName: string, eventObj: any): void;
}

/** @experimental */
export declare class DebugNode {
    componentInstance: any;
    context: any;
    injector: Injector;
    listeners: EventListener[];
    nativeNode: any;
    parent: DebugElement;
    providerTokens: any[];
    references: {
        [key: string]: any;
    };
    source: string;
    constructor(nativeNode: any, parent: DebugNode, _debugInfo: RenderDebugInfo);
}

/** @stable */
export declare class DefaultIterableDiffer implements IterableDiffer {
    collection: any;
    isDirty: boolean;
    length: number;
    constructor(_trackByFn?: TrackByFn);
    check(collection: any): boolean;
    diff(collection: any): DefaultIterableDiffer;
    forEachAddedItem(fn: Function): void;
    forEachIdentityChange(fn: Function): void;
    forEachItem(fn: Function): void;
    forEachMovedItem(fn: Function): void;
    forEachOperation(fn: (item: CollectionChangeRecord, previousIndex: number, currentIndex: number) => void): void;
    forEachPreviousItem(fn: Function): void;
    forEachRemovedItem(fn: Function): void;
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
export declare abstract class DoCheck {
    abstract ngDoCheck(): void;
}

/** @stable */
export declare class ElementRef {
    /** @stable */ nativeElement: any;
    constructor(nativeElement: any);
}

/** @experimental */
export declare abstract class EmbeddedViewRef<C> extends ViewRef {
    context: C;
    rootNodes: any[];
    abstract destroy(): void;
}

/** @stable */
export declare function enableProdMode(): void;

/** @stable */
export declare class ErrorHandler {
    constructor(rethrowError?: boolean);
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
export declare function getDebugNode(nativeNode: any): DebugNode;

/** @experimental */
export declare function getModuleFactory(id: string): NgModuleFactory<any>;

/** @experimental */
export declare function getPlatform(): PlatformRef;

/** @experimental */
export interface GetTestability {
    addToWindow(registry: TestabilityRegistry): void;
    findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean): Testability;
}

/** @experimental */
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
export declare abstract class Injector {
    get(token: any, notFoundValue?: any): any;
    static NULL: Injector;
    static THROW_IF_NOT_FOUND: Object;
}

/** @stable */
export declare const Input: InputDecorator;

/** @experimental */
export declare function isDevMode(): boolean;

/** @stable */
export interface IterableDiffer {
    diff(object: any): any;
    onDestroy(): any;
}

/** @stable */
export interface IterableDifferFactory {
    create(cdRef: ChangeDetectorRef, trackByFn?: TrackByFn): IterableDiffer;
    supports(objects: any): boolean;
}

/** @stable */
export declare class IterableDiffers {
    factories: IterableDifferFactory[];
    constructor(factories: IterableDifferFactory[]);
    find(iterable: any): IterableDifferFactory;
    static create(factories: IterableDifferFactory[], parent?: IterableDiffers): IterableDiffers;
    static extend(factories: IterableDifferFactory[]): Provider;
}

/** @experimental */
export declare function keyframes(steps: AnimationStyleMetadata[]): AnimationKeyframesSequenceMetadata;

/** @stable */
export declare class KeyValueChangeRecord {
    currentValue: any;
    key: any;
    previousValue: any;
    constructor(key: any);
    toString(): string;
}

/** @stable */
export interface KeyValueDiffer {
    diff(object: any): any;
    onDestroy(): any;
}

/** @stable */
export interface KeyValueDifferFactory {
    create(cdRef: ChangeDetectorRef): KeyValueDiffer;
    supports(objects: any): boolean;
}

/** @stable */
export declare class KeyValueDiffers {
    factories: KeyValueDifferFactory[];
    constructor(factories: KeyValueDifferFactory[]);
    find(kv: Object): KeyValueDifferFactory;
    static create(factories: KeyValueDifferFactory[], parent?: KeyValueDiffers): KeyValueDiffers;
    static extend(factories: KeyValueDifferFactory[]): Provider;
}

/** @experimental */
export declare const LOCALE_ID: OpaqueToken;

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
export declare const NgModule: NgModuleDecorator;

/** @experimental */
export declare class NgModuleFactory<T> {
    moduleType: Type<T>;
    constructor(_injectorClass: {
        new (parentInjector: Injector): NgModuleInjector<T>;
    }, _moduleType: Type<T>);
    create(parentInjector: Injector): NgModuleRef<T>;
}

/** @stable */
export declare abstract class NgModuleFactoryLoader {
    abstract load(path: string): Promise<NgModuleFactory<any>>;
}

/** @stable */
export declare abstract class NgModuleRef<T> {
    componentFactoryResolver: ComponentFactoryResolver;
    injector: Injector;
    instance: T;
    abstract destroy(): void;
    abstract onDestroy(callback: () => void): void;
}

/** @experimental */
export declare class NgZone {
    hasPendingMacrotasks: boolean;
    hasPendingMicrotasks: boolean;
    isStable: boolean;
    onError: EventEmitter<any>;
    onMicrotaskEmpty: EventEmitter<any>;
    onStable: EventEmitter<any>;
    onUnstable: EventEmitter<any>;
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
export declare abstract class OnChanges {
    abstract ngOnChanges(changes: SimpleChanges): void;
}

/** @stable */
export declare abstract class OnDestroy {
    abstract ngOnDestroy(): void;
}

/** @stable */
export declare abstract class OnInit {
    abstract ngOnInit(): void;
}

/** @stable */
export declare class OpaqueToken {
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
export declare const PACKAGE_ROOT_URL: any;

/** @stable */
export declare const Pipe: PipeDecorator;

/** @stable */
export interface PipeTransform {
    transform(value: any, ...args: any[]): any;
}

/** @experimental */
export declare const PLATFORM_INITIALIZER: any;

/** @experimental */
export declare const platformCore: (extraProviders?: Provider[]) => PlatformRef;

/** @stable */
export declare abstract class PlatformRef {
    destroyed: boolean;
    injector: Injector;
    /** @stable */ bootstrapModule<M>(moduleType: Type<M>, compilerOptions?: CompilerOptions | CompilerOptions[]): Promise<NgModuleRef<M>>;
    /** @experimental */ bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>): Promise<NgModuleRef<M>>;
    abstract destroy(): void;
    abstract onDestroy(callback: () => void): void;
}

/** @stable */
export declare type Provider = TypeProvider | ValueProvider | ClassProvider | ExistingProvider | FactoryProvider | any[];

/** @stable */
export declare abstract class Query {
}

/** @stable */
export declare class QueryList<T> {
    changes: Observable<any>;
    dirty: boolean;
    first: T;
    last: T;
    length: number;
    filter(fn: (item: T, index: number, array: T[]) => boolean): T[];
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
    parent: Injector;
    createChildFromResolved(providers: ResolvedReflectiveProvider[]): ReflectiveInjector;
    abstract get(token: any, notFoundValue?: any): any;
    instantiateResolved(provider: ResolvedReflectiveProvider): any;
    resolveAndCreateChild(providers: Provider[]): ReflectiveInjector;
    resolveAndInstantiate(provider: Provider): any;
    /** @experimental */ static fromResolvedProviders(providers: ResolvedReflectiveProvider[], parent?: Injector): ReflectiveInjector;
    static resolve(providers: Provider[]): ResolvedReflectiveProvider[];
    static resolveAndCreate(providers: Provider[], parent?: Injector): ReflectiveInjector;
}

/** @experimental */
export declare class ReflectiveKey {
    displayName: string;
    id: number;
    token: Object;
    constructor(token: Object, id: number);
    static numberOfKeys: number;
    static get(token: Object): ReflectiveKey;
}

/** @experimental */
export declare class RenderComponentType {
    animations: {
        [key: string]: Function;
    };
    encapsulation: ViewEncapsulation;
    id: string;
    slotCount: number;
    styles: Array<string | any[]>;
    templateUrl: string;
    constructor(id: string, templateUrl: string, slotCount: number, encapsulation: ViewEncapsulation, styles: Array<string | any[]>, animations: {
        [key: string]: Function;
    });
}

/** @experimental */
export declare abstract class Renderer {
    abstract animate(element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[], duration: number, delay: number, easing: string): AnimationPlayer;
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

/** @experimental */
export declare abstract class RootRenderer {
    abstract renderComponent(componentType: RenderComponentType): Renderer;
}

/** @stable */
export declare abstract class Sanitizer {
    abstract sanitize(context: SecurityContext, value: string): string;
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

/** @experimental */
export declare function sequence(steps: AnimationMetadata[]): AnimationSequenceMetadata;

/** @experimental */
export declare function setTestabilityGetter(getter: GetTestability): void;

/** @stable */
export declare class SimpleChange {
    currentValue: any;
    previousValue: any;
    constructor(previousValue: any, currentValue: any);
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

/** @experimental */
export declare function state(stateNameExpr: string, styles: AnimationStyleMetadata): AnimationStateDeclarationMetadata;

/** @experimental */
export declare function style(tokens: string | {
    [key: string]: string | number;
} | Array<string | {
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
    elementRef: ElementRef;
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
    findTestabilityInTree(elem: Node, findInAncestors?: boolean): Testability;
    getAllRootElements(): any[];
    getAllTestabilities(): Testability[];
    getTestability(elem: any): Testability;
    registerApplication(token: any, testability: Testability): void;
}

/** @stable */
export interface TrackByFn {
    (index: number, item: any): any;
}

/** @experimental */
export declare function transition(stateChangeExpr: string, steps: AnimationMetadata | AnimationMetadata[]): AnimationStateTransitionMetadata;

/** @experimental */
export declare const TRANSLATIONS: OpaqueToken;

/** @experimental */
export declare const TRANSLATIONS_FORMAT: OpaqueToken;

/** @experimental */
export declare function trigger(name: string, animation: AnimationMetadata[]): AnimationEntryMetadata;

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
export interface ViewChildrenDecorator { (selector: Type<any> | Function | string, {read}?: {
        read?: any;
    }): any;
    new (selector: Type<any> | Function | string, {read}?: {
        read?: any;
    }): ViewChildren;
}

/** @stable */
export declare abstract class ViewContainerRef {
    element: ElementRef;
    injector: Injector;
    length: number;
    parentInjector: Injector;
    abstract clear(): void;
    abstract createComponent<C>(componentFactory: ComponentFactory<C>, index?: number, injector?: Injector, projectableNodes?: any[][]): ComponentRef<C>;
    abstract createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number): EmbeddedViewRef<C>;
    abstract detach(index?: number): ViewRef;
    abstract get(index: number): ViewRef;
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
export declare abstract class ViewRef {
    destroyed: boolean;
    abstract onDestroy(callback: Function): any;
}

/** @stable */
export declare class WrappedValue {
    wrapped: any;
    constructor(wrapped: any);
    static wrap(value: any): WrappedValue;
}

/** @experimental */
export declare var wtfCreateScope: (signature: string, flags?: any) => WtfScopeFn;

/** @experimental */
export declare var wtfEndTimeRange: (range: any) => void;

/** @experimental */
export declare var wtfLeave: <T>(scope: any, returnValue?: T) => T;

/** @experimental */
export interface WtfScopeFn {
    (arg0?: any, arg1?: any): any;
}

/** @experimental */
export declare var wtfStartTimeRange: (rangeType: string, action: string) => any;
