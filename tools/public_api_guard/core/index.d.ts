export declare class AbstractProviderError extends BaseException {
    context: any;
    constructor(injector: ReflectiveInjector, key: ReflectiveKey, constructResolvingMessage: Function);
    addKey(injector: ReflectiveInjector, key: ReflectiveKey): void;
}

export declare abstract class AfterContentChecked {
    abstract ngAfterContentChecked(): any;
}

export declare abstract class AfterContentInit {
    abstract ngAfterContentInit(): any;
}

export declare abstract class AfterViewChecked {
    abstract ngAfterViewChecked(): any;
}

export declare abstract class AfterViewInit {
    abstract ngAfterViewInit(): any;
}

export declare function animate(timing: string | number, styles?: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata): AnimationAnimateMetadata;

export declare class AnimationAnimateMetadata extends AnimationMetadata {
    styles: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata;
    timings: string | number;
    constructor(timings: string | number, styles: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata);
}

export declare class AnimationEntryMetadata {
    definitions: AnimationStateMetadata[];
    name: string;
    constructor(name: string, definitions: AnimationStateMetadata[]);
}

export declare class AnimationGroupMetadata extends AnimationWithStepsMetadata {
    steps: AnimationMetadata[];
    constructor(_steps: AnimationMetadata[]);
}

export declare class AnimationKeyframesSequenceMetadata extends AnimationMetadata {
    steps: AnimationStyleMetadata[];
    constructor(steps: AnimationStyleMetadata[]);
}

export declare abstract class AnimationMetadata {
}

export declare abstract class AnimationPlayer {
    parentPlayer: AnimationPlayer;
    abstract destroy(): void;
    abstract finish(): void;
    abstract getPosition(): number;
    abstract onDone(fn: Function): void;
    abstract pause(): void;
    abstract play(): void;
    abstract reset(): void;
    abstract restart(): void;
    abstract setPosition(p: any): void;
}

export declare class AnimationSequenceMetadata extends AnimationWithStepsMetadata {
    steps: AnimationMetadata[];
    constructor(_steps: AnimationMetadata[]);
}

export declare class AnimationStateDeclarationMetadata extends AnimationStateMetadata {
    stateNameExpr: string;
    styles: AnimationStyleMetadata;
    constructor(stateNameExpr: string, styles: AnimationStyleMetadata);
}

export declare abstract class AnimationStateMetadata {
}

export declare class AnimationStateTransitionMetadata extends AnimationStateMetadata {
    stateChangeExpr: string;
    steps: AnimationMetadata;
    constructor(stateChangeExpr: string, steps: AnimationMetadata);
}

export declare class AnimationStyleMetadata extends AnimationMetadata {
    offset: number;
    styles: Array<string | {
        [key: string]: string | number;
    }>;
    constructor(styles: Array<string | {
        [key: string]: string | number;
    }>, offset?: number);
}

export declare abstract class AnimationWithStepsMetadata extends AnimationMetadata {
    steps: AnimationMetadata[];
    constructor();
}

export declare const APP_ID: any;

export declare const APP_INITIALIZER: any;

export declare const APPLICATION_COMMON_PROVIDERS: Array<Type | {
    [k: string]: any;
} | any[]>;

export declare abstract class ApplicationRef {
    componentTypes: Type[];
    injector: Injector;
    zone: NgZone;
    abstract bootstrap<C>(componentFactory: ComponentFactory<C>): ComponentRef<C>;
    abstract dispose(): void;
    abstract registerBootstrapListener(listener: (ref: ComponentRef<any>) => void): void;
    abstract registerDisposeListener(dispose: () => void): void;
    abstract run(callback: Function): any;
    abstract tick(): void;
    abstract waitForAsyncInitializers(): Promise<any>;
}

export declare function asNativeElements(debugEls: DebugElement[]): any;

export declare function assertPlatform(requiredToken: any): PlatformRef;

export declare var Attribute: AttributeMetadataFactory;

export declare class AttributeMetadata extends DependencyMetadata {
    attributeName: string;
    token: AttributeMetadata;
    constructor(attributeName: string);
    toString(): string;
}

export interface AttributeMetadataFactory {
    (name: string): TypeDecorator;
    new (name: string): AttributeMetadata;
}

export declare const AUTO_STYLE: string;

export declare class BaseException extends Error {
    message: string;
    stack: any;
    constructor(message?: string);
    toString(): string;
}

export declare function bind(token: any): ProviderBuilder;

export declare class Binding extends Provider {
    toAlias: any;
    toClass: Type;
    toFactory: Function;
    toValue: any;
    constructor(token: any, {toClass, toValue, toAlias, toFactory, deps, multi}: {
        toClass?: Type;
        toValue?: any;
        toAlias?: any;
        toFactory: Function;
        deps?: Object[];
        multi?: boolean;
    });
}

export declare enum ChangeDetectionStrategy {
    CheckOnce = 0,
    Checked = 1,
    CheckAlways = 2,
    Detached = 3,
    OnPush = 4,
    Default = 5,
}

export declare abstract class ChangeDetectorRef {
    abstract checkNoChanges(): void;
    abstract detach(): void;
    abstract detectChanges(): void;
    abstract markForCheck(): void;
    abstract reattach(): void;
}

export declare function Class(clsDef: ClassDefinition): ConcreteType;

export interface ClassDefinition {
    constructor: Function | any[];
    extends?: Type;
    [x: string]: Type | Function | any[];
}

export declare class CollectionChangeRecord {
    currentIndex: number;
    item: any;
    previousIndex: number;
    trackById: any;
    constructor(item: any, trackById: any);
    toString(): string;
}

export declare var Component: ComponentMetadataFactory;

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

export declare class ComponentFactory<C> {
    componentType: Type;
    selector: string;
    constructor(selector: string, _viewFactory: Function, _componentType: Type);
    create(injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string | any): ComponentRef<C>;
}

export declare abstract class ComponentFactoryResolver {
    abstract resolveComponentFactory<T>(component: ClassWithConstructor<T>): ComponentFactory<T>;
    static NULL: ComponentFactoryResolver;
}

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

export declare abstract class ComponentResolver {
    abstract clearCache(): void;
    abstract resolveComponent(component: Type | string): Promise<ComponentFactory<any>>;
}

export declare var ContentChild: ContentChildMetadataFactory;

export declare class ContentChildMetadata extends QueryMetadata {
    constructor(_selector: Type | string, {read}?: {
        read?: any;
    });
}

export interface ContentChildMetadataFactory {
    (selector: Type | string, {read}?: {
        read?: any;
    }): any;
    new (selector: Type | string, {read}?: {
        read?: any;
    }): ContentChildMetadataFactory;
}

export declare var ContentChildren: ContentChildrenMetadataFactory;

export declare class ContentChildrenMetadata extends QueryMetadata {
    constructor(_selector: Type | string, {descendants, read}?: {
        descendants?: boolean;
        read?: any;
    });
}

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

export declare function coreBootstrap<C>(componentFactory: ComponentFactory<C>, injector: Injector): ComponentRef<C>;

export declare function coreLoadAndBootstrap(componentType: Type, injector: Injector): Promise<ComponentRef<any>>;

export declare function createNgZone(): NgZone;

export declare function createPlatform(injector: Injector): PlatformRef;

export declare class CyclicDependencyError extends AbstractProviderError {
    constructor(injector: ReflectiveInjector, key: ReflectiveKey);
}

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
    inject(token: any): any;
}

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

export declare var Directive: DirectiveMetadataFactory;

export interface DirectiveDecorator extends TypeDecorator {
}

export declare class DirectiveMetadata extends InjectableMetadata {
    events: string[];
    exportAs: string;
    host: {
        [key: string]: string;
    };
    inputs: string[];
    outputs: string[];
    properties: string[];
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

export declare function disposePlatform(): void;

export declare abstract class DoCheck {
    abstract ngDoCheck(): any;
}

export declare abstract class DynamicComponentLoader {
    abstract loadAsRoot(type: Type, overrideSelectorOrNode: string | any, injector: Injector, onDispose?: () => void, projectableNodes?: any[][]): Promise<ComponentRef<any>>;
    abstract loadNextToLocation(type: Type, location: ViewContainerRef, providers?: ResolvedReflectiveProvider[], projectableNodes?: any[][]): Promise<ComponentRef<any>>;
}

export declare class ElementRef {
    nativeElement: any;
    constructor(nativeElement: any);
}

export declare abstract class EmbeddedViewRef<C> extends ViewRef {
    context: C;
    rootNodes: any[];
    abstract destroy(): any;
}

export declare function enableProdMode(): void;

export declare class EventEmitter<T> extends Subject<T> {
    __isAsync: boolean;
    constructor(isAsync?: boolean);
    emit(value: T): void;
    next(value: any): void;
    subscribe(generatorOrNext?: any, error?: any, complete?: any): any;
}

export declare class ExceptionHandler {
    constructor(_logger: any, _rethrowException?: boolean);
    call(exception: any, stackTrace?: any, reason?: string): void;
    static exceptionToString(exception: any, stackTrace?: any, reason?: string): string;
}

export declare class ExpressionChangedAfterItHasBeenCheckedException extends BaseException {
    constructor(oldValue: any, currValue: any, context: any);
}

export declare function forwardRef(forwardRefFn: ForwardRefFn): Type;

export interface ForwardRefFn {
    (): any;
}

export declare function getDebugNode(nativeNode: any): DebugNode;

export declare function getPlatform(): PlatformRef;

export interface GetTestability {
    addToWindow(registry: TestabilityRegistry): void;
    findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean): Testability;
}

export declare function group(steps: AnimationMetadata[]): AnimationGroupMetadata;

export declare var Host: HostMetadataFactory;

export declare var HostBinding: HostBindingMetadataFactory;

export declare class HostBindingMetadata {
    hostPropertyName: string;
    constructor(hostPropertyName?: string);
}

export interface HostBindingMetadataFactory {
    (hostPropertyName?: string): any;
    new (hostPropertyName?: string): any;
}

export declare var HostListener: HostListenerMetadataFactory;

export declare class HostListenerMetadata {
    args: string[];
    eventName: string;
    constructor(eventName: string, args?: string[]);
}

export interface HostListenerMetadataFactory {
    (eventName: string, args?: string[]): any;
    new (eventName: string, args?: string[]): any;
}

export declare class HostMetadata {
    toString(): string;
}

export interface HostMetadataFactory {
    (): any;
    new (): HostMetadata;
}

export declare var Inject: InjectMetadataFactory;

export declare var Injectable: InjectableMetadataFactory;

export declare class InjectableMetadata {
    constructor();
}

export interface InjectableMetadataFactory {
    (): any;
    new (): InjectableMetadata;
}

export declare class InjectMetadata {
    token: any;
    constructor(token: any);
    toString(): string;
}

export interface InjectMetadataFactory {
    (token: any): any;
    new (token: any): InjectMetadata;
}

export declare abstract class Injector {
    get(token: any, notFoundValue?: any): any;
    static THROW_IF_NOT_FOUND: Object;
}

export declare var Input: InputMetadataFactory;

export declare class InputMetadata {
    bindingPropertyName: string;
    constructor(
        bindingPropertyName?: string);
}

export interface InputMetadataFactory {
    (bindingPropertyName?: string): any;
    new (bindingPropertyName?: string): any;
}

export declare class InstantiationError extends WrappedException {
    causeKey: ReflectiveKey;
    context: any;
    wrapperMessage: string;
    constructor(injector: ReflectiveInjector, originalException: any, originalStack: any, key: ReflectiveKey);
    addKey(injector: ReflectiveInjector, key: ReflectiveKey): void;
}

export declare class InvalidProviderError extends BaseException {
    constructor(provider: any);
}

export declare function isDevMode(): boolean;

export interface IterableDiffer {
    diff(object: any): any;
    onDestroy(): any;
}

export interface IterableDifferFactory {
    create(cdRef: ChangeDetectorRef, trackByFn?: TrackByFn): IterableDiffer;
    supports(objects: any): boolean;
}

export declare class IterableDiffers {
    factories: IterableDifferFactory[];
    constructor(factories: IterableDifferFactory[]);
    find(iterable: any): IterableDifferFactory;
    static create(factories: IterableDifferFactory[], parent?: IterableDiffers): IterableDiffers;
    static extend(factories: IterableDifferFactory[]): Provider;
}

export declare function keyframes(steps: AnimationStyleMetadata[]): AnimationKeyframesSequenceMetadata;

export declare class KeyValueChangeRecord {
    currentValue: any;
    key: any;
    previousValue: any;
    constructor(key: any);
    toString(): string;
}

export interface KeyValueDiffer {
    diff(object: any): any;
    onDestroy(): any;
}

export interface KeyValueDifferFactory {
    create(cdRef: ChangeDetectorRef): KeyValueDiffer;
    supports(objects: any): boolean;
}

export declare class KeyValueDiffers {
    factories: KeyValueDifferFactory[];
    constructor(factories: KeyValueDifferFactory[]);
    find(kv: Object): KeyValueDifferFactory;
    static create(factories: KeyValueDifferFactory[], parent?: KeyValueDiffers): KeyValueDiffers;
    static extend(factories: KeyValueDifferFactory[]): Provider;
}

export declare function lockRunMode(): void;

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

export declare class NgZoneError {
    error: any;
    stackTrace: any;
    constructor(error: any, stackTrace: any);
}

export declare class NoAnnotationError extends BaseException {
    constructor(typeOrFunc: any, params: any[][]);
}

export declare class NoComponentFactoryError extends BaseException {
    component: Function;
    constructor(component: Function);
}

export declare class NoProviderError extends AbstractProviderError {
    constructor(injector: ReflectiveInjector, key: ReflectiveKey);
}

export declare abstract class OnChanges {
    abstract ngOnChanges(changes: SimpleChanges): any;
}

export declare abstract class OnDestroy {
    abstract ngOnDestroy(): any;
}

export declare abstract class OnInit {
    abstract ngOnInit(): any;
}

export declare class OpaqueToken {
    constructor(_desc: string);
    toString(): string;
}

export declare var Optional: OptionalMetadataFactory;

export declare class OptionalMetadata {
    toString(): string;
}

export interface OptionalMetadataFactory {
    (): any;
    new (): OptionalMetadata;
}

export declare class OutOfBoundsError extends BaseException {
    constructor(index: any);
}

export declare var Output: OutputMetadataFactory;

export declare class OutputMetadata {
    bindingPropertyName: string;
    constructor(bindingPropertyName?: string);
}

export interface OutputMetadataFactory {
    (bindingPropertyName?: string): any;
    new (bindingPropertyName?: string): any;
}

export declare const PACKAGE_ROOT_URL: any;

export declare var Pipe: PipeMetadataFactory;

export declare class PipeMetadata extends InjectableMetadata {
    name: string;
    pure: boolean;
    constructor({name, pure}: {
        name: string;
        pure?: boolean;
    });
}

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

export interface PipeTransform {
    transform(value: any, ...args: any[]): any;
}

export declare const PLATFORM_COMMON_PROVIDERS: Array<any | Type | Provider | any[]>;

export declare const PLATFORM_DIRECTIVES: OpaqueToken;

export declare const PLATFORM_INITIALIZER: any;

export declare const PLATFORM_PIPES: OpaqueToken;

export declare abstract class PlatformRef {
    disposed: boolean;
    injector: Injector;
    abstract dispose(): void;
    abstract registerDisposeListener(dispose: () => void): void;
}

export declare function provide(token: any, {useClass, useValue, useExisting, useFactory, deps, multi}: {
    useClass?: Type;
    useValue?: any;
    useExisting?: any;
    useFactory?: Function;
    deps?: Object[];
    multi?: boolean;
}): Provider;

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

export declare class ProviderBuilder {
    token: any;
    constructor(token: any);
    toAlias(aliasToken: any): Provider;
    toClass(type: Type): Provider;
    toFactory(factory: Function, dependencies?: any[]): Provider;
    toValue(value: any): Provider;
}

export declare var Query: QueryMetadataFactory;

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

export declare abstract class ReflectiveInjector implements Injector {
    parent: Injector;
    createChildFromResolved(providers: ResolvedReflectiveProvider[]): ReflectiveInjector;
    abstract get(token: any, notFoundValue?: any): any;
    instantiateResolved(provider: ResolvedReflectiveProvider): any;
    resolveAndCreateChild(providers: Array<Type | Provider | {
        [k: string]: any;
    } | any[]>): ReflectiveInjector;
    resolveAndInstantiate(provider: Type | Provider): any;
    static fromResolvedBindings(providers: ResolvedReflectiveProvider[]): ReflectiveInjector;
    static fromResolvedProviders(providers: ResolvedReflectiveProvider[], parent?: Injector): ReflectiveInjector;
    static resolve(providers: Array<Type | Provider | {
        [k: string]: any;
    } | any[]>): ResolvedReflectiveProvider[];
    static resolveAndCreate(providers: Array<Type | Provider | {
        [k: string]: any;
    } | any[]>, parent?: Injector): ReflectiveInjector;
}

export declare class ReflectiveKey {
    displayName: string;
    id: number;
    token: Object;
    constructor(token: Object, id: number);
    static numberOfKeys: number;
    static get(token: Object): ReflectiveKey;
}

export declare class RenderComponentType {
    encapsulation: ViewEncapsulation;
    id: string;
    slotCount: number;
    styles: Array<string | any[]>;
    templateUrl: string;
    constructor(id: string, templateUrl: string, slotCount: number, encapsulation: ViewEncapsulation, styles: Array<string | any[]>);
}

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

export interface ResolvedReflectiveBinding extends ResolvedReflectiveProvider {
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

export declare function resolveForwardRef(type: any): any;

export declare abstract class RootRenderer {
    abstract renderComponent(componentType: RenderComponentType): Renderer;
}

export declare var Self: SelfMetadataFactory;

export declare class SelfMetadata {
    toString(): string;
}

export interface SelfMetadataFactory {
    (): any;
    new (): SelfMetadata;
}

export declare function sequence(steps: AnimationMetadata[]): AnimationSequenceMetadata;

export declare function setTestabilityGetter(getter: GetTestability): void;

export declare class SimpleChange {
    currentValue: any;
    previousValue: any;
    constructor(previousValue: any, currentValue: any);
    isFirstChange(): boolean;
}

export interface SimpleChanges {
    [propName: string]: SimpleChange;
}

export declare var SkipSelf: SkipSelfMetadataFactory;

export declare class SkipSelfMetadata {
    toString(): string;
}

export interface SkipSelfMetadataFactory {
    (): any;
    new (): SkipSelfMetadata;
}

export declare function state(stateNameExpr: string, styles: AnimationStyleMetadata): AnimationStateDeclarationMetadata;

export declare function style(tokens: string | {
    [key: string]: string | number;
} | Array<string | {
    [key: string]: string | number;
}>): AnimationStyleMetadata;

export declare class SystemJsCmpFactoryResolver implements ComponentResolver {
    clearCache(): void;
    resolveComponent(componentType: string | Type): Promise<ComponentFactory<any>>;
}

export declare class SystemJsComponentResolver implements ComponentResolver {
    constructor(_resolver: ComponentResolver);
    clearCache(): void;
    resolveComponent(componentType: string | Type): Promise<ComponentFactory<any>>;
}

export declare abstract class TemplateRef<C> {
    elementRef: ElementRef;
    abstract createEmbeddedView(context: C): EmbeddedViewRef<C>;
}

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

export declare class TestabilityRegistry {
    constructor();
    findTestabilityInTree(elem: Node, findInAncestors?: boolean): Testability;
    getAllRootElements(): any[];
    getAllTestabilities(): Testability[];
    getTestability(elem: any): Testability;
    registerApplication(token: any, testability: Testability): void;
}

export interface TrackByFn {
    (index: number, item: any): any;
}

export declare function transition(stateChangeExpr: string, steps: AnimationMetadata | AnimationMetadata[]): AnimationStateTransitionMetadata;

export declare function trigger(name: string, animation: AnimationMetadata[]): AnimationEntryMetadata;

export declare var Type: FunctionConstructor;

export interface TypeDecorator {
    annotations: any[];
    (target: Object, propertyKey?: string | symbol, parameterIndex?: number): void;
    <T extends Type>(type: T): T;
    Class(obj: ClassDefinition): ConcreteType;
}

export declare var ViewChild: ViewChildMetadataFactory;

export declare class ViewChildMetadata extends ViewQueryMetadata {
    constructor(_selector: Type | string, {read}?: {
        read?: any;
    });
}

export interface ViewChildMetadataFactory {
    (selector: Type | string, {read}?: {
        read?: any;
    }): any;
    new (selector: Type | string, {read}?: {
        read?: any;
    }): ViewChildMetadataFactory;
}

export declare var ViewChildren: ViewChildrenMetadataFactory;

export declare class ViewChildrenMetadata extends ViewQueryMetadata {
    constructor(_selector: Type | string, {read}?: {
        read?: any;
    });
}

export interface ViewChildrenMetadataFactory {
    (selector: Type | string, {read}?: {
        read?: any;
    }): any;
    new (selector: Type | string, {read}?: {
        read?: any;
    }): ViewChildrenMetadata;
}

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

export declare enum ViewEncapsulation {
    Emulated = 0,
    Native = 1,
    None = 2,
}

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

export declare var ViewQuery: QueryMetadataFactory;

export declare class ViewQueryMetadata extends QueryMetadata {
    isViewQuery: boolean;
    constructor(_selector: Type | string, {descendants, first, read}?: {
        descendants?: boolean;
        first?: boolean;
        read?: any;
    });
    toString(): string;
}

export declare abstract class ViewRef {
    destroyed: boolean;
    abstract onDestroy(callback: Function): any;
}

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

export declare class WrappedValue {
    wrapped: any;
    constructor(wrapped: any);
    static wrap(value: any): WrappedValue;
}

export declare var wtfCreateScope: (signature: string, flags?: any) => WtfScopeFn;

export declare var wtfEndTimeRange: (range: any) => void;

export declare var wtfLeave: <T>(scope: any, returnValue?: T) => T;

export interface WtfScopeFn {
    (arg0?: any, arg1?: any): any;
}

export declare var wtfStartTimeRange: (rangeType: string, action: string) => any;
