export declare class MatSelectHarness extends MatFormFieldControlHarness {
    blur(): Promise<void>;
    clickOptions(filter?: OptionHarnessFilters): Promise<void>;
    close(): Promise<void>;
    focus(): Promise<void>;
    getOptionGroups(filter?: Omit<OptgroupHarnessFilters, 'ancestor'>): Promise<MatOptgroupHarness[]>;
    getOptions(filter?: Omit<OptionHarnessFilters, 'ancestor'>): Promise<MatOptionHarness[]>;
    getValueText(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isEmpty(): Promise<boolean>;
    isMultiple(): Promise<boolean>;
    isOpen(): Promise<boolean>;
    isRequired(): Promise<boolean>;
    isValid(): Promise<boolean>;
    open(): Promise<void>;
    static hostSelector: string;
    static with(options?: SelectHarnessFilters): HarnessPredicate<MatSelectHarness>;
}

export interface SelectHarnessFilters extends BaseHarnessFilters {
}
