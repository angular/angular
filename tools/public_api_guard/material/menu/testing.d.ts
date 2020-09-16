export declare class MatMenuHarness extends ContentContainerComponentHarness<string> {
    blur(): Promise<void>;
    clickItem(itemFilter: Omit<MenuItemHarnessFilters, 'ancestor'>, ...subItemFilters: Omit<MenuItemHarnessFilters, 'ancestor'>[]): Promise<void>;
    close(): Promise<void>;
    focus(): Promise<void>;
    getAllChildLoaders(selector: string): Promise<HarnessLoader[]>;
    getAllHarnesses<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T[]>;
    getChildLoader(selector: string): Promise<HarnessLoader>;
    getHarness<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T>;
    getItems(filters?: Omit<MenuItemHarnessFilters, 'ancestor'>): Promise<MatMenuItemHarness[]>;
    getTriggerText(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isFocused(): Promise<boolean>;
    isOpen(): Promise<boolean>;
    open(): Promise<void>;
    static hostSelector: string;
    static with(options?: MenuHarnessFilters): HarnessPredicate<MatMenuHarness>;
}

export declare class MatMenuItemHarness extends ContentContainerComponentHarness<string> {
    blur(): Promise<void>;
    click(): Promise<void>;
    focus(): Promise<void>;
    getSubmenu(): Promise<MatMenuHarness | null>;
    getText(): Promise<string>;
    hasSubmenu(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
    isFocused(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: MenuItemHarnessFilters): HarnessPredicate<MatMenuItemHarness>;
}

export interface MenuHarnessFilters extends BaseHarnessFilters {
    triggerText?: string | RegExp;
}

export interface MenuItemHarnessFilters extends BaseHarnessFilters {
    hasSubmenu?: boolean;
    text?: string | RegExp;
}
