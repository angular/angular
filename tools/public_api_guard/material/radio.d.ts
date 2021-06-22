export declare abstract class _MatRadioButtonBase extends _MatRadioButtonMixinBase implements OnInit, AfterViewInit, OnDestroy, CanDisableRipple, HasTabIndex {
    protected _changeDetector: ChangeDetectorRef;
    _inputElement: ElementRef<HTMLInputElement>;
    _noopAnimations: boolean;
    ariaDescribedby: string;
    ariaLabel: string;
    ariaLabelledby: string;
    readonly change: EventEmitter<MatRadioChange>;
    get checked(): boolean;
    set checked(value: boolean);
    get color(): ThemePalette;
    set color(newValue: ThemePalette);
    get disabled(): boolean;
    set disabled(value: boolean);
    id: string;
    get inputId(): string;
    get labelPosition(): 'before' | 'after';
    set labelPosition(value: 'before' | 'after');
    name: string;
    radioGroup: _MatRadioGroupBase<_MatRadioButtonBase>;
    get required(): boolean;
    set required(value: boolean);
    get value(): any;
    set value(value: any);
    constructor(radioGroup: _MatRadioGroupBase<_MatRadioButtonBase>, elementRef: ElementRef, _changeDetector: ChangeDetectorRef, _focusMonitor: FocusMonitor, _radioDispatcher: UniqueSelectionDispatcher, animationMode?: string, _providerOverride?: MatRadioDefaultOptions | undefined, tabIndex?: string);
    _isRippleDisabled(): boolean;
    _markForCheck(): void;
    _onInputClick(event: Event): void;
    _onInputInteraction(event: Event): void;
    protected _setDisabled(value: boolean): void;
    focus(options?: FocusOptions, origin?: FocusOrigin): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ngAcceptInputType_checked: BooleanInput;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_required: BooleanInput;
    static ngAcceptInputType_tabIndex: NumberInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<_MatRadioButtonBase, never, never, { "id": "id"; "name": "name"; "ariaLabel": "aria-label"; "ariaLabelledby": "aria-labelledby"; "ariaDescribedby": "aria-describedby"; "checked": "checked"; "value": "value"; "labelPosition": "labelPosition"; "disabled": "disabled"; "required": "required"; "color": "color"; }, { "change": "change"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<_MatRadioButtonBase, never>;
}

export declare abstract class _MatRadioGroupBase<T extends _MatRadioButtonBase> implements AfterContentInit, ControlValueAccessor {
    _controlValueAccessorChangeFn: (value: any) => void;
    abstract _radios: QueryList<T>;
    readonly change: EventEmitter<MatRadioChange>;
    color: ThemePalette;
    get disabled(): boolean;
    set disabled(value: boolean);
    get labelPosition(): 'before' | 'after';
    set labelPosition(v: 'before' | 'after');
    get name(): string;
    set name(value: string);
    onTouched: () => any;
    get required(): boolean;
    set required(value: boolean);
    get selected(): T | null;
    set selected(selected: T | null);
    get value(): any;
    set value(newValue: any);
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
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_required: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<_MatRadioGroupBase<any>, never, never, { "color": "color"; "name": "name"; "labelPosition": "labelPosition"; "value": "value"; "selected": "selected"; "disabled": "disabled"; "required": "required"; }, { "change": "change"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<_MatRadioGroupBase<any>, never>;
}

export declare const MAT_RADIO_DEFAULT_OPTIONS: InjectionToken<MatRadioDefaultOptions>;

export declare function MAT_RADIO_DEFAULT_OPTIONS_FACTORY(): MatRadioDefaultOptions;

export declare const MAT_RADIO_GROUP: InjectionToken<_MatRadioGroupBase<_MatRadioButtonBase>>;

export declare const MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR: any;

export declare class MatRadioButton extends _MatRadioButtonBase {
    constructor(radioGroup: MatRadioGroup, elementRef: ElementRef, changeDetector: ChangeDetectorRef, focusMonitor: FocusMonitor, radioDispatcher: UniqueSelectionDispatcher, animationMode?: string, providerOverride?: MatRadioDefaultOptions, tabIndex?: string);
    static ɵcmp: i0.ɵɵComponentDeclaration<MatRadioButton, "mat-radio-button", ["matRadioButton"], { "disableRipple": "disableRipple"; "tabIndex": "tabIndex"; }, {}, never, ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatRadioButton, [{ optional: true; }, null, null, null, null, { optional: true; }, { optional: true; }, { attribute: "tabindex"; }]>;
}

export declare class MatRadioChange {
    source: _MatRadioButtonBase;
    value: any;
    constructor(
    source: _MatRadioButtonBase,
    value: any);
}

export interface MatRadioDefaultOptions {
    color: ThemePalette;
}

export declare class MatRadioGroup extends _MatRadioGroupBase<MatRadioButton> {
    _radios: QueryList<MatRadioButton>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatRadioGroup, "mat-radio-group", ["matRadioGroup"], {}, {}, ["_radios"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatRadioGroup, never>;
}

export declare class MatRadioModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatRadioModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatRadioModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatRadioModule, [typeof i1.MatRadioGroup, typeof i1.MatRadioButton], [typeof i2.MatRippleModule, typeof i2.MatCommonModule], [typeof i1.MatRadioGroup, typeof i1.MatRadioButton, typeof i2.MatCommonModule]>;
}
