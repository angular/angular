export declare class MatAnchor extends MatButton {
    tabIndex: number;
    constructor(focusMonitor: FocusMonitor, elementRef: ElementRef, animationMode: string);
    _haltDisabledEvents(event: Event): void;
    static ngAcceptInputType_disableRipple: boolean | string;
    static ngAcceptInputType_disabled: boolean | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatAnchor, "a[mat-button], a[mat-raised-button], a[mat-icon-button], a[mat-fab],             a[mat-mini-fab], a[mat-stroked-button], a[mat-flat-button]", ["matButton", "matAnchor"], { 'disabled': "disabled", 'disableRipple': "disableRipple", 'color': "color", 'tabIndex': "tabIndex" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatAnchor>;
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
    static ngAcceptInputType_disableRipple: boolean | string;
    static ngAcceptInputType_disabled: boolean | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatButton, "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", ["matButton"], { 'disabled': "disabled", 'disableRipple': "disableRipple", 'color': "color" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatButton>;
}

export declare class MatButtonModule {
    static ɵinj: i0.ɵɵInjectorDef<MatButtonModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatButtonModule, [typeof i1.MatButton, typeof i1.MatAnchor], [typeof i2.CommonModule, typeof i3.MatRippleModule, typeof i3.MatCommonModule], [typeof i1.MatButton, typeof i1.MatAnchor, typeof i3.MatCommonModule]>;
}
