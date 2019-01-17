export declare const _MatChipListMixinBase: CanUpdateErrorStateCtor & typeof MatChipListBase;

export declare const _MatChipMixinBase: CanColorCtor & CanDisableRippleCtor & CanDisableCtor & typeof MatChipBase;

export declare const MAT_CHIPS_DEFAULT_OPTIONS: InjectionToken<MatChipsDefaultOptions>;

export declare class MatChip extends _MatChipMixinBase implements FocusableOption, OnDestroy, CanColor, CanDisable, CanDisableRipple, RippleTarget {
    _elementRef: ElementRef;
    _hasFocus: boolean;
    readonly _onBlur: Subject<MatChipEvent>;
    readonly _onFocus: Subject<MatChipEvent>;
    protected _removable: boolean;
    protected _selectable: boolean;
    protected _selected: boolean;
    protected _value: any;
    readonly ariaSelected: string | null;
    avatar: MatChipAvatar;
    chipListSelectable: boolean;
    readonly destroyed: EventEmitter<MatChipEvent>;
    removable: boolean;
    removeIcon: MatChipRemove;
    readonly removed: EventEmitter<MatChipEvent>;
    rippleConfig: RippleConfig & RippleGlobalOptions;
    readonly rippleDisabled: boolean;
    selectable: boolean;
    selected: boolean;
    readonly selectionChange: EventEmitter<MatChipSelectionChange>;
    trailingIcon: MatChipTrailingIcon;
    value: any;
    constructor(_elementRef: ElementRef, _ngZone: NgZone, platform: Platform, globalRippleOptions: RippleGlobalOptions | null);
    _addHostClassName(): void;
    _blur(): void;
    _handleClick(event: Event): void;
    _handleKeydown(event: KeyboardEvent): void;
    deselect(): void;
    focus(): void;
    ngOnDestroy(): void;
    remove(): void;
    select(): void;
    selectViaInteraction(): void;
    toggleSelected(isUserInput?: boolean): boolean;
}

export declare class MatChipAvatar {
}

export declare class MatChipBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}

export interface MatChipEvent {
    chip: MatChip;
}

export declare class MatChipInput implements MatChipTextControl, OnChanges {
    _addOnBlur: boolean;
    _chipList: MatChipList;
    protected _elementRef: ElementRef<HTMLInputElement>;
    protected _inputElement: HTMLInputElement;
    addOnBlur: boolean;
    chipEnd: EventEmitter<MatChipInputEvent>;
    chipList: MatChipList;
    disabled: boolean;
    readonly empty: boolean;
    focused: boolean;
    id: string;
    placeholder: string;
    separatorKeyCodes: number[] | Set<number>;
    constructor(_elementRef: ElementRef<HTMLInputElement>, _defaultOptions: MatChipsDefaultOptions);
    _blur(): void;
    _emitChipEnd(event?: KeyboardEvent): void;
    _focus(): void;
    _keydown(event?: KeyboardEvent): void;
    _onInput(): void;
    focus(): void;
    ngOnChanges(): void;
}

export interface MatChipInputEvent {
    input: HTMLInputElement;
    value: string;
}

export declare class MatChipList extends _MatChipListMixinBase implements MatFormFieldControl<any>, ControlValueAccessor, AfterContentInit, DoCheck, OnInit, OnDestroy, CanUpdateErrorState {
    _ariaDescribedby: string;
    protected _chipInput: MatChipTextControl;
    protected _disabled: boolean;
    protected _elementRef: ElementRef<HTMLElement>;
    _keyManager: FocusKeyManager<MatChip>;
    _onChange: (value: any) => void;
    _onTouched: () => void;
    protected _placeholder: string;
    protected _required: boolean;
    protected _selectable: boolean;
    _selectionModel: SelectionModel<MatChip>;
    _tabIndex: number;
    _uid: string;
    _userTabIndex: number | null;
    protected _value: any;
    ariaOrientation: 'horizontal' | 'vertical';
    readonly change: EventEmitter<MatChipListChange>;
    readonly chipBlurChanges: Observable<MatChipEvent>;
    readonly chipFocusChanges: Observable<MatChipEvent>;
    readonly chipRemoveChanges: Observable<MatChipEvent>;
    readonly chipSelectionChanges: Observable<MatChipSelectionChange>;
    chips: QueryList<MatChip>;
    compareWith: (o1: any, o2: any) => boolean;
    readonly controlType: string;
    disabled: boolean;
    readonly empty: boolean;
    errorStateMatcher: ErrorStateMatcher;
    readonly focused: boolean;
    readonly id: string;
    multiple: boolean;
    ngControl: NgControl;
    placeholder: string;
    required: boolean;
    readonly role: string | null;
    selectable: boolean;
    readonly selected: MatChip[] | MatChip;
    readonly shouldLabelFloat: boolean;
    tabIndex: number;
    value: any;
    readonly valueChange: EventEmitter<any>;
    constructor(_elementRef: ElementRef<HTMLElement>, _changeDetectorRef: ChangeDetectorRef, _dir: Directionality, _parentForm: NgForm, _parentFormGroup: FormGroupDirective, _defaultErrorStateMatcher: ErrorStateMatcher,
    ngControl: NgControl);
    _blur(): void;
    _focusInput(): void;
    _keydown(event: KeyboardEvent): void;
    _markAsTouched(): void;
    _setSelectionByValue(value: any, isUserInput?: boolean): void;
    protected _updateFocusForDestroyedChips(): void;
    protected _updateTabIndex(): void;
    focus(): void;
    ngAfterContentInit(): void;
    ngDoCheck(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    onContainerClick(event: MouseEvent): void;
    registerInput(inputElement: MatChipTextControl): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDescribedByIds(ids: string[]): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

export declare class MatChipListBase {
    _defaultErrorStateMatcher: ErrorStateMatcher;
    _parentForm: NgForm;
    _parentFormGroup: FormGroupDirective;
    ngControl: NgControl;
    constructor(_defaultErrorStateMatcher: ErrorStateMatcher, _parentForm: NgForm, _parentFormGroup: FormGroupDirective,
    ngControl: NgControl);
}

export declare class MatChipListChange {
    source: MatChipList;
    value: any;
    constructor(
    source: MatChipList,
    value: any);
}

export declare class MatChipRemove {
    protected _parentChip: MatChip;
    constructor(_parentChip: MatChip);
    _handleClick(event: Event): void;
}

export interface MatChipsDefaultOptions {
    separatorKeyCodes: number[] | Set<number>;
}

export declare class MatChipSelectionChange {
    isUserInput: boolean;
    selected: boolean;
    source: MatChip;
    constructor(
    source: MatChip,
    selected: boolean,
    isUserInput?: boolean);
}

export declare class MatChipsModule {
}

export declare class MatChipTrailingIcon {
}
