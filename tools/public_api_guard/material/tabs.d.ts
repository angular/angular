export declare const _MAT_INK_BAR_POSITIONER: InjectionToken<_MatInkBarPositioner>;

export interface _MatInkBarPositioner {
    (element: HTMLElement): {
        left: string;
        width: string;
    };
}

export declare abstract class _MatTabBodyBase implements OnInit, OnDestroy {
    readonly _afterLeavingCenter: EventEmitter<boolean>;
    readonly _beforeCentering: EventEmitter<boolean>;
    _content: TemplatePortal;
    readonly _onCentered: EventEmitter<void>;
    readonly _onCentering: EventEmitter<number>;
    abstract _portalHost: PortalHostDirective;
    _position: MatTabBodyPositionState;
    _translateTabComplete: Subject<AnimationEvent>;
    animationDuration: string;
    origin: number;
    position: number;
    constructor(_elementRef: ElementRef<HTMLElement>, _dir: Directionality, changeDetectorRef: ChangeDetectorRef);
    _getLayoutDirection(): Direction;
    _isCenterPosition(position: MatTabBodyPositionState | string): boolean;
    _onTranslateTabStarted(event: AnimationEvent): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
}

export declare abstract class _MatTabGroupBase extends _MatTabGroupMixinBase implements AfterContentInit, AfterContentChecked, OnDestroy, CanColor, CanDisableRipple {
    _animationMode?: string | undefined;
    abstract _tabBodyWrapper: ElementRef;
    abstract _tabHeader: MatTabGroupBaseHeader;
    abstract _tabs: QueryList<MatTab>;
    readonly animationDone: EventEmitter<void>;
    animationDuration: string;
    backgroundColor: ThemePalette;
    dynamicHeight: boolean;
    readonly focusChange: EventEmitter<MatTabChangeEvent>;
    headerPosition: MatTabHeaderPosition;
    selectedIndex: number | null;
    readonly selectedIndexChange: EventEmitter<number>;
    readonly selectedTabChange: EventEmitter<MatTabChangeEvent>;
    constructor(elementRef: ElementRef, _changeDetectorRef: ChangeDetectorRef, defaultConfig?: MatTabsConfig, _animationMode?: string | undefined);
    _focusChanged(index: number): void;
    _getTabContentId(i: number): string;
    _getTabIndex(tab: MatTab, idx: number): number | null;
    _getTabLabelId(i: number): string;
    _handleClick(tab: MatTab, tabHeader: MatTabGroupBaseHeader, index: number): void;
    _removeTabBodyWrapperHeight(): void;
    _setTabBodyWrapperHeight(tabHeight: number): void;
    ngAfterContentChecked(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    realignInkBar(): void;
}

export declare abstract class _MatTabHeaderBase extends MatPaginatedTabHeader implements AfterContentChecked, AfterContentInit, AfterViewInit, OnDestroy {
    disableRipple: any;
    constructor(elementRef: ElementRef, changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler, dir: Directionality, ngZone: NgZone, platform: Platform, animationMode?: string);
    protected _itemSelected(event: KeyboardEvent): void;
}

export declare class _MatTabLinkBase extends _MatTabLinkMixinBase implements OnDestroy, CanDisable, CanDisableRipple, HasTabIndex, RippleTarget, FocusableOption {
    protected _isActive: boolean;
    active: boolean;
    elementRef: ElementRef;
    rippleConfig: RippleConfig & RippleGlobalOptions;
    readonly rippleDisabled: boolean;
    constructor(_tabNavBar: _MatTabNavBase, elementRef: ElementRef, globalRippleOptions: RippleGlobalOptions | null, tabIndex: string, _focusMonitor: FocusMonitor, animationMode?: string);
    focus(): void;
    ngOnDestroy(): void;
}

export declare abstract class _MatTabNavBase extends MatPaginatedTabHeader implements AfterContentChecked, AfterContentInit, OnDestroy {
    abstract _items: QueryList<MatPaginatedTabHeaderItem & {
        active: boolean;
    }>;
    backgroundColor: ThemePalette;
    color: ThemePalette;
    disableRipple: any;
    constructor(elementRef: ElementRef, dir: Directionality, ngZone: NgZone, changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler,
    platform?: Platform, animationMode?: string);
    protected _itemSelected(): void;
    ngAfterContentInit(): void;
    updateActiveLink(_element?: ElementRef): void;
}

export declare const MAT_TABS_CONFIG: InjectionToken<MatTabsConfig>;

export declare class MatInkBar {
    _animationMode?: string | undefined;
    constructor(_elementRef: ElementRef<HTMLElement>, _ngZone: NgZone, _inkBarPositioner: _MatInkBarPositioner, _animationMode?: string | undefined);
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

export declare class MatTabBody extends _MatTabBodyBase {
    _portalHost: PortalHostDirective;
    constructor(elementRef: ElementRef<HTMLElement>, dir: Directionality, changeDetectorRef: ChangeDetectorRef);
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

export declare class MatTabGroup extends _MatTabGroupBase {
    _tabBodyWrapper: ElementRef;
    _tabHeader: MatTabGroupBaseHeader;
    _tabs: QueryList<MatTab>;
    constructor(elementRef: ElementRef, changeDetectorRef: ChangeDetectorRef, defaultConfig?: MatTabsConfig, animationMode?: string);
}

export declare class MatTabHeader extends _MatTabHeaderBase {
    _inkBar: MatInkBar;
    _items: QueryList<MatTabLabelWrapper>;
    _nextPaginator: ElementRef<HTMLElement>;
    _previousPaginator: ElementRef<HTMLElement>;
    _tabList: ElementRef;
    _tabListContainer: ElementRef;
    constructor(elementRef: ElementRef, changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler, dir: Directionality, ngZone: NgZone, platform: Platform, animationMode?: string);
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

export declare class MatTabLink extends _MatTabLinkBase implements OnDestroy {
    constructor(tabNavBar: MatTabNav, elementRef: ElementRef, ngZone: NgZone, platform: Platform, globalRippleOptions: RippleGlobalOptions | null, tabIndex: string, focusMonitor: FocusMonitor, animationMode?: string);
    ngOnDestroy(): void;
}

export declare class MatTabNav extends _MatTabNavBase {
    _inkBar: MatInkBar;
    _items: QueryList<MatTabLink>;
    _nextPaginator: ElementRef<HTMLElement>;
    _previousPaginator: ElementRef<HTMLElement>;
    _tabList: ElementRef;
    _tabListContainer: ElementRef;
    constructor(elementRef: ElementRef, dir: Directionality, ngZone: NgZone, changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler,
    platform?: Platform, animationMode?: string);
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
