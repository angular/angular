export declare type ArrowViewState = SortDirection | 'hint' | 'active';

export interface ArrowViewStateTransition {
    fromState?: ArrowViewState;
    toState?: ArrowViewState;
}

export declare const MAT_SORT_DEFAULT_OPTIONS: InjectionToken<MatSortDefaultOptions>;

export declare const MAT_SORT_HEADER_INTL_PROVIDER: {
    provide: typeof MatSortHeaderIntl;
    deps: Optional[][];
    useFactory: typeof MAT_SORT_HEADER_INTL_PROVIDER_FACTORY;
};

export declare function MAT_SORT_HEADER_INTL_PROVIDER_FACTORY(parentIntl: MatSortHeaderIntl): MatSortHeaderIntl;

export declare class MatSort extends _MatSortMixinBase implements CanDisable, HasInitialized, OnChanges, OnDestroy, OnInit {
    readonly _stateChanges: Subject<void>;
    active: string;
    get direction(): SortDirection;
    set direction(direction: SortDirection);
    get disableClear(): boolean;
    set disableClear(v: boolean);
    readonly sortChange: EventEmitter<Sort>;
    sortables: Map<string, MatSortable>;
    start: 'asc' | 'desc';
    constructor(_defaultOptions?: MatSortDefaultOptions | undefined);
    deregister(sortable: MatSortable): void;
    getNextSortDirection(sortable: MatSortable): SortDirection;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    register(sortable: MatSortable): void;
    sort(sortable: MatSortable): void;
    static ngAcceptInputType_disableClear: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatSort, "[matSort]", ["matSort"], { "disabled": "matSortDisabled"; "active": "matSortActive"; "start": "matSortStart"; "direction": "matSortDirection"; "disableClear": "matSortDisableClear"; }, { "sortChange": "matSortChange"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSort, [{ optional: true; }]>;
}

export interface MatSortable {
    disableClear: boolean;
    id: string;
    start: 'asc' | 'desc';
}

export declare const matSortAnimations: {
    readonly indicator: AnimationTriggerMetadata;
    readonly leftPointer: AnimationTriggerMetadata;
    readonly rightPointer: AnimationTriggerMetadata;
    readonly arrowOpacity: AnimationTriggerMetadata;
    readonly arrowPosition: AnimationTriggerMetadata;
    readonly allowChildren: AnimationTriggerMetadata;
};

export interface MatSortDefaultOptions {
    disableClear?: boolean;
}

export declare class MatSortHeader extends _MatSortHeaderMixinBase implements CanDisable, MatSortable, OnDestroy, OnInit, AfterViewInit {
    _arrowDirection: SortDirection;
    _columnDef: MatSortHeaderColumnDef;
    _disableViewStateAnimation: boolean;
    _intl: MatSortHeaderIntl;
    _showIndicatorHint: boolean;
    _sort: MatSort;
    _viewState: ArrowViewStateTransition;
    arrowPosition: 'before' | 'after';
    get disableClear(): boolean;
    set disableClear(v: boolean);
    id: string;
    start: 'asc' | 'desc';
    constructor(
    _intl: MatSortHeaderIntl, _changeDetectorRef: ChangeDetectorRef, _sort: MatSort, _columnDef: MatSortHeaderColumnDef, _focusMonitor: FocusMonitor, _elementRef: ElementRef<HTMLElement>);
    _getAriaSortAttribute(): "none" | "ascending" | "descending";
    _getArrowDirectionState(): string;
    _getArrowViewState(): string;
    _handleClick(): void;
    _handleKeydown(event: KeyboardEvent): void;
    _isDisabled(): boolean;
    _isSorted(): boolean;
    _renderArrow(): boolean;
    _setAnimationTransitionState(viewState: ArrowViewStateTransition): void;
    _setIndicatorHintVisible(visible: boolean): void;
    _toggleOnInteraction(): void;
    _updateArrowDirection(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ngAcceptInputType_disableClear: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatSortHeader, "[mat-sort-header]", ["matSortHeader"], { "disabled": "disabled"; "id": "mat-sort-header"; "arrowPosition": "arrowPosition"; "start": "start"; "disableClear": "disableClear"; }, {}, never, ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSortHeader, [null, null, { optional: true; }, { optional: true; }, null, null]>;
}

export declare class MatSortHeaderIntl {
    readonly changes: Subject<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSortHeaderIntl, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MatSortHeaderIntl>;
}

export declare class MatSortModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSortModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatSortModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatSortModule, [typeof i1.MatSort, typeof i2.MatSortHeader], [typeof i3.CommonModule, typeof i4.MatCommonModule], [typeof i1.MatSort, typeof i2.MatSortHeader]>;
}

export interface Sort {
    active: string;
    direction: SortDirection;
}

export declare type SortDirection = 'asc' | 'desc' | '';
