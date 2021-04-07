export declare class A11yModule {
    constructor(highContrastModeDetector: HighContrastModeDetector);
    static ɵfac: i0.ɵɵFactoryDeclaration<A11yModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<A11yModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<A11yModule, [typeof i1.CdkAriaLive, typeof i2.CdkTrapFocus, typeof i3.CdkMonitorFocus], [typeof i4.PlatformModule, typeof i5.ObserversModule], [typeof i1.CdkAriaLive, typeof i2.CdkTrapFocus, typeof i3.CdkMonitorFocus]>;
}

export declare class ActiveDescendantKeyManager<T> extends ListKeyManager<Highlightable & T> {
    setActiveItem(index: number): void;
    setActiveItem(item: T): void;
}

export declare class AriaDescriber implements OnDestroy {
    constructor(_document: any);
    describe(hostElement: Element, message: string, role?: string): void;
    describe(hostElement: Element, message: HTMLElement): void;
    ngOnDestroy(): void;
    removeDescription(hostElement: Element, message: string, role?: string): void;
    removeDescription(hostElement: Element, message: HTMLElement): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AriaDescriber, never>;
    static ɵprov: i0.ɵɵInjectableDef<AriaDescriber>;
}

export declare type AriaLivePoliteness = 'off' | 'polite' | 'assertive';

export declare const CDK_DESCRIBEDBY_HOST_ATTRIBUTE = "cdk-describedby-host";

export declare const CDK_DESCRIBEDBY_ID_PREFIX = "cdk-describedby-message";

export declare class CdkAriaLive implements OnDestroy {
    get politeness(): AriaLivePoliteness;
    set politeness(value: AriaLivePoliteness);
    constructor(_elementRef: ElementRef, _liveAnnouncer: LiveAnnouncer, _contentObserver: ContentObserver, _ngZone: NgZone);
    ngOnDestroy(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkAriaLive, "[cdkAriaLive]", ["cdkAriaLive"], { "politeness": "cdkAriaLive"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkAriaLive, never>;
}

export declare class CdkMonitorFocus implements AfterViewInit, OnDestroy {
    cdkFocusChange: EventEmitter<FocusOrigin>;
    constructor(_elementRef: ElementRef<HTMLElement>, _focusMonitor: FocusMonitor);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkMonitorFocus, "[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]", never, {}, { "cdkFocusChange": "cdkFocusChange"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkMonitorFocus, never>;
}

export declare class CdkTrapFocus implements OnDestroy, AfterContentInit, OnChanges, DoCheck {
    get autoCapture(): boolean;
    set autoCapture(value: boolean);
    get enabled(): boolean;
    set enabled(value: boolean);
    focusTrap: FocusTrap;
    constructor(_elementRef: ElementRef<HTMLElement>, _focusTrapFactory: FocusTrapFactory, _document: any);
    ngAfterContentInit(): void;
    ngDoCheck(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_autoCapture: BooleanInput;
    static ngAcceptInputType_enabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkTrapFocus, "[cdkTrapFocus]", ["cdkTrapFocus"], { "enabled": "cdkTrapFocus"; "autoCapture": "cdkTrapFocusAutoCapture"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkTrapFocus, never>;
}

export declare class ConfigurableFocusTrap extends FocusTrap implements ManagedFocusTrap {
    get enabled(): boolean;
    set enabled(value: boolean);
    constructor(_element: HTMLElement, _checker: InteractivityChecker, _ngZone: NgZone, _document: Document, _focusTrapManager: FocusTrapManager, _inertStrategy: FocusTrapInertStrategy, config: ConfigurableFocusTrapConfig);
    _disable(): void;
    _enable(): void;
    destroy(): void;
}

export interface ConfigurableFocusTrapConfig {
    defer: boolean;
}

export declare class ConfigurableFocusTrapFactory {
    constructor(_checker: InteractivityChecker, _ngZone: NgZone, _focusTrapManager: FocusTrapManager, _document: any, _inertStrategy?: FocusTrapInertStrategy);
    create(element: HTMLElement, config?: ConfigurableFocusTrapConfig): ConfigurableFocusTrap;
    create(element: HTMLElement, deferCaptureElements: boolean): ConfigurableFocusTrap;
    static ɵfac: i0.ɵɵFactoryDeclaration<ConfigurableFocusTrapFactory, [null, null, null, null, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDef<ConfigurableFocusTrapFactory>;
}

export declare class EventListenerFocusTrapInertStrategy implements FocusTrapInertStrategy {
    allowFocus(focusTrap: ConfigurableFocusTrap): void;
    preventFocus(focusTrap: ConfigurableFocusTrap): void;
}

export declare const FOCUS_MONITOR_DEFAULT_OPTIONS: InjectionToken<FocusMonitorOptions>;

export declare const FOCUS_TRAP_INERT_STRATEGY: InjectionToken<FocusTrapInertStrategy>;

export interface FocusableOption extends ListKeyManagerOption {
    focus(origin?: FocusOrigin): void;
}

export declare class FocusKeyManager<T> extends ListKeyManager<FocusableOption & T> {
    setActiveItem(index: number): void;
    setActiveItem(item: T): void;
    setFocusOrigin(origin: FocusOrigin): this;
}

export declare class FocusMonitor implements OnDestroy {
    protected _document?: Document;
    constructor(_ngZone: NgZone, _platform: Platform,
    document: any | null, options: FocusMonitorOptions | null);
    _onBlur(event: FocusEvent, element: HTMLElement): void;
    focusVia(element: HTMLElement, origin: FocusOrigin, options?: FocusOptions): void;
    focusVia(element: ElementRef<HTMLElement>, origin: FocusOrigin, options?: FocusOptions): void;
    monitor(element: HTMLElement, checkChildren?: boolean): Observable<FocusOrigin>;
    monitor(element: ElementRef<HTMLElement>, checkChildren?: boolean): Observable<FocusOrigin>;
    ngOnDestroy(): void;
    stopMonitoring(element: HTMLElement): void;
    stopMonitoring(element: ElementRef<HTMLElement>): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FocusMonitor, [null, null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDef<FocusMonitor>;
}

export declare const enum FocusMonitorDetectionMode {
    IMMEDIATE = 0,
    EVENTUAL = 1
}

export interface FocusMonitorOptions {
    detectionMode?: FocusMonitorDetectionMode;
}

export interface FocusOptions {
    preventScroll?: boolean;
}

export declare type FocusOrigin = 'touch' | 'mouse' | 'keyboard' | 'program' | null;

export declare class FocusTrap {
    readonly _document: Document;
    readonly _element: HTMLElement;
    protected _enabled: boolean;
    readonly _ngZone: NgZone;
    get enabled(): boolean;
    set enabled(value: boolean);
    protected endAnchorListener: () => boolean;
    protected startAnchorListener: () => boolean;
    constructor(_element: HTMLElement, _checker: InteractivityChecker, _ngZone: NgZone, _document: Document, deferAnchors?: boolean);
    attachAnchors(): boolean;
    destroy(): void;
    focusFirstTabbableElement(options?: FocusOptions): boolean;
    focusFirstTabbableElementWhenReady(options?: FocusOptions): Promise<boolean>;
    focusInitialElement(options?: FocusOptions): boolean;
    focusInitialElementWhenReady(options?: FocusOptions): Promise<boolean>;
    focusLastTabbableElement(options?: FocusOptions): boolean;
    focusLastTabbableElementWhenReady(options?: FocusOptions): Promise<boolean>;
    hasAttached(): boolean;
    protected toggleAnchors(enabled: boolean): void;
}

export declare class FocusTrapFactory {
    constructor(_checker: InteractivityChecker, _ngZone: NgZone, _document: any);
    create(element: HTMLElement, deferCaptureElements?: boolean): FocusTrap;
    static ɵfac: i0.ɵɵFactoryDeclaration<FocusTrapFactory, never>;
    static ɵprov: i0.ɵɵInjectableDef<FocusTrapFactory>;
}

export interface FocusTrapInertStrategy {
    allowFocus(focusTrap: FocusTrap): void;
    preventFocus(focusTrap: FocusTrap): void;
}

export declare const enum HighContrastMode {
    NONE = 0,
    BLACK_ON_WHITE = 1,
    WHITE_ON_BLACK = 2
}

export declare class HighContrastModeDetector {
    constructor(_platform: Platform, document: any);
    _applyBodyHighContrastModeCssClasses(): void;
    getHighContrastMode(): HighContrastMode;
    static ɵfac: i0.ɵɵFactoryDeclaration<HighContrastModeDetector, never>;
    static ɵprov: i0.ɵɵInjectableDef<HighContrastModeDetector>;
}

export interface Highlightable extends ListKeyManagerOption {
    setActiveStyles(): void;
    setInactiveStyles(): void;
}

export declare class InteractivityChecker {
    constructor(_platform: Platform);
    isDisabled(element: HTMLElement): boolean;
    isFocusable(element: HTMLElement, config?: IsFocusableConfig): boolean;
    isTabbable(element: HTMLElement): boolean;
    isVisible(element: HTMLElement): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<InteractivityChecker, never>;
    static ɵprov: i0.ɵɵInjectableDef<InteractivityChecker>;
}

export declare function isFakeMousedownFromScreenReader(event: MouseEvent): boolean;

export declare function isFakeTouchstartFromScreenReader(event: TouchEvent): boolean;

export declare class IsFocusableConfig {
    ignoreVisibility: boolean;
}

export declare class ListKeyManager<T extends ListKeyManagerOption> {
    get activeItem(): T | null;
    get activeItemIndex(): number | null;
    change: Subject<number>;
    tabOut: Subject<void>;
    constructor(_items: QueryList<T> | T[]);
    isTyping(): boolean;
    onKeydown(event: KeyboardEvent): void;
    setActiveItem(index: number): void;
    setActiveItem(item: T): void;
    setFirstItemActive(): void;
    setLastItemActive(): void;
    setNextItemActive(): void;
    setPreviousItemActive(): void;
    skipPredicate(predicate: (item: T) => boolean): this;
    updateActiveItem(index: number): void;
    updateActiveItem(item: T): void;
    withAllowedModifierKeys(keys: ListKeyManagerModifierKey[]): this;
    withHomeAndEnd(enabled?: boolean): this;
    withHorizontalOrientation(direction: 'ltr' | 'rtl' | null): this;
    withTypeAhead(debounceInterval?: number): this;
    withVerticalOrientation(enabled?: boolean): this;
    withWrap(shouldWrap?: boolean): this;
}

export declare type ListKeyManagerModifierKey = 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey';

export interface ListKeyManagerOption {
    disabled?: boolean;
    getLabel?(): string;
}

export declare const LIVE_ANNOUNCER_DEFAULT_OPTIONS: InjectionToken<LiveAnnouncerDefaultOptions>;

export declare const LIVE_ANNOUNCER_ELEMENT_TOKEN: InjectionToken<HTMLElement | null>;

export declare function LIVE_ANNOUNCER_ELEMENT_TOKEN_FACTORY(): null;

export declare class LiveAnnouncer implements OnDestroy {
    constructor(elementToken: any, _ngZone: NgZone, _document: any, _defaultOptions?: LiveAnnouncerDefaultOptions | undefined);
    announce(message: string): Promise<void>;
    announce(message: string, politeness?: AriaLivePoliteness): Promise<void>;
    announce(message: string, duration?: number): Promise<void>;
    announce(message: string, politeness?: AriaLivePoliteness, duration?: number): Promise<void>;
    clear(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LiveAnnouncer, [{ optional: true; }, null, null, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDef<LiveAnnouncer>;
}

export interface LiveAnnouncerDefaultOptions {
    duration?: number;
    politeness?: AriaLivePoliteness;
}

export declare const MESSAGES_CONTAINER_ID = "cdk-describedby-message-container";

export interface RegisteredMessage {
    messageElement: Element;
    referenceCount: number;
}

export declare const TOUCH_BUFFER_MS = 650;
