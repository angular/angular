export declare type _Bottom = {
    bottom?: number;
};

export declare type _End = {
    end?: number;
};

export declare function _fixedSizeVirtualScrollStrategyFactory(fixedSizeDir: CdkFixedSizeVirtualScroll): FixedSizeVirtualScrollStrategy;

export declare type _Left = {
    left?: number;
};

export declare type _Right = {
    right?: number;
};

export declare type _Start = {
    start?: number;
};

export declare type _Top = {
    top?: number;
};

export declare type _Without<T> = {
    [P in keyof T]?: never;
};

export declare type _XAxis = _XOR<_XOR<_Left, _Right>, _XOR<_Start, _End>>;

export declare type _XOR<T, U> = (_Without<T> & U) | (_Without<U> & T);

export declare type _YAxis = _XOR<_Top, _Bottom>;

export declare class CdkFixedSizeVirtualScroll implements OnChanges {
    _itemSize: number;
    _maxBufferPx: number;
    _minBufferPx: number;
    _scrollStrategy: FixedSizeVirtualScrollStrategy;
    itemSize: number;
    maxBufferPx: number;
    minBufferPx: number;
    ngOnChanges(): void;
}

export declare class CdkScrollable implements OnInit, OnDestroy {
    protected dir?: Directionality | undefined;
    protected elementRef: ElementRef<HTMLElement>;
    protected ngZone: NgZone;
    protected scrollDispatcher: ScrollDispatcher;
    constructor(elementRef: ElementRef<HTMLElement>, scrollDispatcher: ScrollDispatcher, ngZone: NgZone, dir?: Directionality | undefined);
    elementScrolled(): Observable<Event>;
    getElementRef(): ElementRef<HTMLElement>;
    measureScrollOffset(from: 'top' | 'left' | 'right' | 'bottom' | 'start' | 'end'): number;
    ngOnDestroy(): void;
    ngOnInit(): void;
    scrollTo(options: ExtendedScrollToOptions): void;
}

export declare class CdkVirtualForOf<T> implements CollectionViewer, DoCheck, OnDestroy {
    _cdkVirtualForOf: DataSource<T> | Observable<T[]> | NgIterable<T>;
    cdkVirtualForOf: DataSource<T> | Observable<T[]> | NgIterable<T>;
    cdkVirtualForTemplate: TemplateRef<CdkVirtualForOfContext<T>>;
    cdkVirtualForTemplateCacheSize: number;
    cdkVirtualForTrackBy: TrackByFunction<T> | undefined;
    dataStream: Observable<T[] | ReadonlyArray<T>>;
    viewChange: Subject<ListRange>;
    constructor(
    _viewContainerRef: ViewContainerRef,
    _template: TemplateRef<CdkVirtualForOfContext<T>>,
    _differs: IterableDiffers,
    _viewport: CdkVirtualScrollViewport, ngZone: NgZone);
    measureRangeSize(range: ListRange, orientation: 'horizontal' | 'vertical'): number;
    ngDoCheck(): void;
    ngOnDestroy(): void;
}

export declare type CdkVirtualForOfContext<T> = {
    $implicit: T;
    cdkVirtualForOf: DataSource<T> | Observable<T[]> | NgIterable<T>;
    index: number;
    count: number;
    first: boolean;
    last: boolean;
    even: boolean;
    odd: boolean;
};

export declare class CdkVirtualScrollViewport extends CdkScrollable implements OnInit, OnDestroy {
    _contentWrapper: ElementRef<HTMLElement>;
    _totalContentSizeTransform: string;
    elementRef: ElementRef<HTMLElement>;
    orientation: 'horizontal' | 'vertical';
    renderedRangeStream: Observable<ListRange>;
    scrolledIndexChange: Observable<number>;
    constructor(elementRef: ElementRef<HTMLElement>, _changeDetectorRef: ChangeDetectorRef, ngZone: NgZone, _scrollStrategy: VirtualScrollStrategy, dir: Directionality, scrollDispatcher: ScrollDispatcher);
    attach(forOf: CdkVirtualForOf<any>): void;
    checkViewportSize(): void;
    detach(): void;
    getDataLength(): number;
    getOffsetToRenderedContentStart(): number | null;
    getRenderedRange(): ListRange;
    getViewportSize(): number;
    measureRangeSize(range: ListRange): number;
    measureRenderedContentSize(): number;
    measureScrollOffset(from?: 'top' | 'left' | 'right' | 'bottom' | 'start' | 'end'): number;
    ngOnDestroy(): void;
    ngOnInit(): void;
    scrollToIndex(index: number, behavior?: ScrollBehavior): void;
    scrollToOffset(offset: number, behavior?: ScrollBehavior): void;
    setRenderedContentOffset(offset: number, to?: 'to-start' | 'to-end'): void;
    setRenderedRange(range: ListRange): void;
    setTotalContentSize(size: number): void;
}

export declare const DEFAULT_RESIZE_TIME = 20;

export declare const DEFAULT_SCROLL_TIME = 20;

export declare type ExtendedScrollToOptions = _XAxis & _YAxis & ScrollOptions;

export declare class FixedSizeVirtualScrollStrategy implements VirtualScrollStrategy {
    scrolledIndexChange: Observable<number>;
    constructor(itemSize: number, minBufferPx: number, maxBufferPx: number);
    attach(viewport: CdkVirtualScrollViewport): void;
    detach(): void;
    onContentRendered(): void;
    onContentScrolled(): void;
    onDataLengthChanged(): void;
    onRenderedOffsetChanged(): void;
    scrollToIndex(index: number, behavior: ScrollBehavior): void;
    updateItemAndBufferSize(itemSize: number, minBufferPx: number, maxBufferPx: number): void;
}

export declare const SCROLL_DISPATCHER_PROVIDER: {
    provide: typeof ScrollDispatcher;
    deps: (Optional[] | typeof NgZone | typeof Platform)[];
    useFactory: typeof SCROLL_DISPATCHER_PROVIDER_FACTORY;
};

export declare function SCROLL_DISPATCHER_PROVIDER_FACTORY(parentDispatcher: ScrollDispatcher, ngZone: NgZone, platform: Platform): ScrollDispatcher;

export declare class ScrollDispatcher implements OnDestroy {
    _globalSubscription: Subscription | null;
    scrollContainers: Map<CdkScrollable, Subscription>;
    constructor(_ngZone: NgZone, _platform: Platform);
    ancestorScrolled(elementRef: ElementRef, auditTimeInMs?: number): Observable<CdkScrollable | void>;
    deregister(scrollable: CdkScrollable): void;
    getAncestorScrollContainers(elementRef: ElementRef): CdkScrollable[];
    ngOnDestroy(): void;
    register(scrollable: CdkScrollable): void;
    scrolled(auditTimeInMs?: number): Observable<CdkScrollable | void>;
}

export declare class ScrollDispatchModule {
}

export declare class ScrollingModule {
}

export declare const VIEWPORT_RULER_PROVIDER: {
    provide: typeof ViewportRuler;
    deps: (Optional[] | typeof NgZone | typeof Platform)[];
    useFactory: typeof VIEWPORT_RULER_PROVIDER_FACTORY;
};

export declare function VIEWPORT_RULER_PROVIDER_FACTORY(parentRuler: ViewportRuler, platform: Platform, ngZone: NgZone): ViewportRuler;

export declare class ViewportRuler implements OnDestroy {
    constructor(_platform: Platform, ngZone: NgZone);
    change(throttleTime?: number): Observable<Event>;
    getViewportRect(): ClientRect;
    getViewportScrollPosition(): ViewportScrollPosition;
    getViewportSize(): Readonly<{
        width: number;
        height: number;
    }>;
    ngOnDestroy(): void;
}

export interface ViewportScrollPosition {
    left: number;
    top: number;
}

export declare const VIRTUAL_SCROLL_STRATEGY: InjectionToken<VirtualScrollStrategy>;

export interface VirtualScrollStrategy {
    scrolledIndexChange: Observable<number>;
    attach(viewport: CdkVirtualScrollViewport): void;
    detach(): void;
    onContentRendered(): void;
    onContentScrolled(): void;
    onDataLengthChanged(): void;
    onRenderedOffsetChanged(): void;
    scrollToIndex(index: number, behavior: ScrollBehavior): void;
}
