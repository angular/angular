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
    get viewCount(): number;
    attachView(viewRef: ViewRef): void;
    bootstrap<C>(componentOrFactory: ComponentFactory<C> | Type<C>, rootSelectorOrNode?: string | any): ComponentRef<C>;
    detachView(viewRef: ViewRef): void;
    tick(): void;
}

export declare function asNativeElements(debugEls: DebugElement[]): any;

export declare function assertPlatform(requiredToken: any): PlatformRef;

export declare interface Attribute {
    attributeName?: string;
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

/** @deprecated */
export declare interface CollectionChangeRecord<V> extends IterableChangeRecord<V> {
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
    (selector: Type<any> | Function | string, opts?: {
        read?: any;
        static?: boolean;
    }): any;
    new (selector: Type<any> | Function | string, opts?: {
        read?: any;
        static?: boolean;
    }): ContentChild;
}

export declare type ContentChildren = Query;

export declare interface ContentChildrenDecorator {
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

export declare class ElementRef<T extends any = any> {
    nativeElement: T;
    constructor(nativeElement: T);
}

export declare abstract class EmbeddedViewRef<C> extends ViewRef {
    abstract get context(): C;
    abstract get rootNodes(): any[];
}

export declare function enableProdMode(): void;

export declare class ErrorHandler {
    handleError(error: any): void;
}

export declare class EventEmitter<T extends any> extends Subject<T> {
    constructor(isAsync?: boolean);
    emit(value?: T): void;
    subscribe(generatorOrNext?: any, error?: any, complete?: any): Subscription;
}

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
    ɵprov: never;
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
    readonly ɵprov: never | undefined;
    constructor(_desc: string, options?: {
        providedIn?: Type<any> | 'root' | 'platform' | 'any' | null;
        factory: () => T;
    });
    toString(): string;
}

export declare abstract class Injector {
    abstract get<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>, notFoundValue?: T, flags?: InjectFlags): T;
    /** @deprecated */ abstract get(token: any, notFoundValue?: any): any;
    static NULL: Injector;
    static THROW_IF_NOT_FOUND: {};
    static ɵprov: never;
    /** @deprecated */ static create(providers: StaticProvider[], parent?: Injector): Injector;
    static create(options: {
        providers: StaticProvider[];
        parent?: Injector;
        name?: string;
    }): Injector;
}

export declare const INJECTOR: InjectionToken<Injector>;

export declare interface InjectorType<T> extends Type<T> {
    ɵinj: never;
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
    static ɵprov: never;
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
    static ɵprov: never;
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

export declare interface ModuleWithProviders<T = any /** TODO(alxhub): remove default when callers pass explicit type param */> {
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
    constructor({ enableLongStackTrace, shouldCoalesceEventChangeDetection }: {
        enableLongStackTrace?: boolean | undefined;
        shouldCoalesceEventChangeDetection?: boolean | undefined;
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

export declare function ɵɵadvance(delta: number): void;

export declare function ɵɵattribute(name: string, value: any, sanitizer?: SanitizerFn | null, namespace?: string): typeof ɵɵattribute;

export declare function ɵɵattributeInterpolate1(attrName: string, prefix: string, v0: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): typeof ɵɵattributeInterpolate1;

export declare function ɵɵattributeInterpolate2(attrName: string, prefix: string, v0: any, i0: string, v1: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): typeof ɵɵattributeInterpolate2;

export declare function ɵɵattributeInterpolate3(attrName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): typeof ɵɵattributeInterpolate3;

export declare function ɵɵattributeInterpolate4(attrName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): typeof ɵɵattributeInterpolate4;

export declare function ɵɵattributeInterpolate5(attrName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): typeof ɵɵattributeInterpolate5;

export declare function ɵɵattributeInterpolate6(attrName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): typeof ɵɵattributeInterpolate6;

export declare function ɵɵattributeInterpolate7(attrName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): typeof ɵɵattributeInterpolate7;

export declare function ɵɵattributeInterpolate8(attrName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string, sanitizer?: SanitizerFn, namespace?: string): typeof ɵɵattributeInterpolate8;

export declare function ɵɵattributeInterpolateV(attrName: string, values: any[], sanitizer?: SanitizerFn, namespace?: string): typeof ɵɵattributeInterpolateV;

export declare function ɵɵclassMap(classes: {
    [className: string]: boolean | undefined | null;
} | string | undefined | null): void;

export declare function ɵɵclassMapInterpolate1(prefix: string, v0: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate2(prefix: string, v0: any, i0: string, v1: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate3(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate4(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate5(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate6(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate7(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string): void;

export declare function ɵɵclassMapInterpolate8(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string): void;

export declare function ɵɵclassMapInterpolateV(values: any[]): void;

export declare function ɵɵclassProp(className: string, value: boolean | undefined | null): typeof ɵɵclassProp;

export declare type ɵɵComponentDefWithMeta<T, Selector extends String, ExportAs extends string[], InputMap extends {
    [key: string]: string;
}, OutputMap extends {
    [key: string]: string;
}, QueryFields extends string[], NgContentSelectors extends string[]> = ɵComponentDef<T>;

export declare function ɵɵcomponentHostSyntheticListener(eventName: string, listenerFn: (e?: any) => any, useCapture?: boolean, eventTargetResolver?: GlobalTargetResolver): typeof ɵɵcomponentHostSyntheticListener;

export declare function ɵɵcontainer(index: number): void;

export declare function ɵɵcontainerRefreshEnd(): void;

export declare function ɵɵcontainerRefreshStart(index: number): void;

export declare function ɵɵcontentQuery<T>(directiveIndex: number, predicate: Type<any> | string[], descend: boolean, read?: any): void;

export declare function ɵɵCopyDefinitionFeature(definition: ɵDirectiveDef<any> | ɵComponentDef<any>): void;

export declare const ɵɵdefaultStyleSanitizer: StyleSanitizeFn;

export declare function ɵɵdefineComponent<T>(componentDefinition: {
    type: Type<T>;
    selectors?: ɵCssSelectorList;
    decls: number;
    vars: number;
    inputs?: {
        [P in keyof T]?: string | [string, string];
    };
    outputs?: {
        [P in keyof T]?: string;
    };
    hostBindings?: HostBindingsFunction<T>;
    hostVars?: number;
    hostAttrs?: TAttributes;
    contentQueries?: ContentQueriesFunction<T>;
    exportAs?: string[];
    template: ComponentTemplate<T>;
    consts?: TConstants;
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
    selectors?: ɵCssSelectorList | undefined;
    inputs?: { [P in keyof T]?: string | [string, string] | undefined; } | undefined;
    outputs?: { [P_1 in keyof T]?: string | undefined; } | undefined;
    features?: DirectiveDefFeature[] | undefined;
    hostBindings?: HostBindingsFunction<T> | undefined;
    hostVars?: number | undefined;
    hostAttrs?: TAttributes | undefined;
    contentQueries?: ContentQueriesFunction<T> | undefined;
    viewQuery?: ViewQueriesFunction<T> | null | undefined;
    exportAs?: string[] | undefined;
}) => never;

export declare function ɵɵdefineInjectable<T>(opts: {
    token: unknown;
    providedIn?: Type<any> | 'root' | 'platform' | 'any' | null;
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
    pure?: boolean;
}): never;

export declare type ɵɵDirectiveDefWithMeta<T, Selector extends string, ExportAs extends string[], InputMap extends {
    [key: string]: string;
}, OutputMap extends {
    [key: string]: string;
}, QueryFields extends string[]> = ɵDirectiveDef<T>;

export declare function ɵɵdirectiveInject<T>(token: Type<T> | InjectionToken<T>): T;
export declare function ɵɵdirectiveInject<T>(token: Type<T> | InjectionToken<T>, flags: InjectFlags): T;

export declare function ɵɵdisableBindings(): void;

export declare function ɵɵelement(index: number, name: string, attrsIndex?: number | null, localRefsIndex?: number): void;

export declare function ɵɵelementContainer(index: number, attrsIndex?: number | null, localRefsIndex?: number): void;

export declare function ɵɵelementContainerEnd(): void;

export declare function ɵɵelementContainerStart(index: number, attrsIndex?: number | null, localRefsIndex?: number): void;

export declare function ɵɵelementEnd(): void;

export declare function ɵɵelementStart(index: number, name: string, attrsIndex?: number | null, localRefsIndex?: number): void;

export declare function ɵɵembeddedViewEnd(): void;

export declare function ɵɵembeddedViewStart(viewBlockId: number, decls: number, vars: number): ɵRenderFlags;

export declare function ɵɵenableBindings(): void;

export declare type ɵɵFactoryDef<T, CtorDependencies extends CtorDependency[]> = () => T;

export declare function ɵɵgetCurrentView(): OpaqueViewState;

export declare function ɵɵgetFactoryOf<T>(type: Type<any>): FactoryFn<T> | null;

export declare function ɵɵgetInheritedFactory<T>(type: Type<any>): (type: Type<T>) => T;

export declare function ɵɵhostProperty<T>(propName: string, value: T, sanitizer?: SanitizerFn | null): typeof ɵɵhostProperty;

export declare function ɵɵi18n(index: number, message: string, subTemplateIndex?: number): void;

export declare function ɵɵi18nApply(index: number): void;

export declare function ɵɵi18nAttributes(index: number, values: string[]): void;

export declare function ɵɵi18nEnd(): void;

export declare function ɵɵi18nExp<T>(value: T): typeof ɵɵi18nExp;

export declare function ɵɵi18nPostprocess(message: string, replacements?: {
    [key: string]: (string | string[]);
}): string;

export declare function ɵɵi18nStart(index: number, message: string, subTemplateIndex?: number): void;

export declare function ɵɵInheritDefinitionFeature(definition: ɵDirectiveDef<any> | ɵComponentDef<any>): void;

export declare function ɵɵinject<T>(token: Type<T> | InjectionToken<T>): T;
export declare function ɵɵinject<T>(token: Type<T> | InjectionToken<T>, flags?: InjectFlags): T | null;

export declare interface ɵɵInjectableDef<T> {
    factory: (t?: Type<any>) => T;
    providedIn: InjectorType<any> | 'root' | 'platform' | 'any' | null;
    token: unknown;
    value: T | undefined;
}

export declare function ɵɵinjectAttribute(attrNameToInject: string): string | null;

export declare interface ɵɵInjectorDef<T> {
    factory: () => T;
    imports: (InjectorType<any> | InjectorTypeWithProviders<any>)[];
    providers: (Type<any> | ValueProvider | ExistingProvider | FactoryProvider | ConstructorProvider | StaticClassProvider | ClassProvider | any[])[];
}

export declare function ɵɵinjectPipeChangeDetectorRef(flags?: InjectFlags): ChangeDetectorRef | null;

export declare function ɵɵinvalidFactory(): never;

export declare function ɵɵinvalidFactoryDep(index: number): never;

export declare function ɵɵlistener(eventName: string, listenerFn: (e?: any) => any, useCapture?: boolean, eventTargetResolver?: GlobalTargetResolver): typeof ɵɵlistener;

export declare function ɵɵloadQuery<T>(): QueryList<T>;

export declare function ɵɵnamespaceHTML(): void;

export declare function ɵɵnamespaceMathML(): void;

export declare function ɵɵnamespaceSVG(): void;

export declare function ɵɵnextContext<T = any>(level?: number): T;

export declare type ɵɵNgModuleDefWithMeta<T, Declarations, Imports, Exports> = ɵNgModuleDef<T>;

export declare function ɵɵNgOnChangesFeature<T>(definition: ɵDirectiveDef<T>): void;

export declare function ɵɵpipe(index: number, pipeName: string): any;

export declare function ɵɵpipeBind1(index: number, slotOffset: number, v1: any): any;

export declare function ɵɵpipeBind2(index: number, slotOffset: number, v1: any, v2: any): any;

export declare function ɵɵpipeBind3(index: number, slotOffset: number, v1: any, v2: any, v3: any): any;

export declare function ɵɵpipeBind4(index: number, slotOffset: number, v1: any, v2: any, v3: any, v4: any): any;

export declare function ɵɵpipeBindV(index: number, slotOffset: number, values: [any, ...any[]]): any;

export declare type ɵɵPipeDefWithMeta<T, Name extends string> = ɵPipeDef<T>;

export declare function ɵɵprojection(nodeIndex: number, selectorIndex?: number, attrs?: TAttributes): void;

export declare function ɵɵprojectionDef(projectionSlots?: ProjectionSlots): void;

export declare function ɵɵproperty<T>(propName: string, value: T, sanitizer?: SanitizerFn | null): typeof ɵɵproperty;

export declare function ɵɵpropertyInterpolate(propName: string, v0: any, sanitizer?: SanitizerFn): typeof ɵɵpropertyInterpolate;

export declare function ɵɵpropertyInterpolate1(propName: string, prefix: string, v0: any, suffix: string, sanitizer?: SanitizerFn): typeof ɵɵpropertyInterpolate1;

export declare function ɵɵpropertyInterpolate2(propName: string, prefix: string, v0: any, i0: string, v1: any, suffix: string, sanitizer?: SanitizerFn): typeof ɵɵpropertyInterpolate2;

export declare function ɵɵpropertyInterpolate3(propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string, sanitizer?: SanitizerFn): typeof ɵɵpropertyInterpolate3;

export declare function ɵɵpropertyInterpolate4(propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string, sanitizer?: SanitizerFn): typeof ɵɵpropertyInterpolate4;

export declare function ɵɵpropertyInterpolate5(propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string, sanitizer?: SanitizerFn): typeof ɵɵpropertyInterpolate5;

export declare function ɵɵpropertyInterpolate6(propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string, sanitizer?: SanitizerFn): typeof ɵɵpropertyInterpolate6;

export declare function ɵɵpropertyInterpolate7(propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string, sanitizer?: SanitizerFn): typeof ɵɵpropertyInterpolate7;

export declare function ɵɵpropertyInterpolate8(propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string, sanitizer?: SanitizerFn): typeof ɵɵpropertyInterpolate8;

export declare function ɵɵpropertyInterpolateV(propName: string, values: any[], sanitizer?: SanitizerFn): typeof ɵɵpropertyInterpolateV;

export declare function ɵɵProvidersFeature<T>(providers: Provider[], viewProviders?: Provider[]): (definition: ɵDirectiveDef<T>) => void;

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

/** @deprecated */
export declare function ɵɵselect(index: number): void;

export declare function ɵɵsetComponentScope(type: ɵComponentType<any>, directives: Type<any>[], pipes: Type<any>[]): void;

export declare function ɵɵsetNgModuleScope(type: any, scope: {
    declarations?: Type<any>[] | (() => Type<any>[]);
    imports?: Type<any>[] | (() => Type<any>[]);
    exports?: Type<any>[] | (() => Type<any>[]);
}): void;

export declare function ɵɵstaticContentQuery<T>(directiveIndex: number, predicate: Type<any> | string[], descend: boolean, read?: any): void;

export declare function ɵɵstaticViewQuery<T>(predicate: Type<any> | string[], descend: boolean, read?: any): void;

export declare function ɵɵstyleMap(styles: {
    [styleName: string]: any;
} | string | undefined | null): void;

export declare function ɵɵstyleMapInterpolate1(prefix: string, v0: any, suffix: string): void;

export declare function ɵɵstyleMapInterpolate2(prefix: string, v0: any, i0: string, v1: any, suffix: string): void;

export declare function ɵɵstyleMapInterpolate3(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): void;

export declare function ɵɵstyleMapInterpolate4(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string): void;

export declare function ɵɵstyleMapInterpolate5(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string): void;

export declare function ɵɵstyleMapInterpolate6(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string): void;

export declare function ɵɵstyleMapInterpolate7(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string): void;

export declare function ɵɵstyleMapInterpolate8(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string): void;

export declare function ɵɵstyleMapInterpolateV(values: any[]): void;

export declare function ɵɵstyleProp(prop: string, value: string | number | ɵSafeValue | undefined | null, suffix?: string | null): typeof ɵɵstyleProp;

export declare function ɵɵstylePropInterpolate1(prop: string, prefix: string, v0: any, suffix: string, valueSuffix?: string | null): typeof ɵɵstylePropInterpolate1;

export declare function ɵɵstylePropInterpolate2(prop: string, prefix: string, v0: any, i0: string, v1: any, suffix: string, valueSuffix?: string | null): typeof ɵɵstylePropInterpolate2;

export declare function ɵɵstylePropInterpolate3(prop: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string, valueSuffix?: string | null): typeof ɵɵstylePropInterpolate3;

export declare function ɵɵstylePropInterpolate4(prop: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string, valueSuffix?: string | null): typeof ɵɵstylePropInterpolate4;

export declare function ɵɵstylePropInterpolate5(prop: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string, valueSuffix?: string | null): typeof ɵɵstylePropInterpolate5;

export declare function ɵɵstylePropInterpolate6(prop: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string, valueSuffix?: string | null): typeof ɵɵstylePropInterpolate6;

export declare function ɵɵstylePropInterpolate7(prop: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string, valueSuffix?: string | null): typeof ɵɵstylePropInterpolate7;

export declare function ɵɵstylePropInterpolate8(prop: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string, valueSuffix?: string | null): typeof ɵɵstylePropInterpolate8;

export declare function ɵɵstylePropInterpolateV(prop: string, values: any[], valueSuffix?: string | null): typeof ɵɵstylePropInterpolateV;

export declare function ɵɵstyleSanitizer(sanitizer: StyleSanitizeFn | null): void;

export declare function ɵɵtemplate(index: number, templateFn: ComponentTemplate<any> | null, decls: number, vars: number, tagName?: string | null, attrsIndex?: number | null, localRefsIndex?: number | null, localRefExtractor?: LocalRefExtractor): void;

export declare function ɵɵtemplateRefExtractor(tNode: TNode, currentView: ɵangular_packages_core_core_bo): TemplateRef<unknown> | null;

export declare function ɵɵtext(index: number, value?: string): void;

export declare function ɵɵtextInterpolate(v0: any): typeof ɵɵtextInterpolate;

export declare function ɵɵtextInterpolate1(prefix: string, v0: any, suffix: string): typeof ɵɵtextInterpolate1;

export declare function ɵɵtextInterpolate2(prefix: string, v0: any, i0: string, v1: any, suffix: string): typeof ɵɵtextInterpolate2;

export declare function ɵɵtextInterpolate3(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): typeof ɵɵtextInterpolate3;

export declare function ɵɵtextInterpolate4(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string): typeof ɵɵtextInterpolate4;

export declare function ɵɵtextInterpolate5(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string): typeof ɵɵtextInterpolate5;

export declare function ɵɵtextInterpolate6(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string): typeof ɵɵtextInterpolate6;

export declare function ɵɵtextInterpolate7(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string): typeof ɵɵtextInterpolate7;

export declare function ɵɵtextInterpolate8(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string): typeof ɵɵtextInterpolate8;

export declare function ɵɵtextInterpolateV(values: any[]): typeof ɵɵtextInterpolateV;

export declare function ɵɵupdateSyntheticHostBinding<T>(propName: string, value: T | ɵNO_CHANGE, sanitizer?: SanitizerFn | null): typeof ɵɵupdateSyntheticHostBinding;

export declare function ɵɵviewQuery<T>(predicate: Type<any> | string[], descend: boolean, read?: any): void;

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
    static ɵprov: never;
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
    (selector: Type<any> | Function | string, opts?: {
        read?: any;
        static?: boolean;
    }): any;
    new (selector: Type<any> | Function | string, opts?: {
        read?: any;
        static?: boolean;
    }): ViewChild;
}

export declare type ViewChildren = Query;

export declare interface ViewChildrenDecorator {
    (selector: Type<any> | Function | string, opts?: {
        read?: any;
    }): any;
    new (selector: Type<any> | Function | string, opts?: {
        read?: any;
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
    Native = 1,
    None = 2,
    ShadowDom = 3
}

export declare abstract class ViewRef extends ChangeDetectorRef {
    abstract get destroyed(): boolean;
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
