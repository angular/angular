export declare class MatToolbarHarness extends ContentContainerComponentHarness<MatToolbarSection> {
    getRowsAsText(): Promise<string[]>;
    hasMultipleRows(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: ToolbarHarnessFilters): HarnessPredicate<MatToolbarHarness>;
}

export declare const enum MatToolbarSection {
    ROW = ".mat-toolbar-row"
}

export interface ToolbarHarnessFilters extends BaseHarnessFilters {
    text?: string | RegExp;
}
