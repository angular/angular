export interface BottomSheetHarnessFilters extends BaseHarnessFilters {
}

export declare class MatBottomSheetHarness extends ContentContainerComponentHarness<string> {
    dismiss(): Promise<void>;
    getAriaLabel(): Promise<string | null>;
    static hostSelector: string;
    static with(options?: BottomSheetHarnessFilters): HarnessPredicate<MatBottomSheetHarness>;
}
