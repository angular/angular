export declare type DateFilterFn<D> = (date: D | null) => boolean;

export declare type DatepickerDropdownPositionX = 'start' | 'end';

export declare type DatepickerDropdownPositionY = 'above' | 'below';

export declare class DateRange<D> {
    readonly end: D | null;
    readonly start: D | null;
    constructor(
    start: D | null,
    end: D | null);
}

export interface DateSelectionModelChange<S> {
    oldValue?: S;
    selection: S;
    source: unknown;
}

export declare class DefaultMatCalendarRangeStrategy<D> implements MatDateRangeSelectionStrategy<D> {
    constructor(_dateAdapter: DateAdapter<D>);
    createPreview(activeDate: D | null, currentRange: DateRange<D>): DateRange<D>;
    selectionFinished(date: D, currentRange: DateRange<D>): DateRange<D>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultMatCalendarRangeStrategy<any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DefaultMatCalendarRangeStrategy<any>>;
}

export declare type ExtractDateTypeFromSelection<T> = T extends DateRange<infer D> ? D : NonNullable<T>;

export declare const MAT_DATE_RANGE_SELECTION_STRATEGY: InjectionToken<MatDateRangeSelectionStrategy<any>>;

export declare const MAT_DATEPICKER_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;

export declare function MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy;

export declare const MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER: {
    provide: InjectionToken<() => ScrollStrategy>;
    deps: (typeof Overlay)[];
    useFactory: typeof MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY;
};

export declare const MAT_DATEPICKER_VALIDATORS: any;

export declare const MAT_DATEPICKER_VALUE_ACCESSOR: any;

export declare function MAT_RANGE_DATE_SELECTION_MODEL_FACTORY(parent: MatSingleDateSelectionModel<unknown>, adapter: DateAdapter<unknown>): MatSingleDateSelectionModel<unknown>;

export declare const MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER: FactoryProvider;

export declare function MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY(parent: MatSingleDateSelectionModel<unknown>, adapter: DateAdapter<unknown>): MatSingleDateSelectionModel<unknown>;

export declare const MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER: FactoryProvider;

export declare class MatCalendar<D> implements AfterContentInit, AfterViewChecked, OnDestroy, OnChanges {
    _calendarHeaderPortal: Portal<any>;
    readonly _userSelection: EventEmitter<MatCalendarUserEvent<D | null>>;
    get activeDate(): D;
    set activeDate(value: D);
    comparisonEnd: D | null;
    comparisonStart: D | null;
    get currentView(): MatCalendarView;
    set currentView(value: MatCalendarView);
    dateClass: MatCalendarCellClassFunction<D>;
    dateFilter: (date: D) => boolean;
    headerComponent: ComponentType<any>;
    get maxDate(): D | null;
    set maxDate(value: D | null);
    get minDate(): D | null;
    set minDate(value: D | null);
    readonly monthSelected: EventEmitter<D>;
    monthView: MatMonthView<D>;
    multiYearView: MatMultiYearView<D>;
    get selected(): DateRange<D> | D | null;
    set selected(value: DateRange<D> | D | null);
    readonly selectedChange: EventEmitter<D | null>;
    get startAt(): D | null;
    set startAt(value: D | null);
    startView: MatCalendarView;
    readonly stateChanges: Subject<void>;
    readonly viewChanged: EventEmitter<MatCalendarView>;
    readonly yearSelected: EventEmitter<D>;
    yearView: MatYearView<D>;
    constructor(_intl: MatDatepickerIntl, _dateAdapter: DateAdapter<D>, _dateFormats: MatDateFormats, _changeDetectorRef: ChangeDetectorRef);
    _dateSelected(event: MatCalendarUserEvent<D | null>): void;
    _goToDateInView(date: D, view: 'month' | 'year' | 'multi-year'): void;
    _monthSelectedInYearView(normalizedMonth: D): void;
    _yearSelectedInMultiYearView(normalizedYear: D): void;
    focusActiveCell(): void;
    ngAfterContentInit(): void;
    ngAfterViewChecked(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    updateTodaysDate(): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatCalendar<any>, "mat-calendar", ["matCalendar"], { "headerComponent": "headerComponent"; "startAt": "startAt"; "startView": "startView"; "selected": "selected"; "minDate": "minDate"; "maxDate": "maxDate"; "dateFilter": "dateFilter"; "dateClass": "dateClass"; "comparisonStart": "comparisonStart"; "comparisonEnd": "comparisonEnd"; }, { "selectedChange": "selectedChange"; "yearSelected": "yearSelected"; "monthSelected": "monthSelected"; "viewChanged": "viewChanged"; "_userSelection": "_userSelection"; }, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatCalendar<any>, [null, { optional: true; }, { optional: true; }, null]>;
}

export declare class MatCalendarBody implements OnChanges, OnDestroy {
    _cellPadding: string;
    _cellWidth: string;
    _firstRowOffset: number;
    activeCell: number;
    cellAspectRatio: number;
    comparisonEnd: number | null;
    comparisonStart: number | null;
    endValue: number;
    isRange: boolean;
    label: string;
    labelMinRequiredCells: number;
    numCols: number;
    readonly previewChange: EventEmitter<MatCalendarUserEvent<MatCalendarCell<any> | null>>;
    previewEnd: number | null;
    previewStart: number | null;
    rows: MatCalendarCell[][];
    readonly selectedValueChange: EventEmitter<MatCalendarUserEvent<number>>;
    startValue: number;
    todayValue: number;
    constructor(_elementRef: ElementRef<HTMLElement>, _ngZone: NgZone);
    _cellClicked(cell: MatCalendarCell, event: MouseEvent): void;
    _focusActiveCell(movePreview?: boolean): void;
    _isActiveCell(rowIndex: number, colIndex: number): boolean;
    _isComparisonBridgeEnd(value: number, rowIndex: number, colIndex: number): boolean;
    _isComparisonBridgeStart(value: number, rowIndex: number, colIndex: number): boolean;
    _isComparisonEnd(value: number): boolean;
    _isComparisonIdentical(value: number): boolean;
    _isComparisonStart(value: number): boolean;
    _isInComparisonRange(value: number): boolean;
    _isInPreview(value: number): boolean;
    _isInRange(value: number): boolean;
    _isPreviewEnd(value: number): boolean;
    _isPreviewStart(value: number): boolean;
    _isRangeEnd(value: number): boolean;
    _isRangeStart(value: number): boolean;
    _isSelected(value: number): boolean;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatCalendarBody, "[mat-calendar-body]", ["matCalendarBody"], { "label": "label"; "rows": "rows"; "todayValue": "todayValue"; "startValue": "startValue"; "endValue": "endValue"; "labelMinRequiredCells": "labelMinRequiredCells"; "numCols": "numCols"; "activeCell": "activeCell"; "isRange": "isRange"; "cellAspectRatio": "cellAspectRatio"; "comparisonStart": "comparisonStart"; "comparisonEnd": "comparisonEnd"; "previewStart": "previewStart"; "previewEnd": "previewEnd"; }, { "selectedValueChange": "selectedValueChange"; "previewChange": "previewChange"; }, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatCalendarBody, never>;
}

export declare class MatCalendarCell<D = any> {
    ariaLabel: string;
    compareValue: number;
    cssClasses: MatCalendarCellCssClasses;
    displayValue: string;
    enabled: boolean;
    rawValue?: D | undefined;
    value: number;
    constructor(value: number, displayValue: string, ariaLabel: string, enabled: boolean, cssClasses?: MatCalendarCellCssClasses, compareValue?: number, rawValue?: D | undefined);
}

export declare type MatCalendarCellClassFunction<D> = (date: D, view: 'month' | 'year' | 'multi-year') => MatCalendarCellCssClasses;

export declare type MatCalendarCellCssClasses = string | string[] | Set<string> | {
    [key: string]: any;
};

export declare class MatCalendarHeader<D> {
    _buttonDescriptionId: string;
    calendar: MatCalendar<D>;
    get nextButtonLabel(): string;
    get periodButtonLabel(): string;
    get periodButtonText(): string;
    get prevButtonLabel(): string;
    constructor(_intl: MatDatepickerIntl, calendar: MatCalendar<D>, _dateAdapter: DateAdapter<D>, _dateFormats: MatDateFormats, changeDetectorRef: ChangeDetectorRef);
    currentPeriodClicked(): void;
    nextClicked(): void;
    nextEnabled(): boolean;
    previousClicked(): void;
    previousEnabled(): boolean;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatCalendarHeader<any>, "mat-calendar-header", ["matCalendarHeader"], {}, {}, never, ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatCalendarHeader<any>, [null, null, { optional: true; }, { optional: true; }, null]>;
}

export interface MatCalendarUserEvent<D> {
    event: Event;
    value: D;
}

export declare type MatCalendarView = 'month' | 'year' | 'multi-year';

export declare class MatDatepicker<D> extends MatDatepickerBase<MatDatepickerControl<D>, D | null, D> {
    static ɵcmp: i0.ɵɵComponentDeclaration<MatDatepicker<any>, "mat-datepicker", ["matDatepicker"], {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDatepicker<any>, never>;
}

export declare class MatDatepickerActions implements AfterViewInit, OnDestroy {
    _template: TemplateRef<unknown>;
    constructor(_datepicker: MatDatepickerBase<MatDatepickerControl<unknown>, unknown>, _viewContainerRef: ViewContainerRef);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatDatepickerActions, "mat-datepicker-actions, mat-date-range-picker-actions", never, {}, {}, never, ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDatepickerActions, never>;
}

export declare const matDatepickerAnimations: {
    readonly transformPanel: AnimationTriggerMetadata;
    readonly fadeInCalendar: AnimationTriggerMetadata;
};

export declare class MatDatepickerApply {
    constructor(_datepicker: MatDatepickerBase<MatDatepickerControl<unknown>, unknown>);
    _applySelection(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatDatepickerApply, "[matDatepickerApply], [matDateRangePickerApply]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDatepickerApply, never>;
}

export declare class MatDatepickerCancel {
    _datepicker: MatDatepickerBase<MatDatepickerControl<unknown>, unknown>;
    constructor(_datepicker: MatDatepickerBase<MatDatepickerControl<unknown>, unknown>);
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatDatepickerCancel, "[matDatepickerCancel], [matDateRangePickerCancel]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDatepickerCancel, never>;
}

export declare class MatDatepickerContent<S, D = ExtractDateTypeFromSelection<S>> extends _MatDatepickerContentBase implements OnInit, AfterViewInit, OnDestroy, CanColor {
    _actionsPortal: TemplatePortal | null;
    readonly _animationDone: Subject<void>;
    _animationState: 'enter-dropdown' | 'enter-dialog' | 'void';
    _calendar: MatCalendar<D>;
    _closeButtonFocused: boolean;
    _closeButtonText: string;
    _isAbove: boolean;
    comparisonEnd: D | null;
    comparisonStart: D | null;
    datepicker: MatDatepickerBase<any, S, D>;
    constructor(elementRef: ElementRef, _changeDetectorRef: ChangeDetectorRef, _globalModel: MatDateSelectionModel<S, D>, _dateAdapter: DateAdapter<D>, _rangeSelectionStrategy: MatDateRangeSelectionStrategy<D>, intl: MatDatepickerIntl);
    _applyPendingSelection(): void;
    _getSelected(): D | DateRange<D> | null;
    _handleUserSelection(event: MatCalendarUserEvent<D | null>): void;
    _startExitAnimation(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatDatepickerContent<any, any>, "mat-datepicker-content", ["matDatepickerContent"], { "color": "color"; }, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDatepickerContent<any, any>, [null, null, null, null, { optional: true; }, null]>;
}

export declare class MatDatepickerInput<D> extends MatDatepickerInputBase<D | null, D> implements MatDatepickerControl<D | null>, OnDestroy {
    _datepicker: MatDatepickerPanel<MatDatepickerControl<D>, D | null, D>;
    protected _validator: ValidatorFn | null;
    get dateFilter(): DateFilterFn<D | null>;
    set dateFilter(value: DateFilterFn<D | null>);
    set matDatepicker(datepicker: MatDatepickerPanel<MatDatepickerControl<D>, D | null, D>);
    get max(): D | null;
    set max(value: D | null);
    get min(): D | null;
    set min(value: D | null);
    constructor(elementRef: ElementRef<HTMLInputElement>, dateAdapter: DateAdapter<D>, dateFormats: MatDateFormats, _formField?: MatFormField | undefined);
    protected _assignValueToModel(value: D | null): void;
    protected _getDateFilter(): DateFilterFn<D | null>;
    _getMaxDate(): D | null;
    _getMinDate(): D | null;
    protected _getValueFromModel(modelValue: D | null): D | null;
    protected _openPopup(): void;
    protected _shouldHandleChangeEvent(event: DateSelectionModelChange<D>): boolean;
    getConnectedOverlayOrigin(): ElementRef;
    getOverlayLabelId(): string | null;
    getStartValue(): D | null;
    getThemePalette(): ThemePalette;
    ngOnDestroy(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatDatepickerInput<any>, "input[matDatepicker]", ["matDatepickerInput"], { "matDatepicker": "matDatepicker"; "min": "min"; "max": "max"; "dateFilter": "matDatepickerFilter"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDatepickerInput<any>, [null, { optional: true; }, { optional: true; }, { optional: true; }]>;
}

export declare class MatDatepickerInputEvent<D, S = unknown> {
    target: MatDatepickerInputBase<S, D>;
    targetElement: HTMLElement;
    value: D | null;
    constructor(
    target: MatDatepickerInputBase<S, D>,
    targetElement: HTMLElement);
}

export declare class MatDatepickerIntl {
    calendarLabel: string;
    readonly changes: Subject<void>;
    closeCalendarLabel: string;
    nextMonthLabel: string;
    nextMultiYearLabel: string;
    nextYearLabel: string;
    openCalendarLabel: string;
    prevMonthLabel: string;
    prevMultiYearLabel: string;
    prevYearLabel: string;
    switchToMonthViewLabel: string;
    switchToMultiYearViewLabel: string;
    formatYearRange(start: string, end: string): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDatepickerIntl, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MatDatepickerIntl>;
}

export declare class MatDatepickerModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDatepickerModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatDatepickerModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatDatepickerModule, [typeof i1.MatCalendar, typeof i2.MatCalendarBody, typeof i3.MatDatepicker, typeof i4.MatDatepickerContent, typeof i5.MatDatepickerInput, typeof i6.MatDatepickerToggle, typeof i6.MatDatepickerToggleIcon, typeof i7.MatMonthView, typeof i8.MatYearView, typeof i9.MatMultiYearView, typeof i1.MatCalendarHeader, typeof i10.MatDateRangeInput, typeof i11.MatStartDate, typeof i11.MatEndDate, typeof i12.MatDateRangePicker, typeof i13.MatDatepickerActions, typeof i13.MatDatepickerCancel, typeof i13.MatDatepickerApply], [typeof i14.CommonModule, typeof i15.MatButtonModule, typeof i16.OverlayModule, typeof i17.A11yModule, typeof i18.PortalModule, typeof i19.MatCommonModule], [typeof i20.CdkScrollableModule, typeof i1.MatCalendar, typeof i2.MatCalendarBody, typeof i3.MatDatepicker, typeof i4.MatDatepickerContent, typeof i5.MatDatepickerInput, typeof i6.MatDatepickerToggle, typeof i6.MatDatepickerToggleIcon, typeof i7.MatMonthView, typeof i8.MatYearView, typeof i9.MatMultiYearView, typeof i1.MatCalendarHeader, typeof i10.MatDateRangeInput, typeof i11.MatStartDate, typeof i11.MatEndDate, typeof i12.MatDateRangePicker, typeof i13.MatDatepickerActions, typeof i13.MatDatepickerCancel, typeof i13.MatDatepickerApply]>;
}

export declare class MatDatepickerToggle<D> implements AfterContentInit, OnChanges, OnDestroy {
    _button: MatButton;
    _customIcon: MatDatepickerToggleIcon;
    _intl: MatDatepickerIntl;
    ariaLabel: string;
    datepicker: MatDatepickerPanel<MatDatepickerControl<any>, D>;
    disableRipple: boolean;
    get disabled(): boolean;
    set disabled(value: boolean);
    tabIndex: number | null;
    constructor(_intl: MatDatepickerIntl, _changeDetectorRef: ChangeDetectorRef, defaultTabIndex: string);
    _open(event: Event): void;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatDatepickerToggle<any>, "mat-datepicker-toggle", ["matDatepickerToggle"], { "datepicker": "for"; "tabIndex": "tabIndex"; "ariaLabel": "aria-label"; "disabled": "disabled"; "disableRipple": "disableRipple"; }, {}, ["_customIcon"], ["[matDatepickerToggleIcon]"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDatepickerToggle<any>, [null, null, { attribute: "tabindex"; }]>;
}

export declare class MatDatepickerToggleIcon {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatDatepickerToggleIcon, "[matDatepickerToggleIcon]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDatepickerToggleIcon, never>;
}

export declare class MatDateRangeInput<D> implements MatFormFieldControl<DateRange<D>>, MatDatepickerControl<D>, MatDateRangeInputParent<D>, MatDateRangePickerInput<D>, AfterContentInit, OnChanges, OnDestroy {
    _ariaDescribedBy: string | null;
    _endInput: MatEndDate<D>;
    _groupDisabled: boolean;
    _startInput: MatStartDate<D>;
    comparisonEnd: D | null;
    comparisonStart: D | null;
    controlType: string;
    get dateFilter(): DateFilterFn<D>;
    set dateFilter(value: DateFilterFn<D>);
    get disabled(): boolean;
    set disabled(value: boolean);
    get empty(): boolean;
    get errorState(): boolean;
    focused: boolean;
    id: string;
    get max(): D | null;
    set max(value: D | null);
    get min(): D | null;
    set min(value: D | null);
    ngControl: NgControl | null;
    get placeholder(): string;
    get rangePicker(): MatDatepickerPanel<MatDatepickerControl<D>, DateRange<D>, D>;
    set rangePicker(rangePicker: MatDatepickerPanel<MatDatepickerControl<D>, DateRange<D>, D>);
    get required(): boolean;
    set required(value: boolean);
    separator: string;
    get shouldLabelFloat(): boolean;
    readonly stateChanges: Subject<void>;
    get value(): DateRange<D> | null;
    constructor(_changeDetectorRef: ChangeDetectorRef, _elementRef: ElementRef<HTMLElement>, control: ControlContainer, _dateAdapter: DateAdapter<D>, _formField?: MatFormField | undefined);
    _getAriaLabelledby(): string | null;
    _getInputMirrorValue(): string;
    _handleChildValueChange(): void;
    _openDatepicker(): void;
    _shouldHidePlaceholders(): boolean;
    _shouldHideSeparator(): boolean | "" | null;
    _updateFocus(origin: FocusOrigin): void;
    getConnectedOverlayOrigin(): ElementRef;
    getOverlayLabelId(): string | null;
    getStartValue(): D | null;
    getThemePalette(): ThemePalette;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    onContainerClick(): void;
    setDescribedByIds(ids: string[]): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_required: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatDateRangeInput<any>, "mat-date-range-input", ["matDateRangeInput"], { "rangePicker": "rangePicker"; "required": "required"; "dateFilter": "dateFilter"; "min": "min"; "max": "max"; "disabled": "disabled"; "separator": "separator"; "comparisonStart": "comparisonStart"; "comparisonEnd": "comparisonEnd"; }, {}, ["_startInput", "_endInput"], ["input[matStartDate]", "input[matEndDate]"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDateRangeInput<any>, [null, null, { optional: true; self: true; }, { optional: true; }, { optional: true; }]>;
}

export declare class MatDateRangePicker<D> extends MatDatepickerBase<MatDateRangePickerInput<D>, DateRange<D>, D> {
    protected _forwardContentValues(instance: MatDatepickerContent<DateRange<D>, D>): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatDateRangePicker<any>, "mat-date-range-picker", ["matDateRangePicker"], {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDateRangePicker<any>, never>;
}

export interface MatDateRangeSelectionStrategy<D> {
    createPreview(activeDate: D | null, currentRange: DateRange<D>, event: Event): DateRange<D>;
    selectionFinished(date: D | null, currentRange: DateRange<D>, event: Event): DateRange<D>;
}

export declare abstract class MatDateSelectionModel<S, D = ExtractDateTypeFromSelection<S>> implements OnDestroy {
    protected _adapter: DateAdapter<D>;
    readonly selection: S;
    selectionChanged: Observable<DateSelectionModelChange<S>>;
    protected constructor(
    selection: S, _adapter: DateAdapter<D>);
    protected _isValidDateInstance(date: D): boolean;
    abstract add(date: D | null): void;
    abstract clone(): MatDateSelectionModel<S, D>;
    abstract isComplete(): boolean;
    abstract isValid(): boolean;
    ngOnDestroy(): void;
    updateSelection(value: S, source: unknown): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatDateSelectionModel<any, any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MatDateSelectionModel<any, any>>;
}

export declare class MatEndDate<D> extends _MatDateRangeInputBase<D> implements CanUpdateErrorState, DoCheck, OnInit {
    protected _validator: ValidatorFn | null;
    constructor(rangeInput: MatDateRangeInputParent<D>, elementRef: ElementRef<HTMLInputElement>, defaultErrorStateMatcher: ErrorStateMatcher, injector: Injector, parentForm: NgForm, parentFormGroup: FormGroupDirective, dateAdapter: DateAdapter<D>, dateFormats: MatDateFormats);
    protected _assignValueToModel(value: D | null): void;
    protected _getValueFromModel(modelValue: DateRange<D>): D | null;
    _onKeydown(event: KeyboardEvent): void;
    protected _shouldHandleChangeEvent(change: DateSelectionModelChange<DateRange<D>>): boolean;
    ngDoCheck(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatEndDate<any>, "input[matEndDate]", never, { "errorStateMatcher": "errorStateMatcher"; }, { "dateChange": "dateChange"; "dateInput": "dateInput"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatEndDate<any>, [null, null, null, null, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }]>;
}

export declare class MatMonthView<D> implements AfterContentInit, OnChanges, OnDestroy {
    readonly _changeDetectorRef: ChangeDetectorRef;
    _comparisonRangeEnd: number | null;
    _comparisonRangeStart: number | null;
    _dateAdapter: DateAdapter<D>;
    _firstWeekOffset: number;
    _isRange: boolean;
    _matCalendarBody: MatCalendarBody;
    _monthLabel: string;
    _previewEnd: number | null;
    _previewStart: number | null;
    _rangeEnd: number | null;
    _rangeStart: number | null;
    _todayDate: number | null;
    readonly _userSelection: EventEmitter<MatCalendarUserEvent<D | null>>;
    _weekdays: {
        long: string;
        narrow: string;
    }[];
    _weeks: MatCalendarCell[][];
    get activeDate(): D;
    set activeDate(value: D);
    readonly activeDateChange: EventEmitter<D>;
    comparisonEnd: D | null;
    comparisonStart: D | null;
    dateClass: MatCalendarCellClassFunction<D>;
    dateFilter: (date: D) => boolean;
    get maxDate(): D | null;
    set maxDate(value: D | null);
    get minDate(): D | null;
    set minDate(value: D | null);
    get selected(): DateRange<D> | D | null;
    set selected(value: DateRange<D> | D | null);
    readonly selectedChange: EventEmitter<D | null>;
    constructor(_changeDetectorRef: ChangeDetectorRef, _dateFormats: MatDateFormats, _dateAdapter: DateAdapter<D>, _dir?: Directionality | undefined, _rangeStrategy?: MatDateRangeSelectionStrategy<D> | undefined);
    _dateSelected(event: MatCalendarUserEvent<number>): void;
    _focusActiveCell(movePreview?: boolean): void;
    _handleCalendarBodyKeydown(event: KeyboardEvent): void;
    _init(): void;
    _previewChanged({ event, value: cell }: MatCalendarUserEvent<MatCalendarCell<D> | null>): void;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatMonthView<any>, "mat-month-view", ["matMonthView"], { "activeDate": "activeDate"; "selected": "selected"; "minDate": "minDate"; "maxDate": "maxDate"; "dateFilter": "dateFilter"; "dateClass": "dateClass"; "comparisonStart": "comparisonStart"; "comparisonEnd": "comparisonEnd"; }, { "selectedChange": "selectedChange"; "_userSelection": "_userSelection"; "activeDateChange": "activeDateChange"; }, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatMonthView<any>, [null, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }]>;
}

export declare class MatMultiYearView<D> implements AfterContentInit, OnDestroy {
    _dateAdapter: DateAdapter<D>;
    _matCalendarBody: MatCalendarBody;
    _selectedYear: number | null;
    _todayYear: number;
    _years: MatCalendarCell[][];
    get activeDate(): D;
    set activeDate(value: D);
    readonly activeDateChange: EventEmitter<D>;
    dateClass: MatCalendarCellClassFunction<D>;
    dateFilter: (date: D) => boolean;
    get maxDate(): D | null;
    set maxDate(value: D | null);
    get minDate(): D | null;
    set minDate(value: D | null);
    get selected(): DateRange<D> | D | null;
    set selected(value: DateRange<D> | D | null);
    readonly selectedChange: EventEmitter<D>;
    readonly yearSelected: EventEmitter<D>;
    constructor(_changeDetectorRef: ChangeDetectorRef, _dateAdapter: DateAdapter<D>, _dir?: Directionality | undefined);
    _focusActiveCell(): void;
    _getActiveCell(): number;
    _handleCalendarBodyKeydown(event: KeyboardEvent): void;
    _init(): void;
    _yearSelected(event: MatCalendarUserEvent<number>): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatMultiYearView<any>, "mat-multi-year-view", ["matMultiYearView"], { "activeDate": "activeDate"; "selected": "selected"; "minDate": "minDate"; "maxDate": "maxDate"; "dateFilter": "dateFilter"; "dateClass": "dateClass"; }, { "selectedChange": "selectedChange"; "yearSelected": "yearSelected"; "activeDateChange": "activeDateChange"; }, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatMultiYearView<any>, [null, { optional: true; }, { optional: true; }]>;
}

export declare class MatRangeDateSelectionModel<D> extends MatDateSelectionModel<DateRange<D>, D> {
    constructor(adapter: DateAdapter<D>);
    add(date: D | null): void;
    clone(): MatRangeDateSelectionModel<D>;
    isComplete(): boolean;
    isValid(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatRangeDateSelectionModel<any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MatRangeDateSelectionModel<any>>;
}

export declare class MatSingleDateSelectionModel<D> extends MatDateSelectionModel<D | null, D> {
    constructor(adapter: DateAdapter<D>);
    add(date: D | null): void;
    clone(): MatSingleDateSelectionModel<D>;
    isComplete(): boolean;
    isValid(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSingleDateSelectionModel<any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MatSingleDateSelectionModel<any>>;
}

export declare class MatStartDate<D> extends _MatDateRangeInputBase<D> implements CanUpdateErrorState, DoCheck, OnInit {
    protected _validator: ValidatorFn | null;
    constructor(rangeInput: MatDateRangeInputParent<D>, elementRef: ElementRef<HTMLInputElement>, defaultErrorStateMatcher: ErrorStateMatcher, injector: Injector, parentForm: NgForm, parentFormGroup: FormGroupDirective, dateAdapter: DateAdapter<D>, dateFormats: MatDateFormats);
    protected _assignValueToModel(value: D | null): void;
    protected _formatValue(value: D | null): void;
    protected _getValueFromModel(modelValue: DateRange<D>): D | null;
    protected _shouldHandleChangeEvent(change: DateSelectionModelChange<DateRange<D>>): boolean;
    getMirrorValue(): string;
    ngDoCheck(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatStartDate<any>, "input[matStartDate]", never, { "errorStateMatcher": "errorStateMatcher"; }, { "dateChange": "dateChange"; "dateInput": "dateInput"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatStartDate<any>, [null, null, null, null, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }]>;
}

export declare class MatYearView<D> implements AfterContentInit, OnDestroy {
    readonly _changeDetectorRef: ChangeDetectorRef;
    _dateAdapter: DateAdapter<D>;
    _matCalendarBody: MatCalendarBody;
    _months: MatCalendarCell[][];
    _selectedMonth: number | null;
    _todayMonth: number | null;
    _yearLabel: string;
    get activeDate(): D;
    set activeDate(value: D);
    readonly activeDateChange: EventEmitter<D>;
    dateClass: MatCalendarCellClassFunction<D>;
    dateFilter: (date: D) => boolean;
    get maxDate(): D | null;
    set maxDate(value: D | null);
    get minDate(): D | null;
    set minDate(value: D | null);
    readonly monthSelected: EventEmitter<D>;
    get selected(): DateRange<D> | D | null;
    set selected(value: DateRange<D> | D | null);
    readonly selectedChange: EventEmitter<D>;
    constructor(_changeDetectorRef: ChangeDetectorRef, _dateFormats: MatDateFormats, _dateAdapter: DateAdapter<D>, _dir?: Directionality | undefined);
    _focusActiveCell(): void;
    _handleCalendarBodyKeydown(event: KeyboardEvent): void;
    _init(): void;
    _monthSelected(event: MatCalendarUserEvent<number>): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatYearView<any>, "mat-year-view", ["matYearView"], { "activeDate": "activeDate"; "selected": "selected"; "minDate": "minDate"; "maxDate": "maxDate"; "dateFilter": "dateFilter"; "dateClass": "dateClass"; }, { "selectedChange": "selectedChange"; "monthSelected": "monthSelected"; "activeDateChange": "activeDateChange"; }, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatYearView<any>, [null, { optional: true; }, { optional: true; }, { optional: true; }]>;
}

export declare const yearsPerPage = 24;

export declare const yearsPerRow = 4;
