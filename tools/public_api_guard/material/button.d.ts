export declare class MatAnchor extends MatButton {
    tabIndex: number;
    constructor(focusMonitor: FocusMonitor, elementRef: ElementRef, animationMode: string);
    _haltDisabledEvents(event: Event): void;
}

export declare class MatButton extends _MatButtonMixinBase implements OnDestroy, CanDisable, CanColor, CanDisableRipple, FocusableOption {
    _animationMode: string;
    readonly isIconButton: boolean;
    readonly isRoundButton: boolean;
    ripple: MatRipple;
    constructor(elementRef: ElementRef, _focusMonitor: FocusMonitor, _animationMode: string);
    _getHostElement(): any;
    _hasHostAttributes(...attributes: string[]): boolean;
    _isRippleDisabled(): boolean;
    focus(origin?: FocusOrigin, options?: FocusOptions): void;
    ngOnDestroy(): void;
}

export declare class MatButtonModule {
}
