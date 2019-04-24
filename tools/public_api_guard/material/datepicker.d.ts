export declare const _MatDatepickerContentMixinBase: CanColorCtor & typeof MatDatepickerContentBase;

export declare const MAT_DATEPICKER_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;

export declare function MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy;

export declare const MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER: {
    provide: InjectionToken<() => ScrollStrategy>;
    deps: (typeof Overlay)[];
    useFactory: typeof MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY;
};

export declare const MAT_DATEPICKER_VALIDATORS: any;

export declare const MAT_DATEPICKER_VALUE_ACCESSOR: any;

export declare class MatCalendar<D> implements AfterContentInit, AfterViewChecked, OnDestroy, OnChanges {
    _calendarHeaderPortal: Portal<any>;
    readonly _userSelection: EventEmitter<void>;
    activeDate: D;
    currentView: MatCalendarView;
    dateClass: (date: D) => MatCalendarCellCssClasses;
    dateFilter: (date: D) => boolean;
    headerComponent: ComponentType<any>;
    maxDate: D | null;
    minDate: D | null;
    readonly monthSelected: EventEmitter<D>;
    monthView: MatMonthView<D>;
    multiYearView: MatMultiYearView<D>;
    selected: D | null;
    readonly selectedChange: EventEmitter<D>;
    startAt: D | null;
    startView: MatCalendarView;
    stateChanges: Subject<void>;
    readonly yearSelected: EventEmitter<D>;
    yearView: MatYearView<D>;
    constructor(_intl: MatDatepickerIntl, _dateAdapter: DateAdapter<D>, _dateFormats: MatDateFormats, _changeDetectorRef: ChangeDetectorRef);
    _dateSelected(date: D): void;
    _goToDateInView(date: D, view: 'month' | 'year' | 'multi-year'): void;
    _monthSelectedInYearView(normalizedMonth: D): void;
    _userSelected(): void;
    _yearSelectedInMultiYearView(normalizedYear: D): void;
    focusActiveCell(): void;
    ngAfterContentInit(): void;
    ngAfterViewChecked(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    updateTodaysDate(): void;
}

export declare class MatCalendarBody implements OnChanges {
    _cellPadding: string;
    _cellWidth: string;
    _firstRowOffset: number;
    activeCell: number;
    cellAspectRatio: number;
    label: string;
    labelMinRequiredCells: number;
    numCols: number;
    rows: MatCalendarCell[][];
    selectedValue: number;
    readonly selectedValueChange: EventEmitter<number>;
    todayValue: number;
    constructor(_elementRef: ElementRef<HTMLElement>, _ngZone: NgZone);
    _cellClicked(cell: MatCalendarCell): void;
    _focusActiveCell(): void;
    _isActiveCell(rowIndex: number, colIndex: number): boolean;
    ngOnChanges(changes: SimpleChanges): void;
}

export declare class MatCalendarCell {
    ariaLabel: string;
    cssClasses?: string | Set<string> | {
        [key: string]: any;
    } | string[] | undefined;
    displayValue: string;
    enabled: boolean;
    value: number;
    constructor(value: number, displayValue: string, ariaLabel: string, enabled: boolean, cssClasses?: string | Set<string> | {
        [key: string]: any;
    } | string[] | undefined);
}

export declare type MatCalendarCellCssClasses = string | string[] | Set<string> | {
    [key: string]: any;
};

export declare class MatCalendarHeader<D> {
    calendar: MatCalendar<D>;
    readonly nextButtonLabel: string;
    readonly periodButtonLabel: string;
    readonly periodButtonText: string;
    readonly prevButtonLabel: string;
    constructor(_intl: MatDatepickerIntl, calendar: MatCalendar<D>, _dateAdapter: DateAdapter<D>, _dateFormats: MatDateFormats, changeDetectorRef: ChangeDetectorRef);
    currentPeriodClicked(): void;
    nextClicked(): void;
    nextEnabled(): boolean;
    previousClicked(): void;
    previousEnabled(): boolean;
}

export declare type MatCalendarView = 'month' | 'year' | 'multi-year';

export declare class MatDatepicker<D> implements OnDestroy, CanColor {
    _color: ThemePalette;
    readonly _dateFilter: (date: D | null) => boolean;
    _datepickerInput: MatDatepickerInput<D>;
    readonly _disabledChange: Subject<boolean>;
    readonly _maxDate: D | null;
    readonly _minDate: D | null;
    _popupRef: OverlayRef;
    _selected: D | null;
    readonly _selectedChanged: Subject<D>;
    calendarHeaderComponent: ComponentType<any>;
    closedStream: EventEmitter<void>;
    color: ThemePalette;
    dateClass: (date: D) => MatCalendarCellCssClasses;
    disabled: boolean;
    id: string;
    readonly monthSelected: EventEmitter<D>;
    opened: boolean;
    openedStream: EventEmitter<void>;
    panelClass: string | string[];
    startAt: D | null;
    startView: 'month' | 'year' | 'multi-year';
    touchUi: boolean;
    readonly yearSelected: EventEmitter<D>;
    constructor(_dialog: MatDialog, _overlay: Overlay, _ngZone: NgZone, _viewContainerRef: ViewContainerRef, scrollStrategy: any, _dateAdapter: DateAdapter<D>, _dir: Directionality, _document: any);
    _registerInput(input: MatDatepickerInput<D>): void;
    _selectMonth(normalizedMonth: D): void;
    _selectYear(normalizedYear: D): void;
    close(): void;
    ngOnDestroy(): void;
    open(): void;
    select(date: D): void;
}

export declare const matDatepickerAnimations: {
    readonly transformPanel: AnimationTriggerMetadata;
    readonly fadeInCalendar: AnimationTriggerMetadata;
};

export declare class MatDatepickerContent<D> extends _MatDatepickerContentMixinBase implements AfterViewInit, CanColor {
    _calendar: MatCalendar<D>;
    _isAbove: boolean;
    datepicker: MatDatepicker<D>;
    constructor(elementRef: ElementRef);
    ngAfterViewInit(): void;
}

export declare class MatDatepickerContentBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}

export declare class MatDatepickerInput<D> implements ControlValueAccessor, OnDestroy, Validator {
    _dateAdapter: DateAdapter<D>;
    _dateFilter: (date: D | null) => boolean;
    _datepicker: MatDatepicker<D>;
    _disabledChange: EventEmitter<boolean>;
    _onTouched: () => void;
    _valueChange: EventEmitter<D | null>;
    readonly dateChange: EventEmitter<MatDatepickerInputEvent<D>>;
    readonly dateInput: EventEmitter<MatDatepickerInputEvent<D>>;
    disabled: boolean;
    matDatepicker: MatDatepicker<D>;
    matDatepickerFilter: (date: D | null) => boolean;
    max: D | null;
    min: D | null;
    value: D | null;
    constructor(_elementRef: ElementRef<HTMLInputElement>, _dateAdapter: DateAdapter<D>, _dateFormats: MatDateFormats, _formField: MatFormField);
    _getThemePalette(): ThemePalette;
    _onBlur(): void;
    _onChange(): void;
    _onInput(value: string): void;
    _onKeydown(event: KeyboardEvent): void;
    getConnectedOverlayOrigin(): ElementRef;
    getPopupConnectionElementRef(): ElementRef;
    ngOnDestroy(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    registerOnValidatorChange(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    validate(c: AbstractControl): ValidationErrors | null;
    writeValue(value: D): void;
}

export declare class MatDatepickerInputEvent<D> {
    target: MatDatepickerInput<D>;
    targetElement: HTMLElement;
    value: D | null;
    constructor(
    target: MatDatepickerInput<D>,
    targetElement: HTMLElement);
}

export declare class MatDatepickerIntl {
    calendarLabel: string;
    readonly changes: Subject<void>;
    nextMonthLabel: string;
    nextMultiYearLabel: string;
    nextYearLabel: string;
    openCalendarLabel: string;
    prevMonthLabel: string;
    prevMultiYearLabel: string;
    prevYearLabel: string;
    switchToMonthViewLabel: string;
    switchToMultiYearViewLabel: string;
}

export declare class MatDatepickerModule {
}

export declare class MatDatepickerToggle<D> implements AfterContentInit, OnChanges, OnDestroy {
    _button: MatButton;
    _customIcon: MatDatepickerToggleIcon;
    _intl: MatDatepickerIntl;
    datepicker: MatDatepicker<D>;
    disableRipple: boolean;
    disabled: boolean;
    tabIndex: number | null;
    constructor(_intl: MatDatepickerIntl, _changeDetectorRef: ChangeDetectorRef, defaultTabIndex: string);
    _open(event: Event): void;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
}

export declare class MatDatepickerToggleIcon {
}

export declare class MatMonthView<D> implements AfterContentInit {
    _dateAdapter: DateAdapter<D>;
    _firstWeekOffset: number;
    _matCalendarBody: MatCalendarBody;
    _monthLabel: string;
    _selectedDate: number | null;
    _todayDate: number | null;
    readonly _userSelection: EventEmitter<void>;
    _weekdays: {
        long: string;
        narrow: string;
    }[];
    _weeks: MatCalendarCell[][];
    activeDate: D;
    readonly activeDateChange: EventEmitter<D>;
    dateClass: (date: D) => MatCalendarCellCssClasses;
    dateFilter: (date: D) => boolean;
    maxDate: D | null;
    minDate: D | null;
    selected: D | null;
    readonly selectedChange: EventEmitter<D | null>;
    constructor(_changeDetectorRef: ChangeDetectorRef, _dateFormats: MatDateFormats, _dateAdapter: DateAdapter<D>, _dir?: Directionality | undefined);
    _dateSelected(date: number): void;
    _focusActiveCell(): void;
    _handleCalendarBodyKeydown(event: KeyboardEvent): void;
    _init(): void;
    ngAfterContentInit(): void;
}

export declare class MatYearView<D> implements AfterContentInit {
    _dateAdapter: DateAdapter<D>;
    _matCalendarBody: MatCalendarBody;
    _months: MatCalendarCell[][];
    _selectedMonth: number | null;
    _todayMonth: number | null;
    _yearLabel: string;
    activeDate: D;
    readonly activeDateChange: EventEmitter<D>;
    dateFilter: (date: D) => boolean;
    maxDate: D | null;
    minDate: D | null;
    readonly monthSelected: EventEmitter<D>;
    selected: D | null;
    readonly selectedChange: EventEmitter<D>;
    constructor(_changeDetectorRef: ChangeDetectorRef, _dateFormats: MatDateFormats, _dateAdapter: DateAdapter<D>, _dir?: Directionality | undefined);
    _focusActiveCell(): void;
    _handleCalendarBodyKeydown(event: KeyboardEvent): void;
    _init(): void;
    _monthSelected(month: number): void;
    ngAfterContentInit(): void;
}
