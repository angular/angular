export interface GridListHarnessFilters extends BaseHarnessFilters {
}

export interface GridTileHarnessFilters extends BaseHarnessFilters {
    footerText?: string | RegExp;
    headerText?: string | RegExp;
}

export declare class MatGridListHarness extends ComponentHarness {
    getColumns(): Promise<number>;
    getTileAtPosition({ row, column }: {
        row: number;
        column: number;
    }): Promise<MatGridTileHarness>;
    getTiles(filters?: GridTileHarnessFilters): Promise<MatGridTileHarness[]>;
    static hostSelector: string;
    static with(options?: GridListHarnessFilters): HarnessPredicate<MatGridListHarness>;
}

export declare class MatGridTileHarness extends ComponentHarness {
    getColspan(): Promise<number>;
    getFooterText(): Promise<string | null>;
    getHeaderText(): Promise<string | null>;
    getRowspan(): Promise<number>;
    hasAvatar(): Promise<boolean>;
    hasFooter(): Promise<boolean>;
    hasHeader(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: GridTileHarnessFilters): HarnessPredicate<MatGridTileHarness>;
}
