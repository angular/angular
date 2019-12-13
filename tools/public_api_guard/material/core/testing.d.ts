export declare class MatOptgroupHarness extends ComponentHarness {
    getLabelText(): Promise<string>;
    getOptions(filter?: OptionHarnessFilters): Promise<MatOptionHarness[]>;
    isDisabled(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: OptgroupHarnessFilters): HarnessPredicate<MatOptgroupHarness>;
}

export declare class MatOptionHarness extends ComponentHarness {
    click(): Promise<void>;
    getText(): Promise<string>;
    isActive(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
    isMultiple(): Promise<boolean>;
    isSelected(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: OptionHarnessFilters): HarnessPredicate<MatOptionHarness>;
}

export interface OptgroupHarnessFilters extends BaseHarnessFilters {
    labelText?: string | RegExp;
}

export interface OptionHarnessFilters extends BaseHarnessFilters {
    isSelected?: boolean;
    text?: string | RegExp;
}
