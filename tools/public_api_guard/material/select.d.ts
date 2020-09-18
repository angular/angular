export declare abstract class _MatSelectBase<C> extends _MatSelectMixinBase implements AfterContentInit, OnChanges, OnDestroy, OnInit, DoCheck, ControlValueAccessor, CanDisable, HasTabIndex, MatFormFieldControl<any>, CanUpdateErrorState, CanDisableRipple {
    _ariaDescribedby: string;
    protected _changeDetectorRef: ChangeDetectorRef;
    readonly _closedStream: Observable<void>;
    protected readonly _destroy: Subject<void>;
    _keyManager: ActiveDescendantKeyManager<MatOption>;
    protected _ngZone: NgZone;
    _onChange: (value: any) => void;
    _onTouched: () => void;
    readonly _openedStream: Observable<void>;
    _panelDoneAnimatingStream: Subject<string>;
    protected _parentFormField: MatFormField;
    abstract _positions: ConnectedPosition[];
    _scrollStrategy: ScrollStrategy;
    _selectionModel: SelectionModel<MatOption>;
    _valueId: string;
    protected _viewportRuler: ViewportRuler;
    ariaLabel: string;
    ariaLabelledby: string;
    get compareWith(): (o1: any, o2: any) => boolean;
    set compareWith(fn: (o1: any, o2: any) => boolean);
    controlType: string;
    abstract customTrigger: {};
    get disableOptionCentering(): boolean;
    set disableOptionCentering(value: boolean);
    get empty(): boolean;
    errorStateMatcher: ErrorStateMatcher;
    get focused(): boolean;
    get id(): string;
    set id(value: string);
    get multiple(): boolean;
    set multiple(value: boolean);
    ngControl: NgControl;
    readonly openedChange: EventEmitter<boolean>;
    abstract optionGroups: QueryList<MatOptgroup>;
    readonly optionSelectionChanges: Observable<MatOptionSelectionChange>;
    abstract options: QueryList<_MatOptionBase>;
    overlayDir: CdkConnectedOverlay;
    panel: ElementRef;
    panelClass: string | string[] | Set<string> | {
        [key: string]: any;
    };
    get panelOpen(): boolean;
    get placeholder(): string;
    set placeholder(value: string);
    get required(): boolean;
    set required(value: boolean);
    get selected(): MatOption | MatOption[];
    readonly selectionChange: EventEmitter<C>;
    get shouldLabelFloat(): boolean;
    sortComparator: (a: MatOption, b: MatOption, options: MatOption[]) => number;
    trigger: ElementRef;
    get triggerValue(): string;
    get typeaheadDebounceInterval(): number;
    set typeaheadDebounceInterval(value: number);
    get value(): any;
    set value(newValue: any);
    readonly valueChange: EventEmitter<any>;
    constructor(_viewportRuler: ViewportRuler, _changeDetectorRef: ChangeDetectorRef, _ngZone: NgZone, _defaultErrorStateMatcher: ErrorStateMatcher, elementRef: ElementRef, _dir: Directionality, _parentForm: NgForm, _parentFormGroup: FormGroupDirective, _parentFormField: MatFormField, ngControl: NgControl, tabIndex: string, scrollStrategyFactory: any, _liveAnnouncer: LiveAnnouncer, defaults?: MatSelectConfig);
    protected _canOpen(): boolean;
    _getAriaActiveDescendant(): string | null;
    protected abstract _getChangeEvent(value: any): C;
    _getPanelAriaLabelledby(): string | null;
    _getPanelTheme(): string;
    _handleKeydown(event: KeyboardEvent): void;
    _isRtl(): boolean;
    _onAttached(): void;
    _onBlur(): void;
    _onFocus(): void;
    protected _panelDoneAnimating(isOpen: boolean): void;
    protected abstract _positioningSettled(): void;
    protected abstract _scrollOptionIntoView(index: number): void;
    close(): void;
    focus(options?: FocusOptions): void;
    ngAfterContentInit(): void;
    ngDoCheck(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    onContainerClick(): void;
    open(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => {}): void;
    setDescribedByIds(ids: string[]): void;
    setDisabledState(isDisabled: boolean): void;
    toggle(): void;
    writeValue(value: any): void;
    static ngAcceptInputType_disableOptionCentering: BooleanInput;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_multiple: BooleanInput;
    static ngAcceptInputType_required: BooleanInput;
    static ngAcceptInputType_tabIndex: NumberInput;
    static ngAcceptInputType_typeaheadDebounceInterval: NumberInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<_MatSelectBase<any>, never, never, { "panelClass": "panelClass"; "placeholder": "placeholder"; "required": "required"; "multiple": "multiple"; "disableOptionCentering": "disableOptionCentering"; "compareWith": "compareWith"; "value": "value"; "ariaLabel": "aria-label"; "ariaLabelledby": "aria-labelledby"; "errorStateMatcher": "errorStateMatcher"; "typeaheadDebounceInterval": "typeaheadDebounceInterval"; "sortComparator": "sortComparator"; "id": "id"; }, { "openedChange": "openedChange"; "_openedStream": "opened"; "_closedStream": "closed"; "selectionChange": "selectionChange"; "valueChange": "valueChange"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<_MatSelectBase<any>, [null, null, null, null, null, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; self: true; }, { attribute: "tabindex"; }, null, null, { optional: true; }]>;
}

export declare const MAT_SELECT_CONFIG: InjectionToken<MatSelectConfig>;

export declare const MAT_SELECT_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;

export declare const MAT_SELECT_SCROLL_STRATEGY_PROVIDER: {
    provide: InjectionToken<() => ScrollStrategy>;
    deps: (typeof Overlay)[];
    useFactory: typeof MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY;
};

export declare function MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay): () => ScrollStrategy;

export declare const MAT_SELECT_TRIGGER: InjectionToken<MatSelectTrigger>;

export declare class MatSelect extends _MatSelectBase<MatSelectChange> implements OnInit {
    _offsetY: number;
    _positions: ConnectedPosition[];
    _transformOrigin: string;
    _triggerFontSize: number;
    _triggerRect: ClientRect;
    customTrigger: MatSelectTrigger;
    optionGroups: QueryList<MatOptgroup>;
    options: QueryList<MatOption>;
    _calculateOverlayScroll(selectedIndex: number, scrollBuffer: number, maxScroll: number): number;
    protected _getChangeEvent(value: any): MatSelectChange;
    protected _panelDoneAnimating(isOpen: boolean): void;
    protected _positioningSettled(): void;
    protected _scrollOptionIntoView(index: number): void;
    ngOnInit(): void;
    open(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatSelect, "mat-select", ["matSelect"], { "disabled": "disabled"; "disableRipple": "disableRipple"; "tabIndex": "tabIndex"; }, {}, ["customTrigger", "options", "optionGroups"], ["mat-select-trigger", "*"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatSelect, never>;
}

export declare const matSelectAnimations: {
    readonly transformPanelWrap: AnimationTriggerMetadata;
    readonly transformPanel: AnimationTriggerMetadata;
};

export declare class MatSelectChange {
    source: MatSelect;
    value: any;
    constructor(
    source: MatSelect,
    value: any);
}

export interface MatSelectConfig {
    disableOptionCentering?: boolean;
    typeaheadDebounceInterval?: number;
}

export declare class MatSelectModule {
    static ɵinj: i0.ɵɵInjectorDef<MatSelectModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatSelectModule, [typeof i1.MatSelect, typeof i1.MatSelectTrigger], [typeof i2.CommonModule, typeof i3.OverlayModule, typeof i4.MatOptionModule, typeof i4.MatCommonModule], [typeof i5.CdkScrollableModule, typeof i6.MatFormFieldModule, typeof i1.MatSelect, typeof i1.MatSelectTrigger, typeof i4.MatOptionModule, typeof i4.MatCommonModule]>;
}

export declare class MatSelectTrigger {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatSelectTrigger, "mat-select-trigger", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatSelectTrigger, never>;
}

export declare const SELECT_ITEM_HEIGHT_EM = 3;

export declare const SELECT_MULTIPLE_PANEL_PADDING_X: number;

export declare const SELECT_PANEL_INDENT_PADDING_X: number;

export declare const SELECT_PANEL_MAX_HEIGHT = 256;

export declare const SELECT_PANEL_PADDING_X = 16;

export declare const SELECT_PANEL_VIEWPORT_PADDING = 8;
