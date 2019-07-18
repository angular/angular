export interface AbstractType<T> extends Function {
    prototype: T;
}

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

export interface Attribute {
    attributeName?: string;
}

export declare const Attribute: AttributeDecorator;

export interface AttributeDecorator {
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

export interface ClassProvider extends ClassSansProvider {
    multi?: boolean;
    provide: any;
}

export interface ClassSansProvider {
    useClass: Type<any>;
}

/** @deprecated */
export interface CollectionChangeRecord<V> extends IterableChangeRecord<V> {
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

export interface Component extends Directive {
    animations?: any[];
    changeDetection?: ChangeDetectionStrategy;
    encapsulation?: ViewEncapsulation;
    entryComponents?: Array<Type<any> | any[]>;
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

export interface ConstructorProvider extends ConstructorSansProvider {
    multi?: boolean;
    provide: Type<any>;
}

export interface ConstructorSansProvider {
    deps?: any[];
}

export declare type ContentChild = Query;

export interface ContentChildDecorator {
    (selector: Type<any> | Function | string, opts: {
        read?: any;
        static: boolean;
    }): any;
    new (selector: Type<any> | Function | string, opts: {
        read?: any;
        static: boolean;
    }): ContentChild;
}

export declare type ContentChildren = Query;

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

export declare function createPlatform(injector: Injector): PlatformRef;

export declare function createPlatformFactory(parentPlatformFactory: ((extraProviders?: StaticProvider[]) => PlatformRef) | null, name: string, providers?: StaticProvider[]): (extraProviders?: StaticProvider[]) => PlatformRef;

export declare const CUSTOM_ELEMENTS_SCHEMA: SchemaMetadata;

export interface DebugElement extends DebugNode {
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

export interface DebugNode {
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

/** @deprecated */
export declare const defineInjectable: typeof ɵɵdefineInjectable;

export declare function destroyPlatform(): void;

export interface Directive {
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

export declare class ElementRef<T extends any = any> {
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

export declare class EventEmitter<T extends any> extends Subject<T> {
    __isAsync: boolean;
    constructor(isAsync?: boolean);
    emit(value?: T): void;
    subscribe(generatorOrNext?: any, error?: any, complete?: any): Subscription;
}

export interface ExistingProvider extends ExistingSansProvider {
    multi?: boolean;
    provide: any;
}

export interface ExistingSansProvider {
    useExisting: any;
}

export interface FactoryProvider extends FactorySansProvider {
    multi?: boolean;
    provide: any;
}

export interface FactorySansProvider {
    deps?: any[];
    useFactory: Function;
}

export declare function forwardRef(forwardRefFn: ForwardRefFn): Type<any>;

export interface ForwardRefFn {
    (): any;
}

export declare const getDebugNode: (nativeNode: any) => DebugNode | null;

export declare const getModuleFactory: (id: string) => NgModuleFactory<any>;

export declare function getPlatform(): PlatformRef | null;

export interface GetTestability {
    addToWindow(registry: TestabilityRegistry): void;
    findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean): Testability | null;
}

export interface Host {
}

export declare const Host: HostDecorator;

export interface HostBinding {
    hostPropertyName?: string;
}

export declare const HostBinding: HostBindingDecorator;

export interface HostBindingDecorator {
    (hostPropertyName?: string): any;
    new (hostPropertyName?: string): any;
}

export interface HostDecorator {
    (): any;
    new (): Host;
}

export interface HostListener {
    args?: string[];
    eventName?: string;
}

export declare const HostListener: HostListenerDecorator;

export interface HostListenerDecorator {
    (eventName: string, args?: string[]): any;
    new (eventName: string, args?: string[]): any;
}

export declare const inject: typeof ɵɵinject;

export interface Inject {
    token: any;
}

export declare const Inject: InjectDecorator;

export interface Injectable {
    providedIn?: Type<any> | 'root' | null;
}

export declare const Injectable: InjectableDecorator;

export interface InjectableDecorator {
    (): TypeDecorator;
    (options?: {
        providedIn: Type<any> | 'root' | null;
    } & InjectableProvider): TypeDecorator;
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

export declare enum InjectFlags {
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

export interface Input {
    bindingPropertyName?: string;
}

export declare const Input: InputDecorator;

export interface InputDecorator {
    (bindingPropertyName?: string): any;
    new (bindingPropertyName?: string): any;
}

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
    static ngInjectableDef: never;
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

export interface NgModule {
    bootstrap?: Array<Type<any> | any[]>;
    declarations?: Array<Type<any> | any[]>;
    entryComponents?: Array<Type<any> | any[]>;
    exports?: Array<Type<any> | any[]>;
    id?: string;
    imports?: Array<Type<any> | ModuleWithProviders<{}> | any[]>;
    jit?: true;
    providers?: Provider[];
    schemas?: Array<SchemaMetadata | any[]>;
}

export declare const NgModule: NgModuleDecorator;

export interface NgModuleDecorator {
    (obj?: NgModule): TypeDecorator;
    new (obj?: NgModule): NgModule;
}

export declare abstract class NgModuleFactory<T> {
    abstract readonly moduleType: Type<T>;
    abstract create(parentInjector: Injector | null): NgModuleRef<T>;
}

/** @deprecated */
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

export interface Optional {
}

export declare const Optional: OptionalDecorator;

export interface OptionalDecorator {
    (): any;
    new (): Optional;
}

export interface Output {
    bindingPropertyName?: string;
}

export declare const Output: OutputDecorator;

export interface OutputDecorator {
    (bindingPropertyName?: string): any;
    new (bindingPropertyName?: string): any;
}

export declare function ɵɵallocHostVars(count: number): void;

export declare function ɵɵattribute(name: string, value: any, sanitizer?: SanitizerFn | null, namespace?: string): TsickleIssue1009;

export declare function ɵɵattributeInterpolate1(attrName: string, prefix: string, v0: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): TsickleIssue1009;

export declare function ɵɵattributeInterpolate2(attrName: string, prefix: string, v0: any, i0: string, v1: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): TsickleIssue1009;

export declare function ɵɵattributeInterpolate3(attrName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): TsickleIssue1009;

export declare function ɵɵattributeInterpolate4(attrName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): TsickleIssue1009;

export declare function ɵɵattributeInterpolate5(attrName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): TsickleIssue1009;

export declare function ɵɵattributeInterpolate6(attrName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): TsickleIssue1009;

export declare function ɵɵattributeInterpolate7(attrName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): TsickleIssue1009;

export declare function ɵɵattributeInterpolate8(attrName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): TsickleIssue1009;

export declare function ɵɵattributeInterpolateV(attrName: string, values: any[], sanitizer?: SanitizerFn, namespace?: string): TsickleIssue1009;

export interface ɵɵBaseDef<T> {
    contentQueries: ContentQueriesFunction<T> | null;
    /** @deprecated */ readonly declaredInputs: {
        [P in keyof T]: string;
    };
    hostBindings: HostBindingsFunction<T> | null;
    readonly inputs: {
        [P in keyof T]: string;
    };
    readonly outputs: {
        [P in keyof T]: string;
    };
    viewQuery: ViewQueriesFunction<T> | null;
}

export declare function ɵɵclassMap(classes: {
    [className: string]: any;
} | NO_CHANGE | string | null): void;

export declare function ɵɵclassMapInterpolate1(prefix: string, v0: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate2(prefix: string, v0: any, i0: string, v1: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate3(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate4(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate5(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate6(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate7(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate8(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string): void;

export declare function ɵɵclassMapInterpolateV(values: any[]): void;

export declare function ɵɵclassProp(className: string, value: boolean | null): void;

export declare type ɵɵComponentDefWithMeta<T, Selector extends String, ExportAs extends string[], InputMap extends {
    [key: string]: string;
}, OutputMap extends {
    [key: string]: string;
}, QueryFields extends string[]> = ComponentDef<T>;

export declare function ɵɵcomponentHostSyntheticListener(eventName: string, listenerFn: (e?: any) => any, useCapture?: boolean, eventTargetResolver?: GlobalTargetResolver): void;

export declare function ɵɵcontainer(index: number): void;

export declare function ɵɵcontainerRefreshEnd(): void;

export declare function ɵɵcontainerRefreshStart(index: number): void;

export declare function ɵɵcontentQuery<T>(directiveIndex: number, predicate: Type<any> | string[], descend: boolean, read?: any): void;

export declare const ɵɵdefaultStyleSanitizer: StyleSanitizeFn;

export declare function ɵɵdefineBase<T>(baseDefinition: {
    inputs?: {
        [P in keyof T]?: string | [string, string];
    };
    outputs?: {
        [P in keyof T]?: string;
    };
    contentQueries?: ContentQueriesFunction<T> | null;
    viewQuery?: ViewQueriesFunction<T> | null;
    hostBindings?: HostBindingsFunction<T>;
}): ɵɵBaseDef<T>;

export declare function ɵɵdefineComponent<T>(componentDefinition: {
    type: Type<T>;
    selectors: CssSelectorList;
    factory: FactoryFn<T>;
    consts: number;
    vars: number;
    inputs?: {
        [P in keyof T]?: string | [string, string];
    };
    outputs?: {
        [P in keyof T]?: string;
    };
    hostBindings?: HostBindingsFunction<T>;
    contentQueries?: ContentQueriesFunction<T>;
    exportAs?: string[];
    template: ComponentTemplate<T>;
    ngContentSelectors?: string[];
    viewQuery?: ViewQueriesFunction<T> | null;
    features?: ComponentDefFeature[];
    encapsulation?: ViewEncapsulation;
    data?: {
        [kind: string]: any;
    };
    styles?: string[];
    changeDetection?: ChangeDetectionStrategy;
    directives?: DirectiveTypesOrFactory | null;
    pipes?: PipeTypesOrFactory | null;
    schemas?: SchemaMetadata[] | null;
}): never;

export declare const ɵɵdefineDirective: <T>(directiveDefinition: {
    type: Type<T>;
    selectors: (string | SelectorFlags)[][];
    factory: FactoryFn<T>;
    inputs?: { [P in keyof T]?: string | [string, string] | undefined; } | undefined;
    outputs?: { [P in keyof T]?: string | undefined; } | undefined;
    features?: DirectiveDefFeature[] | undefined;
    hostBindings?: HostBindingsFunction<T> | undefined;
    contentQueries?: ContentQueriesFunction<T> | undefined;
    viewQuery?: ViewQueriesFunction<T> | null | undefined;
    exportAs?: string[] | undefined;
}) => never;

export declare function ɵɵdefineInjectable<T>(opts: {
    token: unknown;
    providedIn?: Type<any> | 'root' | 'any' | null;
    factory: () => T;
}): never;

export declare function ɵɵdefineInjector(options: {
    factory: () => any;
    providers?: any[];
    imports?: any[];
}): never;

export declare function ɵɵdefineNgModule<T>(def: {
    type: T;
    bootstrap?: Type<any>[] | (() => Type<any>[]);
    declarations?: Type<any>[] | (() => Type<any>[]);
    imports?: Type<any>[] | (() => Type<any>[]);
    exports?: Type<any>[] | (() => Type<any>[]);
    schemas?: SchemaMetadata[] | null;
    id?: string | null;
}): never;

export declare function ɵɵdefinePipe<T>(pipeDef: {
    name: string;
    type: Type<T>;
    factory: FactoryFn<T>;
    pure?: boolean;
}): never;

export declare type ɵɵDirectiveDefWithMeta<T, Selector extends string, ExportAs extends string[], InputMap extends {
    [key: string]: string;
}, OutputMap extends {
    [key: string]: string;
}, QueryFields extends string[]> = DirectiveDef<T>;

export declare function ɵɵdirectiveInject<T>(token: Type<T> | InjectionToken<T>): T;
export declare function ɵɵdirectiveInject<T>(token: Type<T> | InjectionToken<T>, flags: InjectFlags): T;

export declare function ɵɵdisableBindings(): void;

export declare function ɵɵelement(index: number, name: string, attrs?: TAttributes | null, localRefs?: string[] | null): void;

export declare function ɵɵelementContainer(index: number, attrs?: TAttributes | null, localRefs?: string[] | null): void;

export declare function ɵɵelementContainerEnd(): void;

export declare function ɵɵelementContainerStart(index: number, attrs?: TAttributes | null, localRefs?: string[] | null): void;

export declare function ɵɵelementEnd(): void;

export declare function ɵɵelementHostAttrs(attrs: TAttributes): void;

export declare function ɵɵelementStart(index: number, name: string, attrs?: TAttributes | null, localRefs?: string[] | null): void;

export declare function ɵɵembeddedViewEnd(): void;

export declare function ɵɵembeddedViewStart(viewBlockId: number, consts: number, vars: number): RenderFlags;

export declare function ɵɵenableBindings(): void;

export declare function ɵɵgetCurrentView(): OpaqueViewState;

export declare function ɵɵgetFactoryOf<T>(type: Type<any>): FactoryFn<T> | null;

export declare function ɵɵgetInheritedFactory<T>(type: Type<any>): (type: Type<T>) => T;

export declare function ɵɵhostProperty<T>(propName: string, value: T, sanitizer?: SanitizerFn | null): TsickleIssue1009;

export declare function ɵɵi18n(index: number, message: string, subTemplateIndex?: number): void;

export declare function ɵɵi18nApply(index: number): void;

export declare function ɵɵi18nAttributes(index: number, values: string[]): void;

export declare function ɵɵi18nEnd(): void;

export declare function ɵɵi18nExp<T>(value: T): TsickleIssue1009;

/** @deprecated */
export declare function ɵɵi18nLocalize(input: string, placeholders?: {
    [key: string]: string;
}): string;

export declare function ɵɵi18nPostprocess(message: string, replacements?: {
    [key: string]: (string | string[]);
}): string;

export declare function ɵɵi18nStart(index: number, message: string, subTemplateIndex?: number): void;

export declare function ɵɵInheritDefinitionFeature(definition: DirectiveDef<any> | ComponentDef<any>): void;

export declare function ɵɵinject<T>(token: Type<T> | InjectionToken<T>): T;
export declare function ɵɵinject<T>(token: Type<T> | InjectionToken<T>, flags?: InjectFlags): T | null;

export interface ɵɵInjectableDef<T> {
    factory: (t?: Type<any>) => T;
    providedIn: InjectorType<any> | 'root' | 'any' | null;
    token: unknown;
    value: T | undefined;
}

export declare function ɵɵinjectAttribute(attrNameToInject: string): string | null;

export interface ɵɵInjectorDef<T> {
    factory: () => T;
    imports: (InjectorType<any> | InjectorTypeWithProviders<any>)[];
    providers: (Type<any> | ValueProvider | ExistingProvider | FactoryProvider | ConstructorProvider | StaticClassProvider | ClassProvider | any[])[];
}

export declare function ɵɵinjectPipeChangeDetectorRef(flags?: InjectFlags): ChangeDetectorRef | null;

export declare function ɵɵlistener(eventName: string, listenerFn: (e?: any) => any, useCapture?: boolean, eventTargetResolver?: GlobalTargetResolver): void;

export declare function ɵɵload<T>(index: number): T;

export declare function ɵɵloadContentQuery<T>(): QueryList<T>;

export declare function ɵɵloadViewQuery<T>(): QueryList<T>;

export declare function ɵɵnamespaceHTML(): void;

export declare function ɵɵnamespaceMathML(): void;

export declare function ɵɵnamespaceSVG(): void;

export declare function ɵɵnextContext<T = any>(level?: number): T;

export declare type ɵɵNgModuleDefWithMeta<T, Declarations, Imports, Exports> = NgModuleDef<T>;

export declare function ɵɵNgOnChangesFeature<T>(): DirectiveDefFeature;

export declare function ɵɵpipe(index: number, pipeName: string): any;

export declare function ɵɵpipeBind1(index: number, slotOffset: number, v1: any): any;

export declare function ɵɵpipeBind2(index: number, slotOffset: number, v1: any, v2: any): any;

export declare function ɵɵpipeBind3(index: number, slotOffset: number, v1: any, v2: any, v3: any): any;

export declare function ɵɵpipeBind4(index: number, slotOffset: number, v1: any, v2: any, v3: any, v4: any): any;

export declare function ɵɵpipeBindV(index: number, slotOffset: number, values: [any, ...any[]]): any;

export declare type ɵɵPipeDefWithMeta<T, Name extends string> = PipeDef<T>;

export declare function ɵɵprojection(nodeIndex: number, selectorIndex?: number, attrs?: TAttributes): void;

export declare function ɵɵprojectionDef(projectionSlots?: ProjectionSlots): void;

export declare function ɵɵproperty<T>(propName: string, value: T, sanitizer?: SanitizerFn | null): TsickleIssue1009;

export declare function ɵɵpropertyInterpolate(propName: string, v0: any, sanitizer?: SanitizerFn): TsickleIssue1009;

export declare function ɵɵpropertyInterpolate1(propName: string, prefix: string, v0: any, suffix: string, sanitizer?: SanitizerFn): TsickleIssue1009;

export declare function ɵɵpropertyInterpolate2(propName: string, prefix: string, v0: any, i0: string, v1: any, suffix: string, sanitizer?: SanitizerFn): TsickleIssue1009;

export declare function ɵɵpropertyInterpolate3(propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string, sanitizer?: SanitizerFn): TsickleIssue1009;

export declare function ɵɵpropertyInterpolate4(propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string, sanitizer?: SanitizerFn): TsickleIssue1009;

export declare function ɵɵpropertyInterpolate5(propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string, sanitizer?: SanitizerFn): TsickleIssue1009;

export declare function ɵɵpropertyInterpolate6(propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string, sanitizer?: SanitizerFn): TsickleIssue1009;

export declare function ɵɵpropertyInterpolate7(propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string, sanitizer?: SanitizerFn): TsickleIssue1009;

export declare function ɵɵpropertyInterpolate8(propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string, sanitizer?: SanitizerFn): TsickleIssue1009;

export declare function ɵɵpropertyInterpolateV(propName: string, values: any[], sanitizer?: SanitizerFn): TsickleIssue1009;

export declare function ɵɵProvidersFeature<T>(providers: Provider[], viewProviders?: Provider[]): (definition: DirectiveDef<T>) => void;

export declare function ɵɵpureFunction0<T>(slotOffset: number, pureFn: () => T, thisArg?: any): T;

export declare function ɵɵpureFunction1(slotOffset: number, pureFn: (v: any) => any, exp: any, thisArg?: any): any;

export declare function ɵɵpureFunction2(slotOffset: number, pureFn: (v1: any, v2: any) => any, exp1: any, exp2: any, thisArg?: any): any;

export declare function ɵɵpureFunction3(slotOffset: number, pureFn: (v1: any, v2: any, v3: any) => any, exp1: any, exp2: any, exp3: any, thisArg?: any): any;

export declare function ɵɵpureFunction4(slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any) => any, exp1: any, exp2: any, exp3: any, exp4: any, thisArg?: any): any;

export declare function ɵɵpureFunction5(slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any) => any, exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, thisArg?: any): any;

export declare function ɵɵpureFunction6(slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any) => any, exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, thisArg?: any): any;

export declare function ɵɵpureFunction7(slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any) => any, exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any, thisArg?: any): any;

export declare function ɵɵpureFunction8(slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any, v8: any) => any, exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any, exp8: any, thisArg?: any): any;

export declare function ɵɵpureFunctionV(slotOffset: number, pureFn: (...v: any[]) => any, exps: any[], thisArg?: any): any;

export declare function ɵɵqueryRefresh(queryList: QueryList<any>): boolean;

export declare function ɵɵreference<T>(index: number): T;

export declare function ɵɵresolveBody(element: RElement & {
    ownerDocument: Document;
}): {
    name: string;
    target: HTMLElement;
};

export declare function ɵɵresolveDocument(element: RElement & {
    ownerDocument: Document;
}): {
    name: string;
    target: Document;
};

export declare function ɵɵresolveWindow(element: RElement & {
    ownerDocument: Document;
}): {
    name: string;
    target: Window | null;
};

export declare function ɵɵrestoreView(viewToRestore: OpaqueViewState): void;

export declare function ɵɵsanitizeHtml(unsafeHtml: any): string;

export declare function ɵɵsanitizeResourceUrl(unsafeResourceUrl: any): string;

export declare function ɵɵsanitizeScript(unsafeScript: any): string;

export declare function ɵɵsanitizeStyle(unsafeStyle: any): string;

export declare function ɵɵsanitizeUrl(unsafeUrl: any): string;

export declare function ɵɵsanitizeUrlOrResourceUrl(unsafeUrl: any, tag: string, prop: string): any;

export declare function ɵɵselect(index: number): void;

export declare function ɵɵsetComponentScope(type: ComponentType<any>, directives: Type<any>[], pipes: Type<any>[]): void;

export declare function ɵɵsetNgModuleScope(type: any, scope: {
    declarations?: Type<any>[] | (() => Type<any>[]);
    imports?: Type<any>[] | (() => Type<any>[]);
    exports?: Type<any>[] | (() => Type<any>[]);
}): void;

export declare function ɵɵstaticContentQuery<T>(directiveIndex: number, predicate: Type<any> | string[], descend: boolean, read?: any): void;

export declare function ɵɵstaticViewQuery<T>(predicate: Type<any> | string[], descend: boolean, read?: any): void;

export declare function ɵɵstyleMap(styles: {
    [styleName: string]: any;
} | NO_CHANGE | null): void;

export declare function ɵɵstyleProp(prop: string, value: string | number | String | null, suffix?: string | null): void;

export declare function ɵɵstylePropInterpolate1(prop: string, prefix: string, v0: any, suffix: string, valueSuffix?: string | null): TsickleIssue1009;

export declare function ɵɵstylePropInterpolate2(prop: string, prefix: string, v0: any, i0: string, v1: any, suffix: string, valueSuffix?: string | null): TsickleIssue1009;

export declare function ɵɵstylePropInterpolate3(prop: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string, valueSuffix?: string | null): TsickleIssue1009;

export declare function ɵɵstylePropInterpolate4(prop: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string, valueSuffix?: string | null): TsickleIssue1009;

export declare function ɵɵstylePropInterpolate5(prop: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string, valueSuffix?: string | null): TsickleIssue1009;

export declare function ɵɵstylePropInterpolate6(prop: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string, valueSuffix?: string | null): TsickleIssue1009;

export declare function ɵɵstylePropInterpolate7(prop: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string, valueSuffix?: string | null): TsickleIssue1009;

export declare function ɵɵstylePropInterpolate8(prop: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string, valueSuffix?: string | null): TsickleIssue1009;

export declare function ɵɵstylePropInterpolateV(prop: string, values: any[], valueSuffix?: string | null): TsickleIssue1009;

export declare function ɵɵstyleSanitizer(sanitizer: StyleSanitizeFn | null): void;

export declare function ɵɵstyling(): void;

export declare function ɵɵstylingApply(): void;

export declare function ɵɵtemplate(index: number, templateFn: ComponentTemplate<any> | null, consts: number, vars: number, tagName?: string | null, attrs?: TAttributes | null, localRefs?: string[] | null, localRefExtractor?: LocalRefExtractor): void;

export declare function ɵɵtemplateRefExtractor(tNode: TNode, currentView: LView): ViewEngine_TemplateRef<unknown> | null;

export declare function ɵɵtext(index: number, value?: any): void;

export declare function ɵɵtextBinding<T>(value: T | NO_CHANGE): void;

export declare function ɵɵtextInterpolate(v0: any): TsickleIssue1009;

export declare function ɵɵtextInterpolate1(prefix: string, v0: any, suffix: string): TsickleIssue1009;

export declare function ɵɵtextInterpolate2(prefix: string, v0: any, i0: string, v1: any, suffix: string): TsickleIssue1009;

export declare function ɵɵtextInterpolate3(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): TsickleIssue1009;

export declare function ɵɵtextInterpolate4(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string): TsickleIssue1009;

export declare function ɵɵtextInterpolate5(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string): TsickleIssue1009;

export declare function ɵɵtextInterpolate6(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string): TsickleIssue1009;

export declare function ɵɵtextInterpolate7(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string): TsickleIssue1009;

export declare function ɵɵtextInterpolate8(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string): TsickleIssue1009;

export declare function ɵɵtextInterpolateV(values: any[]): TsickleIssue1009;

export declare function ɵɵupdateSyntheticHostBinding<T>(propName: string, value: T | NO_CHANGE, sanitizer?: SanitizerFn | null): TsickleIssue1009;

export declare function ɵɵviewQuery<T>(predicate: Type<any> | string[], descend: boolean, read?: any): void;

export declare const PACKAGE_ROOT_URL: InjectionToken<string>;

export interface Pipe {
    name: string;
    pure?: boolean;
}

export declare const Pipe: PipeDecorator;

export interface PipeDecorator {
    (obj: Pipe): TypeDecorator;
    new (obj: Pipe): Pipe;
}

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

export interface Query {
    descendants: boolean;
    first: boolean;
    isViewQuery: boolean;
    read: any;
    selector: any;
    static: boolean;
}

export declare abstract class Query {
}

export declare class QueryList<T> {
    readonly changes: Observable<any>;
    readonly dirty = true;
    readonly first: T;
    readonly last: T;
    readonly length: number;
    constructor();
    destroy(): void;
    filter(fn: (item: T, index: number, array: T[]) => boolean): T[];
    find(fn: (item: T, index: number, array: T[]) => boolean): T | undefined;
    forEach(fn: (item: T, index: number, array: T[]) => void): void;
    map<U>(fn: (item: T, index: number, array: T[]) => U): U[];
    notifyOnChanges(): void;
    reduce<U>(fn: (prevValue: U, curValue: T, curIndex: number, array: T[]) => U, init: U): U;
    reset(resultsTree: Array<T | any[]>): void;
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

export interface Self {
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

export interface SkipSelf {
}

export declare const SkipSelf: SkipSelfDecorator;

export interface SkipSelfDecorator {
    (): any;
    new (): SkipSelf;
}

export interface StaticClassProvider extends StaticClassSansProvider {
    multi?: boolean;
    provide: any;
}

export interface StaticClassSansProvider {
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

export interface ValueSansProvider {
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

export interface ViewChildDecorator {
    (selector: Type<any> | Function | string, opts: {
        read?: any;
        static: boolean;
    }): any;
    new (selector: Type<any> | Function | string, opts: {
        read?: any;
        static: boolean;
    }): ViewChild;
}

export declare type ViewChildren = Query;

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

/** @deprecated */
export declare const wtfCreateScope: (signature: string, flags?: any) => WtfScopeFn;

/** @deprecated */
export declare const wtfEndTimeRange: (range: any) => void;

/** @deprecated */
export declare const wtfLeave: <T>(scope: any, returnValue?: T) => T;

/** @deprecated */
export interface WtfScopeFn {
    (arg0?: any, arg1?: any): any;
}

/** @deprecated */
export declare const wtfStartTimeRange: (rangeType: string, action: string) => any;
