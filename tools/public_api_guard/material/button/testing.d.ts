export interface ButtonHarnessFilters extends BaseHarnessFilters {
    text?: string | RegExp;
}

export declare class MatButtonHarness extends ComponentHarness {
    blur(): Promise<void>;
    click(relativeX: number, relativeY: number): Promise<void>;
    click(location: 'center'): Promise<void>;
    click(): Promise<void>;
    focus(): Promise<void>;
    getText(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isFocused(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: ButtonHarnessFilters): HarnessPredicate<MatButtonHarness>;
}
