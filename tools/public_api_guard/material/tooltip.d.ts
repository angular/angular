export declare abstract class _MatTooltipBase<T extends _TooltipComponentBase> implements OnDestroy, AfterViewInit {
    protected readonly _cssClassPrefix: string;
    protected _dir: Directionality;
    _overlayRef: OverlayRef | null;
    protected abstract readonly _tooltipComponent: ComponentType<T>;
    _tooltipInstance: T | null;
    protected _viewportMargin: number;
    get disabled(): boolean;
    set disabled(value: boolean);
    hideDelay: number;
    get message(): string;
    set message(value: string);
    get position(): TooltipPosition;
    set position(value: TooltipPosition);
    showDelay: number;
    get tooltipClass(): string | string[] | Set<string> | {
        [key: string]: any;
    };
    set tooltipClass(value: string | string[] | Set<string> | {
        [key: string]: any;
    });
    touchGestures: TooltipTouchGestures;
    constructor(_overlay: Overlay, _elementRef: ElementRef<HTMLElement>, _scrollDispatcher: ScrollDispatcher, _viewContainerRef: ViewContainerRef, _ngZone: NgZone, _platform: Platform, _ariaDescriber: AriaDescriber, _focusMonitor: FocusMonitor, scrollStrategy: any, _dir: Directionality, _defaultOptions: MatTooltipDefaultOptions, _document: any);
    protected _addOffset(position: ConnectedPosition): ConnectedPosition;
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
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    show(delay?: number): void;
    toggle(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_hideDelay: NumberInput;
    static ngAcceptInputType_showDelay: NumberInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<_MatTooltipBase<any>, never, never, { "position": "matTooltipPosition"; "disabled": "matTooltipDisabled"; "showDelay": "matTooltipShowDelay"; "hideDelay": "matTooltipHideDelay"; "touchGestures": "matTooltipTouchGestures"; "message": "matTooltip"; "tooltipClass": "matTooltipClass"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<_MatTooltipBase<any>, never>;
}

export declare abstract class _TooltipComponentBase implements OnDestroy {
    _hideTimeoutId: number | undefined;
    _showTimeoutId: number | undefined;
    _visibility: TooltipVisibility;
    message: string;
    tooltipClass: string | string[] | Set<string> | {
        [key: string]: any;
    };
    constructor(_changeDetectorRef: ChangeDetectorRef);
    _animationDone(event: AnimationEvent): void;
    _animationStart(): void;
    _handleBodyInteraction(): void;
    _markForCheck(): void;
    afterHidden(): Observable<void>;
    hide(delay: number): void;
    isVisible(): boolean;
    ngOnDestroy(): void;
    show(delay: number): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<_TooltipComponentBase, never, never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<_TooltipComponentBase, never>;
}

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

export declare class MatTooltip extends _MatTooltipBase<TooltipComponent> {
    protected readonly _tooltipComponent: typeof TooltipComponent;
    constructor(overlay: Overlay, elementRef: ElementRef<HTMLElement>, scrollDispatcher: ScrollDispatcher, viewContainerRef: ViewContainerRef, ngZone: NgZone, platform: Platform, ariaDescriber: AriaDescriber, focusMonitor: FocusMonitor, scrollStrategy: any, dir: Directionality, defaultOptions: MatTooltipDefaultOptions, _document: any);
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatTooltip, "[matTooltip]", ["matTooltip"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTooltip, [null, null, null, null, null, null, null, null, null, { optional: true; }, { optional: true; }, null]>;
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
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTooltipModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatTooltipModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatTooltipModule, [typeof i1.MatTooltip, typeof i1.TooltipComponent], [typeof i2.A11yModule, typeof i3.CommonModule, typeof i4.OverlayModule, typeof i5.MatCommonModule], [typeof i1.MatTooltip, typeof i1.TooltipComponent, typeof i5.MatCommonModule, typeof i6.CdkScrollableModule]>;
}

export declare const SCROLL_THROTTLE_MS = 20;

export declare const TOOLTIP_PANEL_CLASS = "mat-tooltip-panel";

export declare class TooltipComponent extends _TooltipComponentBase {
    _isHandset: Observable<BreakpointState>;
    constructor(changeDetectorRef: ChangeDetectorRef, _breakpointObserver: BreakpointObserver);
    static ɵcmp: i0.ɵɵComponentDeclaration<TooltipComponent, "mat-tooltip-component", never, {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TooltipComponent, never>;
}

export declare type TooltipPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';

export declare type TooltipTouchGestures = 'auto' | 'on' | 'off';

export declare type TooltipVisibility = 'initial' | 'visible' | 'hidden';
