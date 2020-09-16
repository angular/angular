export interface DialogHarnessFilters extends BaseHarnessFilters {
}

export declare class MatDialogHarness extends ContentContainerComponentHarness<string> {
    close(): Promise<void>;
    getAriaDescribedby(): Promise<string | null>;
    getAriaLabel(): Promise<string | null>;
    getAriaLabelledby(): Promise<string | null>;
    getId(): Promise<string | null>;
    getRole(): Promise<DialogRole | null>;
    static hostSelector: string;
    static with(options?: DialogHarnessFilters): HarnessPredicate<MatDialogHarness>;
}
