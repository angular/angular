export interface ButtonToggleGroupHarnessFilters extends BaseHarnessFilters {
}

export interface ButtonToggleHarnessFilters extends BaseHarnessFilters {
    checked?: boolean;
    name?: string | RegExp;
    text?: string | RegExp;
}

export declare class MatButtonToggleGroupHarness extends ComponentHarness {
    getAppearance(): Promise<MatButtonToggleAppearance>;
    getToggles(filter?: ButtonToggleHarnessFilters): Promise<MatButtonToggleHarness[]>;
    isDisabled(): Promise<boolean>;
    isVertical(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: ButtonToggleGroupHarnessFilters): HarnessPredicate<MatButtonToggleGroupHarness>;
}

export declare class MatButtonToggleHarness extends ComponentHarness {
    blur(): Promise<void>;
    check(): Promise<void>;
    focus(): Promise<void>;
    getAppearance(): Promise<MatButtonToggleAppearance>;
    getAriaLabel(): Promise<string | null>;
    getAriaLabelledby(): Promise<string | null>;
    getName(): Promise<string | null>;
    getText(): Promise<string>;
    isChecked(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
    toggle(): Promise<void>;
    uncheck(): Promise<void>;
    static hostSelector: string;
    static with(options?: ButtonToggleHarnessFilters): HarnessPredicate<MatButtonToggleHarness>;
}
