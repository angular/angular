export declare class MatTabGroupHarness extends ComponentHarness {
    getSelectedTab(): Promise<MatTabHarness>;
    getTabs(filter?: TabHarnessFilters): Promise<MatTabHarness[]>;
    selectTab(filter?: TabHarnessFilters): Promise<void>;
    static hostSelector: string;
    static with(options?: TabGroupHarnessFilters): HarnessPredicate<MatTabGroupHarness>;
}

export declare class MatTabHarness extends ContentContainerComponentHarness<string> {
    getAllChildLoaders(selector: string): Promise<HarnessLoader[]>;
    getAllHarnesses<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T[]>;
    getAriaLabel(): Promise<string | null>;
    getAriaLabelledby(): Promise<string | null>;
    getChildLoader(selector: string): Promise<HarnessLoader>;
    getHarness<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T>;
    getHarnessLoaderForContent(): Promise<HarnessLoader>;
    getLabel(): Promise<string>;
    getTextContent(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isSelected(): Promise<boolean>;
    select(): Promise<void>;
    static hostSelector: string;
    static with(options?: TabHarnessFilters): HarnessPredicate<MatTabHarness>;
}

export interface TabGroupHarnessFilters extends BaseHarnessFilters {
    selectedTabLabel?: string | RegExp;
}

export interface TabHarnessFilters extends BaseHarnessFilters {
    label?: string | RegExp;
}
