export declare class _MatSlideToggleRequiredValidatorModule {
    static ɵinj: i0.ɵɵInjectorDef<_MatSlideToggleRequiredValidatorModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<_MatSlideToggleRequiredValidatorModule, [typeof i1.MatSlideToggleRequiredValidator], never, [typeof i1.MatSlideToggleRequiredValidator]>;
}

export declare const MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS: InjectionToken<MatSlideToggleDefaultOptions>;

export declare const MAT_SLIDE_TOGGLE_REQUIRED_VALIDATOR: Provider;

export declare const MAT_SLIDE_TOGGLE_VALUE_ACCESSOR: any;

export declare class MatSlideToggle extends _MatSlideToggleMixinBase implements OnDestroy, AfterContentInit, ControlValueAccessor, CanDisable, CanColor, HasTabIndex, CanDisableRipple {
    _animationMode?: string | undefined;
    _inputElement: ElementRef<HTMLInputElement>;
    _thumbBarEl: ElementRef;
    _thumbEl: ElementRef;
    ariaLabel: string | null;
    ariaLabelledby: string | null;
    readonly change: EventEmitter<MatSlideToggleChange>;
    checked: boolean;
    defaults: MatSlideToggleDefaultOptions;
    readonly dragChange: EventEmitter<void>;
    id: string;
    readonly inputId: string;
    labelPosition: 'before' | 'after';
    name: string | null;
    required: boolean;
    readonly toggleChange: EventEmitter<void>;
    constructor(elementRef: ElementRef, _focusMonitor: FocusMonitor, _changeDetectorRef: ChangeDetectorRef, tabIndex: string,
    _ngZone: NgZone, defaults: MatSlideToggleDefaultOptions, _animationMode?: string | undefined, _dir?: Directionality);
    _onChangeEvent(event: Event): void;
    _onInputClick(event: Event): void;
    _onLabelTextChange(): void;
    focus(options?: FocusOptions): void;
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
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatSlideToggle, "mat-slide-toggle", ["matSlideToggle"], { 'disabled': "disabled", 'disableRipple': "disableRipple", 'color': "color", 'tabIndex': "tabIndex", 'name': "name", 'id': "id", 'labelPosition': "labelPosition", 'ariaLabel': "aria-label", 'ariaLabelledby': "aria-labelledby", 'required': "required", 'checked': "checked" }, { 'change': "change", 'toggleChange': "toggleChange", 'dragChange': "dragChange" }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatSlideToggle>;
}

export declare class MatSlideToggleChange {
    checked: boolean;
    source: MatSlideToggle;
    constructor(
    source: MatSlideToggle,
    checked: boolean);
}

export interface MatSlideToggleDefaultOptions {
    disableDragValue?: boolean;
    disableToggleValue?: boolean;
}

export declare class MatSlideToggleModule {
    static ɵinj: i0.ɵɵInjectorDef<MatSlideToggleModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatSlideToggleModule, [typeof i2.MatSlideToggle], [typeof _MatSlideToggleRequiredValidatorModule, typeof i3.MatRippleModule, typeof i3.MatCommonModule, typeof i4.ObserversModule], [typeof _MatSlideToggleRequiredValidatorModule, typeof i2.MatSlideToggle, typeof i3.MatCommonModule]>;
}

export declare class MatSlideToggleRequiredValidator extends CheckboxRequiredValidator {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatSlideToggleRequiredValidator, "mat-slide-toggle[required][formControlName],             mat-slide-toggle[required][formControl], mat-slide-toggle[required][ngModel]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatSlideToggleRequiredValidator>;
}
