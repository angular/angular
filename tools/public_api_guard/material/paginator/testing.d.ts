export declare abstract class _MatPaginatorHarnessBase extends ComponentHarness {
    protected abstract _firstPageButton: AsyncFactoryFn<TestElement | null>;
    protected abstract _lastPageButton: AsyncFactoryFn<TestElement | null>;
    protected abstract _nextButton: AsyncFactoryFn<TestElement>;
    protected abstract _pageSizeFallback: AsyncFactoryFn<TestElement>;
    protected abstract _previousButton: AsyncFactoryFn<TestElement>;
    protected abstract _rangeLabel: AsyncFactoryFn<TestElement>;
    protected abstract _select: AsyncFactoryFn<(ComponentHarness & {
        getValueText(): Promise<string>;
        clickOptions(...filters: unknown[]): Promise<void>;
    }) | null>;
    getPageSize(): Promise<number>;
    getRangeLabel(): Promise<string>;
    goToFirstPage(): Promise<void>;
    goToLastPage(): Promise<void>;
    goToNextPage(): Promise<void>;
    goToPreviousPage(): Promise<void>;
    setPageSize(size: number): Promise<void>;
}

export declare class MatPaginatorHarness extends _MatPaginatorHarnessBase {
    protected _firstPageButton: AsyncFactoryFn<TestElement | null>;
    protected _lastPageButton: AsyncFactoryFn<TestElement | null>;
    protected _nextButton: AsyncFactoryFn<TestElement>;
    protected _pageSizeFallback: AsyncFactoryFn<TestElement>;
    protected _previousButton: AsyncFactoryFn<TestElement>;
    protected _rangeLabel: AsyncFactoryFn<TestElement>;
    protected _select: AsyncFactoryFn<MatSelectHarness | null>;
    static hostSelector: string;
    static with(options?: PaginatorHarnessFilters): HarnessPredicate<MatPaginatorHarness>;
}

export interface PaginatorHarnessFilters extends BaseHarnessFilters {
}
