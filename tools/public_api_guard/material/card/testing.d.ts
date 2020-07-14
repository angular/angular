export interface CardHarnessFilters extends BaseHarnessFilters {
    subtitle?: string | RegExp;
    text?: string | RegExp;
    title?: string | RegExp;
}

export declare class MatCardHarness extends ContentContainerComponentHarness<MatCardSection> {
    getSubtitleText(): Promise<string>;
    getText(): Promise<string>;
    getTitleText(): Promise<string>;
    static hostSelector: string;
    static with(options?: CardHarnessFilters): HarnessPredicate<MatCardHarness>;
}

export declare const enum MatCardSection {
    HEADER = ".mat-card-header",
    CONTENT = ".mat-card-content",
    ACTIONS = ".mat-card-actions",
    FOOTER = ".mat-card-footer"
}
