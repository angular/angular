export declare abstract class _MatSelectHarnessBase<OptionType extends (ComponentHarnessConstructor<Option> & {
    with: (options?: OptionFilters) => HarnessPredicate<Option>;
}), Option extends ComponentHarness & {
    click(): Promise<void>;
}, OptionFilters extends BaseHarnessFilters, OptionGroupType extends (ComponentHarnessConstructor<OptionGroup> & {
    with: (options?: OptionGroupFilters) => HarnessPredicate<OptionGroup>;
}), OptionGroup extends ComponentHarness, OptionGroupFilters extends BaseHarnessFilters> extends MatFormFieldControlHarness {
    protected abstract _optionClass: OptionType;
    protected abstract _optionGroupClass: OptionGroupType;
    protected abstract _prefix: string;
    blur(): Promise<void>;
    clickOptions(filter?: OptionFilters): Promise<void>;
    close(): Promise<void>;
    focus(): Promise<void>;
    getOptionGroups(filter?: Omit<OptionGroupFilters, 'ancestor'>): Promise<OptionGroup[]>;
    getOptions(filter?: Omit<OptionFilters, 'ancestor'>): Promise<Option[]>;
    getValueText(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isEmpty(): Promise<boolean>;
    isFocused(): Promise<boolean>;
    isMultiple(): Promise<boolean>;
    isOpen(): Promise<boolean>;
    isRequired(): Promise<boolean>;
    isValid(): Promise<boolean>;
    open(): Promise<void>;
}

export declare class MatSelectHarness extends _MatSelectHarnessBase<typeof MatOptionHarness, MatOptionHarness, OptionHarnessFilters, typeof MatOptgroupHarness, MatOptgroupHarness, OptgroupHarnessFilters> {
    protected _optionClass: typeof MatOptionHarness;
    protected _optionGroupClass: typeof MatOptgroupHarness;
    protected _prefix: string;
    static hostSelector: string;
    static with(options?: SelectHarnessFilters): HarnessPredicate<MatSelectHarness>;
}

export interface SelectHarnessFilters extends BaseHarnessFilters {
}
