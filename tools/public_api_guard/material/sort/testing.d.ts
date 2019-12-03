export declare class MatSortHarness extends ComponentHarness {
    getActiveHeader(): Promise<MatSortHeaderHarness | null>;
    getSortHeaders(filter?: SortHeaderHarnessFilters): Promise<MatSortHeaderHarness[]>;
    static hostSelector: string;
    static with(options?: SortHarnessFilters): HarnessPredicate<MatSortHarness>;
}

export declare class MatSortHeaderHarness extends ComponentHarness {
    click(): Promise<void>;
    getAriaLabel(): Promise<string | null>;
    getLabel(): Promise<string>;
    getSortDirection(): Promise<SortDirection>;
    isActive(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: SortHeaderHarnessFilters): HarnessPredicate<MatSortHeaderHarness>;
}

export interface SortHarnessFilters extends BaseHarnessFilters {
}

export interface SortHeaderHarnessFilters extends BaseHarnessFilters {
    label?: string | RegExp;
    sortDirection?: SortDirection;
}
