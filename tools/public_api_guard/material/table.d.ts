export declare class MatCell extends CdkCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef<HTMLElement>);
}

export declare class MatCellDef extends CdkCellDef {
}

export declare class MatColumnDef extends CdkColumnDef {
    name: string;
    static ngAcceptInputType_sticky: boolean | string;
    static ngAcceptInputType_stickyEnd: boolean | string;
}

export declare class MatFooterCell extends CdkFooterCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef);
}

export declare class MatFooterCellDef extends CdkFooterCellDef {
}

export declare class MatFooterRow extends CdkFooterRow {
}

export declare class MatFooterRowDef extends CdkFooterRowDef {
    static ngAcceptInputType_sticky: boolean | string;
}

export declare class MatHeaderCell extends CdkHeaderCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef<HTMLElement>);
}

export declare class MatHeaderCellDef extends CdkHeaderCellDef {
}

export declare class MatHeaderRow extends CdkHeaderRow {
}

export declare class MatHeaderRowDef extends CdkHeaderRowDef {
    static ngAcceptInputType_sticky: boolean | string;
}

export declare class MatRow extends CdkRow {
}

export declare class MatRowDef<T> extends CdkRowDef<T> {
}

export declare class MatTable<T> extends CdkTable<T> {
    protected stickyCssClass: string;
    static ngAcceptInputType_multiTemplateDataRows: boolean | string;
}

export declare class MatTableDataSource<T> extends DataSource<T> {
    _renderChangesSubscription: Subscription;
    data: T[];
    filter: string;
    filterPredicate: ((data: T, filter: string) => boolean);
    filteredData: T[];
    paginator: MatPaginator | null;
    sort: MatSort | null;
    sortData: ((data: T[], sort: MatSort) => T[]);
    sortingDataAccessor: ((data: T, sortHeaderId: string) => string | number);
    constructor(initialData?: T[]);
    _filterData(data: T[]): T[];
    _orderData(data: T[]): T[];
    _pageData(data: T[]): T[];
    _updateChangeSubscription(): void;
    _updatePaginator(filteredDataLength: number): void;
    connect(): BehaviorSubject<T[]>;
    disconnect(): void;
}

export declare class MatTableModule {
}

export declare class MatTextColumn<T> extends CdkTextColumn<T> {
}
