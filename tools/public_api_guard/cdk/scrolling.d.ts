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
    static ngAcceptInputType_itemSize: NumberInput;
    static ngAcceptInputType_maxBufferPx: NumberInput;
    static ngAcceptInputType_minBufferPx: NumberInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkFixedSizeVirtualScroll, "cdk-virtual-scroll-viewport[itemSize]", never, { "itemSize": "itemSize"; "minBufferPx": "minBufferPx"; "maxBufferPx": "maxBufferPx"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkFixedSizeVirtualScroll>;
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
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkScrollable, "[cdk-scrollable], [cdkScrollable]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkScrollable>;
}

export declare class CdkVirtualForOf<T> implements CollectionViewer, DoCheck, OnDestroy {
    _cdkVirtualForOf: DataSource<T> | Observable<T[]> | NgIterable<T> | null | undefined;
    cdkVirtualForOf: DataSource<T> | Observable<T[]> | NgIterable<T> | null | undefined;
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
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkVirtualForOf<any>, "[cdkVirtualFor][cdkVirtualForOf]", never, { "cdkVirtualForOf": "cdkVirtualForOf"; "cdkVirtualForTrackBy": "cdkVirtualForTrackBy"; "cdkVirtualForTemplate": "cdkVirtualForTemplate"; "cdkVirtualForTemplateCacheSize": "cdkVirtualForTemplateCacheSize"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkVirtualForOf<any>>;
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
    _totalContentHeight: string;
    _totalContentWidth: string;
    elementRef: ElementRef<HTMLElement>;
    orientation: 'horizontal' | 'vertical';
    renderedRangeStream: Observable<ListRange>;
    scrolledIndexChange: Observable<number>;
    constructor(elementRef: ElementRef<HTMLElement>, _changeDetectorRef: ChangeDetectorRef, ngZone: NgZone, _scrollStrategy: VirtualScrollStrategy, dir: Directionality, scrollDispatcher: ScrollDispatcher,
    viewportRuler?: ViewportRuler);
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
    static ɵcmp: i0.ɵɵComponentDefWithMeta<CdkVirtualScrollViewport, "cdk-virtual-scroll-viewport", never, { "orientation": "orientation"; }, { "scrolledIndexChange": "scrolledIndexChange"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkVirtualScrollViewport>;
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
    static ɵfac: i0.ɵɵFactoryDef<ScrollDispatcher>;
    static ɵprov: i0.ɵɵInjectableDef<ScrollDispatcher>;
}

export declare class ScrollingModule {
    static ɵinj: i0.ɵɵInjectorDef<ScrollingModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<ScrollingModule, [typeof i1.CdkFixedSizeVirtualScroll, typeof i2.CdkScrollable, typeof i3.CdkVirtualForOf, typeof i4.CdkVirtualScrollViewport], [typeof i5.BidiModule, typeof i6.PlatformModule], [typeof i5.BidiModule, typeof i1.CdkFixedSizeVirtualScroll, typeof i2.CdkScrollable, typeof i3.CdkVirtualForOf, typeof i4.CdkVirtualScrollViewport]>;
}

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
    static ɵfac: i0.ɵɵFactoryDef<ViewportRuler>;
    static ɵprov: i0.ɵɵInjectableDef<ViewportRuler>;
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
