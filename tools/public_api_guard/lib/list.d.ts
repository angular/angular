export declare const _MatListItemMixinBase: CanDisableRippleCtor & typeof MatListItemBase;

export declare const _MatListMixinBase: CanDisableRippleCtor & typeof MatListBase;

export declare const _MatListOptionMixinBase: CanDisableRippleCtor & typeof MatListOptionBase;

export declare const _MatSelectionListMixinBase: CanDisableRippleCtor & typeof MatSelectionListBase;

export declare const MAT_SELECTION_LIST_VALUE_ACCESSOR: any;

export declare class MatList extends _MatListMixinBase implements CanDisableRipple, OnChanges, OnDestroy {
    _stateChanges: Subject<void>;
    constructor(_elementRef?: ElementRef<HTMLElement> | undefined);
    _getListType(): 'list' | 'action-list' | null;
    ngOnChanges(): void;
    ngOnDestroy(): void;
}

export declare class MatListAvatarCssMatStyler {
}

export declare class MatListBase {
}

export declare class MatListIconCssMatStyler {
}

export declare class MatListItem extends _MatListItemMixinBase implements AfterContentInit, CanDisableRipple, OnDestroy {
    _avatar: MatListAvatarCssMatStyler;
    _icon: MatListIconCssMatStyler;
    _lines: QueryList<MatLine>;
    constructor(_element: ElementRef<HTMLElement>, navList?: MatNavList, list?: MatList, _changeDetectorRef?: ChangeDetectorRef);
    _getHostElement(): HTMLElement;
    _isRippleDisabled(): boolean;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
}

export declare class MatListItemBase {
}

export declare class MatListModule {
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
}

export declare class MatListOptionBase {
}

export declare class MatListSubheaderCssMatStyler {
}

export declare class MatNavList extends _MatListMixinBase implements CanDisableRipple, OnChanges, OnDestroy {
    _stateChanges: Subject<void>;
    ngOnChanges(): void;
    ngOnDestroy(): void;
}

export declare class MatSelectionList extends _MatSelectionListMixinBase implements FocusableOption, CanDisableRipple, AfterContentInit, ControlValueAccessor, OnDestroy, OnChanges {
    _keyManager: FocusKeyManager<MatListOption>;
    _onTouched: () => void;
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
    focus(): void;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    selectAll(): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(values: string[]): void;
}

export declare class MatSelectionListBase {
}

export declare class MatSelectionListChange {
    option: MatListOption;
    source: MatSelectionList;
    constructor(
    source: MatSelectionList,
    option: MatListOption);
}
