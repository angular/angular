export declare const APP_BASE_HREF: InjectionToken<string>;

export declare class AsyncPipe implements OnDestroy, PipeTransform {
    constructor(_ref: ChangeDetectorRef);
    ngOnDestroy(): void;
    transform<T>(obj: Subscribable<T> | Promise<T>): T | null;
    transform<T>(obj: null | undefined): null;
    transform<T>(obj: Subscribable<T> | Promise<T> | null | undefined): T | null;
}

export declare class CommonModule {
}

export declare class CurrencyPipe implements PipeTransform {
    constructor(_locale: string, _defaultCurrencyCode?: string);
    transform(value: number | string, currencyCode?: string, display?: 'code' | 'symbol' | 'symbol-narrow' | string | boolean, digitsInfo?: string, locale?: string): string | null;
    transform(value: null | undefined, currencyCode?: string, display?: 'code' | 'symbol' | 'symbol-narrow' | string | boolean, digitsInfo?: string, locale?: string): null;
    transform(value: number | string | null | undefined, currencyCode?: string, display?: 'code' | 'symbol' | 'symbol-narrow' | string | boolean, digitsInfo?: string, locale?: string): string | null;
}

export declare class DatePipe implements PipeTransform {
    constructor(locale: string);
    transform(value: Date | string | number, format?: string, timezone?: string, locale?: string): string | null;
    transform(value: null | undefined, format?: string, timezone?: string, locale?: string): null;
    transform(value: Date | string | number | null | undefined, format?: string, timezone?: string, locale?: string): string | null;
}

export declare class DecimalPipe implements PipeTransform {
    constructor(_locale: string);
    transform(value: number | string, digitsInfo?: string, locale?: string): string | null;
    transform(value: null | undefined, digitsInfo?: string, locale?: string): null;
    transform(value: number | string | null | undefined, digitsInfo?: string, locale?: string): string | null;
}

export declare const DOCUMENT: InjectionToken<Document>;

export declare function formatCurrency(value: number, locale: string, currency: string, currencyCode?: string, digitsInfo?: string): string;

export declare function formatDate(value: string | number | Date, format: string, locale: string, timezone?: string): string;

export declare function formatNumber(value: number, locale: string, digitsInfo?: string): string;

export declare function formatPercent(value: number, locale: string, digitsInfo?: string): string;

export declare enum FormatWidth {
    Short = 0,
    Medium = 1,
    Long = 2,
    Full = 3
}

export declare enum FormStyle {
    Format = 0,
    Standalone = 1
}

export declare function getCurrencySymbol(code: string, format: 'wide' | 'narrow', locale?: string): string;

export declare function getLocaleCurrencyCode(locale: string): string | null;

export declare function getLocaleCurrencyName(locale: string): string | null;

export declare function getLocaleCurrencySymbol(locale: string): string | null;

export declare function getLocaleDateFormat(locale: string, width: FormatWidth): string;

export declare function getLocaleDateTimeFormat(locale: string, width: FormatWidth): string;

export declare function getLocaleDayNames(locale: string, formStyle: FormStyle, width: TranslationWidth): ReadonlyArray<string>;

export declare function getLocaleDayPeriods(locale: string, formStyle: FormStyle, width: TranslationWidth): Readonly<[string, string]>;

export declare function getLocaleDirection(locale: string): 'ltr' | 'rtl';

export declare function getLocaleEraNames(locale: string, width: TranslationWidth): Readonly<[string, string]>;

export declare function getLocaleExtraDayPeriodRules(locale: string): (Time | [Time, Time])[];

export declare function getLocaleExtraDayPeriods(locale: string, formStyle: FormStyle, width: TranslationWidth): string[];

export declare function getLocaleFirstDayOfWeek(locale: string): WeekDay;

export declare function getLocaleId(locale: string): string;

export declare function getLocaleMonthNames(locale: string, formStyle: FormStyle, width: TranslationWidth): ReadonlyArray<string>;

export declare function getLocaleNumberFormat(locale: string, type: NumberFormatStyle): string;

export declare function getLocaleNumberSymbol(locale: string, symbol: NumberSymbol): string;

export declare const getLocalePluralCase: (locale: string) => ((value: number) => Plural);

export declare function getLocaleTimeFormat(locale: string, width: FormatWidth): string;

export declare function getLocaleWeekEndRange(locale: string): [WeekDay, WeekDay];

export declare function getNumberOfCurrencyDigits(code: string): number;

export declare class HashLocationStrategy extends LocationStrategy implements OnDestroy {
    constructor(_platformLocation: PlatformLocation, _baseHref?: string);
    back(): void;
    forward(): void;
    getBaseHref(): string;
    ngOnDestroy(): void;
    onPopState(fn: LocationChangeListener): void;
    path(includeHash?: boolean): string;
    prepareExternalUrl(internal: string): string;
    pushState(state: any, title: string, path: string, queryParams: string): void;
    replaceState(state: any, title: string, path: string, queryParams: string): void;
}

export declare class I18nPluralPipe implements PipeTransform {
    constructor(_localization: NgLocalization);
    transform(value: number | null | undefined, pluralMap: {
        [count: string]: string;
    }, locale?: string): string;
}

export declare class I18nSelectPipe implements PipeTransform {
    transform(value: string | null | undefined, mapping: {
        [key: string]: string;
    }): string;
}

export declare function isPlatformBrowser(platformId: Object): boolean;

export declare function isPlatformServer(platformId: Object): boolean;

export declare function isPlatformWorkerApp(platformId: Object): boolean;

export declare function isPlatformWorkerUi(platformId: Object): boolean;

export declare class JsonPipe implements PipeTransform {
    transform(value: any): string;
}

export declare interface KeyValue<K, V> {
    key: K;
    value: V;
}

export declare class KeyValuePipe implements PipeTransform {
    constructor(differs: KeyValueDiffers);
    transform<K, V>(input: ReadonlyMap<K, V>, compareFn?: (a: KeyValue<K, V>, b: KeyValue<K, V>) => number): Array<KeyValue<K, V>>;
    transform<K extends number, V>(input: Record<K, V>, compareFn?: (a: KeyValue<string, V>, b: KeyValue<string, V>) => number): Array<KeyValue<string, V>>;
    transform<K extends string, V>(input: Record<K, V> | ReadonlyMap<K, V>, compareFn?: (a: KeyValue<K, V>, b: KeyValue<K, V>) => number): Array<KeyValue<K, V>>;
    transform(input: null | undefined, compareFn?: (a: KeyValue<unknown, unknown>, b: KeyValue<unknown, unknown>) => number): null;
    transform<K, V>(input: ReadonlyMap<K, V> | null | undefined, compareFn?: (a: KeyValue<K, V>, b: KeyValue<K, V>) => number): Array<KeyValue<K, V>> | null;
    transform<K extends number, V>(input: Record<K, V> | null | undefined, compareFn?: (a: KeyValue<string, V>, b: KeyValue<string, V>) => number): Array<KeyValue<string, V>> | null;
    transform<K extends string, V>(input: Record<K, V> | ReadonlyMap<K, V> | null | undefined, compareFn?: (a: KeyValue<K, V>, b: KeyValue<K, V>) => number): Array<KeyValue<K, V>> | null;
}

export declare class Location {
    constructor(platformStrategy: LocationStrategy, platformLocation: PlatformLocation);
    back(): void;
    forward(): void;
    getState(): unknown;
    go(path: string, query?: string, state?: any): void;
    isCurrentPathEqualTo(path: string, query?: string): boolean;
    normalize(url: string): string;
    onUrlChange(fn: (url: string, state: unknown) => void): void;
    path(includeHash?: boolean): string;
    prepareExternalUrl(url: string): string;
    replaceState(path: string, query?: string, state?: any): void;
    subscribe(onNext: (value: PopStateEvent) => void, onThrow?: ((exception: any) => void) | null, onReturn?: (() => void) | null): SubscriptionLike;
    static joinWithSlash: (start: string, end: string) => string;
    static normalizeQueryParams: (params: string) => string;
    static stripTrailingSlash: (url: string) => string;
}

export declare const LOCATION_INITIALIZED: InjectionToken<Promise<any>>;

export declare interface LocationChangeEvent {
    state: any;
    type: string;
}

export declare interface LocationChangeListener {
    (event: LocationChangeEvent): any;
}

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

export declare class LowerCasePipe implements PipeTransform {
    transform(value: string): string;
    transform(value: null | undefined): null;
    transform(value: string | null | undefined): string | null;
}

export declare class NgClass implements DoCheck {
    set klass(value: string);
    set ngClass(value: string | string[] | Set<string> | {
        [klass: string]: any;
    });
    constructor(_iterableDiffers: IterableDiffers, _keyValueDiffers: KeyValueDiffers, _ngEl: ElementRef, _renderer: Renderer2);
    ngDoCheck(): void;
}

export declare class NgComponentOutlet implements OnChanges, OnDestroy {
    ngComponentOutlet: Type<any>;
    ngComponentOutletContent: any[][];
    ngComponentOutletInjector: Injector;
    ngComponentOutletNgModuleFactory: NgModuleFactory<any>;
    constructor(_viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
}

export declare class NgForOf<T, U extends NgIterable<T> = NgIterable<T>> implements DoCheck {
    set ngForOf(ngForOf: U & NgIterable<T> | undefined | null);
    set ngForTemplate(value: TemplateRef<NgForOfContext<T, U>>);
    set ngForTrackBy(fn: TrackByFunction<T>);
    get ngForTrackBy(): TrackByFunction<T>;
    constructor(_viewContainer: ViewContainerRef, _template: TemplateRef<NgForOfContext<T, U>>, _differs: IterableDiffers);
    ngDoCheck(): void;
    static ngTemplateContextGuard<T, U extends NgIterable<T>>(dir: NgForOf<T, U>, ctx: any): ctx is NgForOfContext<T, U>;
}

export declare class NgForOfContext<T, U extends NgIterable<T> = NgIterable<T>> {
    $implicit: T;
    count: number;
    get even(): boolean;
    get first(): boolean;
    index: number;
    get last(): boolean;
    ngForOf: U;
    get odd(): boolean;
    constructor($implicit: T, ngForOf: U, index: number, count: number);
}

export declare class NgIf<T = unknown> {
    set ngIf(condition: T);
    set ngIfElse(templateRef: TemplateRef<NgIfContext<T>> | null);
    set ngIfThen(templateRef: TemplateRef<NgIfContext<T>> | null);
    constructor(_viewContainer: ViewContainerRef, templateRef: TemplateRef<NgIfContext<T>>);
    static ngTemplateGuard_ngIf: 'binding';
    static ngTemplateContextGuard<T>(dir: NgIf<T>, ctx: any): ctx is NgIfContext<Exclude<T, false | 0 | '' | null | undefined>>;
}

export declare class NgIfContext<T = unknown> {
    $implicit: T;
    ngIf: T;
}

export declare class NgLocaleLocalization extends NgLocalization {
    protected locale: string;
    constructor(locale: string);
    getPluralCategory(value: any, locale?: string): string;
}

export declare abstract class NgLocalization {
    abstract getPluralCategory(value: any, locale?: string): string;
}

export declare class NgPlural {
    set ngPlural(value: number);
    constructor(_localization: NgLocalization);
    addCase(value: string, switchView: SwitchView): void;
}

export declare class NgPluralCase {
    value: string;
    constructor(value: string, template: TemplateRef<Object>, viewContainer: ViewContainerRef, ngPlural: NgPlural);
}

export declare class NgStyle implements DoCheck {
    set ngStyle(values: {
        [klass: string]: any;
    } | null);
    constructor(_ngEl: ElementRef, _differs: KeyValueDiffers, _renderer: Renderer2);
    ngDoCheck(): void;
}

export declare class NgSwitch {
    set ngSwitch(newValue: any);
}

export declare class NgSwitchCase implements DoCheck {
    ngSwitchCase: any;
    constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>, ngSwitch: NgSwitch);
    ngDoCheck(): void;
}

export declare class NgSwitchDefault {
    constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>, ngSwitch: NgSwitch);
}

export declare class NgTemplateOutlet implements OnChanges {
    ngTemplateOutlet: TemplateRef<any> | null;
    ngTemplateOutletContext: Object | null;
    constructor(_viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
}

export declare enum NumberFormatStyle {
    Decimal = 0,
    Percent = 1,
    Currency = 2,
    Scientific = 3
}

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
    CurrencyGroup = 13
}

export declare class PathLocationStrategy extends LocationStrategy implements OnDestroy {
    constructor(_platformLocation: PlatformLocation, href?: string);
    back(): void;
    forward(): void;
    getBaseHref(): string;
    ngOnDestroy(): void;
    onPopState(fn: LocationChangeListener): void;
    path(includeHash?: boolean): string;
    prepareExternalUrl(internal: string): string;
    pushState(state: any, title: string, url: string, queryParams: string): void;
    replaceState(state: any, title: string, url: string, queryParams: string): void;
}

export declare class PercentPipe implements PipeTransform {
    constructor(_locale: string);
    transform(value: number | string, digitsInfo?: string, locale?: string): string | null;
    transform(value: null | undefined, digitsInfo?: string, locale?: string): null;
    transform(value: number | string | null | undefined, digitsInfo?: string, locale?: string): string | null;
}

export declare abstract class PlatformLocation {
    abstract get hash(): string;
    abstract get hostname(): string;
    abstract get href(): string;
    abstract get pathname(): string;
    abstract get port(): string;
    abstract get protocol(): string;
    abstract get search(): string;
    abstract back(): void;
    abstract forward(): void;
    abstract getBaseHrefFromDOM(): string;
    abstract getState(): unknown;
    abstract onHashChange(fn: LocationChangeListener): VoidFunction;
    abstract onPopState(fn: LocationChangeListener): VoidFunction;
    abstract pushState(state: any, title: string, url: string): void;
    abstract replaceState(state: any, title: string, url: string): void;
}

export declare enum Plural {
    Zero = 0,
    One = 1,
    Two = 2,
    Few = 3,
    Many = 4,
    Other = 5
}

export declare interface PopStateEvent {
    pop?: boolean;
    state?: any;
    type?: string;
    url?: string;
}

export declare function registerLocaleData(data: any, localeId?: string | any, extraData?: any): void;

export declare class SlicePipe implements PipeTransform {
    transform<T>(value: ReadonlyArray<T>, start: number, end?: number): Array<T>;
    transform(value: null | undefined, start: number, end?: number): null;
    transform<T>(value: ReadonlyArray<T> | null | undefined, start: number, end?: number): Array<T> | null;
    transform(value: string, start: number, end?: number): string;
    transform(value: string | null | undefined, start: number, end?: number): string | null;
}

export declare type Time = {
    hours: number;
    minutes: number;
};

export declare class TitleCasePipe implements PipeTransform {
    transform(value: string): string;
    transform(value: null | undefined): null;
    transform(value: string | null | undefined): string | null;
}

export declare enum TranslationWidth {
    Narrow = 0,
    Abbreviated = 1,
    Wide = 2,
    Short = 3
}

export declare class UpperCasePipe implements PipeTransform {
    transform(value: string): string;
    transform(value: null | undefined): null;
    transform(value: string | null | undefined): string | null;
}

export declare const VERSION: Version;

export declare abstract class ViewportScroller {
    abstract getScrollPosition(): [number, number];
    abstract scrollToAnchor(anchor: string): void;
    abstract scrollToPosition(position: [number, number]): void;
    abstract setHistoryScrollRestoration(scrollRestoration: 'auto' | 'manual'): void;
    abstract setOffset(offset: [number, number] | (() => [number, number])): void;
    static ɵprov: unknown;
}

export declare enum WeekDay {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}

export declare abstract class XhrFactory {
    abstract build(): XMLHttpRequest;
}
