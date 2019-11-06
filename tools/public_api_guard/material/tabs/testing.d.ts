export declare class MatTabGroupHarness extends ComponentHarness {
    getSelectedTab(): Promise<MatTabHarness>;
    getTabs(filter?: TabHarnessFilters): Promise<MatTabHarness[]>;
    selectTab(filter?: TabHarnessFilters): Promise<void>;
    static hostSelector: string;
    static with(options?: TabGroupHarnessFilters): HarnessPredicate<MatTabGroupHarness>;
}

export declare class MatTabHarness extends ComponentHarness {
    getAriaLabel(): Promise<string | null>;
    getAriaLabelledby(): Promise<string | null>;
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
