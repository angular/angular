/** @stable */
export declare class AbstractProviderError extends BaseException {
    context: any;
    constructor(injector: ReflectiveInjector, key: ReflectiveKey, constructResolvingMessage: Function);
    addKey(injector: ReflectiveInjector, key: ReflectiveKey): void;
}

/** @stable */
export declare abstract class AfterContentChecked {
    abstract ngAfterContentChecked(): any;
}

/** @stable */
export declare abstract class AfterContentInit {
    abstract ngAfterContentInit(): any;
}

/** @stable */
export declare abstract class AfterViewChecked {
    abstract ngAfterViewChecked(): any;
}

/** @stable */
export declare abstract class AfterViewInit {
    abstract ngAfterViewInit(): any;
}

/** @experimental */
export declare const ANALYZE_FOR_PRECOMPILE: OpaqueToken;

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
    abstract onDone(fn: Function): void;
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
export declare abstract class AnimationWithStepsMetadata extends AnimationMetadata {
    steps: AnimationMetadata[];
    constructor();
}

/** @experimental */
export declare const APP_ID: any;

/** @experimental */
export declare const APP_INITIALIZER: any;

/** @stable */
export declare const APPLICATION_COMMON_PROVIDERS: Array<Type | {
    [k: string]: any;
} | any[]>;

/** @experimental */
export declare abstract class ApplicationRef {
    componentTypes: Type[];
    injector: Injector;
    zone: NgZone;
    abstract bootstrap<C>(componentFactory: ComponentFactory<C> | ConcreteType<C>): ComponentRef<C>;
    abstract dispose(): void;
    abstract registerBootstrapListener(listener: (ref: ComponentRef<any>) => void): void;
    abstract registerDisposeListener(dispose: () => void): void;
    abstract run(callback: Function): any;
    abstract tick(): void;
    abstract waitForAsyncInitializers(): Promise<any>;
}

/** @stable */
export declare var AppModule: AppModuleMetadataFactory;

/** @stable */
export interface AppModuleDecorator extends TypeDecorator {
}

/** @stable */
export declare class AppModuleFactory<T> {
    moduleType: ConcreteType<T>;
    constructor(_injectorClass: {
        new (parentInjector: Injector): AppModuleInjector<T>;
    }, _moduleype: ConcreteType<T>);
    create(parentInjector?: Injector): AppModuleRef<T>;
}

/** @experimental */
export declare abstract class AppModuleFactoryLoader {
    abstract load(path: string): Promise<AppModuleFactory<any>>;
}

/** @stable */
export declare class AppModuleMetadata extends InjectableMetadata {
    directives: Array<Type | any[]>;
    modules: Array<Type | any[]>;
    pipes: Array<Type | any[]>;
    precompile: Array<Type | any[]>;
    providers: any[];
    constructor({providers, directives, pipes, precompile, modules}?: {
        providers?: any[];
        directives?: Array<Type | any[]>;
        pipes?: Array<Type | any[]>;
        precompile?: Array<Type | any[]>;
        modules?: Array<Type | any[]>;
    });
}

/** @stable */
export interface AppModuleMetadataFactory {
    (obj: {
        providers?: any[];
        directives?: Array<Type | any[]>;
        pipes?: Array<Type | any[]>;
        precompile?: Array<Type | any[]>;
        modules?: Array<Type | any[]>;
    }): AppModuleDecorator;
    new (obj: {
        providers?: any[];
        directives?: Array<Type | any[]>;
        pipes?: Array<Type | any[]>;
        precompile?: Array<Type | any[]>;
        modules?: Array<Type | any[]>;
    }): AppModuleMetadata;
}

/** @stable */
export declare abstract class AppModuleRef<T> {
    componentFactoryResolver: ComponentFactoryResolver;
    injector: Injector;
    instance: T;
}

/** @experimental */
export declare function asNativeElements(debugEls: DebugElement[]): any;

/** @experimental */
export declare function assertPlatform(requiredToken: any): PlatformRef;

/** @stable */
export declare var Attribute: AttributeMetadataFactory;

/** @stable */
export declare class AttributeMetadata extends DependencyMetadata {
    attributeName: string;
    token: AttributeMetadata;
    constructor(attributeName: string);
    toString(): string;
}

/** @stable */
export interface AttributeMetadataFactory {
    (name: string): TypeDecorator;
    new (name: string): AttributeMetadata;
}

/** @experimental */
export declare const AUTO_STYLE: string;

/** @stable */
export declare class BaseException extends Error {
    message: string;
    stack: any;
    constructor(message?: string);
    toString(): string;
}

/** @deprecated */
export declare function bind(token: any): ProviderBuilder;

/** @deprecated */
export declare class Binding extends Provider {
    /** @deprecated */ toAlias: any;
    /** @deprecated */ toClass: Type;
    /** @deprecated */ toFactory: Function;
    /** @deprecated */ toValue: any;
    constructor(token: any, {toClass, toValue, toAlias, toFactory, deps, multi}: {
        toClass?: Type;
        toValue?: any;
        toAlias?: any;
        toFactory: Function;
        deps?: Object[];
        multi?: boolean;
    });
}

/** @stable */
export declare function bootstrapModule<M>(moduleType: ConcreteType<M>, platform: PlatformRef, compilerOptions?: CompilerOptions): Promise<AppModuleRef<M>>;

/** @experimental */
export declare function bootstrapModuleFactory<M>(moduleFactory: AppModuleFactory<M>, platform: PlatformRef): AppModuleRef<M>;

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
export declare function Class(clsDef: ClassDefinition): ConcreteType<any>;

/** @stable */
export interface ClassDefinition {
    constructor: Function | any[];
    extends?: Type;
    [x: string]: Type | Function | any[];
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
    injector: Injector;
    clearCache(): void;
    clearCacheFor(type: Type): void;
    compileAppModuleAsync<T>(moduleType: ConcreteType<T>, metadata?: AppModuleMetadata): Promise<AppModuleFactory<T>>;
    compileAppModuleSync<T>(moduleType: ConcreteType<T>, metadata?: AppModuleMetadata): AppModuleFactory<T>;
    compileComponentAsync<T>(component: ConcreteType<T>): Promise<ComponentFactory<T>>;
    compileComponentSync<T>(component: ConcreteType<T>): ComponentFactory<T>;
}

/** @experimental */
export declare abstract class CompilerFactory {
    abstract createCompiler(options?: CompilerOptions): Compiler;
    withDefaults(options?: CompilerOptions): CompilerFactory;
    static mergeOptions(defaultOptions?: CompilerOptions, newOptions?: CompilerOptions): CompilerOptions;
}

/** @experimental */
export declare type CompilerOptions = {
    useDebug?: boolean;
    useJit?: boolean;
    defaultEncapsulation?: ViewEncapsulation;
    providers?: any[];
    deprecatedAppProviders?: any[];
};

/** @stable */
export declare var Component: ComponentMetadataFactory;

/** @stable */
export interface ComponentDecorator extends TypeDecorator {
    View(obj: {
        templateUrl?: string;
        template?: string;
        directives?: Array<Type | any[]>;
        pipes?: Array<Type | any[]>;
        renderer?: string;
        styles?: string[];
        styleUrls?: string[];
        animations?: AnimationEntryMetadata[];
        interpolation?: [string, string];
    }): ViewDecorator;
}

/** @stable */
export declare class ComponentFactory<C> {
    componentType: Type;
    selector: string;
    constructor(selector: string, _viewFactory: Function, _componentType: Type);
    create(injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string | any): ComponentRef<C>;
}

/** @stable */
export declare abstract class ComponentFactoryResolver {
    abstract resolveComponentFactory<T>(component: ConcreteType<T>): ComponentFactory<T>;
    static NULL: ComponentFactoryResolver;
}

/** @stable */
export declare class ComponentMetadata extends DirectiveMetadata {
    animations: AnimationEntryMetadata[];
    changeDetection: ChangeDetectionStrategy;
    directives: Array<Type | any[]>;
    encapsulation: ViewEncapsulation;
    interpolation: [string, string];
    moduleId: string;
    pipes: Array<Type | any[]>;
    precompile: Array<Type | any[]>;
    styleUrls: string[];
    styles: string[];
    template: string;
    templateUrl: string;
    viewProviders: any[];
    constructor({selector, inputs, outputs, properties, events, host, exportAs, moduleId, providers, viewProviders, changeDetection, queries, templateUrl, template, styleUrls, styles, animations, directives, pipes, encapsulation, interpolation, precompile}?: {
        selector?: string;
        inputs?: string[];
        outputs?: string[]; properties?: string[]; events?: string[];
        host?: {
            [key: string]: string;
        };
        providers?: any[];
        exportAs?: string;
        moduleId?: string;
        viewProviders?: any[];
        queries?: {
            [key: string]: any;
        };
        changeDetection?: ChangeDetectionStrategy;
        templateUrl?: string;
        template?: string;
        styleUrls?: string[];
        styles?: string[];
        animations?: AnimationEntryMetadata[];
        directives?: Array<Type | any[]>;
        pipes?: Array<Type | any[]>;
        encapsulation?: ViewEncapsulation;
        interpolation?: [string, string];
        precompile?: Array<Type | any[]>;
    });
}

/** @stable */
export interface ComponentMetadataFactory {
    (obj: {
        selector?: string;
        inputs?: string[];
        outputs?: string[];
        properties?: string[];
        events?: string[];
        host?: {
            [key: string]: string;
        };
        providers?: any[];
        exportAs?: string;
        moduleId?: string;
        queries?: {
            [key: string]: any;
        };
        viewProviders?: any[];
        changeDetection?: ChangeDetectionStrategy;
        templateUrl?: string;
        template?: string;
        styleUrls?: string[];
        styles?: string[];
        animations?: AnimationEntryMetadata[];
        directives?: Array<Type | any[]>;
        pipes?: Array<Type | any[]>;
        encapsulation?: ViewEncapsulation;
        interpolation?: [string, string];
        precompile?: Array<Type | any[]>;
    }): ComponentDecorator;
    new (obj: {
        selector?: string;
        inputs?: string[];
        outputs?: string[];
        properties?: string[];
        events?: string[];
        host?: {
            [key: string]: string;
        };
        providers?: any[];
        exportAs?: string;
        moduleId?: string;
        queries?: {
            [key: string]: any;
        };
        viewProviders?: any[];
        changeDetection?: ChangeDetectionStrategy;
        templateUrl?: string;
        template?: string;
        styleUrls?: string[];
        styles?: string[];
        animations?: AnimationEntryMetadata[];
        directives?: Array<Type | any[]>;
        pipes?: Array<Type | any[]>;
        encapsulation?: ViewEncapsulation;
        interpolation?: [string, string];
        precompile?: Array<Type | any[]>;
    }): ComponentMetadata;
}

/** @stable */
export declare abstract class ComponentRef<C> {
    changeDetectorRef: ChangeDetectorRef;
    componentType: Type;
    hostView: ViewRef;
    injector: Injector;
    instance: C;
    location: ElementRef;
    abstract destroy(): void;
    abstract onDestroy(callback: Function): void;
}

/** @deprecated */
export declare abstract class ComponentResolver {
    abstract clearCache(): void;
    abstract resolveComponent(component: Type | string): Promise<ComponentFactory<any>>;
    static DynamicCompilationDeprecationMsg: string;
    static LazyLoadingDeprecationMsg: string;
}

/** @stable */
export declare class ComponentStillLoadingError extends BaseException {
    compType: Type;
    constructor(compType: Type);
}

/** @stable */
export declare var ContentChild: ContentChildMetadataFactory;

/** @stable */
export declare class ContentChildMetadata extends QueryMetadata {
    constructor(_selector: Type | string, {read}?: {
        read?: any;
    });
}

/** @stable */
export interface ContentChildMetadataFactory {
    (selector: Type | string, {read}?: {
        read?: any;
    }): any;
    new (selector: Type | string, {read}?: {
        read?: any;
    }): ContentChildMetadataFactory;
}

/** @stable */
export declare var ContentChildren: ContentChildrenMetadataFactory;

/** @stable */
export declare class ContentChildrenMetadata extends QueryMetadata {
    constructor(_selector: Type | string, {descendants, read}?: {
        descendants?: boolean;
        read?: any;
    });
}

/** @stable */
export interface ContentChildrenMetadataFactory {
    (selector: Type | string, {descendants, read}?: {
        descendants?: boolean;
        read?: any;
    }): any;
    new (selector: Type | string, {descendants, read}?: {
        descendants?: boolean;
        read?: any;
    }): ContentChildrenMetadata;
}

/** @deprecated */
export declare function coreBootstrap<C>(componentFactory: ComponentFactory<C>, injector: Injector): ComponentRef<C>;

/** @deprecated */
export declare function coreLoadAndBootstrap(componentType: Type, injector: Injector): Promise<ComponentRef<any>>;

/** @experimental */
export declare function createPlatform(injector: Injector): PlatformRef;

/** @experimental */
export declare function createPlatformFactory(name: string, providers: any[]): () => PlatformRef;

/** @stable */
export declare class CyclicDependencyError extends AbstractProviderError {
    constructor(injector: ReflectiveInjector, key: ReflectiveKey);
}

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
    /** @deprecated */ inject(token: any): any;
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
    forEachPreviousItem(fn: Function): void;
    forEachRemovedItem(fn: Function): void;
    onDestroy(): void;
    toString(): string;
}

/** @stable */
export declare var Directive: DirectiveMetadataFactory;

/** @stable */
export interface DirectiveDecorator extends TypeDecorator {
}

/** @stable */
export declare class DirectiveMetadata extends InjectableMetadata {
    /** @deprecated */ events: string[];
    exportAs: string;
    host: {
        [key: string]: string;
    };
    inputs: string[];
    outputs: string[];
    /** @deprecated */ properties: string[];
    providers: any[];
    queries: {
        [key: string]: any;
    };
    selector: string;
    constructor({selector, inputs, outputs, properties, events, host, providers, exportAs, queries}?: {
        selector?: string;
        inputs?: string[];
        outputs?: string[]; properties?: string[]; events?: string[];
        host?: {
            [key: string]: string;
        };
        providers?: any[];
        exportAs?: string;
        queries?: {
            [key: string]: any;
        };
    });
}

/** @stable */
export interface DirectiveMetadataFactory {
    (obj: {
        selector?: string;
        inputs?: string[];
        outputs?: string[];
        properties?: string[];
        events?: string[];
        host?: {
            [key: string]: string;
        };
        providers?: any[];
        exportAs?: string;
        queries?: {
            [key: string]: any;
        };
    }): DirectiveDecorator;
    new (obj: {
        selector?: string;
        inputs?: string[];
        outputs?: string[];
        properties?: string[];
        events?: string[];
        host?: {
            [key: string]: string;
        };
        providers?: any[];
        exportAs?: string;
        queries?: {
            [key: string]: any;
        };
    }): DirectiveMetadata;
}

/** @experimental */
export declare function disposePlatform(): void;

/** @stable */
export declare abstract class DoCheck {
    abstract ngDoCheck(): any;
}

/** @deprecated */
export declare abstract class DynamicComponentLoader {
    abstract loadAsRoot(type: Type, overrideSelectorOrNode: string | any, injector: Injector, onDispose?: () => void, projectableNodes?: any[][]): Promise<ComponentRef<any>>;
    abstract loadNextToLocation(type: Type, location: ViewContainerRef, providers?: ResolvedReflectiveProvider[], projectableNodes?: any[][]): Promise<ComponentRef<any>>;
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
    abstract destroy(): any;
}

/** @experimental */
export declare function enableProdMode(): void;

/** @stable */
export declare class EventEmitter<T> extends Subject<T> {
    __isAsync: boolean;
    constructor(isAsync?: boolean);
    emit(value: T): void;
    /** @deprecated */ next(value: any): void;
    subscribe(generatorOrNext?: any, error?: any, complete?: any): any;
}

/** @stable */
export declare class ExceptionHandler {
    constructor(_logger: any, _rethrowException?: boolean);
    call(exception: any, stackTrace?: any, reason?: string): void;
    static exceptionToString(exception: any, stackTrace?: any, reason?: string): string;
}

/** @stable */
export declare class ExpressionChangedAfterItHasBeenCheckedException extends BaseException {
    constructor(oldValue: any, currValue: any, context: any);
}

/** @experimental */
export declare function forwardRef(forwardRefFn: ForwardRefFn): Type;

/** @experimental */
export interface ForwardRefFn {
    (): any;
}

/** @experimental */
export declare function getDebugNode(nativeNode: any): DebugNode;

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
export declare var Host: HostMetadataFactory;

/** @stable */
export declare var HostBinding: HostBindingMetadataFactory;

/** @stable */
export declare class HostBindingMetadata {
    hostPropertyName: string;
    constructor(hostPropertyName?: string);
}

/** @stable */
export interface HostBindingMetadataFactory {
    (hostPropertyName?: string): any;
    new (hostPropertyName?: string): any;
}

/** @stable */
export declare var HostListener: HostListenerMetadataFactory;

/** @stable */
export declare class HostListenerMetadata {
    args: string[];
    eventName: string;
    constructor(eventName: string, args?: string[]);
}

/** @stable */
export interface HostListenerMetadataFactory {
    (eventName: string, args?: string[]): any;
    new (eventName: string, args?: string[]): any;
}

/** @stable */
export declare class HostMetadata {
    toString(): string;
}

/** @stable */
export interface HostMetadataFactory {
    (): any;
    new (): HostMetadata;
}

/** @stable */
export declare var Inject: InjectMetadataFactory;

/** @stable */
export declare var Injectable: InjectableMetadataFactory;

/** @stable */
export declare class InjectableMetadata {
    constructor();
}

/** @stable */
export interface InjectableMetadataFactory {
    (): any;
    new (): InjectableMetadata;
}

/** @stable */
export declare class InjectMetadata {
    token: any;
    constructor(token: any);
    toString(): string;
}

/** @stable */
export interface InjectMetadataFactory {
    (token: any): any;
    new (token: any): InjectMetadata;
}

/** @stable */
export declare abstract class Injector {
    get(token: any, notFoundValue?: any): any;
    static NULL: Injector;
    static THROW_IF_NOT_FOUND: Object;
}

/** @stable */
export declare var Input: InputMetadataFactory;

/** @stable */
export declare class InputMetadata {
    bindingPropertyName: string;
    constructor(
        bindingPropertyName?: string);
}

/** @stable */
export interface InputMetadataFactory {
    (bindingPropertyName?: string): any;
    new (bindingPropertyName?: string): any;
}

/** @stable */
export declare class InstantiationError extends WrappedException {
    causeKey: ReflectiveKey;
    context: any;
    wrapperMessage: string;
    constructor(injector: ReflectiveInjector, originalException: any, originalStack: any, key: ReflectiveKey);
    addKey(injector: ReflectiveInjector, key: ReflectiveKey): void;
}

/** @stable */
export declare class InvalidProviderError extends BaseException {
    constructor(provider: any);
}

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

/** @deprecated */
export declare function lockRunMode(): void;

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

/** @deprecated */
export declare class NgZoneError {
    error: any;
    stackTrace: any;
    constructor(error: any, stackTrace: any);
}

/** @stable */
export declare class NoAnnotationError extends BaseException {
    constructor(typeOrFunc: Type | Function, params: any[][]);
}

/** @stable */
export declare class NoComponentFactoryError extends BaseException {
    component: Function;
    constructor(component: Function);
}

/** @stable */
export declare class NoProviderError extends AbstractProviderError {
    constructor(injector: ReflectiveInjector, key: ReflectiveKey);
}

/** @stable */
export declare abstract class OnChanges {
    abstract ngOnChanges(changes: SimpleChanges): any;
}

/** @stable */
export declare abstract class OnDestroy {
    abstract ngOnDestroy(): any;
}

/** @stable */
export declare abstract class OnInit {
    abstract ngOnInit(): any;
}

/** @stable */
export declare class OpaqueToken {
    constructor(_desc: string);
    toString(): string;
}

/** @stable */
export declare var Optional: OptionalMetadataFactory;

/** @stable */
export declare class OptionalMetadata {
    toString(): string;
}

/** @stable */
export interface OptionalMetadataFactory {
    (): any;
    new (): OptionalMetadata;
}

/** @stable */
export declare class OutOfBoundsError extends BaseException {
    constructor(index: number);
}

/** @stable */
export declare var Output: OutputMetadataFactory;

/** @stable */
export declare class OutputMetadata {
    bindingPropertyName: string;
    constructor(bindingPropertyName?: string);
}

/** @stable */
export interface OutputMetadataFactory {
    (bindingPropertyName?: string): any;
    new (bindingPropertyName?: string): any;
}

/** @experimental */
export declare const PACKAGE_ROOT_URL: any;

/** @stable */
export declare var Pipe: PipeMetadataFactory;

/** @stable */
export declare class PipeMetadata extends InjectableMetadata {
    name: string;
    pure: boolean;
    constructor({name, pure}: {
        name: string;
        pure?: boolean;
    });
}

/** @stable */
export interface PipeMetadataFactory {
    (obj: {
        name: string;
        pure?: boolean;
    }): any;
    new (obj: {
        name: string;
        pure?: boolean;
    }): any;
}

/** @stable */
export interface PipeTransform {
    transform(value: any, ...args: any[]): any;
}

/** @experimental */
export declare const PLATFORM_COMMON_PROVIDERS: Array<any | Type | Provider | any[]>;

/** @deprecated */
export declare const PLATFORM_DIRECTIVES: OpaqueToken;

/** @experimental */
export declare const PLATFORM_INITIALIZER: any;

/** @deprecated */
export declare const PLATFORM_PIPES: OpaqueToken;

/** @experimental */
export declare abstract class PlatformRef {
    disposed: boolean;
    injector: Injector;
    abstract dispose(): void;
    abstract registerDisposeListener(dispose: () => void): void;
}

/** @deprecated */
export declare function provide(token: any, {useClass, useValue, useExisting, useFactory, deps, multi}: {
    useClass?: Type;
    useValue?: any;
    useExisting?: any;
    useFactory?: Function;
    deps?: Object[];
    multi?: boolean;
}): Provider;

/** @deprecated */
export declare class Provider {
    dependencies: Object[];
    multi: boolean;
    token: any;
    useClass: Type;
    useExisting: any;
    useFactory: Function;
    useValue: any;
    constructor(token: any, {useClass, useValue, useExisting, useFactory, deps, multi}: {
        useClass?: Type;
        useValue?: any;
        useExisting?: any;
        useFactory?: Function;
        deps?: Object[];
        multi?: boolean;
    });
}

/** @deprecated */
export declare class ProviderBuilder {
    token: any;
    constructor(token: any);
    toAlias(aliasToken: any): Provider;
    toClass(type: Type): Provider;
    toFactory(factory: Function, dependencies?: any[]): Provider;
    toValue(value: any): Provider;
}

/** @deprecated */
export declare var Query: QueryMetadataFactory;

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

/** @deprecated */
export declare class QueryMetadata extends DependencyMetadata {
    descendants: boolean;
    first: boolean;
    isVarBindingQuery: boolean;
    isViewQuery: boolean;
    read: any;
    selector: any;
    varBindings: string[];
    constructor(_selector: Type | string, {descendants, first, read}?: {
        descendants?: boolean;
        first?: boolean;
        read?: any;
    });
    toString(): string;
}

/** @deprecated */
export interface QueryMetadataFactory {
    (selector: Type | string, {descendants, read}?: {
        descendants?: boolean;
        read?: any;
    }): ParameterDecorator;
    new (selector: Type | string, {descendants, read}?: {
        descendants?: boolean;
        read?: any;
    }): QueryMetadata;
}

/** @stable */
export declare abstract class ReflectiveInjector implements Injector {
    parent: Injector;
    createChildFromResolved(providers: ResolvedReflectiveProvider[]): ReflectiveInjector;
    abstract get(token: any, notFoundValue?: any): any;
    instantiateResolved(provider: ResolvedReflectiveProvider): any;
    resolveAndCreateChild(providers: Array<Type | Provider | {
        [k: string]: any;
    } | any[]>): ReflectiveInjector;
    resolveAndInstantiate(provider: Type | Provider): any;
    /** @deprecated */ static fromResolvedBindings(providers: ResolvedReflectiveProvider[]): ReflectiveInjector;
    /** @experimental */ static fromResolvedProviders(providers: ResolvedReflectiveProvider[], parent?: Injector): ReflectiveInjector;
    static resolve(providers: Array<Type | Provider | {
        [k: string]: any;
    } | any[]>): ResolvedReflectiveProvider[];
    static resolveAndCreate(providers: Array<Type | Provider | {
        [k: string]: any;
    } | any[]>, parent?: Injector): ReflectiveInjector;
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
    encapsulation: ViewEncapsulation;
    id: string;
    slotCount: number;
    styles: Array<string | any[]>;
    templateUrl: string;
    constructor(id: string, templateUrl: string, slotCount: number, encapsulation: ViewEncapsulation, styles: Array<string | any[]>);
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
    abstract invokeElementMethod(renderElement: any, methodName: string, args?: any[]): any;
    abstract listen(renderElement: any, name: string, callback: Function): Function;
    abstract listenGlobal(target: string, name: string, callback: Function): Function;
    abstract projectNodes(parentElement: any, nodes: any[]): void;
    abstract selectRootElement(selectorOrNode: string | any, debugInfo?: RenderDebugInfo): any;
    abstract setBindingDebugInfo(renderElement: any, propertyName: string, propertyValue: string): void;
    abstract setElementAttribute(renderElement: any, attributeName: string, attributeValue: string): void;
    abstract setElementClass(renderElement: any, className: string, isAdd: boolean): any;
    abstract setElementProperty(renderElement: any, propertyName: string, propertyValue: any): void;
    abstract setElementStyle(renderElement: any, styleName: string, styleValue: string): any;
    abstract setText(renderNode: any, text: string): any;
}

/** @deprecated */
export interface ResolvedReflectiveBinding extends ResolvedReflectiveProvider {
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
export declare abstract class SanitizationService {
    abstract sanitize(context: SecurityContext, value: string): string;
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
export declare var Self: SelfMetadataFactory;

/** @stable */
export declare class SelfMetadata {
    toString(): string;
}

/** @stable */
export interface SelfMetadataFactory {
    (): any;
    new (): SelfMetadata;
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
export declare var SkipSelf: SkipSelfMetadataFactory;

/** @stable */
export declare class SkipSelfMetadata {
    toString(): string;
}

/** @stable */
export interface SkipSelfMetadataFactory {
    (): any;
    new (): SkipSelfMetadata;
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
export declare class SystemJsAppModuleFactoryLoader implements AppModuleFactoryLoader {
    load(path: string): Promise<AppModuleFactory<any>>;
}

/** @experimental */
export declare class SystemJsAppModuleLoader implements AppModuleFactoryLoader {
    constructor(_compiler: Compiler);
    load(path: string): Promise<AppModuleFactory<any>>;
}

/** @deprecated */
export declare class SystemJsCmpFactoryResolver implements ComponentResolver {
    constructor(_console: Console);
    clearCache(): void;
    resolveComponent(componentType: string | Type): Promise<ComponentFactory<any>>;
}

/** @deprecated */
export declare class SystemJsComponentResolver implements ComponentResolver {
    constructor(_resolver: ComponentResolver, _console: Console);
    clearCache(): void;
    resolveComponent(componentType: string | Type): Promise<ComponentFactory<any>>;
}

/** @stable */
export declare abstract class TemplateRef<C> {
    elementRef: ElementRef;
    abstract createEmbeddedView(context: C): EmbeddedViewRef<C>;
}

/** @experimental */
export declare class Testability {
    constructor(_ngZone: NgZone);
    decreasePendingRequestCount(): number;
    findBindings(using: any, provider: string, exactMatch: boolean): any[];
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
export declare function trigger(name: string, animation: AnimationMetadata[]): AnimationEntryMetadata;

/** @stable */
export declare var Type: FunctionConstructor;

/** @stable */
export interface TypeDecorator {
    annotations: any[];
    (target: Object, propertyKey?: string | symbol, parameterIndex?: number): void;
    <T extends Type>(type: T): T;
    Class(obj: ClassDefinition): ConcreteType<any>;
}

/** @stable */
export declare var ViewChild: ViewChildMetadataFactory;

/** @stable */
export declare class ViewChildMetadata extends ViewQueryMetadata {
    constructor(_selector: Type | string, {read}?: {
        read?: any;
    });
}

/** @stable */
export interface ViewChildMetadataFactory {
    (selector: Type | string, {read}?: {
        read?: any;
    }): any;
    new (selector: Type | string, {read}?: {
        read?: any;
    }): ViewChildMetadataFactory;
}

/** @stable */
export declare var ViewChildren: ViewChildrenMetadataFactory;

/** @stable */
export declare class ViewChildrenMetadata extends ViewQueryMetadata {
    constructor(_selector: Type | string, {read}?: {
        read?: any;
    });
}

/** @stable */
export interface ViewChildrenMetadataFactory {
    (selector: Type | string, {read}?: {
        read?: any;
    }): any;
    new (selector: Type | string, {read}?: {
        read?: any;
    }): ViewChildrenMetadata;
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
    abstract remove(index?: number): void;
}

/** @experimental */
export interface ViewDecorator extends TypeDecorator {
    View(obj: {
        templateUrl?: string;
        template?: string;
        directives?: Array<Type | any[]>;
        pipes?: Array<Type | any[]>;
        renderer?: string;
        styles?: string[];
        styleUrls?: string[];
        animations?: AnimationEntryMetadata[];
        interpolation?: [string, string];
    }): ViewDecorator;
}

/** @stable */
export declare enum ViewEncapsulation {
    Emulated = 0,
    Native = 1,
    None = 2,
}

/** @experimental */
export declare class ViewMetadata {
    animations: AnimationEntryMetadata[];
    directives: Array<Type | any[]>;
    encapsulation: ViewEncapsulation;
    interpolation: [string, string];
    pipes: Array<Type | any[]>;
    styleUrls: string[];
    styles: string[];
    template: string;
    templateUrl: string;
    constructor({templateUrl, template, directives, pipes, encapsulation, styles, styleUrls, animations, interpolation}?: {
        templateUrl?: string;
        template?: string;
        directives?: Array<Type | any[]>;
        pipes?: Array<Type | any[]>;
        encapsulation?: ViewEncapsulation;
        styles?: string[];
        styleUrls?: string[];
        animations?: AnimationEntryMetadata[];
        interpolation?: [string, string];
    });
}

/** @experimental */
export interface ViewMetadataFactory {
    (obj: {
        templateUrl?: string;
        template?: string;
        directives?: Array<Type | any[]>;
        pipes?: Array<Type | any[]>;
        encapsulation?: ViewEncapsulation;
        styles?: string[];
        styleUrls?: string[];
        animations?: AnimationEntryMetadata[];
        interpolation?: [string, string];
    }): ViewDecorator;
    new (obj: {
        templateUrl?: string;
        template?: string;
        directives?: Array<Type | any[]>;
        pipes?: Array<Type | any[]>;
        encapsulation?: ViewEncapsulation;
        styles?: string[];
        styleUrls?: string[];
        animations?: AnimationEntryMetadata[];
        interpolation?: [string, string];
    }): ViewMetadata;
}

/** @deprecated */
export declare var ViewQuery: QueryMetadataFactory;

/** @deprecated */
export declare class ViewQueryMetadata extends QueryMetadata {
    isViewQuery: boolean;
    constructor(_selector: Type | string, {descendants, first, read}?: {
        descendants?: boolean;
        first?: boolean;
        read?: any;
    });
    toString(): string;
}

/** @stable */
export declare abstract class ViewRef {
    destroyed: boolean;
    abstract onDestroy(callback: Function): any;
}

/** @stable */
export declare class WrappedException extends BaseWrappedException {
    context: any;
    message: string;
    originalException: any;
    originalStack: any;
    wrapperMessage: string;
    wrapperStack: any;
    constructor(_wrapperMessage: string, _originalException: any, _originalStack?: any, _context?: any);
    toString(): string;
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
