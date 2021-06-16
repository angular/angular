export interface DrawerContainerHarnessFilters extends BaseHarnessFilters {
}

export interface DrawerContentHarnessFilters extends BaseHarnessFilters {
}

export interface DrawerHarnessFilters extends BaseHarnessFilters {
    position?: 'start' | 'end';
}

export declare class MatDrawerContainerHarness extends ContentContainerComponentHarness<string> {
    getContent(): Promise<MatDrawerContentHarness>;
    getDrawers(filter?: DrawerHarnessFilters): Promise<MatDrawerHarness[]>;
    static hostSelector: string;
    static with(options?: DrawerContainerHarnessFilters): HarnessPredicate<MatDrawerContainerHarness>;
}

export declare class MatDrawerContentHarness extends ContentContainerComponentHarness<string> {
    static hostSelector: string;
    static with(options?: DrawerContentHarnessFilters): HarnessPredicate<MatDrawerContentHarness>;
}

export declare class MatDrawerHarness extends MatDrawerHarnessBase {
    static hostSelector: string;
    static with(options?: DrawerHarnessFilters): HarnessPredicate<MatDrawerHarness>;
}

export declare class MatSidenavContainerHarness extends ContentContainerComponentHarness<string> {
    getContent(): Promise<MatSidenavContentHarness>;
    getSidenavs(filter?: DrawerHarnessFilters): Promise<MatSidenavHarness[]>;
    static hostSelector: string;
    static with(options?: DrawerContainerHarnessFilters): HarnessPredicate<MatSidenavContainerHarness>;
}

export declare class MatSidenavContentHarness extends ContentContainerComponentHarness<string> {
    static hostSelector: string;
    static with(options?: DrawerContentHarnessFilters): HarnessPredicate<MatSidenavContentHarness>;
}

export declare class MatSidenavHarness extends MatDrawerHarnessBase {
    isFixedInViewport(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: DrawerHarnessFilters): HarnessPredicate<MatSidenavHarness>;
}
