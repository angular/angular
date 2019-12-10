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
    isReadonly(): Promise<boolean>;
    isRequired(): Promise<boolean>;
    setValue(newValue: string): Promise<void>;
    static hostSelector: string;
    static with(options?: InputHarnessFilters): HarnessPredicate<MatInputHarness>;
}
