export declare class MatTooltipHarness extends ComponentHarness {
    getTooltipText(): Promise<string>;
    hide(): Promise<void>;
    isOpen(): Promise<boolean>;
    show(): Promise<void>;
    static hostSelector: string;
    static with(options?: TooltipHarnessFilters): HarnessPredicate<MatTooltipHarness>;
}

export interface TooltipHarnessFilters extends BaseHarnessFilters {
}
