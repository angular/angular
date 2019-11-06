export declare class MatProgressBarHarness extends ComponentHarness {
    getMode(): Promise<string | null>;
    getValue(): Promise<number | null>;
    static hostSelector: string;
    static with(options?: ProgressBarHarnessFilters): HarnessPredicate<MatProgressBarHarness>;
}

export interface ProgressBarHarnessFilters extends BaseHarnessFilters {
}
