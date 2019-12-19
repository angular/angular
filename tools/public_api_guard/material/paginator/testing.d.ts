export declare class MatPaginatorHarness extends ComponentHarness {
    getPageSize(): Promise<number>;
    getRangeLabel(): Promise<string>;
    goToFirstPage(): Promise<void>;
    goToLastPage(): Promise<void>;
    goToNextPage(): Promise<void>;
    goToPreviousPage(): Promise<void>;
    setPageSize(size: number): Promise<void>;
    static hostSelector: string;
    static with(options?: PaginatorHarnessFilters): HarnessPredicate<MatPaginatorHarness>;
}

export interface PaginatorHarnessFilters extends BaseHarnessFilters {
}
