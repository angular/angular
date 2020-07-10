export interface CardHarnessFilters extends BaseHarnessFilters {
    subtitle?: string | RegExp;
    text?: string | RegExp;
    title?: string | RegExp;
}

export declare class MatCardHarness extends ComponentHarness implements HarnessLoader {
    getAllChildLoaders(selector: string): Promise<HarnessLoader[]>;
    getAllHarnesses<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T[]>;
    getChildLoader(selector: string): Promise<HarnessLoader>;
    getHarness<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T>;
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
