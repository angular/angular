export declare const MAT_PAGINATOR_INTL_PROVIDER: {
    provide: typeof MatPaginatorIntl;
    deps: Optional[][];
    useFactory: typeof MAT_PAGINATOR_INTL_PROVIDER_FACTORY;
};

export declare function MAT_PAGINATOR_INTL_PROVIDER_FACTORY(parentIntl: MatPaginatorIntl): MatPaginatorIntl;

export declare class MatPaginator extends _MatPaginatorBase implements OnInit, OnDestroy, CanDisable, HasInitialized {
    _displayedPageSizeOptions: number[];
    _intl: MatPaginatorIntl;
    color: ThemePalette;
    hidePageSize: boolean;
    length: number;
    readonly page: EventEmitter<PageEvent>;
    pageIndex: number;
    pageSize: number;
    pageSizeOptions: number[];
    showFirstLastButtons: boolean;
    constructor(_intl: MatPaginatorIntl, _changeDetectorRef: ChangeDetectorRef);
    _changePageSize(pageSize: number): void;
    _nextButtonsDisabled(): boolean;
    _previousButtonsDisabled(): boolean;
    firstPage(): void;
    getNumberOfPages(): number;
    hasNextPage(): boolean;
    hasPreviousPage(): boolean;
    lastPage(): void;
    nextPage(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    previousPage(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_hidePageSize: BooleanInput;
    static ngAcceptInputType_length: NumberInput;
    static ngAcceptInputType_pageIndex: NumberInput;
    static ngAcceptInputType_pageSize: NumberInput;
    static ngAcceptInputType_showFirstLastButtons: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatPaginator, "mat-paginator", ["matPaginator"], { "disabled": "disabled"; "color": "color"; "pageIndex": "pageIndex"; "length": "length"; "pageSize": "pageSize"; "pageSizeOptions": "pageSizeOptions"; "hidePageSize": "hidePageSize"; "showFirstLastButtons": "showFirstLastButtons"; }, { "page": "page"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatPaginator>;
}

export declare class MatPaginatorIntl {
    readonly changes: Subject<void>;
    firstPageLabel: string;
    getRangeLabel: (page: number, pageSize: number, length: number) => string;
    itemsPerPageLabel: string;
    lastPageLabel: string;
    nextPageLabel: string;
    previousPageLabel: string;
    static ɵfac: i0.ɵɵFactoryDef<MatPaginatorIntl>;
    static ɵprov: i0.ɵɵInjectableDef<MatPaginatorIntl>;
}

export declare class MatPaginatorModule {
    static ɵinj: i0.ɵɵInjectorDef<MatPaginatorModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatPaginatorModule, [typeof i1.MatPaginator], [typeof i2.CommonModule, typeof i3.MatButtonModule, typeof i4.MatSelectModule, typeof i5.MatTooltipModule], [typeof i1.MatPaginator]>;
}

export declare class PageEvent {
    length: number;
    pageIndex: number;
    pageSize: number;
    previousPageIndex?: number;
}
