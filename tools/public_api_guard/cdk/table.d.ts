export declare const _COALESCED_STYLE_SCHEDULER: InjectionToken<_CoalescedStyleScheduler>;

export declare class _CoalescedStyleScheduler implements OnDestroy {
    constructor(_ngZone: NgZone);
    ngOnDestroy(): void;
    schedule(task: () => unknown): void;
    scheduleEnd(task: () => unknown): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<_CoalescedStyleScheduler, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<_CoalescedStyleScheduler>;
}

export declare class _Schedule {
    endTasks: (() => unknown)[];
    tasks: (() => unknown)[];
}

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
    static ɵdir: i0.ɵɵDirectiveDeclaration<BaseRowDef, never, never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<BaseRowDef, never>;
}

export interface CanStick {
    _hasStickyChanged: boolean;
    sticky: boolean;
    hasStickyChanged(): boolean;
    resetStickyChanged(): void;
}

export declare type CanStickCtor = Constructor<CanStick>;

export declare const CDK_ROW_TEMPLATE = "<ng-container cdkCellOutlet></ng-container>";

export declare const CDK_TABLE: InjectionToken<any>;

export declare const CDK_TABLE_TEMPLATE = "\n  <ng-content select=\"caption\"></ng-content>\n  <ng-content select=\"colgroup, col\"></ng-content>\n  <ng-container headerRowOutlet></ng-container>\n  <ng-container rowOutlet></ng-container>\n  <ng-container noDataRowOutlet></ng-container>\n  <ng-container footerRowOutlet></ng-container>\n";

export declare class CdkCell extends BaseCdkCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkCell, "cdk-cell, td[cdk-cell]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkCell, never>;
}

export declare class CdkCellDef implements CellDef {
    template: TemplateRef<any>;
    constructor(/** @docs-private */ template: TemplateRef<any>);
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkCellDef, "[cdkCellDef]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkCellDef, never>;
}

export declare class CdkCellOutlet implements OnDestroy {
    _viewContainer: ViewContainerRef;
    cells: CdkCellDef[];
    context: any;
    constructor(_viewContainer: ViewContainerRef);
    ngOnDestroy(): void;
    static mostRecentCellOutlet: CdkCellOutlet | null;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkCellOutlet, "[cdkCellOutlet]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkCellOutlet, never>;
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
    _columnCssClassName: string[];
    protected _name: string;
    _stickyEnd: boolean;
    _table?: any;
    cell: CdkCellDef;
    cssClassFriendlyName: string;
    footerCell: CdkFooterCellDef;
    headerCell: CdkHeaderCellDef;
    get name(): string;
    set name(name: string);
    get stickyEnd(): boolean;
    set stickyEnd(v: boolean);
    constructor(_table?: any);
    protected _setNameInput(value: string): void;
    protected _updateColumnCssClassName(): void;
    static ngAcceptInputType_sticky: BooleanInput;
    static ngAcceptInputType_stickyEnd: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkColumnDef, "[cdkColumnDef]", never, { "sticky": "sticky"; "name": "cdkColumnDef"; "stickyEnd": "stickyEnd"; }, {}, ["cell", "headerCell", "footerCell"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkColumnDef, [{ optional: true; }]>;
}

export declare class CdkFooterCell extends BaseCdkCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkFooterCell, "cdk-footer-cell, td[cdk-footer-cell]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkFooterCell, never>;
}

export declare class CdkFooterCellDef implements CellDef {
    template: TemplateRef<any>;
    constructor(/** @docs-private */ template: TemplateRef<any>);
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkFooterCellDef, "[cdkFooterCellDef]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkFooterCellDef, never>;
}

export declare class CdkFooterRow {
    static ɵcmp: i0.ɵɵComponentDeclaration<CdkFooterRow, "cdk-footer-row, tr[cdk-footer-row]", never, {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkFooterRow, never>;
}

export declare class CdkFooterRowDef extends _CdkFooterRowDefBase implements CanStick, OnChanges {
    _table?: any;
    constructor(template: TemplateRef<any>, _differs: IterableDiffers, _table?: any);
    ngOnChanges(changes: SimpleChanges): void;
    static ngAcceptInputType_sticky: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkFooterRowDef, "[cdkFooterRowDef]", never, { "columns": "cdkFooterRowDef"; "sticky": "cdkFooterRowDefSticky"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkFooterRowDef, [null, null, { optional: true; }]>;
}

export declare class CdkHeaderCell extends BaseCdkCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkHeaderCell, "cdk-header-cell, th[cdk-header-cell]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkHeaderCell, never>;
}

export declare class CdkHeaderCellDef implements CellDef {
    template: TemplateRef<any>;
    constructor(/** @docs-private */ template: TemplateRef<any>);
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkHeaderCellDef, "[cdkHeaderCellDef]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkHeaderCellDef, never>;
}

export declare class CdkHeaderRow {
    static ɵcmp: i0.ɵɵComponentDeclaration<CdkHeaderRow, "cdk-header-row, tr[cdk-header-row]", never, {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkHeaderRow, never>;
}

export declare class CdkHeaderRowDef extends _CdkHeaderRowDefBase implements CanStick, OnChanges {
    _table?: any;
    constructor(template: TemplateRef<any>, _differs: IterableDiffers, _table?: any);
    ngOnChanges(changes: SimpleChanges): void;
    static ngAcceptInputType_sticky: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkHeaderRowDef, "[cdkHeaderRowDef]", never, { "columns": "cdkHeaderRowDef"; "sticky": "cdkHeaderRowDefSticky"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkHeaderRowDef, [null, null, { optional: true; }]>;
}

export declare class CdkNoDataRow {
    templateRef: TemplateRef<any>;
    constructor(templateRef: TemplateRef<any>);
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkNoDataRow, "ng-template[cdkNoDataRow]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkNoDataRow, never>;
}

export declare class CdkRecycleRows {
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkRecycleRows, "cdk-table[recycleRows], table[cdk-table][recycleRows]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkRecycleRows, never>;
}

export declare class CdkRow {
    static ɵcmp: i0.ɵɵComponentDeclaration<CdkRow, "cdk-row, tr[cdk-row]", never, {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkRow, never>;
}

export declare class CdkRowDef<T> extends BaseRowDef {
    _table?: any;
    when: (index: number, rowData: T) => boolean;
    constructor(template: TemplateRef<any>, _differs: IterableDiffers, _table?: any);
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkRowDef<any>, "[cdkRowDef]", never, { "columns": "cdkRowDefColumns"; "when": "cdkRowDefWhen"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkRowDef<any>, [null, null, { optional: true; }]>;
}

export declare class CdkTable<T> implements AfterContentChecked, CollectionViewer, OnDestroy, OnInit {
    protected readonly _changeDetectorRef: ChangeDetectorRef;
    protected readonly _coalescedStyleScheduler: _CoalescedStyleScheduler;
    _contentColumnDefs: QueryList<CdkColumnDef>;
    _contentFooterRowDefs: QueryList<CdkFooterRowDef>;
    _contentHeaderRowDefs: QueryList<CdkHeaderRowDef>;
    _contentRowDefs: QueryList<CdkRowDef<T>>;
    protected _data: readonly T[];
    protected readonly _differs: IterableDiffers;
    protected readonly _dir: Directionality;
    protected readonly _elementRef: ElementRef;
    _footerRowOutlet: FooterRowOutlet;
    _headerRowOutlet: HeaderRowOutlet;
    protected _isNativeHtmlTable: boolean;
    _multiTemplateDataRows: boolean;
    _noDataRow: CdkNoDataRow;
    _noDataRowOutlet: NoDataRowOutlet;
    _rowOutlet: DataRowOutlet;
    protected readonly _stickyPositioningListener: StickyPositioningListener;
    protected readonly _viewRepeater: _ViewRepeater<T, RenderRow<T>, RowContext<T>>;
    readonly contentChanged: EventEmitter<void>;
    get dataSource(): CdkTableDataSourceInput<T>;
    set dataSource(dataSource: CdkTableDataSourceInput<T>);
    get fixedLayout(): boolean;
    set fixedLayout(v: boolean);
    get multiTemplateDataRows(): boolean;
    set multiTemplateDataRows(v: boolean);
    protected needsPositionStickyOnElement: boolean;
    protected stickyCssClass: string;
    get trackBy(): TrackByFunction<T>;
    set trackBy(fn: TrackByFunction<T>);
    readonly viewChange: BehaviorSubject<{
        start: number;
        end: number;
    }>;
    constructor(_differs: IterableDiffers, _changeDetectorRef: ChangeDetectorRef, _elementRef: ElementRef, role: string, _dir: Directionality, _document: any, _platform: Platform, _viewRepeater: _ViewRepeater<T, RenderRow<T>, RowContext<T>>, _coalescedStyleScheduler: _CoalescedStyleScheduler, _viewportRuler: ViewportRuler,
    _stickyPositioningListener: StickyPositioningListener);
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
    setNoDataRow(noDataRow: CdkNoDataRow | null): void;
    updateStickyColumnStyles(): void;
    updateStickyFooterRowStyles(): void;
    updateStickyHeaderRowStyles(): void;
    static ngAcceptInputType_fixedLayout: BooleanInput;
    static ngAcceptInputType_multiTemplateDataRows: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<CdkTable<any>, "cdk-table, table[cdk-table]", ["cdkTable"], { "trackBy": "trackBy"; "dataSource": "dataSource"; "multiTemplateDataRows": "multiTemplateDataRows"; "fixedLayout": "fixedLayout"; }, { "contentChanged": "contentChanged"; }, ["_noDataRow", "_contentColumnDefs", "_contentRowDefs", "_contentHeaderRowDefs", "_contentFooterRowDefs"], ["caption", "colgroup, col"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkTable<any>, [null, null, null, { attribute: "role"; }, { optional: true; }, null, null, null, null, null, { optional: true; skipSelf: true; }]>;
}

export declare class CdkTableModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkTableModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<CdkTableModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<CdkTableModule, [typeof i1.CdkTable, typeof i2.CdkRowDef, typeof i3.CdkCellDef, typeof i2.CdkCellOutlet, typeof i3.CdkHeaderCellDef, typeof i3.CdkFooterCellDef, typeof i3.CdkColumnDef, typeof i3.CdkCell, typeof i2.CdkRow, typeof i3.CdkHeaderCell, typeof i3.CdkFooterCell, typeof i2.CdkHeaderRow, typeof i2.CdkHeaderRowDef, typeof i2.CdkFooterRow, typeof i2.CdkFooterRowDef, typeof i1.DataRowOutlet, typeof i1.HeaderRowOutlet, typeof i1.FooterRowOutlet, typeof i4.CdkTextColumn, typeof i2.CdkNoDataRow, typeof i1.CdkRecycleRows, typeof i1.NoDataRowOutlet], [typeof i5.ScrollingModule], [typeof i1.CdkTable, typeof i2.CdkRowDef, typeof i3.CdkCellDef, typeof i2.CdkCellOutlet, typeof i3.CdkHeaderCellDef, typeof i3.CdkFooterCellDef, typeof i3.CdkColumnDef, typeof i3.CdkCell, typeof i2.CdkRow, typeof i3.CdkHeaderCell, typeof i3.CdkFooterCell, typeof i2.CdkHeaderRow, typeof i2.CdkHeaderRowDef, typeof i2.CdkFooterRow, typeof i2.CdkFooterRowDef, typeof i1.DataRowOutlet, typeof i1.HeaderRowOutlet, typeof i1.FooterRowOutlet, typeof i4.CdkTextColumn, typeof i2.CdkNoDataRow, typeof i1.CdkRecycleRows, typeof i1.NoDataRowOutlet]>;
}

export declare class CdkTextColumn<T> implements OnDestroy, OnInit {
    _name: string;
    cell: CdkCellDef;
    columnDef: CdkColumnDef;
    dataAccessor: (data: T, name: string) => string;
    headerCell: CdkHeaderCellDef;
    headerText: string;
    justify: 'start' | 'end';
    get name(): string;
    set name(name: string);
    constructor(_table: CdkTable<T>, _options: TextColumnOptions<T>);
    _createDefaultHeaderText(): string;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<CdkTextColumn<any>, "cdk-text-column", never, { "name": "name"; "headerText": "headerText"; "dataAccessor": "dataAccessor"; "justify": "justify"; }, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkTextColumn<any>, [{ optional: true; }, { optional: true; }]>;
}

export interface CellDef {
    template: TemplateRef<any>;
}

export declare type Constructor<T> = new (...args: any[]) => T;

export declare class DataRowOutlet implements RowOutlet {
    elementRef: ElementRef;
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDeclaration<DataRowOutlet, "[rowOutlet]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DataRowOutlet, never>;
}

export declare class FooterRowOutlet implements RowOutlet {
    elementRef: ElementRef;
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDeclaration<FooterRowOutlet, "[footerRowOutlet]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<FooterRowOutlet, never>;
}

export declare class HeaderRowOutlet implements RowOutlet {
    elementRef: ElementRef;
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDeclaration<HeaderRowOutlet, "[headerRowOutlet]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HeaderRowOutlet, never>;
}

export declare function mixinHasStickyInput<T extends Constructor<{}>>(base: T): CanStickCtor & T;

export declare class NoDataRowOutlet implements RowOutlet {
    elementRef: ElementRef;
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDeclaration<NoDataRowOutlet, "[noDataRowOutlet]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NoDataRowOutlet, never>;
}

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

export declare const STICKY_POSITIONING_LISTENER: InjectionToken<StickyPositioningListener>;

export declare type StickyDirection = 'top' | 'bottom' | 'left' | 'right';

export declare type StickyOffset = number | null | undefined;

export interface StickyPositioningListener {
    stickyColumnsUpdated(update: StickyUpdate): void;
    stickyEndColumnsUpdated(update: StickyUpdate): void;
    stickyFooterRowsUpdated(update: StickyUpdate): void;
    stickyHeaderRowsUpdated(update: StickyUpdate): void;
}

export declare type StickySize = number | null | undefined;

export declare class StickyStyler {
    direction: Direction;
    constructor(_isNativeHtmlTable: boolean, _stickCellCss: string, direction: Direction, _coalescedStyleScheduler: _CoalescedStyleScheduler, _isBrowser?: boolean, _needsPositionStickyOnElement?: boolean, _positionListener?: StickyPositioningListener | undefined);
    _addStickyStyle(element: HTMLElement, dir: StickyDirection, dirValue: number, isBorderElement: boolean): void;
    _getCalculatedZIndex(element: HTMLElement): string;
    _getCellWidths(row: HTMLElement, recalculateCellWidths?: boolean): number[];
    _getStickyEndColumnPositions(widths: number[], stickyStates: boolean[]): number[];
    _getStickyStartColumnPositions(widths: number[], stickyStates: boolean[]): number[];
    _removeStickyStyle(element: HTMLElement, stickyDirections: StickyDirection[]): void;
    clearStickyPositioning(rows: HTMLElement[], stickyDirections: StickyDirection[]): void;
    stickRows(rowsToStick: HTMLElement[], stickyStates: boolean[], position: 'top' | 'bottom'): void;
    updateStickyColumns(rows: HTMLElement[], stickyStartStates: boolean[], stickyEndStates: boolean[], recalculateCellWidths?: boolean): void;
    updateStickyFooterContainer(tableElement: Element, stickyStates: boolean[]): void;
}

export interface StickyUpdate {
    elements?: readonly (HTMLElement[] | undefined)[];
    offsets?: StickyOffset[];
    sizes: StickySize[];
}

export declare const TEXT_COLUMN_OPTIONS: InjectionToken<TextColumnOptions<any>>;

export interface TextColumnOptions<T> {
    defaultDataAccessor?: (data: T, name: string) => string;
    defaultHeaderTextTransform?: (name: string) => string;
}
