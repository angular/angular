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

export declare class MatTooltip implements OnDestroy {
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
    constructor(_overlay: Overlay, _elementRef: ElementRef<HTMLElement>, _scrollDispatcher: ScrollDispatcher, _viewContainerRef: ViewContainerRef, _ngZone: NgZone, platform: Platform, _ariaDescriber: AriaDescriber, _focusMonitor: FocusMonitor, scrollStrategy: any, _dir: Directionality, _defaultOptions: MatTooltipDefaultOptions, hammerLoader?: HammerLoader);
    _getOrigin(): {
        main: OriginConnectionPosition;
        fallback: OriginConnectionPosition;
    };
    _getOverlayPosition(): {
        main: OverlayConnectionPosition;
        fallback: OverlayConnectionPosition;
    };
    _handleKeydown(e: KeyboardEvent): void;
    _handleTouchend(): void;
    _isTooltipVisible(): boolean;
    hide(delay?: number): void;
    ngOnDestroy(): void;
    show(delay?: number): void;
    toggle(): void;
}

export declare const matTooltipAnimations: {
    readonly tooltipState: AnimationTriggerMetadata;
};

export interface MatTooltipDefaultOptions {
    hideDelay: number;
    position?: TooltipPosition;
    showDelay: number;
    touchendHideDelay: number;
}

export declare class MatTooltipModule {
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
}

export declare type TooltipPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';

export declare type TooltipVisibility = 'initial' | 'visible' | 'hidden';
