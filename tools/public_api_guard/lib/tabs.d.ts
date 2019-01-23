export declare const _MAT_INK_BAR_POSITIONER: InjectionToken<_MatInkBarPositioner>;

export interface _MatInkBarPositioner {
    (element: HTMLElement): {
        left: string;
        width: string;
    };
}

export declare const _MatTabGroupMixinBase: CanColorCtor & CanDisableRippleCtor & typeof MatTabGroupBase;

export declare const MAT_TABS_CONFIG: InjectionToken<{}>;

export declare class MatInkBar {
    constructor(_elementRef: ElementRef<HTMLElement>, _ngZone: NgZone, _inkBarPositioner: _MatInkBarPositioner);
    alignToElement(element: HTMLElement): void;
    hide(): void;
    show(): void;
}

export declare class MatTab extends _MatTabMixinBase implements OnInit, CanDisable, OnChanges, OnDestroy {
    _explicitContent: TemplateRef<any>;
    _implicitContent: TemplateRef<any>;
    readonly _stateChanges: Subject<void>;
    ariaLabel: string;
    ariaLabelledby: string;
    readonly content: TemplatePortal | null;
    isActive: boolean;
    origin: number | null;
    position: number | null;
    templateLabel: MatTabLabel;
    textLabel: string;
    constructor(_viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
}

export declare class MatTabBody implements OnInit, OnDestroy {
    readonly _afterLeavingCenter: EventEmitter<boolean>;
    readonly _beforeCentering: EventEmitter<boolean>;
    _content: TemplatePortal;
    readonly _onCentered: EventEmitter<void>;
    readonly _onCentering: EventEmitter<number>;
    _portalHost: PortalHostDirective;
    _position: MatTabBodyPositionState;
    _translateTabComplete: Subject<AnimationEvent>;
    animationDuration: string;
    origin: number;
    position: number;
    constructor(_elementRef: ElementRef<HTMLElement>, _dir: Directionality,
    changeDetectorRef?: ChangeDetectorRef);
    _getLayoutDirection(): Direction;
    _isCenterPosition(position: MatTabBodyPositionState | string): boolean;
    _onTranslateTabStarted(event: AnimationEvent): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
}

export declare type MatTabBodyOriginState = 'left' | 'right';

export declare class MatTabBodyPortal extends CdkPortalOutlet implements OnInit, OnDestroy {
    constructor(componentFactoryResolver: ComponentFactoryResolver, viewContainerRef: ViewContainerRef, _host: MatTabBody);
    ngOnDestroy(): void;
    ngOnInit(): void;
}

export declare type MatTabBodyPositionState = 'left' | 'center' | 'right' | 'left-origin-center' | 'right-origin-center';

export declare class MatTabChangeEvent {
    index: number;
    tab: MatTab;
}

export declare class MatTabContent {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
}

export declare class MatTabGroup extends _MatTabGroupMixinBase implements AfterContentInit, AfterContentChecked, OnDestroy, CanColor, CanDisableRipple {
    _tabBodyWrapper: ElementRef;
    _tabHeader: MatTabHeader;
    _tabs: QueryList<MatTab>;
    readonly animationDone: EventEmitter<void>;
    animationDuration: string;
    backgroundColor: ThemePalette;
    dynamicHeight: boolean;
    readonly focusChange: EventEmitter<MatTabChangeEvent>;
    headerPosition: MatTabHeaderPosition;
    selectedIndex: number | null;
    readonly selectedIndexChange: EventEmitter<number>;
    readonly selectedTabChange: EventEmitter<MatTabChangeEvent>;
    constructor(elementRef: ElementRef, _changeDetectorRef: ChangeDetectorRef, defaultConfig?: MatTabsConfig);
    _focusChanged(index: number): void;
    _getTabContentId(i: number): string;
    _getTabIndex(tab: MatTab, idx: number): number | null;
    _getTabLabelId(i: number): string;
    _handleClick(tab: MatTab, tabHeader: MatTabHeader, index: number): void;
    _removeTabBodyWrapperHeight(): void;
    _setTabBodyWrapperHeight(tabHeight: number): void;
    ngAfterContentChecked(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    realignInkBar(): void;
}

export declare class MatTabGroupBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}

export declare class MatTabHeader extends _MatTabHeaderMixinBase implements AfterContentChecked, AfterContentInit, AfterViewInit, OnDestroy, CanDisableRipple {
    _disableScrollAfter: boolean;
    _disableScrollBefore: boolean;
    _inkBar: MatInkBar;
    _labelWrappers: QueryList<MatTabLabelWrapper>;
    _nextPaginator: ElementRef<HTMLElement>;
    _previousPaginator: ElementRef<HTMLElement>;
    _showPaginationControls: boolean;
    _tabList: ElementRef;
    _tabListContainer: ElementRef;
    focusIndex: number;
    readonly indexFocused: EventEmitter<number>;
    scrollDistance: number;
    readonly selectFocusedIndex: EventEmitter<number>;
    selectedIndex: number;
    constructor(_elementRef: ElementRef, _changeDetectorRef: ChangeDetectorRef, _viewportRuler: ViewportRuler, _dir: Directionality, _ngZone?: NgZone | undefined, _platform?: Platform | undefined);
    _alignInkBarToSelectedTab(): void;
    _checkPaginationEnabled(): void;
    _checkScrollingControls(): void;
    _getLayoutDirection(): Direction;
    _getMaxScrollDistance(): number;
    _handleKeydown(event: KeyboardEvent): void;
    _handlePaginatorClick(direction: ScrollDirection): void;
    _handlePaginatorPress(direction: ScrollDirection): void;
    _isValidIndex(index: number): boolean;
    _onContentChanges(): void;
    _scrollHeader(direction: ScrollDirection): {
        maxScrollDistance: number;
        distance: number;
    };
    _scrollToLabel(labelIndex: number): void;
    _setTabFocus(tabIndex: number): void;
    _stopInterval(): void;
    _updateTabScrollPosition(): void;
    ngAfterContentChecked(): void;
    ngAfterContentInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    updatePagination(): void;
}

export declare type MatTabHeaderPosition = 'above' | 'below';

export declare class MatTabLabel extends CdkPortal {
}

export declare class MatTabLabelWrapper extends _MatTabLabelWrapperMixinBase implements CanDisable {
    elementRef: ElementRef;
    constructor(elementRef: ElementRef);
    focus(): void;
    getOffsetLeft(): number;
    getOffsetWidth(): number;
}

export declare class MatTabLink extends _MatTabLinkMixinBase implements OnDestroy, CanDisable, CanDisableRipple, HasTabIndex, RippleTarget {
    _elementRef: ElementRef;
    protected _isActive: boolean;
    protected _tabLinkRipple: RippleRenderer;
    active: boolean;
    rippleConfig: RippleConfig & RippleGlobalOptions;
    readonly rippleDisabled: boolean;
    constructor(_tabNavBar: MatTabNav, _elementRef: ElementRef, ngZone: NgZone, platform: Platform, globalRippleOptions: RippleGlobalOptions | null, tabIndex: string,
    _focusMonitor?: FocusMonitor | undefined);
    ngOnDestroy(): void;
}

export declare class MatTabNav extends _MatTabNavMixinBase implements AfterContentChecked, AfterContentInit, CanColor, CanDisableRipple, OnDestroy {
    _inkBar: MatInkBar;
    _tabLinks: QueryList<MatTabLink>;
    backgroundColor: ThemePalette;
    constructor(elementRef: ElementRef, _dir: Directionality, _ngZone: NgZone, _changeDetectorRef: ChangeDetectorRef, _viewportRuler: ViewportRuler);
    _alignInkBar(): void;
    ngAfterContentChecked(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    updateActiveLink(element: ElementRef): void;
}

export declare const matTabsAnimations: {
    readonly translateTab: AnimationTriggerMetadata;
};

export interface MatTabsConfig {
    animationDuration?: string;
}

export declare class MatTabsModule {
}

export declare type ScrollDirection = 'after' | 'before';
