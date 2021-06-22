export declare const _MAT_INK_BAR_POSITIONER: InjectionToken<_MatInkBarPositioner>;

export interface _MatInkBarPositioner {
    (element: HTMLElement): {
        left: string;
        width: string;
    };
}

export declare abstract class _MatTabBodyBase implements OnInit, OnDestroy {
    readonly _afterLeavingCenter: EventEmitter<void>;
    readonly _beforeCentering: EventEmitter<boolean>;
    _content: TemplatePortal;
    readonly _onCentered: EventEmitter<void>;
    readonly _onCentering: EventEmitter<number>;
    abstract _portalHost: CdkPortalOutlet;
    _position: MatTabBodyPositionState;
    readonly _translateTabComplete: Subject<AnimationEvent>;
    animationDuration: string;
    origin: number | null;
    set position(position: number);
    constructor(_elementRef: ElementRef<HTMLElement>, _dir: Directionality, changeDetectorRef: ChangeDetectorRef);
    _getLayoutDirection(): Direction;
    _isCenterPosition(position: MatTabBodyPositionState | string): boolean;
    _onTranslateTabStarted(event: AnimationEvent): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<_MatTabBodyBase, never, never, { "_content": "content"; "origin": "origin"; "animationDuration": "animationDuration"; "position": "position"; }, { "_onCentering": "_onCentering"; "_beforeCentering": "_beforeCentering"; "_afterLeavingCenter": "_afterLeavingCenter"; "_onCentered": "_onCentered"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<_MatTabBodyBase, [null, { optional: true; }, null]>;
}

export declare abstract class _MatTabGroupBase extends _MatTabGroupMixinBase implements AfterContentInit, AfterContentChecked, OnDestroy, CanColor, CanDisableRipple {
    abstract _allTabs: QueryList<MatTab>;
    _animationMode?: string | undefined;
    protected _changeDetectorRef: ChangeDetectorRef;
    abstract _tabBodyWrapper: ElementRef;
    abstract _tabHeader: MatTabGroupBaseHeader;
    _tabs: QueryList<MatTab>;
    readonly animationDone: EventEmitter<void>;
    get animationDuration(): string;
    set animationDuration(value: string);
    get backgroundColor(): ThemePalette;
    set backgroundColor(value: ThemePalette);
    get contentTabIndex(): number | null;
    set contentTabIndex(value: number | null);
    disablePagination: boolean;
    get dynamicHeight(): boolean;
    set dynamicHeight(value: boolean);
    readonly focusChange: EventEmitter<MatTabChangeEvent>;
    headerPosition: MatTabHeaderPosition;
    get selectedIndex(): number | null;
    set selectedIndex(value: number | null);
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
    _tabFocusChanged(focusOrigin: FocusOrigin, index: number): void;
    focusTab(index: number): void;
    ngAfterContentChecked(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    realignInkBar(): void;
    static ngAcceptInputType_animationDuration: NumberInput;
    static ngAcceptInputType_contentTabIndex: BooleanInput;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_dynamicHeight: BooleanInput;
    static ngAcceptInputType_selectedIndex: NumberInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<_MatTabGroupBase, never, never, { "dynamicHeight": "dynamicHeight"; "selectedIndex": "selectedIndex"; "headerPosition": "headerPosition"; "animationDuration": "animationDuration"; "contentTabIndex": "contentTabIndex"; "disablePagination": "disablePagination"; "backgroundColor": "backgroundColor"; }, { "selectedIndexChange": "selectedIndexChange"; "focusChange": "focusChange"; "animationDone": "animationDone"; "selectedTabChange": "selectedTabChange"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<_MatTabGroupBase, [null, null, { optional: true; }, { optional: true; }]>;
}

export declare abstract class _MatTabHeaderBase extends MatPaginatedTabHeader implements AfterContentChecked, AfterContentInit, AfterViewInit, OnDestroy {
    get disableRipple(): any;
    set disableRipple(value: any);
    constructor(elementRef: ElementRef, changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler, dir: Directionality, ngZone: NgZone, platform: Platform, animationMode?: string);
    protected _itemSelected(event: KeyboardEvent): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<_MatTabHeaderBase, never, never, { "disableRipple": "disableRipple"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<_MatTabHeaderBase, [null, null, null, { optional: true; }, null, null, { optional: true; }]>;
}

export declare class _MatTabLinkBase extends _MatTabLinkMixinBase implements AfterViewInit, OnDestroy, CanDisable, CanDisableRipple, HasTabIndex, RippleTarget, FocusableOption {
    protected _isActive: boolean;
    get active(): boolean;
    set active(value: boolean); elementRef: ElementRef;
    rippleConfig: RippleConfig & RippleGlobalOptions;
    get rippleDisabled(): boolean;
    constructor(_tabNavBar: _MatTabNavBase, elementRef: ElementRef, globalRippleOptions: RippleGlobalOptions | null, tabIndex: string, _focusMonitor: FocusMonitor, animationMode?: string);
    _handleFocus(): void;
    focus(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_active: BooleanInput;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_tabIndex: NumberInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<_MatTabLinkBase, never, never, { "active": "active"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<_MatTabLinkBase, [null, null, { optional: true; }, { attribute: "tabindex"; }, null, { optional: true; }]>;
}

export declare abstract class _MatTabNavBase extends MatPaginatedTabHeader implements AfterContentChecked, AfterContentInit, OnDestroy {
    abstract _items: QueryList<MatPaginatedTabHeaderItem & {
        active: boolean;
    }>;
    get backgroundColor(): ThemePalette;
    set backgroundColor(value: ThemePalette);
    color: ThemePalette;
    get disableRipple(): any;
    set disableRipple(value: any);
    constructor(elementRef: ElementRef, dir: Directionality, ngZone: NgZone, changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler, platform: Platform, animationMode?: string);
    protected _itemSelected(): void;
    ngAfterContentInit(): void;
    updateActiveLink(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<_MatTabNavBase, never, never, { "backgroundColor": "backgroundColor"; "disableRipple": "disableRipple"; "color": "color"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<_MatTabNavBase, [null, { optional: true; }, null, null, null, null, { optional: true; }]>;
}

export declare const MAT_TAB_GROUP: InjectionToken<any>;

export declare const MAT_TABS_CONFIG: InjectionToken<MatTabsConfig>;

export declare class MatInkBar {
    _animationMode?: string | undefined;
    constructor(_elementRef: ElementRef<HTMLElement>, _ngZone: NgZone, _inkBarPositioner: _MatInkBarPositioner, _animationMode?: string | undefined);
    alignToElement(element: HTMLElement): void;
    hide(): void;
    show(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatInkBar, "mat-ink-bar", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatInkBar, [null, null, null, { optional: true; }]>;
}

export declare class MatTab extends _MatTabBase implements OnInit, CanDisable, OnChanges, OnDestroy {
    _closestTabGroup: any;
    _explicitContent: TemplateRef<any>;
    _implicitContent: TemplateRef<any>;
    readonly _stateChanges: Subject<void>;
    protected _templateLabel: MatTabLabel;
    ariaLabel: string;
    ariaLabelledby: string;
    get content(): TemplatePortal | null;
    isActive: boolean;
    origin: number | null;
    position: number | null;
    get templateLabel(): MatTabLabel;
    set templateLabel(value: MatTabLabel);
    textLabel: string;
    constructor(_viewContainerRef: ViewContainerRef, _closestTabGroup: any);
    protected _setTemplateLabelInput(value: MatTabLabel): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatTab, "mat-tab", ["matTab"], { "disabled": "disabled"; "textLabel": "label"; "ariaLabel": "aria-label"; "ariaLabelledby": "aria-labelledby"; }, {}, ["templateLabel", "_explicitContent"], ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTab, [null, { optional: true; }]>;
}

export declare class MatTabBody extends _MatTabBodyBase {
    _portalHost: CdkPortalOutlet;
    constructor(elementRef: ElementRef<HTMLElement>, dir: Directionality, changeDetectorRef: ChangeDetectorRef);
    static ɵcmp: i0.ɵɵComponentDeclaration<MatTabBody, "mat-tab-body", never, {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTabBody, [null, { optional: true; }, null]>;
}

export declare type MatTabBodyOriginState = 'left' | 'right';

export declare class MatTabBodyPortal extends CdkPortalOutlet implements OnInit, OnDestroy {
    constructor(componentFactoryResolver: ComponentFactoryResolver, viewContainerRef: ViewContainerRef, _host: MatTabBody, _document: any);
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatTabBodyPortal, "[matTabBodyHost]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTabBodyPortal, never>;
}

export declare type MatTabBodyPositionState = 'left' | 'center' | 'right' | 'left-origin-center' | 'right-origin-center';

export declare class MatTabChangeEvent {
    index: number;
    tab: MatTab;
}

export declare class MatTabContent { template: TemplateRef<any>;
    constructor( template: TemplateRef<any>);
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatTabContent, "[matTabContent]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTabContent, never>;
}

export declare class MatTabGroup extends _MatTabGroupBase {
    _allTabs: QueryList<MatTab>;
    _tabBodyWrapper: ElementRef;
    _tabHeader: MatTabGroupBaseHeader;
    constructor(elementRef: ElementRef, changeDetectorRef: ChangeDetectorRef, defaultConfig?: MatTabsConfig, animationMode?: string);
    static ɵcmp: i0.ɵɵComponentDeclaration<MatTabGroup, "mat-tab-group", ["matTabGroup"], { "color": "color"; "disableRipple": "disableRipple"; }, {}, ["_allTabs"], never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTabGroup, [null, null, { optional: true; }, { optional: true; }]>;
}

export declare class MatTabHeader extends _MatTabHeaderBase {
    _inkBar: MatInkBar;
    _items: QueryList<MatTabLabelWrapper>;
    _nextPaginator: ElementRef<HTMLElement>;
    _previousPaginator: ElementRef<HTMLElement>;
    _tabList: ElementRef;
    _tabListContainer: ElementRef;
    constructor(elementRef: ElementRef, changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler, dir: Directionality, ngZone: NgZone, platform: Platform, animationMode?: string);
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatTabHeader, "mat-tab-header", never, { "selectedIndex": "selectedIndex"; }, { "selectFocusedIndex": "selectFocusedIndex"; "indexFocused": "indexFocused"; }, ["_items"], ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTabHeader, [null, null, null, { optional: true; }, null, null, { optional: true; }]>;
}

export declare type MatTabHeaderPosition = 'above' | 'below';

export declare class MatTabLabel extends CdkPortal {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatTabLabel, "[mat-tab-label], [matTabLabel]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTabLabel, never>;
}

export declare class MatTabLabelWrapper extends _MatTabLabelWrapperBase implements CanDisable {
    elementRef: ElementRef;
    constructor(elementRef: ElementRef);
    focus(): void;
    getOffsetLeft(): number;
    getOffsetWidth(): number;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatTabLabelWrapper, "[matTabLabelWrapper]", never, { "disabled": "disabled"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTabLabelWrapper, never>;
}

export declare class MatTabLink extends _MatTabLinkBase implements OnDestroy {
    constructor(tabNavBar: MatTabNav, elementRef: ElementRef, ngZone: NgZone, platform: Platform, globalRippleOptions: RippleGlobalOptions | null, tabIndex: string, focusMonitor: FocusMonitor, animationMode?: string);
    ngOnDestroy(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatTabLink, "[mat-tab-link], [matTabLink]", ["matTabLink"], { "disabled": "disabled"; "disableRipple": "disableRipple"; "tabIndex": "tabIndex"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTabLink, [null, null, null, null, { optional: true; }, { attribute: "tabindex"; }, null, { optional: true; }]>;
}

export declare class MatTabNav extends _MatTabNavBase {
    _inkBar: MatInkBar;
    _items: QueryList<MatTabLink>;
    _nextPaginator: ElementRef<HTMLElement>;
    _previousPaginator: ElementRef<HTMLElement>;
    _tabList: ElementRef;
    _tabListContainer: ElementRef;
    constructor(elementRef: ElementRef, dir: Directionality, ngZone: NgZone, changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler, platform: Platform, animationMode?: string);
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatTabNav, "[mat-tab-nav-bar]", ["matTabNavBar", "matTabNav"], { "color": "color"; }, {}, ["_items"], ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTabNav, [null, { optional: true; }, null, null, null, null, { optional: true; }]>;
}

export declare const matTabsAnimations: {
    readonly translateTab: AnimationTriggerMetadata;
};

export interface MatTabsConfig {
    animationDuration?: string;
    contentTabIndex?: number;
    disablePagination?: boolean;
    dynamicHeight?: boolean;
    fitInkBarToContent?: boolean;
}

export declare class MatTabsModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTabsModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatTabsModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatTabsModule, [typeof i1.MatTabGroup, typeof i2.MatTabLabel, typeof i3.MatTab, typeof i4.MatInkBar, typeof i5.MatTabLabelWrapper, typeof i6.MatTabNav, typeof i6.MatTabLink, typeof i7.MatTabBody, typeof i7.MatTabBodyPortal, typeof i8.MatTabHeader, typeof i9.MatTabContent], [typeof i10.CommonModule, typeof i11.MatCommonModule, typeof i12.PortalModule, typeof i11.MatRippleModule, typeof i13.ObserversModule, typeof i14.A11yModule], [typeof i11.MatCommonModule, typeof i1.MatTabGroup, typeof i2.MatTabLabel, typeof i3.MatTab, typeof i6.MatTabNav, typeof i6.MatTabLink, typeof i9.MatTabContent]>;
}

export declare type ScrollDirection = 'after' | 'before';
