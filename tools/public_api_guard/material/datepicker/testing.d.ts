export interface CalendarCellHarnessFilters extends BaseHarnessFilters {
    active?: boolean;
    disabled?: boolean;
    inComparisonRange?: boolean;
    inPreviewRange?: boolean;
    inRange?: boolean;
    selected?: boolean;
    text?: string | RegExp;
    today?: boolean;
}

export interface CalendarHarnessFilters extends BaseHarnessFilters {
}

export declare const enum CalendarView {
    MONTH = 0,
    YEAR = 1,
    MULTI_YEAR = 2
}

export interface DatepickerInputHarnessFilters extends BaseHarnessFilters {
    placeholder?: string | RegExp;
    value?: string | RegExp;
}

export interface DatepickerToggleHarnessFilters extends BaseHarnessFilters {
}

export interface DateRangeInputHarnessFilters extends BaseHarnessFilters {
    value?: string | RegExp;
}

export declare class MatCalendarCellHarness extends ComponentHarness {
    blur(): Promise<void>;
    focus(): Promise<void>;
    getAriaLabel(): Promise<string>;
    getText(): Promise<string>;
    hover(): Promise<void>;
    isActive(): Promise<boolean>;
    isComparisonRangeEnd(): Promise<boolean>;
    isComparisonRangeStart(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
    isInComparisonRange(): Promise<boolean>;
    isInPreviewRange(): Promise<boolean>;
    isInRange(): Promise<boolean>;
    isPreviewRangeEnd(): Promise<boolean>;
    isPreviewRangeStart(): Promise<boolean>;
    isRangeEnd(): Promise<boolean>;
    isRangeStart(): Promise<boolean>;
    isSelected(): Promise<boolean>;
    isToday(): Promise<boolean>;
    mouseAway(): Promise<void>;
    select(): Promise<void>;
    static hostSelector: string;
    static with(options?: CalendarCellHarnessFilters): HarnessPredicate<MatCalendarCellHarness>;
}

export declare class MatCalendarHarness extends ComponentHarness {
    changeView(): Promise<void>;
    getCells(filter?: CalendarCellHarnessFilters): Promise<MatCalendarCellHarness[]>;
    getCurrentView(): Promise<CalendarView>;
    getCurrentViewLabel(): Promise<string>;
    next(): Promise<void>;
    previous(): Promise<void>;
    selectCell(filter?: CalendarCellHarnessFilters): Promise<void>;
    static hostSelector: string;
    static with(options?: CalendarHarnessFilters): HarnessPredicate<MatCalendarHarness>;
}

export declare class MatDatepickerInputHarness extends MatDatepickerInputHarnessBase implements DatepickerTrigger {
    closeCalendar(): Promise<void>;
    getCalendar(filter?: CalendarHarnessFilters): Promise<MatCalendarHarness>;
    hasCalendar(): Promise<boolean>;
    isCalendarOpen(): Promise<boolean>;
    openCalendar(): Promise<void>;
    static hostSelector: string;
    static with(options?: DatepickerInputHarnessFilters): HarnessPredicate<MatDatepickerInputHarness>;
}

export declare class MatDatepickerToggleHarness extends DatepickerTriggerHarnessBase {
    protected _openCalendar(): Promise<void>;
    isCalendarOpen(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: DatepickerToggleHarnessFilters): HarnessPredicate<MatDatepickerToggleHarness>;
}

export declare class MatDateRangeInputHarness extends DatepickerTriggerHarnessBase {
    protected _openCalendar(): Promise<void>;
    getEndInput(): Promise<MatEndDateHarness>;
    getSeparator(): Promise<string>;
    getStartInput(): Promise<MatStartDateHarness>;
    getValue(): Promise<string>;
    isCalendarOpen(): Promise<boolean>;
    isDisabled(): Promise<boolean>;
    isRequired(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: DateRangeInputHarnessFilters): HarnessPredicate<MatDateRangeInputHarness>;
}

export declare class MatEndDateHarness extends MatDatepickerInputHarnessBase {
    static hostSelector: string;
    static with(options?: DatepickerInputHarnessFilters): HarnessPredicate<MatEndDateHarness>;
}

export declare class MatStartDateHarness extends MatDatepickerInputHarnessBase {
    static hostSelector: string;
    static with(options?: DatepickerInputHarnessFilters): HarnessPredicate<MatStartDateHarness>;
}
