export declare class MatCell extends CdkCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef<HTMLElement>);
}

export declare class MatCellDef extends CdkCellDef {
}

export declare class MatColumnDef extends CdkColumnDef {
    name: string;
    sticky: boolean;
    stickyEnd: boolean;
}

export declare class MatFooterCell extends CdkFooterCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef);
}

export declare class MatFooterCellDef extends CdkFooterCellDef {
}

export declare class MatFooterRow extends CdkFooterRow {
}

export declare class MatFooterRowDef extends CdkFooterRowDef {
}

export declare class MatHeaderCell extends CdkHeaderCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef<HTMLElement>);
}

export declare class MatHeaderCellDef extends CdkHeaderCellDef {
}

export declare class MatHeaderRow extends CdkHeaderRow {
}

export declare class MatHeaderRowDef extends CdkHeaderRowDef {
}

export declare class MatRow extends CdkRow {
}

export declare class MatRowDef<T> extends CdkRowDef<T> {
}

export declare class MatTable<T> extends CdkTable<T> {
    protected stickyCssClass: string;
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
