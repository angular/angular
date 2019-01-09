export declare const _MatButtonToggleMixinBase: CanDisableRippleCtor & typeof MatButtonToggleBase;

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
    focus(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
}

export declare type MatButtonToggleAppearance = 'legacy' | 'standard';

export declare class MatButtonToggleBase {
}

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
    _syncButtonToggle(toggle: MatButtonToggle, select: boolean, isUserInput?: boolean): void;
    ngAfterContentInit(): void;
    ngOnInit(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

export declare class MatButtonToggleGroupMultiple {
}

export declare class MatButtonToggleModule {
}

export declare type ToggleType = 'checkbox' | 'radio';
