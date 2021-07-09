export declare const MAT_LIST: InjectionToken<MatList>;

export declare const MAT_NAV_LIST: InjectionToken<MatNavList>;

export declare const MAT_SELECTION_LIST_VALUE_ACCESSOR: any;

export declare class MatList extends _MatListBase implements CanDisable, CanDisableRipple, OnChanges, OnDestroy {
    readonly _stateChanges: Subject<void>;
    constructor(_elementRef: ElementRef<HTMLElement>);
    _getListType(): 'list' | 'action-list' | null;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatList, "mat-list, mat-action-list", ["matList"], { "disableRipple": "disableRipple"; "disabled": "disabled"; }, {}, never, ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatList, never>;
}

export declare class MatListAvatarCssMatStyler {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatListAvatarCssMatStyler, "[mat-list-avatar], [matListAvatar]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatListAvatarCssMatStyler, never>;
}

export declare class MatListIconCssMatStyler {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatListIconCssMatStyler, "[mat-list-icon], [matListIcon]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatListIconCssMatStyler, never>;
}

export declare class MatListItem extends _MatListItemMixinBase implements AfterContentInit, CanDisableRipple, OnDestroy {
    _avatar: MatListAvatarCssMatStyler;
    _icon: MatListIconCssMatStyler;
    _lines: QueryList<MatLine>;
    get disabled(): boolean;
    set disabled(value: boolean);
    constructor(_element: ElementRef<HTMLElement>, _changeDetectorRef: ChangeDetectorRef, navList?: MatNavList, list?: MatList);
    _getHostElement(): HTMLElement;
    _isRippleDisabled(): boolean;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatListItem, "mat-list-item, a[mat-list-item], button[mat-list-item]", ["matListItem"], { "disableRipple": "disableRipple"; "disabled": "disabled"; }, {}, ["_avatar", "_icon", "_lines"], ["[mat-list-avatar], [mat-list-icon], [matListAvatar], [matListIcon]", "[mat-line], [matLine]", "*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatListItem, [null, null, { optional: true; }, { optional: true; }]>;
}

export declare class MatListModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatListModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatListModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatListModule, [typeof i1.MatList, typeof i1.MatNavList, typeof i1.MatListItem, typeof i1.MatListAvatarCssMatStyler, typeof i1.MatListIconCssMatStyler, typeof i1.MatListSubheaderCssMatStyler, typeof i2.MatSelectionList, typeof i2.MatListOption], [typeof i3.MatLineModule, typeof i3.MatRippleModule, typeof i3.MatCommonModule, typeof i3.MatPseudoCheckboxModule, typeof i4.CommonModule], [typeof i1.MatList, typeof i1.MatNavList, typeof i1.MatListItem, typeof i1.MatListAvatarCssMatStyler, typeof i3.MatLineModule, typeof i3.MatCommonModule, typeof i1.MatListIconCssMatStyler, typeof i1.MatListSubheaderCssMatStyler, typeof i3.MatPseudoCheckboxModule, typeof i2.MatSelectionList, typeof i2.MatListOption, typeof i5.MatDividerModule]>;
}

export declare class MatListOption extends _MatListOptionBase implements AfterContentInit, OnDestroy, OnInit, FocusableOption, CanDisableRipple {
    _avatar: MatListAvatarCssMatStyler;
    _icon: MatListIconCssMatStyler;
    _lines: QueryList<MatLine>;
    _text: ElementRef;
    checkboxPosition: MatListOptionCheckboxPosition;
    get color(): ThemePalette;
    set color(newValue: ThemePalette);
    get disabled(): any;
    set disabled(value: any);
    get selected(): boolean;
    set selected(value: boolean);
    readonly selectedChange: EventEmitter<boolean>;
    selectionList: MatSelectionList;
    get value(): any;
    set value(newValue: any);
    constructor(_element: ElementRef<HTMLElement>, _changeDetector: ChangeDetectorRef,
    selectionList: MatSelectionList);
    _getHostElement(): HTMLElement;
    _handleBlur(): void;
    _handleClick(): void;
    _handleFocus(): void;
    _isRippleDisabled(): any;
    _markForCheck(): void;
    _setSelected(selected: boolean): boolean;
    focus(): void;
    getLabel(): any;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    toggle(): void;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_selected: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatListOption, "mat-list-option", ["matListOption"], { "disableRipple": "disableRipple"; "checkboxPosition": "checkboxPosition"; "color": "color"; "value": "value"; "disabled": "disabled"; "selected": "selected"; }, { "selectedChange": "selectedChange"; }, ["_avatar", "_icon", "_lines"], ["*", "[mat-list-avatar], [mat-list-icon], [matListAvatar], [matListIcon]"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatListOption, never>;
}

export declare type MatListOptionCheckboxPosition = 'before' | 'after';

export declare class MatListSubheaderCssMatStyler {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatListSubheaderCssMatStyler, "[mat-subheader], [matSubheader]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatListSubheaderCssMatStyler, never>;
}

export declare class MatNavList extends _MatListBase implements CanDisable, CanDisableRipple, OnChanges, OnDestroy {
    readonly _stateChanges: Subject<void>;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatNavList, "mat-nav-list", ["matNavList"], { "disableRipple": "disableRipple"; "disabled": "disabled"; }, {}, never, ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatNavList, never>;
}

export declare class MatSelectionList extends _MatSelectionListBase implements CanDisableRipple, AfterContentInit, ControlValueAccessor, OnDestroy, OnChanges {
    _keyManager: FocusKeyManager<MatListOption>;
    _onTouched: () => void;
    _tabIndex: number;
    _value: string[] | null;
    color: ThemePalette;
    compareWith: (o1: any, o2: any) => boolean;
    get disabled(): boolean;
    set disabled(value: boolean);
    get multiple(): boolean;
    set multiple(value: boolean);
    options: QueryList<MatListOption>;
    selectedOptions: SelectionModel<MatListOption>;
    readonly selectionChange: EventEmitter<MatSelectionListChange>;
    tabIndex: number;
    constructor(_element: ElementRef<HTMLElement>, tabIndex: string, _changeDetector: ChangeDetectorRef, _focusMonitor?: FocusMonitor | undefined);
    _emitChangeEvent(options: MatListOption[]): void;
    _keydown(event: KeyboardEvent): void;
    _removeOptionFromList(option: MatListOption): MatListOption | null;
    _reportValueChange(): void;
    _setFocusedOption(option: MatListOption): void;
    deselectAll(): MatListOption[];
    focus(options?: FocusOptions): void;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    selectAll(): MatListOption[];
    setDisabledState(isDisabled: boolean): void;
    writeValue(values: string[]): void;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_multiple: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatSelectionList, "mat-selection-list", ["matSelectionList"], { "disableRipple": "disableRipple"; "tabIndex": "tabIndex"; "color": "color"; "compareWith": "compareWith"; "disabled": "disabled"; "multiple": "multiple"; }, { "selectionChange": "selectionChange"; }, ["options"], ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSelectionList, [null, { attribute: "tabindex"; }, null, null]>;
}

export declare class MatSelectionListChange {
    option: MatListOption;
    options: MatListOption[];
    source: MatSelectionList;
    constructor(
    source: MatSelectionList,
    option: MatListOption,
    options: MatListOption[]);
}
