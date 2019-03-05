export declare const _MatSelectMixinBase: CanDisableCtor & HasTabIndexCtor & CanDisableRippleCtor & CanUpdateErrorStateCtor & typeof MatSelectBase;

export declare const fadeInContent: AnimationTriggerMetadata;

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
    _positions: {
        originX: string;
        originY: string;
        overlayX: string;
        overlayY: string;
    }[];
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
    focused: boolean;
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
    value: any;
    readonly valueChange: EventEmitter<any>;
    constructor(_viewportRuler: ViewportRuler, _changeDetectorRef: ChangeDetectorRef, _ngZone: NgZone, _defaultErrorStateMatcher: ErrorStateMatcher, elementRef: ElementRef, _dir: Directionality, _parentForm: NgForm, _parentFormGroup: FormGroupDirective, _parentFormField: MatFormField, ngControl: NgControl, tabIndex: string, scrollStrategyFactory: any,
    _liveAnnouncer?: LiveAnnouncer | undefined);
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
    focus(): void;
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
}

export declare const matSelectAnimations: {
    readonly transformPanelWrap: AnimationTriggerMetadata;
    readonly transformPanel: AnimationTriggerMetadata;
    readonly fadeInContent: AnimationTriggerMetadata;
};

export declare class MatSelectBase {
    _defaultErrorStateMatcher: ErrorStateMatcher;
    _elementRef: ElementRef;
    _parentForm: NgForm;
    _parentFormGroup: FormGroupDirective;
    ngControl: NgControl;
    constructor(_elementRef: ElementRef, _defaultErrorStateMatcher: ErrorStateMatcher, _parentForm: NgForm, _parentFormGroup: FormGroupDirective, ngControl: NgControl);
}

export declare class MatSelectChange {
    source: MatSelect;
    value: any;
    constructor(
    source: MatSelect,
    value: any);
}

export declare class MatSelectModule {
}

export declare class MatSelectTrigger {
}

export declare const SELECT_ITEM_HEIGHT_EM = 3;

export declare let SELECT_MULTIPLE_PANEL_PADDING_X: number;

export declare const SELECT_PANEL_INDENT_PADDING_X: number;

export declare const SELECT_PANEL_MAX_HEIGHT = 256;

export declare const SELECT_PANEL_PADDING_X = 16;

export declare const SELECT_PANEL_VIEWPORT_PADDING = 8;

export declare const transformPanel: AnimationTriggerMetadata;
