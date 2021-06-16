export declare abstract class _MatCheckboxHarnessBase extends ComponentHarness {
    protected abstract _input: AsyncFactoryFn<TestElement>;
    protected abstract _label: AsyncFactoryFn<TestElement>;
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
    isFocused(): Promise<boolean>;
    isIndeterminate(): Promise<boolean>;
    isRequired(): Promise<boolean>;
    isValid(): Promise<boolean>;
    abstract toggle(): Promise<void>;
    uncheck(): Promise<void>;
}

export interface CheckboxHarnessFilters extends BaseHarnessFilters {
    label?: string | RegExp;
    name?: string;
}

export declare class MatCheckboxHarness extends _MatCheckboxHarnessBase {
    protected _input: AsyncFactoryFn<TestElement>;
    protected _label: AsyncFactoryFn<TestElement>;
    toggle(): Promise<void>;
    static hostSelector: string;
    static with(options?: CheckboxHarnessFilters): HarnessPredicate<MatCheckboxHarness>;
}
