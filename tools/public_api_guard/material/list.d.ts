export declare const MAT_SELECTION_LIST_VALUE_ACCESSOR: any;

export declare class MatList extends _MatListMixinBase implements CanDisableRipple, OnChanges, OnDestroy {
    _stateChanges: Subject<void>;
    constructor(_elementRef: ElementRef<HTMLElement>);
    _getListType(): 'list' | 'action-list' | null;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disableRipple: boolean | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatList, "mat-list, mat-action-list", ["matList"], { 'disableRipple': "disableRipple" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatList>;
}

export declare class MatListAvatarCssMatStyler {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatListAvatarCssMatStyler, "[mat-list-avatar], [matListAvatar]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatListAvatarCssMatStyler>;
}

export declare class MatListIconCssMatStyler {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatListIconCssMatStyler, "[mat-list-icon], [matListIcon]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatListIconCssMatStyler>;
}

export declare class MatListItem extends _MatListItemMixinBase implements AfterContentInit, CanDisableRipple, OnDestroy {
    _avatar: MatListAvatarCssMatStyler;
    _icon: MatListIconCssMatStyler;
    _lines: QueryList<MatLine>;
    constructor(_element: ElementRef<HTMLElement>, _changeDetectorRef: ChangeDetectorRef, navList?: MatNavList, list?: MatList);
    _getHostElement(): HTMLElement;
    _isRippleDisabled(): boolean;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disableRipple: boolean | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatListItem, "mat-list-item, a[mat-list-item], button[mat-list-item]", ["matListItem"], { 'disableRipple': "disableRipple" }, {}, ["_avatar", "_icon", "_lines"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatListItem>;
}

export declare class MatListModule {
    static ɵinj: i0.ɵɵInjectorDef<MatListModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatListModule, [typeof i1.MatList, typeof i1.MatNavList, typeof i1.MatListItem, typeof i1.MatListAvatarCssMatStyler, typeof i1.MatListIconCssMatStyler, typeof i1.MatListSubheaderCssMatStyler, typeof i2.MatSelectionList, typeof i2.MatListOption], [typeof i3.MatLineModule, typeof i3.MatRippleModule, typeof i3.MatCommonModule, typeof i3.MatPseudoCheckboxModule, typeof i4.CommonModule], [typeof i1.MatList, typeof i1.MatNavList, typeof i1.MatListItem, typeof i1.MatListAvatarCssMatStyler, typeof i3.MatLineModule, typeof i3.MatCommonModule, typeof i1.MatListIconCssMatStyler, typeof i1.MatListSubheaderCssMatStyler, typeof i3.MatPseudoCheckboxModule, typeof i2.MatSelectionList, typeof i2.MatListOption, typeof i5.MatDividerModule]>;
}

export declare class MatListOption extends _MatListOptionMixinBase implements AfterContentInit, OnDestroy, OnInit, FocusableOption, CanDisableRipple {
    _avatar: MatListAvatarCssMatStyler;
    _icon: MatListIconCssMatStyler;
    _lines: QueryList<MatLine>;
    _text: ElementRef;
    checkboxPosition: 'before' | 'after';
    color: ThemePalette;
    disabled: any;
    selected: boolean;
    selectionList: MatSelectionList;
    value: any;
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
    static ngAcceptInputType_disableRipple: boolean | string;
    static ngAcceptInputType_disabled: boolean | string;
    static ngAcceptInputType_selected: boolean | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatListOption, "mat-list-option", ["matListOption"], { 'disableRipple': "disableRipple", 'checkboxPosition': "checkboxPosition", 'color': "color", 'value': "value", 'disabled': "disabled", 'selected': "selected" }, {}, ["_avatar", "_icon", "_lines"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatListOption>;
}

export declare class MatListSubheaderCssMatStyler {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatListSubheaderCssMatStyler, "[mat-subheader], [matSubheader]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatListSubheaderCssMatStyler>;
}

export declare class MatNavList extends _MatListMixinBase implements CanDisableRipple, OnChanges, OnDestroy {
    _stateChanges: Subject<void>;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disableRipple: boolean | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatNavList, "mat-nav-list", ["matNavList"], { 'disableRipple': "disableRipple" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatNavList>;
}

export declare class MatSelectionList extends _MatSelectionListMixinBase implements CanDisableRipple, AfterContentInit, ControlValueAccessor, OnDestroy, OnChanges {
    _keyManager: FocusKeyManager<MatListOption>;
    _onTouched: () => void;
    _value: string[] | null;
    color: ThemePalette;
    compareWith: (o1: any, o2: any) => boolean;
    disabled: boolean;
    options: QueryList<MatListOption>;
    selectedOptions: SelectionModel<MatListOption>;
    readonly selectionChange: EventEmitter<MatSelectionListChange>;
    tabIndex: number;
    constructor(_element: ElementRef<HTMLElement>, tabIndex: string);
    _emitChangeEvent(option: MatListOption): void;
    _keydown(event: KeyboardEvent): void;
    _removeOptionFromList(option: MatListOption): MatListOption | null;
    _reportValueChange(): void;
    _setFocusedOption(option: MatListOption): void;
    deselectAll(): void;
    focus(options?: FocusOptions): void;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    selectAll(): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(values: string[]): void;
    static ngAcceptInputType_disableRipple: boolean | string;
    static ngAcceptInputType_disabled: boolean | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatSelectionList, "mat-selection-list", ["matSelectionList"], { 'disableRipple': "disableRipple", 'tabIndex': "tabIndex", 'color': "color", 'compareWith': "compareWith", 'disabled': "disabled" }, { 'selectionChange': "selectionChange" }, ["options"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatSelectionList>;
}

export declare class MatSelectionListChange {
    option: MatListOption;
    source: MatSelectionList;
    constructor(
    source: MatSelectionList,
    option: MatListOption);
}
