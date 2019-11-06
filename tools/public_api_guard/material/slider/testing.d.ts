export declare class MatSliderHarness extends ComponentHarness {
    blur(): Promise<void>;
    focus(): Promise<void>;
    getDisplayValue(): Promise<string | null>;
    getId(): Promise<string | null>;
    getMaxValue(): Promise<number>;
    getMinValue(): Promise<number>;
    getOrientation(): Promise<'horizontal' | 'vertical'>;
    getPercentage(): Promise<number>;
    getValue(): Promise<number>;
    isDisabled(): Promise<boolean>;
    setValue(value: number): Promise<void>;
    static hostSelector: string;
    static with(options?: SliderHarnessFilters): HarnessPredicate<MatSliderHarness>;
}

export interface SliderHarnessFilters extends BaseHarnessFilters {
}
