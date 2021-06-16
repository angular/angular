export interface AccordionHarnessFilters extends BaseHarnessFilters {
}

export interface ExpansionPanelHarnessFilters extends BaseHarnessFilters {
    content?: string | RegExp;
    description?: string | RegExp | null;
    disabled?: boolean;
    expanded?: boolean;
    title?: string | RegExp | null;
}

export declare class MatAccordionHarness extends ComponentHarness {
    getExpansionPanels(filter?: ExpansionPanelHarnessFilters): Promise<MatExpansionPanelHarness[]>;
    isMulti(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: AccordionHarnessFilters): HarnessPredicate<MatAccordionHarness>;
}

export declare class MatExpansionPanelHarness extends ContentContainerComponentHarness<MatExpansionPanelSection> {
    blur(): Promise<void>;
    collapse(): Promise<void>;
    expand(): Promise<void>;
    focus(): Promise<void>;
    getDescription(): Promise<string | null>;
    getHarnessLoaderForContent(): Promise<HarnessLoader>;
    getTextContent(): Promise<string>;
    getTitle(): Promise<string | null>;
    getToggleIndicatorPosition(): Promise<'before' | 'after'>;
    hasToggleIndicator(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
    isExpanded(): Promise<boolean>;
    isFocused(): Promise<boolean>;
    toggle(): Promise<void>;
    static hostSelector: string;
    static with(options?: ExpansionPanelHarnessFilters): HarnessPredicate<MatExpansionPanelHarness>;
}

export declare const enum MatExpansionPanelSection {
    HEADER = ".mat-expansion-panel-header",
    TITLE = ".mat-expansion-panel-header-title",
    DESCRIPTION = ".mat-expansion-panel-header-description",
    CONTENT = ".mat-expansion-panel-content"
}
