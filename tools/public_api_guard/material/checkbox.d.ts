export declare class _MatCheckboxRequiredValidatorModule {
    static ɵinj: i0.ɵɵInjectorDef<_MatCheckboxRequiredValidatorModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<_MatCheckboxRequiredValidatorModule, [typeof i1.MatCheckboxRequiredValidator], never, [typeof i1.MatCheckboxRequiredValidator]>;
}

export declare const MAT_CHECKBOX_CLICK_ACTION: InjectionToken<MatCheckboxClickAction>;

export declare const MAT_CHECKBOX_CONTROL_VALUE_ACCESSOR: any;

export declare const MAT_CHECKBOX_DEFAULT_OPTIONS: InjectionToken<MatCheckboxDefaultOptions>;

export declare function MAT_CHECKBOX_DEFAULT_OPTIONS_FACTORY(): MatCheckboxDefaultOptions;

export declare const MAT_CHECKBOX_REQUIRED_VALIDATOR: Provider;

export declare class MatCheckbox extends _MatCheckboxMixinBase implements ControlValueAccessor, AfterViewInit, AfterViewChecked, OnDestroy, CanColor, CanDisable, HasTabIndex, CanDisableRipple, FocusableOption {
    _animationMode?: string | undefined;
    _inputElement: ElementRef<HTMLInputElement>;
    _onTouched: () => any;
    ariaLabel: string;
    ariaLabelledby: string | null;
    readonly change: EventEmitter<MatCheckboxChange>;
    checked: boolean;
    disabled: any;
    id: string;
    indeterminate: boolean;
    readonly indeterminateChange: EventEmitter<boolean>;
    readonly inputId: string;
    labelPosition: 'before' | 'after';
    name: string | null;
    required: boolean;
    ripple: MatRipple;
    value: string;
    constructor(elementRef: ElementRef<HTMLElement>, _changeDetectorRef: ChangeDetectorRef, _focusMonitor: FocusMonitor, _ngZone: NgZone, tabIndex: string,
    _clickAction: MatCheckboxClickAction, _animationMode?: string | undefined, _options?: MatCheckboxDefaultOptions | undefined);
    _getAriaChecked(): 'true' | 'false' | 'mixed';
    _isRippleDisabled(): any;
    _onInputClick(event: Event): void;
    _onInteractionEvent(event: Event): void;
    _onLabelTextChange(): void;
    focus(origin?: FocusOrigin, options?: FocusOptions): void;
    ngAfterViewChecked(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    toggle(): void;
    writeValue(value: any): void;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_indeterminate: BooleanInput;
    static ngAcceptInputType_required: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatCheckbox, "mat-checkbox", ["matCheckbox"], { 'disableRipple': "disableRipple", 'color': "color", 'tabIndex': "tabIndex", 'ariaLabel': "aria-label", 'ariaLabelledby': "aria-labelledby", 'id': "id", 'required': "required", 'labelPosition': "labelPosition", 'name': "name", 'value': "value", 'checked': "checked", 'disabled': "disabled", 'indeterminate': "indeterminate" }, { 'change': "change", 'indeterminateChange': "indeterminateChange" }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatCheckbox>;
}

export declare class MatCheckboxChange {
    checked: boolean;
    source: MatCheckbox;
}

export declare type MatCheckboxClickAction = 'noop' | 'check' | 'check-indeterminate' | undefined;

export interface MatCheckboxDefaultOptions {
    clickAction?: MatCheckboxClickAction;
    color?: ThemePalette;
}

export declare class MatCheckboxModule {
    static ɵinj: i0.ɵɵInjectorDef<MatCheckboxModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatCheckboxModule, [typeof i2.MatCheckbox], [typeof i3.CommonModule, typeof i4.MatRippleModule, typeof i4.MatCommonModule, typeof i5.ObserversModule, typeof _MatCheckboxRequiredValidatorModule], [typeof i2.MatCheckbox, typeof i4.MatCommonModule, typeof _MatCheckboxRequiredValidatorModule]>;
}

export declare class MatCheckboxRequiredValidator extends CheckboxRequiredValidator {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatCheckboxRequiredValidator, "mat-checkbox[required][formControlName],             mat-checkbox[required][formControl], mat-checkbox[required][ngModel]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatCheckboxRequiredValidator>;
}

export declare enum TransitionCheckState {
    Init = 0,
    Checked = 1,
    Unchecked = 2,
    Indeterminate = 3
}
