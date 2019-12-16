export declare const MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS: InjectionToken<MatButtonToggleDefaultOptions>;

export declare const MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR: any;

export declare class MatButtonToggle extends _MatButtonToggleMixinBase implements OnInit, CanDisableRipple, OnDestroy {
    _buttonElement: ElementRef<HTMLButtonElement>;
    _type: ToggleType;
    appearance: MatButtonToggleAppearance;
    ariaLabel: string;
    ariaLabelledby: string | null;
    readonly buttonId: string;
    buttonToggleGroup: MatButtonToggleGroup;
    readonly change: EventEmitter<MatButtonToggleChange>;
    checked: boolean;
    disabled: boolean;
    id: string;
    name: string;
    tabIndex: number | null;
    value: any;
    constructor(toggleGroup: MatButtonToggleGroup, _changeDetectorRef: ChangeDetectorRef, _elementRef: ElementRef<HTMLElement>, _focusMonitor: FocusMonitor, defaultTabIndex: string, defaultOptions?: MatButtonToggleDefaultOptions);
    _markForCheck(): void;
    _onButtonClick(): void;
    focus(options?: FocusOptions): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ngAcceptInputType_checked: BooleanInput;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_multiple: BooleanInput;
    static ngAcceptInputType_vertical: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatButtonToggle, "mat-button-toggle", ["matButtonToggle"], { 'disableRipple': "disableRipple", 'ariaLabel': "aria-label", 'ariaLabelledby': "aria-labelledby", 'id': "id", 'name': "name", 'value': "value", 'tabIndex': "tabIndex", 'appearance': "appearance", 'checked': "checked", 'disabled': "disabled" }, { 'change': "change" }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatButtonToggle>;
}

export declare type MatButtonToggleAppearance = 'legacy' | 'standard';

export declare class MatButtonToggleChange {
    source: MatButtonToggle;
    value: any;
    constructor(
    source: MatButtonToggle,
    value: any);
}

export interface MatButtonToggleDefaultOptions {
    appearance?: MatButtonToggleAppearance;
}

export declare class MatButtonToggleGroup implements ControlValueAccessor, OnInit, AfterContentInit {
    _buttonToggles: QueryList<MatButtonToggle>;
    _controlValueAccessorChangeFn: (value: any) => void;
    _onTouched: () => any;
    appearance: MatButtonToggleAppearance;
    readonly change: EventEmitter<MatButtonToggleChange>;
    disabled: boolean;
    multiple: boolean;
    name: string;
    readonly selected: MatButtonToggle | MatButtonToggle[];
    value: any;
    readonly valueChange: EventEmitter<any>;
    vertical: boolean;
    constructor(_changeDetector: ChangeDetectorRef, defaultOptions?: MatButtonToggleDefaultOptions);
    _emitChangeEvent(): void;
    _isPrechecked(toggle: MatButtonToggle): boolean;
    _isSelected(toggle: MatButtonToggle): boolean;
    _syncButtonToggle(toggle: MatButtonToggle, select: boolean, isUserInput?: boolean, deferEvents?: boolean): void;
    ngAfterContentInit(): void;
    ngOnInit(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_multiple: BooleanInput;
    static ngAcceptInputType_vertical: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatButtonToggleGroup, "mat-button-toggle-group", ["matButtonToggleGroup"], { 'appearance': "appearance", 'name': "name", 'vertical': "vertical", 'value': "value", 'multiple': "multiple", 'disabled': "disabled" }, { 'valueChange': "valueChange", 'change': "change" }, ["_buttonToggles"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatButtonToggleGroup>;
}

export declare class MatButtonToggleGroupMultiple {
}

export declare class MatButtonToggleModule {
    static ɵinj: i0.ɵɵInjectorDef<MatButtonToggleModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatButtonToggleModule, [typeof i1.MatButtonToggleGroup, typeof i1.MatButtonToggle], [typeof i2.MatCommonModule, typeof i2.MatRippleModule], [typeof i2.MatCommonModule, typeof i1.MatButtonToggleGroup, typeof i1.MatButtonToggle]>;
}

export declare type ToggleType = 'checkbox' | 'radio';
