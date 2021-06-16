export declare abstract class _MatTooltipHarnessBase extends ComponentHarness {
    protected abstract _optionalPanel: AsyncFactoryFn<TestElement | null>;
    getTooltipText(): Promise<string>;
    hide(): Promise<void>;
    isOpen(): Promise<boolean>;
    show(): Promise<void>;
}

export declare class MatTooltipHarness extends _MatTooltipHarnessBase {
    protected _optionalPanel: AsyncFactoryFn<TestElement | null>;
    static hostSelector: string;
    static with(options?: TooltipHarnessFilters): HarnessPredicate<MatTooltipHarness>;
}

export interface TooltipHarnessFilters extends BaseHarnessFilters {
}
