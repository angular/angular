export declare const _CdkColumnDefBase: CanStickCtor & typeof CdkColumnDefBase;

export declare const _CdkFooterRowDefBase: CanStickCtor & typeof CdkFooterRowDefBase;

export declare const _CdkHeaderRowDefBase: CanStickCtor & typeof CdkHeaderRowDefBase;

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
}

export declare class CdkCellDef implements CellDef {
    template: TemplateRef<any>;
    constructor(/** @docs-private */ template: TemplateRef<any>);
}

export declare class CdkCellOutlet implements OnDestroy {
    _viewContainer: ViewContainerRef;
    cells: CdkCellDef[];
    context: any;
    constructor(_viewContainer: ViewContainerRef);
    ngOnDestroy(): void;
    static mostRecentCellOutlet: CdkCellOutlet | null;
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
}

export declare class CdkColumnDefBase {
}

export declare class CdkFooterCell extends BaseCdkCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef);
}

export declare class CdkFooterCellDef implements CellDef {
    template: TemplateRef<any>;
    constructor(/** @docs-private */ template: TemplateRef<any>);
}

export declare class CdkFooterRow {
}

export declare class CdkFooterRowDef extends _CdkFooterRowDefBase implements CanStick, OnChanges {
    constructor(template: TemplateRef<any>, _differs: IterableDiffers);
    ngOnChanges(changes: SimpleChanges): void;
}

export declare class CdkFooterRowDefBase extends BaseRowDef {
}

export declare class CdkHeaderCell extends BaseCdkCell {
    constructor(columnDef: CdkColumnDef, elementRef: ElementRef);
}

export declare class CdkHeaderCellDef implements CellDef {
    template: TemplateRef<any>;
    constructor(/** @docs-private */ template: TemplateRef<any>);
}

export declare class CdkHeaderRow {
}

export declare class CdkHeaderRowDef extends _CdkHeaderRowDefBase implements CanStick, OnChanges {
    constructor(template: TemplateRef<any>, _differs: IterableDiffers);
    ngOnChanges(changes: SimpleChanges): void;
}

export declare class CdkHeaderRowDefBase extends BaseRowDef {
}

export declare class CdkRow {
}

export declare class CdkRowDef<T> extends BaseRowDef {
    when: (index: number, rowData: T) => boolean;
    constructor(template: TemplateRef<any>, _differs: IterableDiffers);
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
    constructor(_differs: IterableDiffers, _changeDetectorRef: ChangeDetectorRef, _elementRef: ElementRef, role: string, _dir: Directionality,
    _document?: any, _platform?: Platform | undefined);
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
}

export declare class CdkTableModule {
}

export interface CellDef {
    template: TemplateRef<any>;
}

export declare type Constructor<T> = new (...args: any[]) => T;

export declare class DataRowOutlet implements RowOutlet {
    elementRef: ElementRef;
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef, elementRef: ElementRef);
}

export declare class FooterRowOutlet implements RowOutlet {
    elementRef: ElementRef;
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef, elementRef: ElementRef);
}

export declare class HeaderRowOutlet implements RowOutlet {
    elementRef: ElementRef;
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef, elementRef: ElementRef);
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
    constructor(isNativeHtmlTable: boolean, stickCellCss: string, direction: Direction, _isBrowser?: boolean);
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
