export declare class BaseCdkCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef);
}

export declare abstract class BaseRowDef implements OnChanges {
    protected _columnsDiffer: IterableDiffer<any>;
    protected _differs: IterableDiffers;
    columns: Iterable<string>; template: TemplateRef<any>;
    constructor( template: TemplateRef<any>, _differs: IterableDiffers);
    extractCellTemplate(column: CdkColumnDef): TemplateRef<any>;
    getColumnsDiff(): IterableChanges<any> | null;
    ngOnChanges(changes: SimpleChanges): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<BaseRowDef, never, never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<BaseRowDef>;
}

export interface CanStick {
    _hasStickyChanged: boolean;
    sticky: boolean;
    hasStickyChanged(): boolean;
    resetStickyChanged(): void;
}

export declare type CanStickCtor = Constructor<CanStick>;

export declare const CDK_ROW_TEMPLATE = "<ng-container cdkCellOutlet></ng-container>";

export declare const CDK_TABLE_TEMPLATE = "\n  <ng-content select=\"caption\"></ng-content>\n  <ng-container headerRowOutlet></ng-container>\n  <ng-container rowOutlet></ng-container>\n  <ng-container footerRowOutlet></ng-container>\n";

export declare class CdkCell extends BaseCdkCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkCell, "cdk-cell, td[cdk-cell]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkCell>;
}

export declare class CdkCellDef implements CellDef {
    template: TemplateRef<any>;
    constructor(/** @docs-private */ template: TemplateRef<any>);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkCellDef, "[cdkCellDef]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkCellDef>;
}

export declare class CdkCellOutlet implements OnDestroy {
    _viewContainer: ViewContainerRef;
    cells: CdkCellDef[];
    context: any;
    constructor(_viewContainer: ViewContainerRef);
    ngOnDestroy(): void;
    static mostRecentCellOutlet: CdkCellOutlet | null;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkCellOutlet, "[cdkCellOutlet]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkCellOutlet>;
}

export interface CdkCellOutletMultiRowContext<T> {
    $implicit?: T;
    count?: number;
    dataIndex?: number;
    even?: boolean;
    first?: boolean;
    last?: boolean;
    odd?: boolean;
    renderIndex?: number;
}

export interface CdkCellOutletRowContext<T> {
    $implicit?: T;
    count?: number;
    even?: boolean;
    first?: boolean;
    index?: number;
    last?: boolean;
    odd?: boolean;
}

export declare class CdkColumnDef extends _CdkColumnDefBase implements CanStick {
    _name: string;
    _stickyEnd: boolean;
    cell: CdkCellDef;
    cssClassFriendlyName: string;
    footerCell: CdkFooterCellDef;
    headerCell: CdkHeaderCellDef;
    name: string;
    stickyEnd: boolean;
    static ngAcceptInputType_sticky: BooleanInput;
    static ngAcceptInputType_stickyEnd: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkColumnDef, "[cdkColumnDef]", never, { "sticky": "sticky"; "name": "cdkColumnDef"; "stickyEnd": "stickyEnd"; }, {}, ["cell", "headerCell", "footerCell"]>;
    static ɵfac: i0.ɵɵFactoryDef<CdkColumnDef>;
}

export declare class CdkFooterCell extends BaseCdkCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkFooterCell, "cdk-footer-cell, td[cdk-footer-cell]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkFooterCell>;
}

export declare class CdkFooterCellDef implements CellDef {
    template: TemplateRef<any>;
    constructor(/** @docs-private */ template: TemplateRef<any>);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkFooterCellDef, "[cdkFooterCellDef]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkFooterCellDef>;
}

export declare class CdkFooterRow {
    static ɵcmp: i0.ɵɵComponentDefWithMeta<CdkFooterRow, "cdk-footer-row, tr[cdk-footer-row]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkFooterRow>;
}

export declare class CdkFooterRowDef extends _CdkFooterRowDefBase implements CanStick, OnChanges {
    constructor(template: TemplateRef<any>, _differs: IterableDiffers);
    ngOnChanges(changes: SimpleChanges): void;
    static ngAcceptInputType_sticky: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkFooterRowDef, "[cdkFooterRowDef]", never, { "columns": "cdkFooterRowDef"; "sticky": "cdkFooterRowDefSticky"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkFooterRowDef>;
}

export declare class CdkHeaderCell extends BaseCdkCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkHeaderCell, "cdk-header-cell, th[cdk-header-cell]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkHeaderCell>;
}

export declare class CdkHeaderCellDef implements CellDef {
    template: TemplateRef<any>;
    constructor(/** @docs-private */ template: TemplateRef<any>);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkHeaderCellDef, "[cdkHeaderCellDef]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkHeaderCellDef>;
}

export declare class CdkHeaderRow {
    static ɵcmp: i0.ɵɵComponentDefWithMeta<CdkHeaderRow, "cdk-header-row, tr[cdk-header-row]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkHeaderRow>;
}

export declare class CdkHeaderRowDef extends _CdkHeaderRowDefBase implements CanStick, OnChanges {
    constructor(template: TemplateRef<any>, _differs: IterableDiffers);
    ngOnChanges(changes: SimpleChanges): void;
    static ngAcceptInputType_sticky: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkHeaderRowDef, "[cdkHeaderRowDef]", never, { "columns": "cdkHeaderRowDef"; "sticky": "cdkHeaderRowDefSticky"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkHeaderRowDef>;
}

export declare class CdkRow {
    static ɵcmp: i0.ɵɵComponentDefWithMeta<CdkRow, "cdk-row, tr[cdk-row]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkRow>;
}

export declare class CdkRowDef<T> extends BaseRowDef {
    when: (index: number, rowData: T) => boolean;
    constructor(template: TemplateRef<any>, _differs: IterableDiffers);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkRowDef<any>, "[cdkRowDef]", never, { "columns": "cdkRowDefColumns"; "when": "cdkRowDefWhen"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkRowDef<any>>;
}

export declare class CdkTable<T> implements AfterContentChecked, CollectionViewer, OnDestroy, OnInit {
    protected readonly _changeDetectorRef: ChangeDetectorRef;
    _contentColumnDefs: QueryList<CdkColumnDef>;
    _contentFooterRowDefs: QueryList<CdkFooterRowDef>;
    _contentHeaderRowDefs: QueryList<CdkHeaderRowDef>;
    _contentRowDefs: QueryList<CdkRowDef<T>>;
    protected _data: T[] | ReadonlyArray<T>;
    protected readonly _differs: IterableDiffers;
    protected readonly _dir: Directionality;
    protected readonly _elementRef: ElementRef;
    _footerRowOutlet: FooterRowOutlet;
    _headerRowOutlet: HeaderRowOutlet;
    _multiTemplateDataRows: boolean;
    _rowOutlet: DataRowOutlet;
    dataSource: CdkTableDataSourceInput<T>;
    multiTemplateDataRows: boolean;
    protected stickyCssClass: string;
    trackBy: TrackByFunction<T>;
    viewChange: BehaviorSubject<{
        start: number;
        end: number;
    }>;
    constructor(_differs: IterableDiffers, _changeDetectorRef: ChangeDetectorRef, _elementRef: ElementRef, role: string, _dir: Directionality, _document: any, _platform: Platform);
    _getRenderedRows(rowOutlet: RowOutlet): HTMLElement[];
    _getRowDefs(data: T, dataIndex: number): CdkRowDef<T>[];
    addColumnDef(columnDef: CdkColumnDef): void;
    addFooterRowDef(footerRowDef: CdkFooterRowDef): void;
    addHeaderRowDef(headerRowDef: CdkHeaderRowDef): void;
    addRowDef(rowDef: CdkRowDef<T>): void;
    ngAfterContentChecked(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    removeColumnDef(columnDef: CdkColumnDef): void;
    removeFooterRowDef(footerRowDef: CdkFooterRowDef): void;
    removeHeaderRowDef(headerRowDef: CdkHeaderRowDef): void;
    removeRowDef(rowDef: CdkRowDef<T>): void;
    renderRows(): void;
    setFooterRowDef(footerRowDef: CdkFooterRowDef): void;
    setHeaderRowDef(headerRowDef: CdkHeaderRowDef): void;
    updateStickyColumnStyles(): void;
    updateStickyFooterRowStyles(): void;
    updateStickyHeaderRowStyles(): void;
    static ngAcceptInputType_multiTemplateDataRows: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<CdkTable<any>, "cdk-table, table[cdk-table]", ["cdkTable"], { "trackBy": "trackBy"; "dataSource": "dataSource"; "multiTemplateDataRows": "multiTemplateDataRows"; }, {}, ["_contentColumnDefs", "_contentRowDefs", "_contentHeaderRowDefs", "_contentFooterRowDefs"]>;
    static ɵfac: i0.ɵɵFactoryDef<CdkTable<any>>;
}

export declare class CdkTableModule {
    static ɵinj: i0.ɵɵInjectorDef<CdkTableModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<CdkTableModule, [typeof i1.CdkTable, typeof i2.CdkRowDef, typeof i3.CdkCellDef, typeof i2.CdkCellOutlet, typeof i3.CdkHeaderCellDef, typeof i3.CdkFooterCellDef, typeof i3.CdkColumnDef, typeof i3.CdkCell, typeof i2.CdkRow, typeof i3.CdkHeaderCell, typeof i3.CdkFooterCell, typeof i2.CdkHeaderRow, typeof i2.CdkHeaderRowDef, typeof i2.CdkFooterRow, typeof i2.CdkFooterRowDef, typeof i1.DataRowOutlet, typeof i1.HeaderRowOutlet, typeof i1.FooterRowOutlet, typeof i4.CdkTextColumn], [typeof i5.CommonModule], [typeof i1.CdkTable, typeof i2.CdkRowDef, typeof i3.CdkCellDef, typeof i2.CdkCellOutlet, typeof i3.CdkHeaderCellDef, typeof i3.CdkFooterCellDef, typeof i3.CdkColumnDef, typeof i3.CdkCell, typeof i2.CdkRow, typeof i3.CdkHeaderCell, typeof i3.CdkFooterCell, typeof i2.CdkHeaderRow, typeof i2.CdkHeaderRowDef, typeof i2.CdkFooterRow, typeof i2.CdkFooterRowDef, typeof i1.DataRowOutlet, typeof i1.HeaderRowOutlet, typeof i1.FooterRowOutlet, typeof i4.CdkTextColumn]>;
}

export declare class CdkTextColumn<T> implements OnDestroy, OnInit {
    _name: string;
    cell: CdkCellDef;
    columnDef: CdkColumnDef;
    dataAccessor: (data: T, name: string) => string;
    headerCell: CdkHeaderCellDef;
    headerText: string;
    justify: 'start' | 'end';
    name: string;
    constructor(_table: CdkTable<T>, _options: TextColumnOptions<T>);
    _createDefaultHeaderText(): string;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<CdkTextColumn<any>, "cdk-text-column", never, { "name": "name"; "headerText": "headerText"; "dataAccessor": "dataAccessor"; "justify": "justify"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkTextColumn<any>>;
}

export interface CellDef {
    template: TemplateRef<any>;
}

export declare type Constructor<T> = new (...args: any[]) => T;

export declare class DataRowOutlet implements RowOutlet {
    elementRef: ElementRef;
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<DataRowOutlet, "[rowOutlet]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<DataRowOutlet>;
}

export declare class FooterRowOutlet implements RowOutlet {
    elementRef: ElementRef;
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<FooterRowOutlet, "[footerRowOutlet]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<FooterRowOutlet>;
}

export declare class HeaderRowOutlet implements RowOutlet {
    elementRef: ElementRef;
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<HeaderRowOutlet, "[headerRowOutlet]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<HeaderRowOutlet>;
}

export declare function mixinHasStickyInput<T extends Constructor<{}>>(base: T): CanStickCtor & T;

export interface RenderRow<T> {
    data: T;
    dataIndex: number;
    rowDef: CdkRowDef<T>;
}

export interface RowContext<T> extends CdkCellOutletMultiRowContext<T>, CdkCellOutletRowContext<T> {
}

export interface RowOutlet {
    viewContainer: ViewContainerRef;
}

export declare const STICKY_DIRECTIONS: StickyDirection[];

export declare type StickyDirection = 'top' | 'bottom' | 'left' | 'right';

export declare class StickyStyler {
    direction: Direction;
    constructor(_isNativeHtmlTable: boolean, _stickCellCss: string, direction: Direction, _isBrowser?: boolean);
    _addStickyStyle(element: HTMLElement, dir: StickyDirection, dirValue: number): void;
    _getCalculatedZIndex(element: HTMLElement): string;
    _getCellWidths(row: HTMLElement): number[];
    _getStickyEndColumnPositions(widths: number[], stickyStates: boolean[]): number[];
    _getStickyStartColumnPositions(widths: number[], stickyStates: boolean[]): number[];
    _removeStickyStyle(element: HTMLElement, stickyDirections: StickyDirection[]): void;
    clearStickyPositioning(rows: HTMLElement[], stickyDirections: StickyDirection[]): void;
    stickRows(rowsToStick: HTMLElement[], stickyStates: boolean[], position: 'top' | 'bottom'): void;
    updateStickyColumns(rows: HTMLElement[], stickyStartStates: boolean[], stickyEndStates: boolean[]): void;
    updateStickyFooterContainer(tableElement: Element, stickyStates: boolean[]): void;
}

export declare const TEXT_COLUMN_OPTIONS: InjectionToken<TextColumnOptions<any>>;

export interface TextColumnOptions<T> {
    defaultDataAccessor?: (data: T, name: string) => string;
    defaultHeaderTextTransform?: (name: string) => string;
}
