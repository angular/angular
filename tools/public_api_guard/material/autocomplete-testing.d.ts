export declare abstract class _MatAutocompleteHarnessBase<OptionType extends (ComponentHarnessConstructor<Option> & {
    with: (options?: OptionFilters) => HarnessPredicate<Option>;
}), Option extends ComponentHarness & {
    click(): Promise<void>;
}, OptionFilters extends BaseHarnessFilters, OptionGroupType extends (ComponentHarnessConstructor<OptionGroup> & {
    with: (options?: OptionGroupFilters) => HarnessPredicate<OptionGroup>;
}), OptionGroup extends ComponentHarness, OptionGroupFilters extends BaseHarnessFilters> extends ComponentHarness {
    protected abstract _optionClass: OptionType;
    protected abstract _optionGroupClass: OptionGroupType;
    protected abstract _prefix: string;
    blur(): Promise<void>;
    enterText(value: string): Promise<void>;
    focus(): Promise<void>;
    getOptionGroups(filters?: Omit<OptionGroupFilters, 'ancestor'>): Promise<OptionGroup[]>;
    getOptions(filters?: Omit<OptionFilters, 'ancestor'>): Promise<Option[]>;
    getValue(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isFocused(): Promise<boolean>;
    isOpen(): Promise<boolean>;
    selectOption(filters: OptionFilters): Promise<void>;
}

export interface AutocompleteHarnessFilters extends BaseHarnessFilters {
    value?: string | RegExp;
}

export declare class MatAutocompleteHarness extends _MatAutocompleteHarnessBase<typeof MatOptionHarness, MatOptionHarness, OptionHarnessFilters, typeof MatOptgroupHarness, MatOptgroupHarness, OptgroupHarnessFilters> {
    protected _optionClass: typeof MatOptionHarness;
    protected _optionGroupClass: typeof MatOptgroupHarness;
    protected _prefix: string;
    static hostSelector: string;
    static with(options?: AutocompleteHarnessFilters): HarnessPredicate<MatAutocompleteHarness>;
}
