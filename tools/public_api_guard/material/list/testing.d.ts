export interface ActionListHarnessFilters extends BaseHarnessFilters {
}

export interface ActionListItemHarnessFilters extends BaseListItemHarnessFilters {
}

export interface BaseListItemHarnessFilters extends BaseHarnessFilters {
    text?: string | RegExp;
}

export interface ListHarnessFilters extends BaseHarnessFilters {
}

export interface ListItemHarnessFilters extends BaseListItemHarnessFilters {
}

export interface ListOptionHarnessFilters extends BaseListItemHarnessFilters {
    selected?: boolean;
}

export declare class MatActionListHarness extends MatListHarnessBase<typeof MatActionListItemHarness, MatActionListItemHarness, ActionListItemHarnessFilters> {
    _itemHarness: typeof MatActionListItemHarness;
    static hostSelector: string;
    static with(options?: ActionListHarnessFilters): HarnessPredicate<MatActionListHarness>;
}

export declare class MatActionListItemHarness extends MatListItemHarnessBase {
    blur(): Promise<void>;
    click(): Promise<void>;
    focus(): Promise<void>;
    static hostSelector: string;
    static with(options?: ActionListItemHarnessFilters): HarnessPredicate<MatActionListItemHarness>;
}

export declare class MatListHarness extends MatListHarnessBase<typeof MatListItemHarness, MatListItemHarness, ListItemHarnessFilters> {
    _itemHarness: typeof MatListItemHarness;
    static hostSelector: string;
    static with(options?: ListHarnessFilters): HarnessPredicate<MatListHarness>;
}

export declare class MatListItemHarness extends MatListItemHarnessBase {
    static hostSelector: string;
    static with(options?: ListItemHarnessFilters): HarnessPredicate<MatListItemHarness>;
}

export declare class MatListOptionHarness extends MatListItemHarnessBase {
    blur(): Promise<void>;
    deselect(): Promise<void>;
    focus(): Promise<void>;
    getCheckboxPosition(): Promise<'before' | 'after'>;
    isDisabled(): Promise<boolean>;
    isSelected(): Promise<boolean>;
    select(): Promise<void>;
    toggle(): Promise<void>;
    static hostSelector: string;
    static with(options?: ListOptionHarnessFilters): HarnessPredicate<MatListOptionHarness>;
}

export declare class MatNavListHarness extends MatListHarnessBase<typeof MatNavListItemHarness, MatNavListItemHarness, NavListItemHarnessFilters> {
    _itemHarness: typeof MatNavListItemHarness;
    static hostSelector: string;
    static with(options?: NavListHarnessFilters): HarnessPredicate<MatNavListHarness>;
}

export declare class MatNavListItemHarness extends MatListItemHarnessBase {
    blur(): Promise<void>;
    click(): Promise<void>;
    focus(): Promise<void>;
    getHref(): Promise<string | null>;
    static hostSelector: string;
    static with(options?: NavListItemHarnessFilters): HarnessPredicate<MatNavListItemHarness>;
}

export declare class MatSelectionListHarness extends MatListHarnessBase<typeof MatListOptionHarness, MatListOptionHarness, ListOptionHarnessFilters> {
    _itemHarness: typeof MatListOptionHarness;
    deselectItems(...filters: ListItemHarnessFilters[]): Promise<void>;
    isDisabled(): Promise<boolean>;
    selectItems(...filters: ListOptionHarnessFilters[]): Promise<void>;
    static hostSelector: string;
    static with(options?: SelectionListHarnessFilters): HarnessPredicate<MatSelectionListHarness>;
}

export interface NavListHarnessFilters extends BaseHarnessFilters {
}

export interface NavListItemHarnessFilters extends BaseListItemHarnessFilters {
    href?: string | RegExp | null;
}

export interface SelectionListHarnessFilters extends BaseHarnessFilters {
}

export interface SubheaderHarnessFilters extends BaseHarnessFilters {
    text?: string | RegExp;
}
