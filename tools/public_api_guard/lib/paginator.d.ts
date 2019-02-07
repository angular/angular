export declare const _MatPaginatorBase: CanDisableCtor & HasInitializedCtor & typeof MatPaginatorBase;

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
}

export declare class MatPaginatorBase {
}

export declare class MatPaginatorIntl {
    readonly changes: Subject<void>;
    firstPageLabel: string;
    getRangeLabel: (page: number, pageSize: number, length: number) => string;
    itemsPerPageLabel: string;
    lastPageLabel: string;
    nextPageLabel: string;
    previousPageLabel: string;
}

export declare class MatPaginatorModule {
}

export declare class PageEvent {
    length: number;
    pageIndex: number;
    pageSize: number;
    previousPageIndex?: number;
}
