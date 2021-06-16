export declare class MatTabGroupHarness extends ComponentHarness {
    getSelectedTab(): Promise<MatTabHarness>;
    getTabs(filter?: TabHarnessFilters): Promise<MatTabHarness[]>;
    selectTab(filter?: TabHarnessFilters): Promise<void>;
    static hostSelector: string;
    static with(options?: TabGroupHarnessFilters): HarnessPredicate<MatTabGroupHarness>;
}

export declare class MatTabHarness extends ContentContainerComponentHarness<string> {
    getAriaLabel(): Promise<string | null>;
    getAriaLabelledby(): Promise<string | null>;
    getHarnessLoaderForContent(): Promise<HarnessLoader>;
    getLabel(): Promise<string>;
    protected getRootHarnessLoader(): Promise<HarnessLoader>;
    getTextContent(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isSelected(): Promise<boolean>;
    select(): Promise<void>;
    static hostSelector: string;
    static with(options?: TabHarnessFilters): HarnessPredicate<MatTabHarness>;
}

export declare class MatTabLinkHarness extends ComponentHarness {
    click(): Promise<void>;
    getLabel(): Promise<string>;
    isActive(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: TabLinkHarnessFilters): HarnessPredicate<MatTabLinkHarness>;
}

export declare class MatTabNavBarHarness extends ComponentHarness {
    clickLink(filter?: TabLinkHarnessFilters): Promise<void>;
    getActiveLink(): Promise<MatTabLinkHarness>;
    getLinks(filter?: TabLinkHarnessFilters): Promise<MatTabLinkHarness[]>;
    static hostSelector: string;
    static with(options?: TabNavBarHarnessFilters): HarnessPredicate<MatTabNavBarHarness>;
}

export interface TabGroupHarnessFilters extends BaseHarnessFilters {
    selectedTabLabel?: string | RegExp;
}

export interface TabHarnessFilters extends BaseHarnessFilters {
    label?: string | RegExp;
}

export interface TabLinkHarnessFilters extends BaseHarnessFilters {
    label?: string | RegExp;
}

export interface TabNavBarHarnessFilters extends BaseHarnessFilters {
}
