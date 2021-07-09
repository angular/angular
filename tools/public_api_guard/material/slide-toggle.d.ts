export declare class _MatSlideToggleRequiredValidatorModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<_MatSlideToggleRequiredValidatorModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<_MatSlideToggleRequiredValidatorModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<_MatSlideToggleRequiredValidatorModule, [typeof i1.MatSlideToggleRequiredValidator], never, [typeof i1.MatSlideToggleRequiredValidator]>;
}

export declare const MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS: InjectionToken<MatSlideToggleDefaultOptions>;

export declare const MAT_SLIDE_TOGGLE_REQUIRED_VALIDATOR: Provider;

export declare const MAT_SLIDE_TOGGLE_VALUE_ACCESSOR: any;

export declare class MatSlideToggle extends _MatSlideToggleBase implements OnDestroy, AfterContentInit, ControlValueAccessor, CanDisable, CanColor, HasTabIndex, CanDisableRipple {
    _inputElement: ElementRef<HTMLInputElement>;
    _noopAnimations: boolean;
    _thumbBarEl: ElementRef;
    _thumbEl: ElementRef;
    ariaDescribedby: string;
    ariaLabel: string | null;
    ariaLabelledby: string | null;
    readonly change: EventEmitter<MatSlideToggleChange>;
    get checked(): boolean;
    set checked(value: boolean);
    defaults: MatSlideToggleDefaultOptions;
    id: string;
    get inputId(): string;
    labelPosition: 'before' | 'after';
    name: string | null;
    get required(): boolean;
    set required(value: boolean);
    readonly toggleChange: EventEmitter<void>;
    constructor(elementRef: ElementRef, _focusMonitor: FocusMonitor, _changeDetectorRef: ChangeDetectorRef, tabIndex: string, defaults: MatSlideToggleDefaultOptions, animationMode?: string);
    _onChangeEvent(event: Event): void;
    _onInputClick(event: Event): void;
    _onLabelTextChange(): void;
    focus(options?: FocusOptions, origin?: FocusOrigin): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    toggle(): void;
    writeValue(value: any): void;
    static ngAcceptInputType_checked: BooleanInput;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_required: BooleanInput;
    static ngAcceptInputType_tabIndex: NumberInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatSlideToggle, "mat-slide-toggle", ["matSlideToggle"], { "disabled": "disabled"; "disableRipple": "disableRipple"; "color": "color"; "tabIndex": "tabIndex"; "name": "name"; "id": "id"; "labelPosition": "labelPosition"; "ariaLabel": "aria-label"; "ariaLabelledby": "aria-labelledby"; "ariaDescribedby": "aria-describedby"; "required": "required"; "checked": "checked"; }, { "change": "change"; "toggleChange": "toggleChange"; }, never, ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSlideToggle, [null, null, null, { attribute: "tabindex"; }, null, { optional: true; }]>;
}

export declare class MatSlideToggleChange {
    checked: boolean;
    source: MatSlideToggle;
    constructor(
    source: MatSlideToggle,
    checked: boolean);
}

export interface MatSlideToggleDefaultOptions {
    color?: ThemePalette;
    disableToggleValue?: boolean;
}

export declare class MatSlideToggleModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSlideToggleModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatSlideToggleModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatSlideToggleModule, [typeof i2.MatSlideToggle], [typeof _MatSlideToggleRequiredValidatorModule, typeof i3.MatRippleModule, typeof i3.MatCommonModule, typeof i4.ObserversModule], [typeof _MatSlideToggleRequiredValidatorModule, typeof i2.MatSlideToggle, typeof i3.MatCommonModule]>;
}

export declare class MatSlideToggleRequiredValidator extends CheckboxRequiredValidator {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatSlideToggleRequiredValidator, "mat-slide-toggle[required][formControlName],             mat-slide-toggle[required][formControl], mat-slide-toggle[required][ngModel]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSlideToggleRequiredValidator, never>;
}
