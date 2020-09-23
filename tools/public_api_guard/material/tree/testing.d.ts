export declare class MatTreeHarness extends ComponentHarness {
    getNodes(filter?: TreeNodeHarnessFilters): Promise<MatTreeNodeHarness[]>;
    static hostSelector: string;
    static with(options?: TreeHarnessFilters): HarnessPredicate<MatTreeHarness>;
}

export declare class MatTreeNodeHarness extends ComponentHarness {
    _toggle: import("@angular/cdk/testing").AsyncFactoryFn<import("@angular/cdk/testing").TestElement | null>;
    collapse(): Promise<void>;
    expand(): Promise<void>;
    getLevel(): Promise<number>;
    getText(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isExpanded(): Promise<boolean>;
    toggle(): Promise<void>;
    static hostSelector: string;
    static with(options?: TreeNodeHarnessFilters): HarnessPredicate<MatTreeNodeHarness>;
}

export interface TreeHarnessFilters extends BaseHarnessFilters {
}

export interface TreeNodeHarnessFilters extends BaseHarnessFilters {
    disabled?: boolean;
    expanded?: boolean;
    level?: number;
    text?: string | RegExp;
}
