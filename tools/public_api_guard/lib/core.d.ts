export declare function _countGroupLabelsBeforeOption(optionIndex: number, options: QueryList<MatOption>, optionGroups: QueryList<MatOptgroup>): number;

export declare function _getOptionScrollPosition(optionIndex: number, optionHeight: number, currentScrollPosition: number, panelHeight: number): number;

export declare const _MatOptgroupMixinBase: CanDisableCtor & typeof MatOptgroupBase;

export declare class AnimationCurves {
    static ACCELERATION_CURVE: string;
    static DECELERATION_CURVE: string;
    static SHARP_CURVE: string;
    static STANDARD_CURVE: string;
}

export declare class AnimationDurations {
    static COMPLEX: string;
    static ENTERING: string;
    static EXITING: string;
}

export declare const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9, NOV = 10, DEC = 11;

export declare const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9, NOV = 10, DEC = 11;

export interface CanColor {
    color: ThemePalette;
}

export declare type CanColorCtor = Constructor<CanColor>;

export interface CanDisable {
    disabled: boolean;
}

export declare type CanDisableCtor = Constructor<CanDisable>;

export interface CanDisableRipple {
    disableRipple: boolean;
}

export declare type CanDisableRippleCtor = Constructor<CanDisableRipple>;

export interface CanUpdateErrorState {
    errorState: boolean;
    errorStateMatcher: ErrorStateMatcher;
    readonly stateChanges: Subject<void>;
    updateErrorState(): void;
}

export declare type CanUpdateErrorStateCtor = Constructor<CanUpdateErrorState>;

export declare abstract class DateAdapter<D> {
    protected _localeChanges: Subject<void>;
    protected locale: any;
    readonly localeChanges: Observable<void>;
    abstract addCalendarDays(date: D, days: number): D;
    abstract addCalendarMonths(date: D, months: number): D;
    abstract addCalendarYears(date: D, years: number): D;
    clampDate(date: D, min?: D | null, max?: D | null): D;
    abstract clone(date: D): D;
    compareDate(first: D, second: D): number;
    abstract createDate(year: number, month: number, date: number): D;
    deserialize(value: any): D | null;
    abstract format(date: D, displayFormat: any): string;
    abstract getDate(date: D): number;
    abstract getDateNames(): string[];
    abstract getDayOfWeek(date: D): number;
    abstract getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];
    abstract getFirstDayOfWeek(): number;
    abstract getMonth(date: D): number;
    abstract getMonthNames(style: 'long' | 'short' | 'narrow'): string[];
    abstract getNumDaysInMonth(date: D): number;
    abstract getYear(date: D): number;
    abstract getYearName(date: D): string;
    abstract invalid(): D;
    abstract isDateInstance(obj: any): boolean;
    abstract isValid(date: D): boolean;
    abstract parse(value: any, parseFormat: any): D | null;
    sameDate(first: D | null, second: D | null): boolean;
    setLocale(locale: any): void;
    abstract toIso8601(date: D): string;
    abstract today(): D;
}

export declare const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9, NOV = 10, DEC = 11;

export declare const defaultRippleAnimationConfig: {
    enterDuration: number;
    exitDuration: number;
};

export declare class ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean;
}

export declare const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9, NOV = 10, DEC = 11;

export declare type FloatLabelType = 'always' | 'never' | 'auto';

export declare class GestureConfig extends HammerGestureConfig {
    events: string[];
    constructor(_hammerOptions?: HammerOptions | undefined, commonModule?: MatCommonModule);
    buildHammer(element: HTMLElement): HammerInstance;
}

export interface HammerInput {
    center: {
        x: number;
        y: number;
    };
    deltaX: number;
    deltaY: number;
    preventDefault: () => {};
}

export interface HammerInstance {
    off(eventName: string, callback: Function): void;
    on(eventName: string, callback: Function): void;
}

export interface HammerManager {
    add(recogniser: Recognizer | Recognizer[]): Recognizer;
    emit(event: string, data: any): void;
    off(events: string, handler?: Function): void;
    on(events: string, handler: Function): void;
    set(options: any): HammerManager;
}

export interface HammerOptions {
    cssProps?: {
        [key: string]: string;
    };
    domEvents?: boolean;
    enable?: boolean | ((manager: HammerManager) => boolean);
    inputClass?: HammerInput;
    inputTarget?: EventTarget;
    preset?: any[];
    recognizers?: any[];
    touchAction?: string;
}

export interface HammerStatic {
    Pan: Recognizer;
    Press: Recognizer;
    Swipe: Recognizer;
    new (element: HTMLElement | SVGElement, options?: any): HammerManager;
}

export interface HasInitialized {
    _markInitialized: () => void;
    initialized: Observable<void>;
}

export declare type HasInitializedCtor = Constructor<HasInitialized>;

export interface HasTabIndex {
    tabIndex: number;
}

export declare type HasTabIndexCtor = Constructor<HasTabIndex>;

export declare const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9, NOV = 10, DEC = 11;

export declare const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9, NOV = 10, DEC = 11;

export declare const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9, NOV = 10, DEC = 11;

export interface LabelOptions {
    float?: FloatLabelType;
}

export declare const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9, NOV = 10, DEC = 11;

export declare const MAT_DATE_FORMATS: InjectionToken<MatDateFormats>;

export declare const MAT_DATE_LOCALE: InjectionToken<string>;

export declare function MAT_DATE_LOCALE_FACTORY(): string;

export declare const MAT_DATE_LOCALE_PROVIDER: {
    provide: InjectionToken<string>;
    useExisting: InjectionToken<string>;
};

export declare const MAT_HAMMER_OPTIONS: InjectionToken<HammerOptions>;

export declare const MAT_LABEL_GLOBAL_OPTIONS: InjectionToken<LabelOptions>;

export declare const MAT_NATIVE_DATE_FORMATS: MatDateFormats;

export declare const MAT_OPTION_PARENT_COMPONENT: InjectionToken<MatOptionParentComponent>;

export declare const MAT_RIPPLE_GLOBAL_OPTIONS: InjectionToken<RippleGlobalOptions>;

export declare class MatCommonModule {
    constructor(_sanityChecksEnabled: boolean, _hammerLoader?: HammerLoader | undefined);
    _checkHammerIsAvailable(): void;
}

export declare type MatDateFormats = {
    parse: {
        dateInput: any;
    };
    display: {
        dateInput: any;
        monthYearLabel: any;
        dateA11yLabel: any;
        monthYearA11yLabel: any;
    };
};

export declare const MATERIAL_SANITY_CHECKS: InjectionToken<boolean>;

export declare class MatLine {
}

export declare class MatLineModule {
}

export declare class MatLineSetter {
    constructor(lines: QueryList<MatLine>, element: ElementRef<HTMLElement>);
}

export declare class MatNativeDateModule {
}

export declare class MatOptgroup extends _MatOptgroupMixinBase implements CanDisable {
    _labelId: string;
    label: string;
}

export declare class MatOptgroupBase {
}

export declare class MatOption implements AfterViewChecked, OnDestroy {
    readonly _stateChanges: Subject<void>;
    readonly active: boolean;
    readonly disableRipple: boolean | undefined;
    disabled: any;
    readonly group: MatOptgroup;
    id: string;
    readonly multiple: boolean | undefined;
    readonly onSelectionChange: EventEmitter<MatOptionSelectionChange>;
    readonly selected: boolean;
    value: any;
    readonly viewValue: string;
    constructor(_element: ElementRef<HTMLElement>, _changeDetectorRef: ChangeDetectorRef, _parent: MatOptionParentComponent, group: MatOptgroup);
    _getHostElement(): HTMLElement;
    _getTabIndex(): string;
    _handleKeydown(event: KeyboardEvent): void;
    _selectViaInteraction(): void;
    deselect(): void;
    focus(): void;
    getLabel(): string;
    ngAfterViewChecked(): void;
    ngOnDestroy(): void;
    select(): void;
    setActiveStyles(): void;
    setInactiveStyles(): void;
}

export declare class MatOptionModule {
}

export interface MatOptionParentComponent {
    disableRipple?: boolean;
    multiple?: boolean;
}

export declare class MatOptionSelectionChange {
    isUserInput: boolean;
    source: MatOption;
    constructor(
    source: MatOption,
    isUserInput?: boolean);
}

export declare class MatPseudoCheckbox {
    _animationMode?: string | undefined;
    disabled: boolean;
    state: MatPseudoCheckboxState;
    constructor(_animationMode?: string | undefined);
}

export declare class MatPseudoCheckboxModule {
}

export declare type MatPseudoCheckboxState = 'unchecked' | 'checked' | 'indeterminate';

export declare class MatRipple implements OnInit, OnDestroy, RippleTarget {
    animation: RippleAnimationConfig;
    centered: boolean;
    color: string;
    disabled: boolean;
    radius: number;
    readonly rippleConfig: RippleConfig;
    readonly rippleDisabled: boolean;
    trigger: HTMLElement;
    unbounded: boolean;
    constructor(_elementRef: ElementRef<HTMLElement>, ngZone: NgZone, platform: Platform, globalOptions?: RippleGlobalOptions, animationMode?: string);
    fadeOutAll(): void;
    launch(config: RippleConfig): RippleRef;
    launch(x: number, y: number, config?: RippleConfig): RippleRef;
    ngOnDestroy(): void;
    ngOnInit(): void;
}

export declare class MatRippleModule {
}

export declare const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9, NOV = 10, DEC = 11;

export declare function mixinColor<T extends Constructor<HasElementRef>>(base: T, defaultColor?: ThemePalette): CanColorCtor & T;

export declare function mixinDisabled<T extends Constructor<{}>>(base: T): CanDisableCtor & T;

export declare function mixinDisableRipple<T extends Constructor<{}>>(base: T): CanDisableRippleCtor & T;

export declare function mixinErrorState<T extends Constructor<HasErrorState>>(base: T): CanUpdateErrorStateCtor & T;

export declare function mixinInitialized<T extends Constructor<{}>>(base: T): HasInitializedCtor & T;

export declare function mixinTabIndex<T extends Constructor<CanDisable>>(base: T, defaultTabIndex?: number): HasTabIndexCtor & T;

export declare class NativeDateAdapter extends DateAdapter<Date> {
    useUtcForDisplay: boolean;
    constructor(matDateLocale: string, platform: Platform);
    addCalendarDays(date: Date, days: number): Date;
    addCalendarMonths(date: Date, months: number): Date;
    addCalendarYears(date: Date, years: number): Date;
    clone(date: Date): Date;
    createDate(year: number, month: number, date: number): Date;
    deserialize(value: any): Date | null;
    format(date: Date, displayFormat: Object): string;
    getDate(date: Date): number;
    getDateNames(): string[];
    getDayOfWeek(date: Date): number;
    getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];
    getFirstDayOfWeek(): number;
    getMonth(date: Date): number;
    getMonthNames(style: 'long' | 'short' | 'narrow'): string[];
    getNumDaysInMonth(date: Date): number;
    getYear(date: Date): number;
    getYearName(date: Date): string;
    invalid(): Date;
    isDateInstance(obj: any): boolean;
    isValid(date: Date): boolean;
    parse(value: any): Date | null;
    toIso8601(date: Date): string;
    today(): Date;
}

export declare class NativeDateModule {
}

export declare const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9, NOV = 10, DEC = 11;

export declare const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9, NOV = 10, DEC = 11;

export interface Recognizer {
    new (options?: any): Recognizer;
    recognizeWith(otherRecognizer: Recognizer | string): Recognizer;
}

export interface RecognizerStatic {
    new (options?: any): Recognizer;
}

export interface RippleAnimationConfig {
    enterDuration?: number;
    exitDuration?: number;
}

export declare type RippleConfig = {
    color?: string;
    centered?: boolean;
    radius?: number;
    persistent?: boolean;
    animation?: RippleAnimationConfig;
    terminateOnPointerUp?: boolean;
};

export interface RippleGlobalOptions {
    animation?: RippleAnimationConfig;
    disabled?: boolean;
    terminateOnPointerUp?: boolean;
}

export declare class RippleRef {
    config: RippleConfig;
    element: HTMLElement;
    state: RippleState;
    constructor(_renderer: RippleRenderer,
    element: HTMLElement,
    config: RippleConfig);
    fadeOut(): void;
}

export declare class RippleRenderer {
    constructor(_target: RippleTarget, _ngZone: NgZone, elementRef: ElementRef<HTMLElement>, platform: Platform);
    _removeTriggerEvents(): void;
    fadeInRipple(x: number, y: number, config?: RippleConfig): RippleRef;
    fadeOutAll(): void;
    fadeOutRipple(rippleRef: RippleRef): void;
    setupTriggerEvents(element: HTMLElement): void;
}

export declare enum RippleState {
    FADING_IN = 0,
    VISIBLE = 1,
    FADING_OUT = 2,
    HIDDEN = 3
}

export interface RippleTarget {
    rippleConfig: RippleConfig;
    rippleDisabled: boolean;
}

export declare const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9, NOV = 10, DEC = 11;

export declare function setLines(lines: QueryList<MatLine>, element: ElementRef<HTMLElement>): void;

export declare class ShowOnDirtyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean;
}

export declare type ThemePalette = 'primary' | 'accent' | 'warn' | undefined;
