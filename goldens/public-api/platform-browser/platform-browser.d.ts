export declare class BrowserModule {
    constructor(parentModule: BrowserModule | null);
    static withServerTransition(params: {
        appId: string;
    }): ModuleWithProviders<BrowserModule>;
}

export declare class BrowserTransferStateModule {
}

export declare class By {
    static all(): Predicate<DebugNode>;
    static css(selector: string): Predicate<DebugElement>;
    static directive(type: Type<any>): Predicate<DebugNode>;
}

export declare function disableDebugTools(): void;

export declare abstract class DomSanitizer implements Sanitizer {
    abstract bypassSecurityTrustHtml(value: string): SafeHtml;
    abstract bypassSecurityTrustResourceUrl(value: string): SafeResourceUrl;
    abstract bypassSecurityTrustScript(value: string): SafeScript;
    abstract bypassSecurityTrustStyle(value: string): SafeStyle;
    abstract bypassSecurityTrustUrl(value: string): SafeUrl;
    abstract sanitize(context: SecurityContext, value: SafeValue | string | null): string | null;
}

export declare function enableDebugTools<T>(ref: ComponentRef<T>): ComponentRef<T>;

export declare const EVENT_MANAGER_PLUGINS: InjectionToken<ɵangular_packages_platform_browser_platform_browser_g[]>;

export declare class EventManager {
    constructor(plugins: ɵangular_packages_platform_browser_platform_browser_g[], _zone: NgZone);
    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function;
    addGlobalEventListener(target: string, eventName: string, handler: Function): Function;
    getZone(): NgZone;
}

export declare const HAMMER_GESTURE_CONFIG: InjectionToken<HammerGestureConfig>;

export declare const HAMMER_LOADER: InjectionToken<HammerLoader>;

export declare class HammerGestureConfig {
    events: string[];
    options?: {
        cssProps?: any;
        domEvents?: boolean;
        enable?: boolean | ((manager: any) => boolean);
        preset?: any[];
        touchAction?: string;
        recognizers?: any[];
        inputClass?: any;
        inputTarget?: EventTarget;
    };
    overrides: {
        [key: string]: Object;
    };
    buildHammer(element: HTMLElement): HammerInstance;
}

export declare type HammerLoader = () => Promise<void>;

export declare class HammerModule {
}

export declare function makeStateKey<T = void>(key: string): StateKey<T>;

export declare class Meta {
    constructor(_doc: any);
    addTag(tag: MetaDefinition, forceCreation?: boolean): HTMLMetaElement | null;
    addTags(tags: MetaDefinition[], forceCreation?: boolean): HTMLMetaElement[];
    getTag(attrSelector: string): HTMLMetaElement | null;
    getTags(attrSelector: string): HTMLMetaElement[];
    removeTag(attrSelector: string): void;
    removeTagElement(meta: HTMLMetaElement): void;
    updateTag(tag: MetaDefinition, selector?: string): HTMLMetaElement | null;
}

export declare type MetaDefinition = {
    charset?: string;
    content?: string;
    httpEquiv?: string;
    id?: string;
    itemprop?: string;
    name?: string;
    property?: string;
    scheme?: string;
    url?: string;
} & {
    [prop: string]: string;
};

export declare const platformBrowser: (extraProviders?: StaticProvider[]) => PlatformRef;

export declare interface SafeHtml extends SafeValue {
}

export declare interface SafeResourceUrl extends SafeValue {
}

export declare interface SafeScript extends SafeValue {
}

export declare interface SafeStyle extends SafeValue {
}

export declare interface SafeUrl extends SafeValue {
}

export declare interface SafeValue {
}

export declare type StateKey<T> = string & {
    __not_a_string: never;
};

export declare class Title {
    constructor(_doc: any);
    getTitle(): string;
    setTitle(newTitle: string): void;
}

export declare class TransferState {
    get<T>(key: StateKey<T>, defaultValue: T): T;
    hasKey<T>(key: StateKey<T>): boolean;
    onSerialize<T>(key: StateKey<T>, callback: () => T): void;
    remove<T>(key: StateKey<T>): void;
    set<T>(key: StateKey<T>, value: T): void;
    toJson(): string;
}

export declare const VERSION: Version;
