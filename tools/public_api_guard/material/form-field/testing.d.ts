export declare type FormFieldControlHarness = MatInputHarness | MatSelectHarness;

export interface FormFieldHarnessFilters extends BaseHarnessFilters {
    floatingLabelText?: string | RegExp;
    hasErrors?: boolean;
}

export declare class MatFormFieldHarness extends ComponentHarness {
    getAppearance(): Promise<'legacy' | 'standard' | 'fill' | 'outline'>;
    getControl(): Promise<FormFieldControlHarness | null>;
    getControl<X extends MatFormFieldControlHarness>(type: ComponentHarnessConstructor<X>): Promise<X | null>;
    getControl<X extends MatFormFieldControlHarness>(type: HarnessPredicate<X>): Promise<X | null>;
    getHarnessLoaderForPrefix(): Promise<TestElement | null>;
    getHarnessLoaderForSuffix(): Promise<TestElement | null>;
    getLabel(): Promise<string | null>;
    getTextErrors(): Promise<string[]>;
    getTextHints(): Promise<string[]>;
    getThemeColor(): Promise<'primary' | 'accent' | 'warn'>;
    hasErrors(): Promise<boolean>;
    hasFloatingLabel(): Promise<boolean>;
    hasLabel(): Promise<boolean>;
    isAutofilled(): Promise<boolean>;
    isControlDirty(): Promise<boolean | null>;
    isControlPending(): Promise<boolean | null>;
    isControlTouched(): Promise<boolean | null>;
    isControlValid(): Promise<boolean | null>;
    isDisabled(): Promise<boolean>;
    isLabelFloating(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: FormFieldHarnessFilters): HarnessPredicate<MatFormFieldHarness>;
}
