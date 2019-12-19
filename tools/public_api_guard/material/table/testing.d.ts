export interface CellHarnessFilters extends BaseHarnessFilters {
    text?: string | RegExp;
}

export declare class MatCellHarness extends ComponentHarness {
    getColumnName(): Promise<string>;
    getText(): Promise<string>;
    static hostSelector: string;
    static with(options?: CellHarnessFilters): HarnessPredicate<MatCellHarness>;
}

export declare class MatFooterCellHarness extends MatCellHarness {
    static hostSelector: string;
    static with(options?: CellHarnessFilters): HarnessPredicate<MatFooterCellHarness>;
}

export declare class MatFooterRowHarness extends ComponentHarness {
    getCellTextByIndex(filter?: CellHarnessFilters): Promise<string[]>;
    getCells(filter?: CellHarnessFilters): Promise<MatFooterCellHarness[]>;
    static hostSelector: string;
    static with(options?: RowHarnessFilters): HarnessPredicate<MatFooterRowHarness>;
}

export declare class MatHeaderCellHarness extends MatCellHarness {
    static hostSelector: string;
    static with(options?: CellHarnessFilters): HarnessPredicate<MatHeaderCellHarness>;
}

export declare class MatHeaderRowHarness extends ComponentHarness {
    getCellTextByIndex(filter?: CellHarnessFilters): Promise<string[]>;
    getCells(filter?: CellHarnessFilters): Promise<MatHeaderCellHarness[]>;
    static hostSelector: string;
    static with(options?: RowHarnessFilters): HarnessPredicate<MatHeaderRowHarness>;
}

export declare class MatRowHarness extends ComponentHarness {
    getCellTextByIndex(filter?: CellHarnessFilters): Promise<string[]>;
    getCells(filter?: CellHarnessFilters): Promise<MatCellHarness[]>;
    static hostSelector: string;
    static with(options?: RowHarnessFilters): HarnessPredicate<MatRowHarness>;
}

export declare class MatTableHarness extends ComponentHarness {
    getCellTextByColumnName(): Promise<MatTableHarnessColumnsText>;
    getCellTextByIndex(): Promise<string[][]>;
    getFooterRows(filter?: RowHarnessFilters): Promise<MatFooterRowHarness[]>;
    getHeaderRows(filter?: RowHarnessFilters): Promise<MatHeaderRowHarness[]>;
    getRows(filter?: RowHarnessFilters): Promise<MatRowHarness[]>;
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
