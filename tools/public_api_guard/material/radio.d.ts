export declare const MAT_RADIO_DEFAULT_OPTIONS: InjectionToken<MatRadioDefaultOptions>;

export declare function MAT_RADIO_DEFAULT_OPTIONS_FACTORY(): MatRadioDefaultOptions;

export declare const MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR: any;

export declare class MatRadioButton extends _MatRadioButtonMixinBase implements OnInit, AfterViewInit, OnDestroy, CanDisableRipple, HasTabIndex {
    _animationMode?: string | undefined;
    _inputElement: ElementRef<HTMLInputElement>;
    ariaDescribedby: string;
    ariaLabel: string;
    ariaLabelledby: string;
    readonly change: EventEmitter<MatRadioChange>;
    checked: boolean;
    color: ThemePalette;
    disabled: boolean;
    id: string;
    readonly inputId: string;
    labelPosition: 'before' | 'after';
    name: string;
    radioGroup: MatRadioGroup;
    required: boolean;
    value: any;
    constructor(radioGroup: MatRadioGroup, elementRef: ElementRef, _changeDetector: ChangeDetectorRef, _focusMonitor: FocusMonitor, _radioDispatcher: UniqueSelectionDispatcher, _animationMode?: string | undefined, _providerOverride?: MatRadioDefaultOptions | undefined);
    _isRippleDisabled(): boolean;
    _markForCheck(): void;
    _onInputChange(event: Event): void;
    _onInputClick(event: Event): void;
    focus(options?: FocusOptions): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ngAcceptInputType_checked: boolean | string | null | undefined;
    static ngAcceptInputType_disableRipple: boolean | string | null | undefined;
    static ngAcceptInputType_disabled: boolean | string | null | undefined;
    static ngAcceptInputType_required: boolean | string | null | undefined;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatRadioButton, "mat-radio-button", ["matRadioButton"], { 'disableRipple': "disableRipple", 'tabIndex': "tabIndex", 'id': "id", 'name': "name", 'ariaLabel': "aria-label", 'ariaLabelledby': "aria-labelledby", 'ariaDescribedby': "aria-describedby", 'checked': "checked", 'value': "value", 'labelPosition': "labelPosition", 'disabled': "disabled", 'required': "required", 'color': "color" }, { 'change': "change" }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatRadioButton>;
}

export declare class MatRadioChange {
    source: MatRadioButton;
    value: any;
    constructor(
    source: MatRadioButton,
    value: any);
}

export interface MatRadioDefaultOptions {
    color: ThemePalette;
}

export declare class MatRadioGroup implements AfterContentInit, ControlValueAccessor {
    _controlValueAccessorChangeFn: (value: any) => void;
    _radios: QueryList<MatRadioButton>;
    readonly change: EventEmitter<MatRadioChange>;
    color: ThemePalette;
    disabled: boolean;
    labelPosition: 'before' | 'after';
    name: string;
    onTouched: () => any;
    required: boolean;
    selected: MatRadioButton | null;
    value: any;
    constructor(_changeDetector: ChangeDetectorRef);
    _checkSelectedRadioButton(): void;
    _emitChangeEvent(): void;
    _markRadiosForCheck(): void;
    _touch(): void;
    ngAfterContentInit(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
    static ngAcceptInputType_disabled: boolean | string | null | undefined;
    static ngAcceptInputType_required: boolean | string | null | undefined;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatRadioGroup, "mat-radio-group", ["matRadioGroup"], { 'color': "color", 'name': "name", 'labelPosition': "labelPosition", 'value': "value", 'selected': "selected", 'disabled': "disabled", 'required': "required" }, { 'change': "change" }, ["_radios"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatRadioGroup>;
}

export declare class MatRadioModule {
    static ɵinj: i0.ɵɵInjectorDef<MatRadioModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatRadioModule, [typeof i1.MatRadioGroup, typeof i1.MatRadioButton], [typeof i2.CommonModule, typeof i3.MatRippleModule, typeof i3.MatCommonModule], [typeof i1.MatRadioGroup, typeof i1.MatRadioButton, typeof i3.MatCommonModule]>;
}
