export declare abstract class _MatRowHarnessBase<CellType extends (ComponentHarnessConstructor<Cell> & {
    with: (options?: CellHarnessFilters) => HarnessPredicate<Cell>;
}), Cell extends ComponentHarness & {
    getText(): Promise<string>;
    getColumnName(): Promise<string>;
}> extends ComponentHarness {
    protected abstract _cellHarness: CellType;
    getCellTextByColumnName(): Promise<MatRowHarnessColumnsText>;
    getCellTextByIndex(filter?: CellHarnessFilters): Promise<string[]>;
    getCells(filter?: CellHarnessFilters): Promise<Cell[]>;
}

export declare abstract class _MatTableHarnessBase<HeaderRowType extends (ComponentHarnessConstructor<HeaderRow> & {
    with: (options?: RowHarnessFilters) => HarnessPredicate<HeaderRow>;
}), HeaderRow extends RowBase, RowType extends (ComponentHarnessConstructor<Row> & {
    with: (options?: RowHarnessFilters) => HarnessPredicate<Row>;
}), Row extends RowBase, FooterRowType extends (ComponentHarnessConstructor<FooterRow> & {
    with: (options?: RowHarnessFilters) => HarnessPredicate<FooterRow>;
}), FooterRow extends RowBase> extends ContentContainerComponentHarness<string> {
    protected abstract _footerRowHarness: FooterRowType;
    protected abstract _headerRowHarness: HeaderRowType;
    protected abstract _rowHarness: RowType;
    getCellTextByColumnName(): Promise<MatTableHarnessColumnsText>;
    getCellTextByIndex(): Promise<string[][]>;
    getFooterRows(filter?: RowHarnessFilters): Promise<FooterRow[]>;
    getHeaderRows(filter?: RowHarnessFilters): Promise<HeaderRow[]>;
    getRows(filter?: RowHarnessFilters): Promise<Row[]>;
}

export interface CellHarnessFilters extends BaseHarnessFilters {
    columnName?: string | RegExp;
    text?: string | RegExp;
}

export declare class MatCellHarness extends ContentContainerComponentHarness {
    getColumnName(): Promise<string>;
    getText(): Promise<string>;
    static hostSelector: string;
    protected static _getCellPredicate<T extends MatCellHarness>(type: ComponentHarnessConstructor<T>, options: CellHarnessFilters): HarnessPredicate<T>;
    static with(options?: CellHarnessFilters): HarnessPredicate<MatCellHarness>;
}

export declare class MatFooterCellHarness extends MatCellHarness {
    static hostSelector: string;
    static with(options?: CellHarnessFilters): HarnessPredicate<MatFooterCellHarness>;
}

export declare class MatFooterRowHarness extends _MatRowHarnessBase<typeof MatFooterCellHarness, MatFooterCellHarness> {
    protected _cellHarness: typeof MatFooterCellHarness;
    static hostSelector: string;
    static with(options?: RowHarnessFilters): HarnessPredicate<MatFooterRowHarness>;
}

export declare class MatHeaderCellHarness extends MatCellHarness {
    static hostSelector: string;
    static with(options?: CellHarnessFilters): HarnessPredicate<MatHeaderCellHarness>;
}

export declare class MatHeaderRowHarness extends _MatRowHarnessBase<typeof MatHeaderCellHarness, MatHeaderCellHarness> {
    protected _cellHarness: typeof MatHeaderCellHarness;
    static hostSelector: string;
    static with(options?: RowHarnessFilters): HarnessPredicate<MatHeaderRowHarness>;
}

export declare class MatRowHarness extends _MatRowHarnessBase<typeof MatCellHarness, MatCellHarness> {
    protected _cellHarness: typeof MatCellHarness;
    static hostSelector: string;
    static with(options?: RowHarnessFilters): HarnessPredicate<MatRowHarness>;
}

export interface MatRowHarnessColumnsText {
    [columnName: string]: string;
}

export declare class MatTableHarness extends _MatTableHarnessBase<typeof MatHeaderRowHarness, MatHeaderRowHarness, typeof MatRowHarness, MatRowHarness, typeof MatFooterRowHarness, MatFooterRowHarness> {
    protected _footerRowHarness: typeof MatFooterRowHarness;
    protected _headerRowHarness: typeof MatHeaderRowHarness;
    protected _rowHarness: typeof MatRowHarness;
    static hostSelector: string;
    static with(options?: TableHarnessFilters): HarnessPredicate<MatTableHarness>;
}

export interface MatTableHarnessColumnsText {
    [columnName: string]: {
        text: string[];
        headerText: string[];
        footerText: string[];
    };
}

export interface RowHarnessFilters extends BaseHarnessFilters {
}

export interface TableHarnessFilters extends BaseHarnessFilters {
}
