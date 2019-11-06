export declare class MatRadioButtonHarness extends ComponentHarness {
    blur(): Promise<void>;
    check(): Promise<void>;
    focus(): Promise<void>;
    getId(): Promise<string | null>;
    getLabelText(): Promise<string>;
    getName(): Promise<string | null>;
    getValue(): Promise<string | null>;
    isChecked(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
    isRequired(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: RadioButtonHarnessFilters): HarnessPredicate<MatRadioButtonHarness>;
}

export declare class MatRadioGroupHarness extends ComponentHarness {
    checkRadioButton(filter?: RadioButtonHarnessFilters): Promise<void>;
    getCheckedRadioButton(): Promise<MatRadioButtonHarness | null>;
    getCheckedValue(): Promise<string | null>;
    getId(): Promise<string | null>;
    getName(): Promise<string | null>;
    getRadioButtons(filter?: RadioButtonHarnessFilters): Promise<MatRadioButtonHarness[]>;
    static hostSelector: string;
    static with(options?: RadioGroupHarnessFilters): HarnessPredicate<MatRadioGroupHarness>;
}

export interface RadioButtonHarnessFilters extends BaseHarnessFilters {
    label?: string | RegExp;
    name?: string;
}

export interface RadioGroupHarnessFilters extends BaseHarnessFilters {
    name?: string;
}
