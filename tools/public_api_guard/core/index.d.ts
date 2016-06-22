export declare class AbstractProviderError extends BaseException {
    constructor(injector: ReflectiveInjector, key: ReflectiveKey, constructResolvingMessage: Function);
    addKey(injector: ReflectiveInjector, key: ReflectiveKey): void;
    context: any;
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
    timings: string | number;
    styles: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata;
    constructor(timings: string | number, styles: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata);
}

export declare class AnimationEntryMetadata {
    name: string;
    definitions: AnimationStateMetadata[];
    constructor(name: string, definitions: AnimationStateMetadata[]);
}

export declare class AnimationGroupMetadata extends AnimationWithStepsMetadata {
    constructor(_steps: AnimationMetadata[]);
    steps: AnimationMetadata[];
}

export declare class AnimationKeyframesSequenceMetadata extends AnimationMetadata {
    steps: AnimationStyleMetadata[];
    constructor(steps: AnimationStyleMetadata[]);
}

export declare abstract class AnimationMetadata {
}

export declare abstract class AnimationPlayer {
    abstract onDone(fn: Function): void;
    abstract play(): void;
    abstract pause(): void;
    abstract restart(): void;
    abstract finish(): void;
    abstract destroy(): void;
    abstract reset(): void;
    abstract setPosition(p: any): void;
    abstract getPosition(): number;
    parentPlayer: AnimationPlayer;
}

export declare class AnimationSequenceMetadata extends AnimationWithStepsMetadata {
    constructor(_steps: AnimationMetadata[]);
    steps: AnimationMetadata[];
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
    styles: Array<string | {
        [key: string]: string | number;
    }>;
    offset: number;
    constructor(styles: Array<string | {
        [key: string]: string | number;
    }>, offset?: number);
}

export declare abstract class AnimationWithStepsMetadata extends AnimationMetadata {
    constructor();
    steps: AnimationMetadata[];
}

export declare const APP_ID: any;

export declare const APP_INITIALIZER: any;

export declare const APPLICATION_COMMON_PROVIDERS: Array<Type | {
    [k: string]: any;
} | any[]>;

export declare abstract class ApplicationRef {
    abstract registerBootstrapListener(listener: (ref: ComponentRef<any>) => void): void;
    abstract registerDisposeListener(dispose: () => void): void;
    abstract waitForAsyncInitializers(): Promise<any>;
    abstract run(callback: Function): any;
    abstract bootstrap<C>(componentFactory: ComponentFactory<C>): ComponentRef<C>;
    injector: Injector;
    zone: NgZone;
    abstract dispose(): void;
    abstract tick(): void;
    componentTypes: Type[];
}

export declare function asNativeElements(debugEls: DebugElement[]): any;

export declare function assertPlatform(requiredToken: any): PlatformRef;

export declare var Attribute: AttributeMetadataFactory;

export declare class AttributeMetadata extends DependencyMetadata {
    attributeName: string;
    constructor(attributeName: string);
    token: AttributeMetadata;
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
    constructor(token: any, {toClass, toValue, toAlias, toFactory, deps, multi}: {
        toClass?: Type;
        toValue?: any;
        toAlias?: any;
        toFactory: Function;
        deps?: Object[];
        multi?: boolean;
    });
    toClass: Type;
    toAlias: any;
    toFactory: Function;
    toValue: any;
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
    abstract markForCheck(): void;
    abstract detach(): void;
    abstract detectChanges(): void;
    abstract checkNoChanges(): void;
    abstract reattach(): void;
}

export declare function Class(clsDef: ClassDefinition): ConcreteType;

export interface ClassDefinition {
    extends?: Type;
    constructor: Function | any[];
    [x: string]: Type | Function | any[];
}

export declare class CollectionChangeRecord {
    item: any;
    trackById: any;
    currentIndex: number;
    previousIndex: number;
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
    selector: string;
    constructor(selector: string, _viewFactory: Function, _componentType: Type);
    componentType: Type;
    create(injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string | any): ComponentRef<C>;
}

export declare abstract class ComponentFactoryResolver {
    static NULL: ComponentFactoryResolver;
    abstract resolveComponentFactory<T>(component: ClassWithConstructor<T>): ComponentFactory<T>;
}

export declare class ComponentMetadata extends DirectiveMetadata {
    changeDetection: ChangeDetectionStrategy;
    viewProviders: any[];
    moduleId: string;
    templateUrl: string;
    template: string;
    styleUrls: string[];
    styles: string[];
    animations: AnimationEntryMetadata[];
    directives: Array<Type | any[]>;
    pipes: Array<Type | any[]>;
    encapsulation: ViewEncapsulation;
    interpolation: [string, string];
    precompile: Array<Type | any[]>;
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
    location: ElementRef;
    injector: Injector;
    instance: C;
    hostView: ViewRef;
    changeDetectorRef: ChangeDetectorRef;
    componentType: Type;
    abstract destroy(): void;
    abstract onDestroy(callback: Function): void;
}

export declare abstract class ComponentResolver {
    abstract resolveComponent(component: Type | string): Promise<ComponentFactory<any>>;
    abstract clearCache(): void;
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
    name: string;
    properties: {
        [key: string]: any;
    };
    attributes: {
        [key: string]: string;
    };
    classes: {
        [key: string]: boolean;
    };
    styles: {
        [key: string]: string;
    };
    childNodes: DebugNode[];
    nativeElement: any;
    constructor(nativeNode: any, parent: any, _debugInfo: RenderDebugInfo);
    addChild(child: DebugNode): void;
    removeChild(child: DebugNode): void;
    insertChildrenAfter(child: DebugNode, newChildren: DebugNode[]): void;
    query(predicate: Predicate<DebugElement>): DebugElement;
    queryAll(predicate: Predicate<DebugElement>): DebugElement[];
    queryAllNodes(predicate: Predicate<DebugNode>): DebugNode[];
    children: DebugElement[];
    triggerEventHandler(eventName: string, eventObj: any): void;
}

export declare class DebugNode {
    nativeNode: any;
    listeners: EventListener[];
    parent: DebugElement;
    constructor(nativeNode: any, parent: DebugNode, _debugInfo: RenderDebugInfo);
    injector: Injector;
    componentInstance: any;
    context: any;
    references: {
        [key: string]: any;
    };
    providerTokens: any[];
    source: string;
    inject(token: any): any;
}

export declare class DefaultIterableDiffer implements IterableDiffer {
    constructor(_trackByFn?: TrackByFn);
    collection: any;
    length: number;
    forEachItem(fn: Function): void;
    forEachPreviousItem(fn: Function): void;
    forEachAddedItem(fn: Function): void;
    forEachMovedItem(fn: Function): void;
    forEachRemovedItem(fn: Function): void;
    forEachIdentityChange(fn: Function): void;
    diff(collection: any): DefaultIterableDiffer;
    onDestroy(): void;
    check(collection: any): boolean;
    isDirty: boolean;
    toString(): string;
}

export declare var Directive: DirectiveMetadataFactory;

export interface DirectiveDecorator extends TypeDecorator {
}

export declare class DirectiveMetadata extends InjectableMetadata {
    selector: string;
    inputs: string[];
    properties: string[];
    outputs: string[];
    events: string[];
    host: {
        [key: string]: string;
    };
    providers: any[];
    exportAs: string;
    queries: {
        [key: string]: any;
    };
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
    static exceptionToString(exception: any, stackTrace?: any, reason?: string): string;
    call(exception: any, stackTrace?: any, reason?: string): void;
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
    eventName: string;
    args: string[];
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
    static THROW_IF_NOT_FOUND: Object;
    get(token: any, notFoundValue?: any): any;
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
    constructor(injector: ReflectiveInjector, originalException: any, originalStack: any, key: ReflectiveKey);
    addKey(injector: ReflectiveInjector, key: ReflectiveKey): void;
    wrapperMessage: string;
    causeKey: ReflectiveKey;
    context: any;
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
    supports(objects: any): boolean;
    create(cdRef: ChangeDetectorRef, trackByFn?: TrackByFn): IterableDiffer;
}

export declare class IterableDiffers {
    factories: IterableDifferFactory[];
    constructor(factories: IterableDifferFactory[]);
    static create(factories: IterableDifferFactory[], parent?: IterableDiffers): IterableDiffers;
    static extend(factories: IterableDifferFactory[]): Provider;
    find(iterable: any): IterableDifferFactory;
}

export declare function keyframes(steps: AnimationStyleMetadata[]): AnimationKeyframesSequenceMetadata;

export declare class KeyValueChangeRecord {
    key: any;
    previousValue: any;
    currentValue: any;
    constructor(key: any);
    toString(): string;
}

export interface KeyValueDiffer {
    diff(object: any): any;
    onDestroy(): any;
}

export interface KeyValueDifferFactory {
    supports(objects: any): boolean;
    create(cdRef: ChangeDetectorRef): KeyValueDiffer;
}

export declare class KeyValueDiffers {
    factories: KeyValueDifferFactory[];
    constructor(factories: KeyValueDifferFactory[]);
    static create(factories: KeyValueDifferFactory[], parent?: KeyValueDiffers): KeyValueDiffers;
    static extend(factories: KeyValueDifferFactory[]): Provider;
    find(kv: Object): KeyValueDifferFactory;
}

export declare function lockRunMode(): void;

export declare class NgZone {
    static isInAngularZone(): boolean;
    static assertInAngularZone(): void;
    static assertNotInAngularZone(): void;
    constructor({enableLongStackTrace}: {
        enableLongStackTrace?: boolean;
    });
    onUnstable: EventEmitter<any>;
    onMicrotaskEmpty: EventEmitter<any>;
    onStable: EventEmitter<any>;
    onError: EventEmitter<any>;
    isStable: boolean;
    hasPendingMicrotasks: boolean;
    hasPendingMacrotasks: boolean;
    run(fn: () => any): any;
    runGuarded(fn: () => any): any;
    runOutsideAngular(fn: () => any): any;
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
    constructor({name, pure}: {
        name: string;
        pure?: boolean;
    });
    pure: boolean;
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
    abstract registerDisposeListener(dispose: () => void): void;
    injector: Injector;
    abstract dispose(): void;
    disposed: boolean;
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
    token: any;
    useClass: Type;
    useValue: any;
    useExisting: any;
    useFactory: Function;
    dependencies: Object[];
    constructor(token: any, {useClass, useValue, useExisting, useFactory, deps, multi}: {
        useClass?: Type;
        useValue?: any;
        useExisting?: any;
        useFactory?: Function;
        deps?: Object[];
        multi?: boolean;
    });
    multi: boolean;
}

export declare class ProviderBuilder {
    token: any;
    constructor(token: any);
    toClass(type: Type): Provider;
    toValue(value: any): Provider;
    toAlias(aliasToken: any): Provider;
    toFactory(factory: Function, dependencies?: any[]): Provider;
}

export declare var Query: QueryMetadataFactory;

export declare class QueryList<T> {
    changes: Observable<any>;
    length: number;
    first: T;
    last: T;
    map<U>(fn: (item: T, index: number, array: T[]) => U): U[];
    filter(fn: (item: T, index: number, array: T[]) => boolean): T[];
    reduce<U>(fn: (prevValue: U, curValue: T, curIndex: number, array: T[]) => U, init: U): U;
    forEach(fn: (item: T, index: number, array: T[]) => void): void;
    some(fn: (value: T, index: number, array: T[]) => boolean): boolean;
    toArray(): T[];
    toString(): string;
    reset(res: Array<T | any[]>): void;
    notifyOnChanges(): void;
    setDirty(): void;
    dirty: boolean;
}

export declare class QueryMetadata extends DependencyMetadata {
    descendants: boolean;
    first: boolean;
    read: any;
    constructor(_selector: Type | string, {descendants, first, read}?: {
        descendants?: boolean;
        first?: boolean;
        read?: any;
    });
    isViewQuery: boolean;
    selector: any;
    isVarBindingQuery: boolean;
    varBindings: string[];
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
    static resolve(providers: Array<Type | Provider | {
        [k: string]: any;
    } | any[]>): ResolvedReflectiveProvider[];
    static resolveAndCreate(providers: Array<Type | Provider | {
        [k: string]: any;
    } | any[]>, parent?: Injector): ReflectiveInjector;
    static fromResolvedProviders(providers: ResolvedReflectiveProvider[], parent?: Injector): ReflectiveInjector;
    static fromResolvedBindings(providers: ResolvedReflectiveProvider[]): ReflectiveInjector;
    parent: Injector;
    resolveAndCreateChild(providers: Array<Type | Provider | {
        [k: string]: any;
    } | any[]>): ReflectiveInjector;
    createChildFromResolved(providers: ResolvedReflectiveProvider[]): ReflectiveInjector;
    resolveAndInstantiate(provider: Type | Provider): any;
    instantiateResolved(provider: ResolvedReflectiveProvider): any;
    abstract get(token: any, notFoundValue?: any): any;
}

export declare class ReflectiveKey {
    token: Object;
    id: number;
    constructor(token: Object, id: number);
    displayName: string;
    static get(token: Object): ReflectiveKey;
    static numberOfKeys: number;
}

export declare class RenderComponentType {
    id: string;
    templateUrl: string;
    slotCount: number;
    encapsulation: ViewEncapsulation;
    styles: Array<string | any[]>;
    constructor(id: string, templateUrl: string, slotCount: number, encapsulation: ViewEncapsulation, styles: Array<string | any[]>);
}

export declare abstract class Renderer {
    abstract selectRootElement(selectorOrNode: string | any, debugInfo?: RenderDebugInfo): any;
    abstract createElement(parentElement: any, name: string, debugInfo?: RenderDebugInfo): any;
    abstract createViewRoot(hostElement: any): any;
    abstract createTemplateAnchor(parentElement: any, debugInfo?: RenderDebugInfo): any;
    abstract createText(parentElement: any, value: string, debugInfo?: RenderDebugInfo): any;
    abstract projectNodes(parentElement: any, nodes: any[]): void;
    abstract attachViewAfter(node: any, viewRootNodes: any[]): void;
    abstract detachView(viewRootNodes: any[]): void;
    abstract destroyView(hostElement: any, viewAllNodes: any[]): void;
    abstract listen(renderElement: any, name: string, callback: Function): Function;
    abstract listenGlobal(target: string, name: string, callback: Function): Function;
    abstract setElementProperty(renderElement: any, propertyName: string, propertyValue: any): void;
    abstract setElementAttribute(renderElement: any, attributeName: string, attributeValue: string): void;
    abstract setBindingDebugInfo(renderElement: any, propertyName: string, propertyValue: string): void;
    abstract setElementClass(renderElement: any, className: string, isAdd: boolean): any;
    abstract setElementStyle(renderElement: any, styleName: string, styleValue: string): any;
    abstract invokeElementMethod(renderElement: any, methodName: string, args?: any[]): any;
    abstract setText(renderNode: any, text: string): any;
    abstract animate(element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[], duration: number, delay: number, easing: string): AnimationPlayer;
}

export interface ResolvedReflectiveBinding extends ResolvedReflectiveProvider {
}

export declare class ResolvedReflectiveFactory {
    factory: Function;
    dependencies: ReflectiveDependency[];
    constructor(
        factory: Function,
        dependencies: ReflectiveDependency[]);
}

export interface ResolvedReflectiveProvider {
    key: ReflectiveKey;
    resolvedFactories: ResolvedReflectiveFactory[];
    multiProvider: boolean;
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
    previousValue: any;
    currentValue: any;
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
    resolveComponent(componentType: string | Type): Promise<ComponentFactory<any>>;
    clearCache(): void;
}

export declare class SystemJsComponentResolver implements ComponentResolver {
    constructor(_resolver: ComponentResolver);
    resolveComponent(componentType: string | Type): Promise<ComponentFactory<any>>;
    clearCache(): void;
}

export declare abstract class TemplateRef<C> {
    elementRef: ElementRef;
    abstract createEmbeddedView(context: C): EmbeddedViewRef<C>;
}

export declare class Testability {
    constructor(_ngZone: NgZone);
    increasePendingRequestCount(): number;
    decreasePendingRequestCount(): number;
    isStable(): boolean;
    whenStable(callback: Function): void;
    getPendingRequestCount(): number;
    findBindings(using: any, provider: string, exactMatch: boolean): any[];
    findProviders(using: any, provider: string, exactMatch: boolean): any[];
}

export declare class TestabilityRegistry {
    constructor();
    registerApplication(token: any, testability: Testability): void;
    getTestability(elem: any): Testability;
    getAllTestabilities(): Testability[];
    getAllRootElements(): any[];
    findTestabilityInTree(elem: Node, findInAncestors?: boolean): Testability;
}

export interface TrackByFn {
    (index: number, item: any): any;
}

export declare function transition(stateChangeExpr: string, steps: AnimationMetadata | AnimationMetadata[]): AnimationStateTransitionMetadata;

export declare function trigger(name: string, animation: AnimationMetadata[]): AnimationEntryMetadata;

export declare var Type: FunctionConstructor;

export interface TypeDecorator {
    <T extends Type>(type: T): T;
    (target: Object, propertyKey?: string | symbol, parameterIndex?: number): void;
    annotations: any[];
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
    parentInjector: Injector;
    abstract clear(): void;
    abstract get(index: number): ViewRef;
    length: number;
    abstract createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number): EmbeddedViewRef<C>;
    abstract createComponent<C>(componentFactory: ComponentFactory<C>, index?: number, injector?: Injector, projectableNodes?: any[][]): ComponentRef<C>;
    abstract insert(viewRef: ViewRef, index?: number): ViewRef;
    abstract indexOf(viewRef: ViewRef): number;
    abstract remove(index?: number): void;
    abstract detach(index?: number): ViewRef;
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
    templateUrl: string;
    template: string;
    styleUrls: string[];
    styles: string[];
    directives: Array<Type | any[]>;
    pipes: Array<Type | any[]>;
    encapsulation: ViewEncapsulation;
    animations: AnimationEntryMetadata[];
    interpolation: [string, string];
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
    constructor(_selector: Type | string, {descendants, first, read}?: {
        descendants?: boolean;
        first?: boolean;
        read?: any;
    });
    isViewQuery: boolean;
    toString(): string;
}

export declare abstract class ViewRef {
    destroyed: boolean;
    abstract onDestroy(callback: Function): any;
}

export declare class WrappedException extends BaseWrappedException {
    constructor(_wrapperMessage: string, _originalException: any, _originalStack?: any, _context?: any);
    wrapperMessage: string;
    wrapperStack: any;
    originalException: any;
    originalStack: any;
    context: any;
    message: string;
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
