export declare const MAT_SELECT_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;

export declare const MAT_SELECT_SCROLL_STRATEGY_PROVIDER: {
    provide: InjectionToken<() => ScrollStrategy>;
    deps: (typeof Overlay)[];
    useFactory: typeof MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY;
};

export declare function MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay): () => ScrollStrategy;

export declare class MatSelect extends _MatSelectMixinBase implements AfterContentInit, OnChanges, OnDestroy, OnInit, DoCheck, ControlValueAccessor, CanDisable, HasTabIndex, MatFormFieldControl<any>, CanUpdateErrorState, CanDisableRipple {
    _ariaDescribedby: string;
    readonly _closedStream: Observable<void>;
    _keyManager: ActiveDescendantKeyManager<MatOption>;
    _offsetY: number;
    _onChange: (value: any) => void;
    _onTouched: () => void;
    readonly _openedStream: Observable<void>;
    _optionIds: string;
    _panelDoneAnimatingStream: Subject<string>;
    _positions: ConnectedPosition[];
    _scrollStrategy: ScrollStrategy;
    _selectionModel: SelectionModel<MatOption>;
    _transformOrigin: string;
    _triggerFontSize: number;
    _triggerRect: ClientRect;
    ariaLabel: string;
    ariaLabelledby: string;
    compareWith: (o1: any, o2: any) => boolean;
    controlType: string;
    customTrigger: MatSelectTrigger;
    disableOptionCentering: boolean;
    readonly empty: boolean;
    errorStateMatcher: ErrorStateMatcher;
    readonly focused: boolean;
    id: string;
    multiple: boolean;
    ngControl: NgControl;
    readonly openedChange: EventEmitter<boolean>;
    optionGroups: QueryList<MatOptgroup>;
    readonly optionSelectionChanges: Observable<MatOptionSelectionChange>;
    options: QueryList<MatOption>;
    overlayDir: CdkConnectedOverlay;
    panel: ElementRef;
    panelClass: string | string[] | Set<string> | {
        [key: string]: any;
    };
    readonly panelOpen: boolean;
    placeholder: string;
    required: boolean;
    readonly selected: MatOption | MatOption[];
    readonly selectionChange: EventEmitter<MatSelectChange>;
    readonly shouldLabelFloat: boolean;
    sortComparator: (a: MatOption, b: MatOption, options: MatOption[]) => number;
    trigger: ElementRef;
    readonly triggerValue: string;
    typeaheadDebounceInterval: number;
    value: any;
    readonly valueChange: EventEmitter<any>;
    constructor(_viewportRuler: ViewportRuler, _changeDetectorRef: ChangeDetectorRef, _ngZone: NgZone, _defaultErrorStateMatcher: ErrorStateMatcher, elementRef: ElementRef, _dir: Directionality, _parentForm: NgForm, _parentFormGroup: FormGroupDirective, _parentFormField: MatFormField, ngControl: NgControl, tabIndex: string, scrollStrategyFactory: any, _liveAnnouncer: LiveAnnouncer);
    _calculateOverlayScroll(selectedIndex: number, scrollBuffer: number, maxScroll: number): number;
    _getAriaActiveDescendant(): string | null;
    _getAriaLabel(): string | null;
    _getAriaLabelledby(): string | null;
    _getPanelTheme(): string;
    _handleKeydown(event: KeyboardEvent): void;
    _isRtl(): boolean;
    _onAttached(): void;
    _onBlur(): void;
    _onFocus(): void;
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
    static ngAcceptInputType_disableOptionCentering: boolean | string;
    static ngAcceptInputType_disableRipple: boolean | string;
    static ngAcceptInputType_disabled: boolean | string;
    static ngAcceptInputType_multiple: boolean | string;
    static ngAcceptInputType_required: boolean | string;
    static ngAcceptInputType_typeaheadDebounceInterval: number | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatSelect, "mat-select", ["matSelect"], { 'disabled': "disabled", 'disableRipple': "disableRipple", 'tabIndex': "tabIndex", 'panelClass': "panelClass", 'placeholder': "placeholder", 'required': "required", 'multiple': "multiple", 'disableOptionCentering': "disableOptionCentering", 'compareWith': "compareWith", 'value': "value", 'ariaLabel': "aria-label", 'ariaLabelledby': "aria-labelledby", 'errorStateMatcher': "errorStateMatcher", 'typeaheadDebounceInterval': "typeaheadDebounceInterval", 'sortComparator': "sortComparator", 'id': "id" }, { 'openedChange': "openedChange", '_openedStream': "opened", '_closedStream': "closed", 'selectionChange': "selectionChange", 'valueChange': "valueChange" }, ["customTrigger", "options", "optionGroups"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatSelect>;
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

export declare class MatSelectModule {
    static ɵinj: i0.ɵɵInjectorDef<MatSelectModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatSelectModule, [typeof i1.MatSelect, typeof i1.MatSelectTrigger], [typeof i2.CommonModule, typeof i3.OverlayModule, typeof i4.MatOptionModule, typeof i4.MatCommonModule], [typeof i5.MatFormFieldModule, typeof i1.MatSelect, typeof i1.MatSelectTrigger, typeof i4.MatOptionModule, typeof i4.MatCommonModule]>;
}

export declare class MatSelectTrigger {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatSelectTrigger, "mat-select-trigger", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatSelectTrigger>;
}

export declare const SELECT_ITEM_HEIGHT_EM = 3;

export declare const SELECT_MULTIPLE_PANEL_PADDING_X: number;

export declare const SELECT_PANEL_INDENT_PADDING_X: number;

export declare const SELECT_PANEL_MAX_HEIGHT = 256;

export declare const SELECT_PANEL_PADDING_X = 16;

export declare const SELECT_PANEL_VIEWPORT_PADDING = 8;
