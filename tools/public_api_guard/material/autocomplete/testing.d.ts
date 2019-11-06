export interface AutocompleteHarnessFilters extends BaseHarnessFilters {
    value?: string | RegExp;
}

export declare class MatAutocompleteHarness extends ComponentHarness {
    blur(): Promise<void>;
    enterText(value: string): Promise<void>;
    focus(): Promise<void>;
    getOptionGroups(filters?: OptionGroupHarnessFilters): Promise<MatAutocompleteOptionGroupHarness[]>;
    getOptions(filters?: OptionHarnessFilters): Promise<MatAutocompleteOptionHarness[]>;
    getValue(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isOpen(): Promise<boolean>;
    selectOption(filters: OptionHarnessFilters): Promise<void>;
    static hostSelector: string;
    static with(options?: AutocompleteHarnessFilters): HarnessPredicate<MatAutocompleteHarness>;
}
