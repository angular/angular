/** @stable */
export declare class BrowserModule {
    constructor(parentModule: BrowserModule);
    /** @experimental */ static withServerTransition(params: {
        appId: string;
    }): ModuleWithProviders;
}

/** @experimental */
export declare class BrowserTransferStateModule {
}

/** @experimental */
export declare class By {
    static all(): Predicate<DebugElement>;
    static css(selector: string): Predicate<DebugElement>;
    static directive(type: Type<any>): Predicate<DebugElement>;
}

/** @experimental */
export declare function disableDebugTools(): void;

/** @deprecated */
export declare const DOCUMENT: InjectionToken<Document>;

/** @stable */
export declare abstract class DomSanitizer implements Sanitizer {
    abstract bypassSecurityTrustHtml(value: string): SafeHtml;
    abstract bypassSecurityTrustResourceUrl(value: string): SafeResourceUrl;
    abstract bypassSecurityTrustScript(value: string): SafeScript;
    abstract bypassSecurityTrustStyle(value: string): SafeStyle;
    abstract bypassSecurityTrustUrl(value: string): SafeUrl;
    abstract sanitize(context: SecurityContext, value: SafeValue | string | null): string | null;
}

/** @experimental */
export declare function enableDebugTools<T>(ref: ComponentRef<T>): ComponentRef<T>;

/** @stable */
export declare const EVENT_MANAGER_PLUGINS: InjectionToken<EventManagerPlugin[]>;

/** @stable */
export declare class EventManager {
    constructor(plugins: EventManagerPlugin[], _zone: NgZone);
    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function;
    addGlobalEventListener(target: string, eventName: string, handler: Function): Function;
    getZone(): NgZone;
}

/** @experimental */
export declare const HAMMER_GESTURE_CONFIG: InjectionToken<HammerGestureConfig>;

/** @experimental */
export declare class HammerGestureConfig {
    events: string[];
    overrides: {
        [key: string]: Object;
    };
    buildHammer(element: HTMLElement): HammerInstance;
}

/** @experimental */
export declare function makeStateKey<T =

/** @experimental */
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

/** @experimental */
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

/** @stable */
export declare const platformBrowser: (extraProviders?: StaticProvider[]) => PlatformRef;

/** @stable */
export interface SafeHtml extends SafeValue {
}

/** @stable */
export interface SafeResourceUrl extends SafeValue {
}

/** @stable */
export interface SafeScript extends SafeValue {
}

/** @stable */
export interface SafeStyle extends SafeValue {
}

/** @stable */
export interface SafeUrl extends SafeValue {
}

/** @stable */
export interface SafeValue {
}

/** @experimental */
export declare type StateKey<T> = string & {
    __not_a_string: never;
};

/** @experimental */
export declare class Title {
    constructor(_doc: any);
    getTitle(): string;
    setTitle(newTitle: string): void;
}

/** @experimental */
export declare class TransferState {
    get<T>(key: StateKey<T>, defaultValue: T): T;
    hasKey<T>(key: StateKey<T>): boolean;
    onSerialize<T>(key: StateKey<T>, callback: () => T): void;
    remove<T>(key: StateKey<T>): void;
    set<T>(key: StateKey<T>, value: T): void;
    toJson(): string;
}

/** @stable */
export declare const VERSION: Version;
