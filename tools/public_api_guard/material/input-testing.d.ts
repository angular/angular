export interface InputHarnessFilters extends BaseHarnessFilters {
    placeholder?: string | RegExp;
    value?: string | RegExp;
}

export declare class MatInputHarness extends MatFormFieldControlHarness {
    blur(): Promise<void>;
    focus(): Promise<void>;
    getId(): Promise<string>;
    getName(): Promise<string>;
    getPlaceholder(): Promise<string>;
    getType(): Promise<string>;
    getValue(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isFocused(): Promise<boolean>;
    isReadonly(): Promise<boolean>;
    isRequired(): Promise<boolean>;
    setValue(newValue: string): Promise<void>;
    static hostSelector: string;
    static with(options?: InputHarnessFilters): HarnessPredicate<MatInputHarness>;
}

export declare class MatNativeOptionHarness extends ComponentHarness {
    getIndex(): Promise<number>;
    getText(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isSelected(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: NativeOptionHarnessFilters): HarnessPredicate<MatNativeOptionHarness>;
}

export declare class MatNativeSelectHarness extends MatFormFieldControlHarness {
    blur(): Promise<void>;
    focus(): Promise<void>;
    getId(): Promise<string>;
    getName(): Promise<string>;
    getOptions(filter?: NativeOptionHarnessFilters): Promise<MatNativeOptionHarness[]>;
    isDisabled(): Promise<boolean>;
    isFocused(): Promise<boolean>;
    isMultiple(): Promise<boolean>;
    isRequired(): Promise<boolean>;
    selectOptions(filter?: NativeOptionHarnessFilters): Promise<void>;
    static hostSelector: string;
    static with(options?: NativeSelectHarnessFilters): HarnessPredicate<MatNativeSelectHarness>;
}

export interface NativeOptionHarnessFilters extends BaseHarnessFilters {
    index?: number;
    isSelected?: boolean;
    text?: string | RegExp;
}

export interface NativeSelectHarnessFilters extends BaseHarnessFilters {
}
