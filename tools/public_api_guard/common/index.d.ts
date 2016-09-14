/** @stable */
export declare const APP_BASE_HREF: OpaqueToken;

/** @stable */
export declare class AsyncPipe implements OnDestroy {
    constructor(_ref: ChangeDetectorRef);
    ngOnDestroy(): void;
    transform(obj: Observable<any> | Promise<any> | EventEmitter<any>): any;
}

/** @stable */
export declare class CommonModule {
}

/** @stable */
export declare class CurrencyPipe implements PipeTransform {
    constructor(_locale: string);
    transform(value: any, currencyCode?: string, symbolDisplay?: boolean, digits?: string): string;
}

/** @stable */
export declare class DatePipe implements PipeTransform {
    constructor(_locale: string);
    transform(value: any, pattern?: string): string;
}

/** @stable */
export declare class DecimalPipe implements PipeTransform {
    constructor(_locale: string);
    transform(value: any, digits?: string): string;
}

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
    }): string;
}

/** @experimental */
export declare class I18nSelectPipe implements PipeTransform {
    transform(value: string, mapping: {
        [key: string]: string;
    }): string;
}

/** @stable */
export declare class JsonPipe implements PipeTransform {
    transform(value: any): string;
}

/** @stable */
export declare class Location {
    constructor(platformStrategy: LocationStrategy);
    back(): void;
    forward(): void;
    go(path: string, query?: string): void;
    isCurrentPathEqualTo(path: string, query?: string): boolean;
    normalize(url: string): string;
    path(includeHash?: boolean): string;
    prepareExternalUrl(url: string): string;
    replaceState(path: string, query?: string): void;
    subscribe(onNext: (value: any) => void, onThrow?: (exception: any) => void, onReturn?: () => void): Object;
    static joinWithSlash(start: string, end: string): string;
    static normalizeQueryParams(params: string): string;
    static stripTrailingSlash(url: string): string;
}

/** @experimental */
export interface LocationChangeEvent {
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
    constructor(_iterableDiffers: IterableDiffers, _keyValueDiffers: KeyValueDiffers, _ngEl: ElementRef, _renderer: Renderer);
    ngDoCheck(): void;
}

/** @stable */
export declare class NgFor implements DoCheck, OnChanges {
    ngForOf: any;
    ngForTemplate: TemplateRef<NgForRow>;
    ngForTrackBy: TrackByFn;
    constructor(_viewContainer: ViewContainerRef, _template: TemplateRef<NgForRow>, _differs: IterableDiffers, _cdr: ChangeDetectorRef);
    ngDoCheck(): void;
    ngOnChanges(changes: SimpleChanges): void;
}

/** @stable */
export declare class NgIf {
    ngIf: any;
    constructor(_viewContainer: ViewContainerRef, _template: TemplateRef<Object>);
}

/** @experimental */
export declare abstract class NgLocalization {
    abstract getPluralCategory(value: any): string;
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
    constructor(_differs: KeyValueDiffers, _ngEl: ElementRef, _renderer: Renderer);
    ngDoCheck(): void;
}

/** @stable */
export declare class NgSwitch {
    ngSwitch: any;
}

/** @stable */
export declare class NgSwitchCase {
    ngSwitchCase: any;
    constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>, ngSwitch: NgSwitch);
}

/** @stable */
export declare class NgSwitchDefault {
    constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>, sswitch: NgSwitch);
}

/** @experimental */
export declare class NgTemplateOutlet implements OnChanges {
    ngOutletContext: Object;
    ngTemplateOutlet: TemplateRef<Object>;
    constructor(_viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
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
    transform(value: any, digits?: string): string;
}

/** @stable */
export declare abstract class PlatformLocation {
    hash: string;
    pathname: string;
    search: string;
    abstract back(): void;
    abstract forward(): void;
    abstract getBaseHrefFromDOM(): string;
    abstract onHashChange(fn: LocationChangeListener): void;
    abstract onPopState(fn: LocationChangeListener): void;
    abstract pushState(state: any, title: string, url: string): void;
    abstract replaceState(state: any, title: string, url: string): void;
}

/** @stable */
export declare class SlicePipe implements PipeTransform {
    transform(value: any, start: number, end?: number): any;
}

/** @stable */
export declare class UpperCasePipe implements PipeTransform {
    transform(value: string): string;
}
