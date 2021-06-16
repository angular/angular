export declare class MatProgressSpinnerHarness extends ComponentHarness {
    getMode(): Promise<ProgressSpinnerMode>;
    getValue(): Promise<number | null>;
    static hostSelector: string;
    static with(options?: ProgressSpinnerHarnessFilters): HarnessPredicate<MatProgressSpinnerHarness>;
}

export interface ProgressSpinnerHarnessFilters extends BaseHarnessFilters {
}
