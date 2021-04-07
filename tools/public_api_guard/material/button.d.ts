export declare class MatAnchor extends MatButton {
    tabIndex: number;
    constructor(focusMonitor: FocusMonitor, elementRef: ElementRef, animationMode: string);
    _haltDisabledEvents(event: Event): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatAnchor, "a[mat-button], a[mat-raised-button], a[mat-icon-button], a[mat-fab],             a[mat-mini-fab], a[mat-stroked-button], a[mat-flat-button]", ["matButton", "matAnchor"], { "disabled": "disabled"; "disableRipple": "disableRipple"; "color": "color"; "tabIndex": "tabIndex"; }, {}, never, ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatAnchor, [null, null, { optional: true; }]>;
}

export declare class MatButton extends _MatButtonMixinBase implements AfterViewInit, OnDestroy, CanDisable, CanColor, CanDisableRipple, FocusableOption {
    _animationMode: string;
    readonly isIconButton: boolean;
    readonly isRoundButton: boolean;
    ripple: MatRipple;
    constructor(elementRef: ElementRef, _focusMonitor: FocusMonitor, _animationMode: string);
    _getHostElement(): any;
    _hasHostAttributes(...attributes: string[]): boolean;
    _isRippleDisabled(): boolean;
    focus(origin?: FocusOrigin, options?: FocusOptions): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatButton, "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", ["matButton"], { "disabled": "disabled"; "disableRipple": "disableRipple"; "color": "color"; }, {}, never, ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatButton, [null, null, { optional: true; }]>;
}

export declare class MatButtonModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatButtonModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatButtonModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatButtonModule, [typeof i1.MatButton, typeof i1.MatAnchor], [typeof i2.MatRippleModule, typeof i2.MatCommonModule], [typeof i1.MatButton, typeof i1.MatAnchor, typeof i2.MatCommonModule]>;
}
