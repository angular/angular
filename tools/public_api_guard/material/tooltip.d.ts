export declare function getMatTooltipInvalidPositionError(position: string): Error;

export declare const MAT_TOOLTIP_DEFAULT_OPTIONS: InjectionToken<MatTooltipDefaultOptions>;

export declare function MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY(): MatTooltipDefaultOptions;

export declare const MAT_TOOLTIP_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;

export declare function MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy;

export declare const MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER: {
    provide: InjectionToken<() => ScrollStrategy>;
    deps: (typeof Overlay)[];
    useFactory: typeof MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY;
};

export declare class MatTooltip implements OnDestroy, OnInit {
    _overlayRef: OverlayRef | null;
    _tooltipInstance: TooltipComponent | null;
    disabled: boolean;
    hideDelay: number;
    message: string;
    position: TooltipPosition;
    showDelay: number;
    tooltipClass: string | string[] | Set<string> | {
        [key: string]: any;
    };
    touchGestures: TooltipTouchGestures;
    constructor(_overlay: Overlay, _elementRef: ElementRef<HTMLElement>, _scrollDispatcher: ScrollDispatcher, _viewContainerRef: ViewContainerRef, _ngZone: NgZone, _platform: Platform, _ariaDescriber: AriaDescriber, _focusMonitor: FocusMonitor, scrollStrategy: any, _dir: Directionality, _defaultOptions: MatTooltipDefaultOptions,
    _hammerLoader?: any);
    _getOrigin(): {
        main: OriginConnectionPosition;
        fallback: OriginConnectionPosition;
    };
    _getOverlayPosition(): {
        main: OverlayConnectionPosition;
        fallback: OverlayConnectionPosition;
    };
    _isTooltipVisible(): boolean;
    hide(delay?: number): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    show(delay?: number): void;
    toggle(): void;
    static ngAcceptInputType_disabled: boolean | string | null | undefined;
    static ngAcceptInputType_hideDelay: number | string | null | undefined;
    static ngAcceptInputType_showDelay: number | string | null | undefined;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatTooltip, "[matTooltip]", ["matTooltip"], { 'position': "matTooltipPosition", 'disabled': "matTooltipDisabled", 'showDelay': "matTooltipShowDelay", 'hideDelay': "matTooltipHideDelay", 'touchGestures': "matTooltipTouchGestures", 'message': "matTooltip", 'tooltipClass': "matTooltipClass" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTooltip>;
}

export declare const matTooltipAnimations: {
    readonly tooltipState: AnimationTriggerMetadata;
};

export interface MatTooltipDefaultOptions {
    hideDelay: number;
    position?: TooltipPosition;
    showDelay: number;
    touchGestures?: TooltipTouchGestures;
    touchendHideDelay: number;
}

export declare class MatTooltipModule {
    static ɵinj: i0.ɵɵInjectorDef<MatTooltipModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatTooltipModule, [typeof i1.MatTooltip, typeof i1.TooltipComponent], [typeof i2.A11yModule, typeof i3.CommonModule, typeof i4.OverlayModule, typeof i5.MatCommonModule], [typeof i1.MatTooltip, typeof i1.TooltipComponent, typeof i5.MatCommonModule]>;
}

export declare const SCROLL_THROTTLE_MS = 20;

export declare const TOOLTIP_PANEL_CLASS = "mat-tooltip-panel";

export declare class TooltipComponent implements OnDestroy {
    _hideTimeoutId: number | null;
    _isHandset: Observable<BreakpointState>;
    _showTimeoutId: number | null;
    _visibility: TooltipVisibility;
    message: string;
    tooltipClass: string | string[] | Set<string> | {
        [key: string]: any;
    };
    constructor(_changeDetectorRef: ChangeDetectorRef, _breakpointObserver: BreakpointObserver);
    _animationDone(event: AnimationEvent): void;
    _animationStart(): void;
    _handleBodyInteraction(): void;
    _markForCheck(): void;
    afterHidden(): Observable<void>;
    hide(delay: number): void;
    isVisible(): boolean;
    ngOnDestroy(): void;
    show(delay: number): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<TooltipComponent, "mat-tooltip-component", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<TooltipComponent>;
}

export declare type TooltipPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';

export declare type TooltipTouchGestures = 'auto' | 'on' | 'off';

export declare type TooltipVisibility = 'initial' | 'visible' | 'hidden';
