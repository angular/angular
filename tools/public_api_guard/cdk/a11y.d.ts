export declare class A11yModule {
    constructor(highContrastModeDetector: HighContrastModeDetector);
    static ɵinj: i0.ɵɵInjectorDef<A11yModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<A11yModule, [typeof i1.CdkAriaLive, typeof i2.CdkTrapFocus, typeof i3.CdkMonitorFocus], [typeof i4.CommonModule, typeof i5.PlatformModule, typeof i6.ObserversModule], [typeof i1.CdkAriaLive, typeof i2.CdkTrapFocus, typeof i3.CdkMonitorFocus]>;
}

export declare class ActiveDescendantKeyManager<T> extends ListKeyManager<Highlightable & T> {
    setActiveItem(index: number): void;
    setActiveItem(item: T): void;
}

export declare class AriaDescriber implements OnDestroy {
    constructor(_document: any);
    describe(hostElement: Element, message: string | HTMLElement): void;
    ngOnDestroy(): void;
    removeDescription(hostElement: Element, message: string | HTMLElement): void;
    static ɵfac: i0.ɵɵFactoryDef<AriaDescriber>;
    static ɵprov: i0.ɵɵInjectableDef<AriaDescriber>;
}

export declare type AriaLivePoliteness = 'off' | 'polite' | 'assertive';

export declare const CDK_DESCRIBEDBY_HOST_ATTRIBUTE = "cdk-describedby-host";

export declare const CDK_DESCRIBEDBY_ID_PREFIX = "cdk-describedby-message";

export declare class CdkAriaLive implements OnDestroy {
    politeness: AriaLivePoliteness;
    constructor(_elementRef: ElementRef, _liveAnnouncer: LiveAnnouncer, _contentObserver: ContentObserver, _ngZone: NgZone);
    ngOnDestroy(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkAriaLive, "[cdkAriaLive]", ["cdkAriaLive"], { "politeness": "cdkAriaLive"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkAriaLive>;
}

export declare class CdkMonitorFocus implements OnDestroy {
    cdkFocusChange: EventEmitter<FocusOrigin>;
    constructor(_elementRef: ElementRef<HTMLElement>, _focusMonitor: FocusMonitor);
    ngOnDestroy(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkMonitorFocus, "[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]", never, {}, { "cdkFocusChange": "cdkFocusChange"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkMonitorFocus>;
}

export declare class CdkTrapFocus implements OnDestroy, AfterContentInit, DoCheck {
    autoCapture: boolean;
    enabled: boolean;
    focusTrap: FocusTrap;
    constructor(_elementRef: ElementRef<HTMLElement>, _focusTrapFactory: FocusTrapFactory, _document: any);
    ngAfterContentInit(): void;
    ngDoCheck(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_autoCapture: BooleanInput;
    static ngAcceptInputType_enabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkTrapFocus, "[cdkTrapFocus]", ["cdkTrapFocus"], { "enabled": "cdkTrapFocus"; "autoCapture": "cdkTrapFocusAutoCapture"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkTrapFocus>;
}

export interface FocusableOption extends ListKeyManagerOption {
    focus(origin?: FocusOrigin): void;
}

export declare class FocusKeyManager<T> extends ListKeyManager<FocusableOption & T> {
    setActiveItem(index: number): void;
    setActiveItem(item: T): void;
    setFocusOrigin(origin: FocusOrigin): this;
}

export declare class FocusMonitor implements OnDestroy {
    constructor(_ngZone: NgZone, _platform: Platform);
    _onBlur(event: FocusEvent, element: HTMLElement): void;
    focusVia(element: HTMLElement, origin: FocusOrigin, options?: FocusOptions): void;
    focusVia(element: ElementRef<HTMLElement>, origin: FocusOrigin, options?: FocusOptions): void;
    monitor(element: HTMLElement, checkChildren?: boolean): Observable<FocusOrigin>;
    monitor(element: ElementRef<HTMLElement>, checkChildren?: boolean): Observable<FocusOrigin>;
    ngOnDestroy(): void;
    stopMonitoring(element: HTMLElement): void;
    stopMonitoring(element: ElementRef<HTMLElement>): void;
    static ɵfac: i0.ɵɵFactoryDef<FocusMonitor>;
    static ɵprov: i0.ɵɵInjectableDef<FocusMonitor>;
}

export interface FocusOptions {
    preventScroll?: boolean;
}

export declare type FocusOrigin = 'touch' | 'mouse' | 'keyboard' | 'program' | null;

export declare class FocusTrap {
    enabled: boolean;
    protected endAnchorListener: () => boolean;
    protected startAnchorListener: () => boolean;
    constructor(_element: HTMLElement, _checker: InteractivityChecker, _ngZone: NgZone, _document: Document, deferAnchors?: boolean);
    attachAnchors(): boolean;
    destroy(): void;
    focusFirstTabbableElement(): boolean;
    focusFirstTabbableElementWhenReady(): Promise<boolean>;
    focusInitialElement(): boolean;
    focusInitialElementWhenReady(): Promise<boolean>;
    focusLastTabbableElement(): boolean;
    focusLastTabbableElementWhenReady(): Promise<boolean>;
    hasAttached(): boolean;
}

export declare class FocusTrapFactory {
    constructor(_checker: InteractivityChecker, _ngZone: NgZone, _document: any);
    create(element: HTMLElement, deferCaptureElements?: boolean): FocusTrap;
    static ɵfac: i0.ɵɵFactoryDef<FocusTrapFactory>;
    static ɵprov: i0.ɵɵInjectableDef<FocusTrapFactory>;
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
    static ɵfac: i0.ɵɵFactoryDef<HighContrastModeDetector>;
    static ɵprov: i0.ɵɵInjectableDef<HighContrastModeDetector>;
}

export interface Highlightable extends ListKeyManagerOption {
    setActiveStyles(): void;
    setInactiveStyles(): void;
}

export declare class InteractivityChecker {
    constructor(_platform: Platform);
    isDisabled(element: HTMLElement): boolean;
    isFocusable(element: HTMLElement): boolean;
    isTabbable(element: HTMLElement): boolean;
    isVisible(element: HTMLElement): boolean;
    static ɵfac: i0.ɵɵFactoryDef<InteractivityChecker>;
    static ɵprov: i0.ɵɵInjectableDef<InteractivityChecker>;
}

export declare function isFakeMousedownFromScreenReader(event: MouseEvent): boolean;

export declare class ListKeyManager<T extends ListKeyManagerOption> {
    readonly activeItem: T | null;
    readonly activeItemIndex: number | null;
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
    static ɵfac: i0.ɵɵFactoryDef<LiveAnnouncer>;
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
