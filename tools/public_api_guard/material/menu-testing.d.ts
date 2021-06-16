export declare abstract class _MatMenuHarnessBase<ItemType extends (ComponentHarnessConstructor<Item> & {
    with: (options?: ItemFilters) => HarnessPredicate<Item>;
}), Item extends ComponentHarness & {
    click(): Promise<void>;
    getSubmenu(): Promise<_MatMenuHarnessBase<ItemType, Item, ItemFilters> | null>;
}, ItemFilters extends BaseHarnessFilters> extends ContentContainerComponentHarness<string> {
    protected abstract _itemClass: ItemType;
    blur(): Promise<void>;
    clickItem(itemFilter: Omit<ItemFilters, 'ancestor'>, ...subItemFilters: Omit<ItemFilters, 'ancestor'>[]): Promise<void>;
    close(): Promise<void>;
    focus(): Promise<void>;
    getItems(filters?: Omit<ItemFilters, 'ancestor'>): Promise<Item[]>;
    protected getRootHarnessLoader(): Promise<HarnessLoader>;
    getTriggerText(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isFocused(): Promise<boolean>;
    isOpen(): Promise<boolean>;
    open(): Promise<void>;
}

export declare abstract class _MatMenuItemHarnessBase<MenuType extends ComponentHarnessConstructor<Menu>, Menu extends ComponentHarness> extends ContentContainerComponentHarness<string> {
    protected abstract _menuClass: MenuType;
    blur(): Promise<void>;
    click(): Promise<void>;
    focus(): Promise<void>;
    getSubmenu(): Promise<Menu | null>;
    getText(): Promise<string>;
    hasSubmenu(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
    isFocused(): Promise<boolean>;
}

export declare class MatMenuHarness extends _MatMenuHarnessBase<typeof MatMenuItemHarness, MatMenuItemHarness, MenuItemHarnessFilters> {
    protected _itemClass: typeof MatMenuItemHarness;
    static hostSelector: string;
    static with(options?: MenuHarnessFilters): HarnessPredicate<MatMenuHarness>;
}

export declare class MatMenuItemHarness extends _MatMenuItemHarnessBase<typeof MatMenuHarness, MatMenuHarness> {
    protected _menuClass: typeof MatMenuHarness;
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
