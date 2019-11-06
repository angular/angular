export interface CheckboxHarnessFilters extends BaseHarnessFilters {
    label?: string | RegExp;
    name?: string;
}

export declare class MatCheckboxHarness extends ComponentHarness {
    blur(): Promise<void>;
    check(): Promise<void>;
    focus(): Promise<void>;
    getAriaLabel(): Promise<string | null>;
    getAriaLabelledby(): Promise<string | null>;
    getLabelText(): Promise<string>;
    getName(): Promise<string | null>;
    getValue(): Promise<string | null>;
    isChecked(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
    isIndeterminate(): Promise<boolean>;
    isRequired(): Promise<boolean>;
    isValid(): Promise<boolean>;
    toggle(): Promise<void>;
    uncheck(): Promise<void>;
    static hostSelector: string;
    static with(options?: CheckboxHarnessFilters): HarnessPredicate<MatCheckboxHarness>;
}
