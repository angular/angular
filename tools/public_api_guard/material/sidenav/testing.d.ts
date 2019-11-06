export interface DrawerHarnessFilters extends BaseHarnessFilters {
    position?: 'start' | 'end';
}

export declare class MatDrawerHarness extends ComponentHarness {
    getMode(): Promise<'over' | 'push' | 'side'>;
    getPosition(): Promise<'start' | 'end'>;
    isOpen(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: DrawerHarnessFilters): HarnessPredicate<MatDrawerHarness>;
}

export declare class MatSidenavHarness extends MatDrawerHarness {
    isFixedInViewport(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: DrawerHarnessFilters): HarnessPredicate<MatDrawerHarness>;
}
