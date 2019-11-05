export declare class MatCell extends CdkCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef<HTMLElement>);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatCell, "mat-cell, td[mat-cell]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatCell>;
}

export declare class MatCellDef extends CdkCellDef {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatCellDef, "[matCellDef]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatCellDef>;
}

export declare class MatColumnDef extends CdkColumnDef {
    name: string;
    static ngAcceptInputType_sticky: boolean | string;
    static ngAcceptInputType_stickyEnd: boolean | string;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatColumnDef, "[matColumnDef]", never, { 'sticky': "sticky", 'name': "matColumnDef" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatColumnDef>;
}

export declare class MatFooterCell extends CdkFooterCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatFooterCell, "mat-footer-cell, td[mat-footer-cell]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatFooterCell>;
}

export declare class MatFooterCellDef extends CdkFooterCellDef {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatFooterCellDef, "[matFooterCellDef]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatFooterCellDef>;
}

export declare class MatFooterRow extends CdkFooterRow {
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatFooterRow, "mat-footer-row, tr[mat-footer-row]", ["matFooterRow"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatFooterRow>;
}

export declare class MatFooterRowDef extends CdkFooterRowDef {
    static ngAcceptInputType_sticky: boolean | string;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatFooterRowDef, "[matFooterRowDef]", never, { 'columns': "matFooterRowDef", 'sticky': "matFooterRowDefSticky" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatFooterRowDef>;
}

export declare class MatHeaderCell extends CdkHeaderCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef<HTMLElement>);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatHeaderCell, "mat-header-cell, th[mat-header-cell]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatHeaderCell>;
}

export declare class MatHeaderCellDef extends CdkHeaderCellDef {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatHeaderCellDef, "[matHeaderCellDef]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatHeaderCellDef>;
}

export declare class MatHeaderRow extends CdkHeaderRow {
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatHeaderRow, "mat-header-row, tr[mat-header-row]", ["matHeaderRow"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatHeaderRow>;
}

export declare class MatHeaderRowDef extends CdkHeaderRowDef {
    static ngAcceptInputType_sticky: boolean | string;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatHeaderRowDef, "[matHeaderRowDef]", never, { 'columns': "matHeaderRowDef", 'sticky': "matHeaderRowDefSticky" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatHeaderRowDef>;
}

export declare class MatRow extends CdkRow {
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatRow, "mat-row, tr[mat-row]", ["matRow"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatRow>;
}

export declare class MatRowDef<T> extends CdkRowDef<T> {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatRowDef<any>, "[matRowDef]", never, { 'columns': "matRowDefColumns", 'when': "matRowDefWhen" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatRowDef<any>>;
}

export declare class MatTable<T> extends CdkTable<T> {
    protected stickyCssClass: string;
    static ngAcceptInputType_multiTemplateDataRows: boolean | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatTable<any>, "mat-table, table[mat-table]", ["matTable"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTable<any>>;
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
    static ɵinj: i0.ɵɵInjectorDef<MatTableModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatTableModule, [typeof i1.MatTable, typeof i2.MatHeaderCellDef, typeof i3.MatHeaderRowDef, typeof i2.MatColumnDef, typeof i2.MatCellDef, typeof i3.MatRowDef, typeof i2.MatFooterCellDef, typeof i3.MatFooterRowDef, typeof i2.MatHeaderCell, typeof i2.MatCell, typeof i2.MatFooterCell, typeof i3.MatHeaderRow, typeof i3.MatRow, typeof i3.MatFooterRow, typeof i4.MatTextColumn], [typeof i5.CdkTableModule, typeof i6.CommonModule, typeof i7.MatCommonModule], [typeof i1.MatTable, typeof i2.MatHeaderCellDef, typeof i3.MatHeaderRowDef, typeof i2.MatColumnDef, typeof i2.MatCellDef, typeof i3.MatRowDef, typeof i2.MatFooterCellDef, typeof i3.MatFooterRowDef, typeof i2.MatHeaderCell, typeof i2.MatCell, typeof i2.MatFooterCell, typeof i3.MatHeaderRow, typeof i3.MatRow, typeof i3.MatFooterRow, typeof i4.MatTextColumn]>;
}

export declare class MatTextColumn<T> extends CdkTextColumn<T> {
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatTextColumn<any>, "mat-text-column", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTextColumn<any>>;
}
