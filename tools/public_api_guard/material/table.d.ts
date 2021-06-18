export declare class _MatTableDataSource<T, P extends MatTableDataSourcePaginator = MatTableDataSourcePaginator> extends DataSource<T> {
    _renderChangesSubscription: Subscription | null;
    get data(): T[];
    set data(data: T[]);
    get filter(): string;
    set filter(filter: string);
    filterPredicate: ((data: T, filter: string) => boolean);
    filteredData: T[];
    get paginator(): P | null;
    set paginator(paginator: P | null);
    get sort(): MatSort | null;
    set sort(sort: MatSort | null);
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

export declare class MatCell extends CdkCell {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatCell, "mat-cell, td[mat-cell]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatCell, never>;
}

export declare class MatCellDef extends CdkCellDef {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatCellDef, "[matCellDef]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatCellDef, never>;
}

export declare class MatColumnDef extends CdkColumnDef {
    get name(): string;
    set name(name: string);
    protected _updateColumnCssClassName(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatColumnDef, "[matColumnDef]", never, { "sticky": "sticky"; "name": "matColumnDef"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatColumnDef, never>;
}

export declare class MatFooterCell extends CdkFooterCell {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatFooterCell, "mat-footer-cell, td[mat-footer-cell]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatFooterCell, never>;
}

export declare class MatFooterCellDef extends CdkFooterCellDef {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatFooterCellDef, "[matFooterCellDef]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatFooterCellDef, never>;
}

export declare class MatFooterRow extends CdkFooterRow {
    static ɵcmp: i0.ɵɵComponentDeclaration<MatFooterRow, "mat-footer-row, tr[mat-footer-row]", ["matFooterRow"], {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatFooterRow, never>;
}

export declare class MatFooterRowDef extends CdkFooterRowDef {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatFooterRowDef, "[matFooterRowDef]", never, { "columns": "matFooterRowDef"; "sticky": "matFooterRowDefSticky"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatFooterRowDef, never>;
}

export declare class MatHeaderCell extends CdkHeaderCell {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatHeaderCell, "mat-header-cell, th[mat-header-cell]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatHeaderCell, never>;
}

export declare class MatHeaderCellDef extends CdkHeaderCellDef {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatHeaderCellDef, "[matHeaderCellDef]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatHeaderCellDef, never>;
}

export declare class MatHeaderRow extends CdkHeaderRow {
    static ɵcmp: i0.ɵɵComponentDeclaration<MatHeaderRow, "mat-header-row, tr[mat-header-row]", ["matHeaderRow"], {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatHeaderRow, never>;
}

export declare class MatHeaderRowDef extends CdkHeaderRowDef {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatHeaderRowDef, "[matHeaderRowDef]", never, { "columns": "matHeaderRowDef"; "sticky": "matHeaderRowDefSticky"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatHeaderRowDef, never>;
}

export declare class MatNoDataRow extends CdkNoDataRow {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatNoDataRow, "ng-template[matNoDataRow]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatNoDataRow, never>;
}

export declare class MatRecycleRows {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatRecycleRows, "mat-table[recycleRows], table[mat-table][recycleRows]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatRecycleRows, never>;
}

export declare class MatRow extends CdkRow {
    static ɵcmp: i0.ɵɵComponentDeclaration<MatRow, "mat-row, tr[mat-row]", ["matRow"], {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatRow, never>;
}

export declare class MatRowDef<T> extends CdkRowDef<T> {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatRowDef<any>, "[matRowDef]", never, { "columns": "matRowDefColumns"; "when": "matRowDefWhen"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatRowDef<any>, never>;
}

export declare class MatTable<T> extends CdkTable<T> {
    protected needsPositionStickyOnElement: boolean;
    protected stickyCssClass: string;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatTable<any>, "mat-table, table[mat-table]", ["matTable"], {}, {}, never, ["caption", "colgroup, col"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTable<any>, never>;
}

export declare class MatTableDataSource<T> extends _MatTableDataSource<T, MatPaginator> {
}

export interface MatTableDataSourcePageEvent {
    length: number;
    pageIndex: number;
    pageSize: number;
}

export interface MatTableDataSourcePaginator {
    initialized: Observable<void>;
    length: number;
    page: Subject<MatTableDataSourcePageEvent>;
    pageIndex: number;
    pageSize: number;
}

export declare class MatTableModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTableModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatTableModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatTableModule, [typeof i1.MatTable, typeof i1.MatRecycleRows, typeof i2.MatHeaderCellDef, typeof i3.MatHeaderRowDef, typeof i2.MatColumnDef, typeof i2.MatCellDef, typeof i3.MatRowDef, typeof i2.MatFooterCellDef, typeof i3.MatFooterRowDef, typeof i2.MatHeaderCell, typeof i2.MatCell, typeof i2.MatFooterCell, typeof i3.MatHeaderRow, typeof i3.MatRow, typeof i3.MatFooterRow, typeof i3.MatNoDataRow, typeof i4.MatTextColumn], [typeof i5.CdkTableModule, typeof i6.MatCommonModule], [typeof i6.MatCommonModule, typeof i1.MatTable, typeof i1.MatRecycleRows, typeof i2.MatHeaderCellDef, typeof i3.MatHeaderRowDef, typeof i2.MatColumnDef, typeof i2.MatCellDef, typeof i3.MatRowDef, typeof i2.MatFooterCellDef, typeof i3.MatFooterRowDef, typeof i2.MatHeaderCell, typeof i2.MatCell, typeof i2.MatFooterCell, typeof i3.MatHeaderRow, typeof i3.MatRow, typeof i3.MatFooterRow, typeof i3.MatNoDataRow, typeof i4.MatTextColumn]>;
}

export declare class MatTextColumn<T> extends CdkTextColumn<T> {
    static ɵcmp: i0.ɵɵComponentDeclaration<MatTextColumn<any>, "mat-text-column", never, {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTextColumn<any>, never>;
}
