export declare class MatSnackBarHarness extends ContentContainerComponentHarness<string> {
    protected _actionButtonSelector: string;
    protected _messageSelector: string;
    protected _simpleSnackBarSelector: string;
    dismissWithAction(): Promise<void>;
    getActionDescription(): Promise<string>;
    getAriaLive(): Promise<AriaLivePoliteness>;
    getMessage(): Promise<string>;
    getRole(): Promise<'alert' | 'status' | null>;
    hasAction(): Promise<boolean>;
    isDismissed(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: SnackBarHarnessFilters): HarnessPredicate<MatSnackBarHarness>;
}

export interface SnackBarHarnessFilters extends BaseHarnessFilters {
}
