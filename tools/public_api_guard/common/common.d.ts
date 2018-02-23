/** @stable */
export declare const APP_BASE_HREF: InjectionToken<string>;

/** @stable */
export declare class AsyncPipe implements OnDestroy, PipeTransform {
    constructor(_ref: ChangeDetectorRef);
    ngOnDestroy(): void;
    transform<T>(obj: Promise<T> | null | undefined): T | null;
    transform<T>(obj: Observable<T> | null | undefined): T | null;
    transform<T>(obj: undefined): undefined;
    transform<T>(obj: null): null;
}

/** @stable */
export declare class CommonModule {
}

/** @stable */
export declare class CurrencyPipe implements PipeTransform {
    constructor(_locale: string);
    transform(value: any, currencyCode?: string, display?: 'code' | 'symbol' | 'symbol-narrow' | string | boolean, digitsInfo?: string, locale?: string): string | null;
}

/** @stable */
export declare class DatePipe implements PipeTransform {
    constructor(locale: string);
    transform(value: any, format?: string, timezone?: string, locale?: string): string | null;
}

/** @stable */
export declare class DecimalPipe implements PipeTransform {
    constructor(_locale: string);
    transform(value: any, digitsInfo?: string, locale?: string): string | null;
}

/** @stable */
export declare class DeprecatedCurrencyPipe implements PipeTransform {
    constructor(_locale: string);
    transform(value: any, currencyCode?: string, symbolDisplay?: boolean, digits?: string): string | null;
}

/** @stable */
export declare class DeprecatedDatePipe implements PipeTransform {
    constructor(_locale: string);
    transform(value: any, pattern?: string): string | null;
}

/** @stable */
export declare class DeprecatedDecimalPipe implements PipeTransform {
    constructor(_locale: string);
    transform(value: any, digits?: string): string | null;
}

/** @deprecated */
export declare class DeprecatedI18NPipesModule {
}

/** @stable */
export declare class DeprecatedPercentPipe implements PipeTransform {
    constructor(_locale: string);
    transform(value: any, digits?: string): string | null;
}

/** @stable */
export declare const DOCUMENT: InjectionToken<Document>;

/** @stable */
export declare function formatCurrency(value: number, locale: string, currency: string, currencyCode?: string, digitsInfo?: string): string;

/** @stable */
export declare function formatDate(value: string | number | Date, format: string, locale: string, timezone?: string): string;

/** @stable */
export declare function formatNumber(value: number, locale: string, digitsInfo?: string): string;

/** @stable */
export declare function formatPercent(value: number, locale: string, digitsInfo?: string): string;

/** @experimental */
export declare enum FormatWidth {
    Short = 0,
    Medium = 1,
    Long = 2,
    Full = 3,
}

/** @experimental */
export declare enum FormStyle {
    Format = 0,
    Standalone = 1,
}

/** @experimental */
export declare function getCurrencySymbol(code: string, format: 'wide' | 'narrow', locale?: string): string;

/** @experimental */
export declare function getLocaleCurrencyName(locale: string): string | null;

/** @experimental */
export declare function getLocaleCurrencySymbol(locale: string): string | null;

/** @experimental */
export declare function getLocaleDateFormat(locale: string, width: FormatWidth): string;

/** @experimental */
export declare function getLocaleDateTimeFormat(locale: string, width: FormatWidth): string;

/** @experimental */
export declare function getLocaleDayNames(locale: string, formStyle: FormStyle, width: TranslationWidth): string[];

/** @experimental */
export declare function getLocaleDayPeriods(locale: string, formStyle: FormStyle, width: TranslationWidth): [string, string];

/** @experimental */
export declare function getLocaleEraNames(locale: string, width: TranslationWidth): [string, string];

/** @experimental */
export declare function getLocaleExtraDayPeriodRules(locale: string): (Time | [Time, Time])[];

/** @experimental */
export declare function getLocaleExtraDayPeriods(locale: string, formStyle: FormStyle, width: TranslationWidth): string[];

/** @experimental */
export declare function getLocaleFirstDayOfWeek(locale: string): WeekDay;

/** @experimental */
export declare function getLocaleId(locale: string): string;

/** @experimental */
export declare function getLocaleMonthNames(locale: string, formStyle: FormStyle, width: TranslationWidth): string[];

/** @experimental */
export declare function getLocaleNumberFormat(locale: string, type: NumberFormatStyle): string;

/** @experimental */
export declare function getLocaleNumberSymbol(locale: string, symbol: NumberSymbol): string;

/** @experimental */
export declare function getLocalePluralCase(locale: string): (value: number) => Plural;

/** @experimental */
export declare function getLocaleTimeFormat(locale: string, width: FormatWidth): string;

/** @experimental */
export declare function getLocaleWeekEndRange(locale: string): [WeekDay, WeekDay];

/** @experimental */
export declare function getNumberOfCurrencyDigits(code: string): number;

/** @stable */
export declare class HashLocationStrategy extends LocationStrategy {
    constructor(_platformLocation: PlatformLocation, _baseHref?: string);
    back(): void;
    forward(): void;
    getBaseHref(): string;
    onPopState(fn: LocationChangeListener): void;
    path(includeHash?: boolean): string;
    prepareExternalUrl(internal: string): string;
    pushState(state: any, title: string, path: string, queryParams: string): void;
    replaceState(state: any, title: string, path: string, queryParams: string): void;
}

/** @experimental */
export declare class I18nPluralPipe implements PipeTransform {
    constructor(_localization: NgLocalization);
    transform(value: number, pluralMap: {
        [count: string]: string;
    }, locale?: string): string;
}

/** @experimental */
export declare class I18nSelectPipe implements PipeTransform {
    transform(value: string | null | undefined, mapping: {
        [key: string]: string;
    }): string;
}

/** @experimental */
export declare function isPlatformBrowser(platformId: Object): boolean;

/** @experimental */
export declare function isPlatformServer(platformId: Object): boolean;

/** @experimental */
export declare function isPlatformWorkerApp(platformId: Object): boolean;

/** @experimental */
export declare function isPlatformWorkerUi(platformId: Object): boolean;

/** @stable */
export declare class JsonPipe implements PipeTransform {
    transform(value: any): string;
}

/** @stable */
export declare class Location {
    constructor(platformStrategy: LocationStrategy);
    back(): void;
    forward(): void;
    go(path: string, query?: string, state?: any): void;
    isCurrentPathEqualTo(path: string, query?: string): boolean;
    normalize(url: string): string;
    path(includeHash?: boolean): string;
    prepareExternalUrl(url: string): string;
    replaceState(path: string, query?: string, state?: any): void;
    subscribe(onNext: (value: PopStateEvent) => void, onThrow?: ((exception: any) => void) | null, onReturn?: (() => void) | null): ISubscription;
    static joinWithSlash(start: string, end: string): string;
    static normalizeQueryParams(params: string): string;
    static stripTrailingSlash(url: string): string;
}

/** @experimental */
export declare const LOCATION_INITIALIZED: InjectionToken<Promise<any>>;

/** @experimental */
export interface LocationChangeEvent {
    state: any;
    type: string;
}

/** @experimental */
export interface LocationChangeListener {
    (e: LocationChangeEvent): any;
}

/** @stable */
export declare abstract class LocationStrategy {
    abstract back(): void;
    abstract forward(): void;
    abstract getBaseHref(): string;
    abstract onPopState(fn: LocationChangeListener): void;
    abstract path(includeHash?: boolean): string;
    abstract prepareExternalUrl(internal: string): string;
    abstract pushState(state: any, title: string, url: string, queryParams: string): void;
    abstract replaceState(state: any, title: string, url: string, queryParams: string): void;
}

/** @stable */
export declare class LowerCasePipe implements PipeTransform {
    transform(value: string): string;
}

/** @stable */
export declare class NgClass implements DoCheck {
    klass: string;
    ngClass: string | string[] | Set<string> | {
        [klass: string]: any;
    };
    constructor(_iterableDiffers: IterableDiffers, _keyValueDiffers: KeyValueDiffers, _ngEl: ElementRef, _renderer: Renderer2);
    ngDoCheck(): void;
}

/** @experimental */
export declare class NgComponentOutlet implements OnChanges, OnDestroy {
    ngComponentOutlet: Type<any>;
    ngComponentOutletContent: any[][];
    ngComponentOutletInjector: Injector;
    ngComponentOutletNgModuleFactory: NgModuleFactory<any>;
    constructor(_viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
}

/** @stable */
export declare class NgForOf<T> implements DoCheck, OnChanges {
    ngForOf: NgIterable<T>;
    ngForTemplate: TemplateRef<NgForOfContext<T>>;
    ngForTrackBy: TrackByFunction<T>;
    constructor(_viewContainer: ViewContainerRef, _template: TemplateRef<NgForOfContext<T>>, _differs: IterableDiffers);
    ngDoCheck(): void;
    ngOnChanges(changes: SimpleChanges): void;
}

/** @stable */
export declare class NgForOfContext<T> {
    $implicit: T;
    count: number;
    readonly even: boolean;
    readonly first: boolean;
    index: number;
    readonly last: boolean;
    ngForOf: NgIterable<T>;
    readonly odd: boolean;
    constructor($implicit: T, ngForOf: NgIterable<T>, index: number, count: number);
}

/** @stable */
export declare class NgIf {
    ngIf: any;
    ngIfElse: TemplateRef<NgIfContext> | null;
    ngIfThen: TemplateRef<NgIfContext> | null;
    constructor(_viewContainer: ViewContainerRef, templateRef: TemplateRef<NgIfContext>);
}

/** @stable */
export declare class NgIfContext {
    $implicit: any;
    ngIf: any;
}

/** @experimental */
export declare class NgLocaleLocalization extends NgLocalization {
    /** @deprecated */ protected deprecatedPluralFn: ((locale: string, value: string | number) => Plural) | null | undefined;
    protected locale: string;
    constructor(locale: string,
        deprecatedPluralFn?: ((locale: string, value: string | number) => Plural) | null | undefined);
    getPluralCategory(value: any, locale?: string): string;
}

/** @experimental */
export declare abstract class NgLocalization {
    abstract getPluralCategory(value: any, locale?: string): string;
}

/** @experimental */
export declare class NgPlural {
    ngPlural: number;
    constructor(_localization: NgLocalization);
    addCase(value: string, switchView: SwitchView): void;
}

/** @experimental */
export declare class NgPluralCase {
    value: string;
    constructor(value: string, template: TemplateRef<Object>, viewContainer: ViewContainerRef, ngPlural: NgPlural);
}

/** @stable */
export declare class NgStyle implements DoCheck {
    ngStyle: {
        [key: string]: string;
    };
    constructor(_differs: KeyValueDiffers, _ngEl: ElementRef, _renderer: Renderer2);
    ngDoCheck(): void;
}

/** @stable */
export declare class NgSwitch {
    ngSwitch: any;
}

/** @stable */
export declare class NgSwitchCase implements DoCheck {
    ngSwitchCase: any;
    constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>, ngSwitch: NgSwitch);
    ngDoCheck(): void;
}

/** @stable */
export declare class NgSwitchDefault {
    constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>, ngSwitch: NgSwitch);
}

/** @stable */
export declare class NgTemplateOutlet implements OnChanges {
    ngTemplateOutlet: TemplateRef<any>;
    ngTemplateOutletContext: Object;
    constructor(_viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
}

/** @experimental */
export declare enum NumberFormatStyle {
    Decimal = 0,
    Percent = 1,
    Currency = 2,
    Scientific = 3,
}

/** @experimental */
export declare enum NumberSymbol {
    Decimal = 0,
    Group = 1,
    List = 2,
    PercentSign = 3,
    PlusSign = 4,
    MinusSign = 5,
    Exponential = 6,
    SuperscriptingExponent = 7,
    PerMille = 8,
    Infinity = 9,
    NaN = 10,
    TimeSeparator = 11,
    CurrencyDecimal = 12,
    CurrencyGroup = 13,
}

/** @stable */
export declare class PathLocationStrategy extends LocationStrategy {
    constructor(_platformLocation: PlatformLocation, href?: string);
    back(): void;
    forward(): void;
    getBaseHref(): string;
    onPopState(fn: LocationChangeListener): void;
    path(includeHash?: boolean): string;
    prepareExternalUrl(internal: string): string;
    pushState(state: any, title: string, url: string, queryParams: string): void;
    replaceState(state: any, title: string, url: string, queryParams: string): void;
}

/** @stable */
export declare class PercentPipe implements PipeTransform {
    constructor(_locale: string);
    transform(value: any, digitsInfo?: string, locale?: string): string | null;
}

/** @stable */
export declare abstract class PlatformLocation {
    readonly abstract hash: string;
    readonly abstract pathname: string;
    readonly abstract search: string;
    abstract back(): void;
    abstract forward(): void;
    abstract getBaseHrefFromDOM(): string;
    abstract onHashChange(fn: LocationChangeListener): void;
    abstract onPopState(fn: LocationChangeListener): void;
    abstract pushState(state: any, title: string, url: string): void;
    abstract replaceState(state: any, title: string, url: string): void;
}

/** @experimental */
export declare enum Plural {
    Zero = 0,
    One = 1,
    Two = 2,
    Few = 3,
    Many = 4,
    Other = 5,
}

/** @experimental */
export interface PopStateEvent {
    pop?: boolean;
    state?: any;
    type?: string;
    url?: string;
}

/** @experimental */
export declare function registerLocaleData(data: any, localeId?: string | any, extraData?: any): void;

/** @stable */
export declare class SlicePipe implements PipeTransform {
    transform(value: any, start: number, end?: number): any;
}

/** @experimental */
export declare type Time = {
    hours: number;
    minutes: number;
};

/** @stable */
export declare class TitleCasePipe implements PipeTransform {
    transform(value: string): string;
}

/** @experimental */
export declare enum TranslationWidth {
    Narrow = 0,
    Abbreviated = 1,
    Wide = 2,
    Short = 3,
}

/** @stable */
export declare class UpperCasePipe implements PipeTransform {
    transform(value: string): string;
}

/** @stable */
export declare const VERSION: Version;

/** @experimental */
export declare enum WeekDay {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
}
