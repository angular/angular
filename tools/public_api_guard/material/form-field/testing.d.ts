export declare abstract class _MatFormFieldHarnessBase<ControlHarness extends MatFormFieldControlHarness> extends ComponentHarness {
    protected abstract _errors: AsyncFactoryFn<TestElement[]>;
    protected abstract _hints: AsyncFactoryFn<TestElement[]>;
    protected abstract _inputControl: AsyncFactoryFn<ControlHarness | null>;
    protected abstract _label: AsyncFactoryFn<TestElement | null>;
    protected abstract _prefixContainer: AsyncFactoryFn<TestElement | null>;
    protected abstract _selectControl: AsyncFactoryFn<ControlHarness | null>;
    protected abstract _suffixContainer: AsyncFactoryFn<TestElement | null>;
    abstract getAppearance(): Promise<string>;
    getControl(): Promise<ControlHarness | null>;
    getControl<X extends MatFormFieldControlHarness>(type: ComponentHarnessConstructor<X>): Promise<X | null>;
    getControl<X extends MatFormFieldControlHarness>(type: HarnessPredicate<X>): Promise<X | null>;
    getHarnessLoaderForPrefix(): Promise<TestElement | null>;
    getHarnessLoaderForSuffix(): Promise<TestElement | null>;
    getLabel(): Promise<string | null>;
    getPrefixText(): Promise<string>;
    getSuffixText(): Promise<string>;
    getTextErrors(): Promise<string[]>;
    getTextHints(): Promise<string[]>;
    getThemeColor(): Promise<'primary' | 'accent' | 'warn'>;
    hasErrors(): Promise<boolean>;
    abstract hasLabel(): Promise<boolean>;
    isAutofilled(): Promise<boolean>;
    isControlDirty(): Promise<boolean | null>;
    isControlPending(): Promise<boolean | null>;
    isControlTouched(): Promise<boolean | null>;
    isControlValid(): Promise<boolean | null>;
    isDisabled(): Promise<boolean>;
    abstract isLabelFloating(): Promise<boolean>;
}

export declare type FormFieldControlHarness = MatInputHarness | MatSelectHarness;

export interface FormFieldHarnessFilters extends BaseHarnessFilters {
    floatingLabelText?: string | RegExp;
    hasErrors?: boolean;
}

export declare class MatFormFieldHarness extends _MatFormFieldHarnessBase<FormFieldControlHarness> {
    protected _errors: AsyncFactoryFn<TestElement[]>;
    protected _hints: AsyncFactoryFn<TestElement[]>;
    protected _inputControl: AsyncFactoryFn<MatInputHarness | null>;
    protected _label: AsyncFactoryFn<TestElement | null>;
    protected _prefixContainer: AsyncFactoryFn<TestElement | null>;
    protected _selectControl: AsyncFactoryFn<MatSelectHarness | null>;
    protected _suffixContainer: AsyncFactoryFn<TestElement | null>;
    getAppearance(): Promise<'legacy' | 'standard' | 'fill' | 'outline'>;
    hasLabel(): Promise<boolean>;
    isLabelFloating(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: FormFieldHarnessFilters): HarnessPredicate<MatFormFieldHarness>;
}
