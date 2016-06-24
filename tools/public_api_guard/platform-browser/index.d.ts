export declare const BROWSER_APP_PROVIDERS: Array<any>;

export declare const BROWSER_PLATFORM_PROVIDERS: Array<any>;

export declare const BROWSER_PROVIDERS: any[];

export declare const BROWSER_SANITIZATION_PROVIDERS: Array<any>;

export declare function browserPlatform(): PlatformRef;

export declare class BrowserPlatformLocation extends PlatformLocation {
    hash: string;
    pathname: string;
    search: string;
    constructor();
    back(): void;
    forward(): void;
    getBaseHrefFromDOM(): string;
    onHashChange(fn: UrlChangeListener): void;
    onPopState(fn: UrlChangeListener): void;
    pushState(state: any, title: string, url: string): void;
    replaceState(state: any, title: string, url: string): void;
}

export declare class By {
    static all(): Predicate<DebugElement>;
    static css(selector: string): Predicate<DebugElement>;
    static directive(type: Type): Predicate<DebugElement>;
}

export declare abstract class ClientMessageBroker {
    abstract runOnService(args: UiArguments, returnType: Type): Promise<any>;
}

export declare abstract class ClientMessageBrokerFactory {
    abstract createMessageBroker(channel: string, runInZone?: boolean): ClientMessageBroker;
}

export declare function disableDebugTools(): void;

export declare const DOCUMENT: OpaqueToken;

export declare class DomEventsPlugin extends EventManagerPlugin {
    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function;
    addGlobalEventListener(target: string, eventName: string, handler: Function): Function;
    supports(eventName: string): boolean;
}

export declare abstract class DomSanitizationService implements SanitizationService {
    abstract bypassSecurityTrustHtml(value: string): SafeHtml;
    abstract bypassSecurityTrustResourceUrl(value: string): SafeResourceUrl;
    abstract bypassSecurityTrustScript(value: string): SafeScript;
    abstract bypassSecurityTrustStyle(value: string): SafeStyle;
    abstract bypassSecurityTrustUrl(value: string): SafeUrl;
    abstract sanitize(context: SecurityContext, value: any): string;
}

export declare const ELEMENT_PROBE_PROVIDERS: any[];

export declare function enableDebugTools<T>(ref: ComponentRef<T>): ComponentRef<T>;

export declare const EVENT_MANAGER_PLUGINS: OpaqueToken;

export declare class EventManager {
    constructor(plugins: EventManagerPlugin[], _zone: NgZone);
    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function;
    addGlobalEventListener(target: string, eventName: string, handler: Function): Function;
    getZone(): NgZone;
}

export declare class FnArg {
    type: Type;
    value: any;
    constructor(value: any, type: Type);
}

export declare const HAMMER_GESTURE_CONFIG: OpaqueToken;

export declare class HammerGestureConfig {
    events: string[];
    overrides: {
        [key: string]: Object;
    };
    buildHammer(element: HTMLElement): HammerInstance;
}

export declare class KeyEventsPlugin extends EventManagerPlugin {
    constructor();
    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function;
    supports(eventName: string): boolean;
    static eventCallback(element: HTMLElement, fullKey: any, handler: Function, zone: NgZone): Function;
    static getEventFullKey(event: KeyboardEvent): string;
    static parseEventName(eventName: string): {
        [key: string]: string;
    };
}

export declare abstract class MessageBus implements MessageBusSource, MessageBusSink {
    abstract attachToZone(zone: NgZone): void;
    abstract from(channel: string): EventEmitter<any>;
    abstract initChannel(channel: string, runInZone?: boolean): void;
    abstract to(channel: string): EventEmitter<any>;
}

export interface MessageBusSink {
    attachToZone(zone: NgZone): void;
    initChannel(channel: string, runInZone: boolean): void;
    to(channel: string): EventEmitter<any>;
}

export interface MessageBusSource {
    attachToZone(zone: NgZone): void;
    from(channel: string): EventEmitter<any>;
    initChannel(channel: string, runInZone: boolean): void;
}

export declare const PRIMITIVE: Type;

export declare class ReceivedMessage {
    args: any[];
    id: string;
    method: string;
    type: string;
    constructor(data: {
        [key: string]: any;
    });
}

export interface SafeHtml extends SafeValue {
}

export interface SafeResourceUrl extends SafeValue {
}

export interface SafeScript extends SafeValue {
}

export interface SafeStyle extends SafeValue {
}

export interface SafeUrl extends SafeValue {
}

export declare var SecurityContext: typeof t.SecurityContext;

export declare abstract class ServiceMessageBroker {
    abstract registerMethod(methodName: string, signature: Type[], method: Function, returnType?: Type): void;
}

export declare abstract class ServiceMessageBrokerFactory {
    abstract createMessageBroker(channel: string, runInZone?: boolean): ServiceMessageBroker;
}

export declare class Title {
    getTitle(): string;
    setTitle(newTitle: string): void;
}

export declare class UiArguments {
    args: FnArg[];
    method: string;
    constructor(method: string, args?: FnArg[]);
}

export declare class WebWorkerInstance {
    bus: MessageBus;
    worker: Worker;
}

export declare const WORKER_APP_APPLICATION_PROVIDERS: Array<any>;

export declare const WORKER_APP_LOCATION_PROVIDERS: ({
    provide: typeof PlatformLocation;
    useClass: typeof WebWorkerPlatformLocation;
} | {
    provide: any;
    useFactory: (platformLocation: WebWorkerPlatformLocation, zone: NgZone) => () => Promise<boolean>;
    multi: boolean;
    deps: (typeof PlatformLocation | typeof NgZone)[];
})[];

export declare const WORKER_APP_PLATFORM_PROVIDERS: Array<any>;

export declare const WORKER_SCRIPT: OpaqueToken;

export declare const WORKER_UI_APPLICATION_PROVIDERS: Array<any>;

export declare const WORKER_UI_LOCATION_PROVIDERS: (typeof MessageBasedPlatformLocation | typeof BrowserPlatformLocation | {
    provide: any;
    useFactory: (injector: Injector) => () => void;
    multi: boolean;
    deps: typeof Injector[];
})[];

export declare const WORKER_UI_PLATFORM_PROVIDERS: Array<any>;

export declare const WORKER_UI_STARTABLE_MESSAGING_SERVICE: OpaqueToken;

export declare function workerAppPlatform(): PlatformRef;

export declare function workerUiPlatform(): PlatformRef;
