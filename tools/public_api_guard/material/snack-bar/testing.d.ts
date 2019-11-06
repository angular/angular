export declare class MatSnackBarHarness extends ComponentHarness {
    dismissWithAction(): Promise<void>;
    getActionDescription(): Promise<string>;
    getMessage(): Promise<string>;
    getRole(): Promise<'alert' | 'status' | null>;
    hasAction(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: SnackBarHarnessFilters): HarnessPredicate<MatSnackBarHarness>;
}

export interface SnackBarHarnessFilters extends BaseHarnessFilters {
}
