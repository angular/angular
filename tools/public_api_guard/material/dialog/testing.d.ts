export interface DialogHarnessFilters extends BaseHarnessFilters {
}

export declare class MatDialogHarness extends ComponentHarness {
    close(): Promise<void>;
    getAriaDescribedby(): Promise<string | null>;
    getAriaLabel(): Promise<string | null>;
    getAriaLabelledby(): Promise<string | null>;
    getId(): Promise<string | null>;
    getRole(): Promise<DialogRole | null>;
    static hostSelector: string;
    static with(options?: DialogHarnessFilters): HarnessPredicate<MatDialogHarness>;
}
