export declare abstract class _MatRadioButtonHarnessBase extends ComponentHarness {
    protected abstract _clickLabel: AsyncFactoryFn<TestElement>;
    protected abstract _textLabel: AsyncFactoryFn<TestElement>;
    blur(): Promise<void>;
    check(): Promise<void>;
    focus(): Promise<void>;
    getId(): Promise<string | null>;
    getLabelText(): Promise<string>;
    getName(): Promise<string | null>;
    getValue(): Promise<string | null>;
    isChecked(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
    isFocused(): Promise<boolean>;
    isRequired(): Promise<boolean>;
}

export declare abstract class _MatRadioGroupHarnessBase<ButtonType extends (ComponentHarnessConstructor<Button> & {
    with: (options?: ButtonFilters) => HarnessPredicate<Button>;
}), Button extends ComponentHarness & {
    isChecked(): Promise<boolean>;
    getValue(): Promise<string | null>;
    getName(): Promise<string | null>;
    check(): Promise<void>;
}, ButtonFilters extends BaseHarnessFilters> extends ComponentHarness {
    protected abstract _buttonClass: ButtonType;
    checkRadioButton(filter?: ButtonFilters): Promise<void>;
    getCheckedRadioButton(): Promise<Button | null>;
    getCheckedValue(): Promise<string | null>;
    getId(): Promise<string | null>;
    getName(): Promise<string | null>;
    getRadioButtons(filter?: ButtonFilters): Promise<Button[]>;
    protected static _checkRadioGroupName(harness: _MatRadioGroupHarnessBase<any, any, any>, name: string): Promise<boolean>;
}

export declare class MatRadioButtonHarness extends _MatRadioButtonHarnessBase {
    protected _clickLabel: AsyncFactoryFn<TestElement>;
    protected _textLabel: AsyncFactoryFn<TestElement>;
    static hostSelector: string;
    static with(options?: RadioButtonHarnessFilters): HarnessPredicate<MatRadioButtonHarness>;
}

export declare class MatRadioGroupHarness extends _MatRadioGroupHarnessBase<typeof MatRadioButtonHarness, MatRadioButtonHarness, RadioButtonHarnessFilters> {
    protected _buttonClass: typeof MatRadioButtonHarness;
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
