export interface DividerHarnessFilters extends BaseHarnessFilters {
}

export declare class MatDividerHarness extends ComponentHarness {
    getOrientation(): Promise<'horizontal' | 'vertical'>;
    isInset(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: DividerHarnessFilters): HarnessPredicate<MatDividerHarness>;
}
