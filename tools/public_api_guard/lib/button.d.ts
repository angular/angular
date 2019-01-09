export declare const _MatButtonMixinBase: CanDisableRippleCtor & CanDisableCtor & CanColorCtor & typeof MatButtonBase;

export declare class MatAnchor extends MatButton {
    tabIndex: number;
    constructor(platform: Platform, focusMonitor: FocusMonitor, elementRef: ElementRef, animationMode?: string);
    _haltDisabledEvents(event: Event): void;
}

export declare class MatButton extends _MatButtonMixinBase implements OnDestroy, CanDisable, CanColor, CanDisableRipple {
    _animationMode?: string | undefined;
    readonly isIconButton: boolean;
    readonly isRoundButton: boolean;
    ripple: MatRipple;
    constructor(elementRef: ElementRef,
    _platform: Platform, _focusMonitor: FocusMonitor, _animationMode?: string | undefined);
    _getHostElement(): any;
    _hasHostAttributes(...attributes: string[]): boolean;
    _isRippleDisabled(): boolean;
    focus(): void;
    ngOnDestroy(): void;
}

export declare class MatButtonBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}

export declare class MatButtonModule {
}
