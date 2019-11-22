export declare class MatMenuHarness extends ComponentHarness {
    blur(): Promise<void>;
    clickItem(itemFilter: Omit<MenuItemHarnessFilters, 'ancestor'>, ...subItemFilters: Omit<MenuItemHarnessFilters, 'ancestor'>[]): Promise<void>;
    close(): Promise<void>;
    focus(): Promise<void>;
    getItems(filters?: Omit<MenuItemHarnessFilters, 'ancestor'>): Promise<MatMenuItemHarness[]>;
    getTriggerText(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isOpen(): Promise<boolean>;
    open(): Promise<void>;
    static hostSelector: string;
    static with(options?: MenuHarnessFilters): HarnessPredicate<MatMenuHarness>;
}

export declare class MatMenuItemHarness extends ComponentHarness {
    blur(): Promise<void>;
    click(): Promise<void>;
    focus(): Promise<void>;
    getSubmenu(): Promise<MatMenuHarness | null>;
    getText(): Promise<string>;
    hasSubmenu(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
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
