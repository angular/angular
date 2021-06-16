export interface BadgeHarnessFilters extends BaseHarnessFilters {
    text?: string | RegExp;
}

export declare class MatBadgeHarness extends ComponentHarness {
    getPosition(): Promise<MatBadgePosition>;
    getSize(): Promise<MatBadgeSize>;
    getText(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isHidden(): Promise<boolean>;
    isOverlapping(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: BadgeHarnessFilters): HarnessPredicate<MatBadgeHarness>;
}
