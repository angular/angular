/** @experimental */
export declare abstract class AnimationDriver {
    abstract animate(element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[], duration: number, delay: number, easing: string): AnimationPlayer;
    static NOOP: AnimationDriver;
}

/** @stable */
export declare class BrowserModule {
    constructor(parentModule: BrowserModule);
}

/** @experimental */
export declare class By {
    static all(): Predicate<DebugElement>;
    static css(selector: string): Predicate<DebugElement>;
    static directive(type: Type<any>): Predicate<DebugElement>;
}

/** @experimental */
export declare function disableDebugTools(): void;

/** @stable */
export declare const DOCUMENT: OpaqueToken;

/** @stable */
export declare abstract class DomSanitizer implements Sanitizer {
    abstract bypassSecurityTrustHtml(value: string): SafeHtml;
    abstract bypassSecurityTrustResourceUrl(value: string): SafeResourceUrl;
    abstract bypassSecurityTrustScript(value: string): SafeScript;
    abstract bypassSecurityTrustStyle(value: string): SafeStyle;
    abstract bypassSecurityTrustUrl(value: string): SafeUrl;
    abstract sanitize(context: SecurityContext, value: any): string;
}

/** @experimental */
export declare function enableDebugTools<T>(ref: ComponentRef<T>): ComponentRef<T>;

/** @stable */
export declare const EVENT_MANAGER_PLUGINS: OpaqueToken;

/** @stable */
export declare class EventManager {
    constructor(plugins: EventManagerPlugin[], _zone: NgZone);
    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function;
    addGlobalEventListener(target: string, eventName: string, handler: Function): Function;
    getZone(): NgZone;
}

/** @experimental */
export declare const HAMMER_GESTURE_CONFIG: OpaqueToken;

/** @experimental */
export declare class HammerGestureConfig {
    events: string[];
    overrides: {
        [key: string]: Object;
    };
    buildHammer(element: HTMLElement): HammerInstance;
}

/** @experimental */
export declare class NgProbeToken {
    constructor(name: string, token: any);
}

/** @stable */
export declare const platformBrowser: (extraProviders?: Provider[]) => PlatformRef;

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

/** @experimental */
export declare class Title {
    getTitle(): string;
    setTitle(newTitle: string): void;
}
