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
    origin: number | null;
    position: number;
    constructor(_elementRef: ElementRef<HTMLElement>, _dir: Directionality, changeDetectorRef: ChangeDetectorRef);
    _getLayoutDirection(): Direction;
    _isCenterPosition(position: MatTabBodyPositionState | string): boolean;
    _onTranslateTabStarted(event: AnimationEvent): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<_MatTabBodyBase, never, never, { '_content': "content", 'origin': "origin", 'animationDuration': "animationDuration", 'position': "position" }, { '_onCentering': "_onCentering", '_beforeCentering': "_beforeCentering", '_afterLeavingCenter': "_afterLeavingCenter", '_onCentered': "_onCentered" }, never>;
    static ɵfac: i0.ɵɵFactoryDef<_MatTabBodyBase>;
}

export declare abstract class _MatTabGroupBase extends _MatTabGroupMixinBase implements AfterContentInit, AfterContentChecked, OnDestroy, CanColor, CanDisableRipple {
    abstract _allTabs: QueryList<MatTab>;
    _animationMode?: string | undefined;
    protected _changeDetectorRef: ChangeDetectorRef;
    abstract _tabBodyWrapper: ElementRef;
    abstract _tabHeader: MatTabGroupBaseHeader;
    _tabs: QueryList<MatTab>;
    readonly animationDone: EventEmitter<void>;
    animationDuration: string;
    backgroundColor: ThemePalette;
    disablePagination: boolean;
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
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<_MatTabGroupBase, never, never, { 'dynamicHeight': "dynamicHeight", 'selectedIndex': "selectedIndex", 'headerPosition': "headerPosition", 'animationDuration': "animationDuration", 'disablePagination': "disablePagination", 'backgroundColor': "backgroundColor" }, { 'selectedIndexChange': "selectedIndexChange", 'focusChange': "focusChange", 'animationDone': "animationDone", 'selectedTabChange': "selectedTabChange" }, never>;
    static ɵfac: i0.ɵɵFactoryDef<_MatTabGroupBase>;
}

export declare abstract class _MatTabHeaderBase extends MatPaginatedTabHeader implements AfterContentChecked, AfterContentInit, AfterViewInit, OnDestroy {
    disableRipple: any;
    constructor(elementRef: ElementRef, changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler, dir: Directionality, ngZone: NgZone, platform: Platform, animationMode?: string);
    protected _itemSelected(event: KeyboardEvent): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<_MatTabHeaderBase, never, never, { 'disableRipple': "disableRipple" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<_MatTabHeaderBase>;
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
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<_MatTabLinkBase, never, never, { 'active': "active" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<_MatTabLinkBase>;
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
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<_MatTabNavBase, never, never, { 'backgroundColor': "backgroundColor", 'disableRipple': "disableRipple", 'color': "color" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<_MatTabNavBase>;
}

export declare const MAT_TAB_GROUP: InjectionToken<any>;

export declare const MAT_TABS_CONFIG: InjectionToken<MatTabsConfig>;

export declare class MatInkBar {
    _animationMode?: string | undefined;
    constructor(_elementRef: ElementRef<HTMLElement>, _ngZone: NgZone, _inkBarPositioner: _MatInkBarPositioner, _animationMode?: string | undefined);
    alignToElement(element: HTMLElement): void;
    hide(): void;
    show(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatInkBar, "mat-ink-bar", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatInkBar>;
}

export declare class MatTab extends _MatTabMixinBase implements OnInit, CanDisable, OnChanges, OnDestroy {
    _closestTabGroup?: any;
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
    constructor(_viewContainerRef: ViewContainerRef,
    _closestTabGroup?: any);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatTab, "mat-tab", ["matTab"], { 'disabled': "disabled", 'textLabel': "label", 'ariaLabel': "aria-label", 'ariaLabelledby': "aria-labelledby" }, {}, ["templateLabel", "_explicitContent"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatTab>;
}

export declare class MatTabBody extends _MatTabBodyBase {
    _portalHost: PortalHostDirective;
    constructor(elementRef: ElementRef<HTMLElement>, dir: Directionality, changeDetectorRef: ChangeDetectorRef);
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatTabBody, "mat-tab-body", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTabBody>;
}

export declare type MatTabBodyOriginState = 'left' | 'right';

export declare class MatTabBodyPortal extends CdkPortalOutlet implements OnInit, OnDestroy {
    constructor(componentFactoryResolver: ComponentFactoryResolver, viewContainerRef: ViewContainerRef, _host: MatTabBody,
    _document?: any);
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatTabBodyPortal, "[matTabBodyHost]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTabBodyPortal>;
}

export declare type MatTabBodyPositionState = 'left' | 'center' | 'right' | 'left-origin-center' | 'right-origin-center';

export declare class MatTabChangeEvent {
    index: number;
    tab: MatTab;
}

export declare class MatTabContent {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatTabContent, "[matTabContent]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTabContent>;
}

export declare class MatTabGroup extends _MatTabGroupBase {
    _allTabs: QueryList<MatTab>;
    _tabBodyWrapper: ElementRef;
    _tabHeader: MatTabGroupBaseHeader;
    constructor(elementRef: ElementRef, changeDetectorRef: ChangeDetectorRef, defaultConfig?: MatTabsConfig, animationMode?: string);
    static ngAcceptInputType_animationDuration: NumberInput;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_dynamicHeight: BooleanInput;
    static ngAcceptInputType_selectedIndex: NumberInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatTabGroup, "mat-tab-group", ["matTabGroup"], { 'color': "color", 'disableRipple': "disableRipple" }, {}, ["_allTabs"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatTabGroup>;
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
    static ngAcceptInputType_selectedIndex: NumberInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatTabHeader, "mat-tab-header", never, { 'selectedIndex': "selectedIndex" }, { 'selectFocusedIndex': "selectFocusedIndex", 'indexFocused': "indexFocused" }, ["_items"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatTabHeader>;
}

export declare type MatTabHeaderPosition = 'above' | 'below';

export declare class MatTabLabel extends CdkPortal {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatTabLabel, "[mat-tab-label], [matTabLabel]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTabLabel>;
}

export declare class MatTabLabelWrapper extends _MatTabLabelWrapperMixinBase implements CanDisable {
    elementRef: ElementRef;
    constructor(elementRef: ElementRef);
    focus(): void;
    getOffsetLeft(): number;
    getOffsetWidth(): number;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatTabLabelWrapper, "[matTabLabelWrapper]", never, { 'disabled': "disabled" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTabLabelWrapper>;
}

export declare class MatTabLink extends _MatTabLinkBase implements OnDestroy {
    constructor(tabNavBar: MatTabNav, elementRef: ElementRef, ngZone: NgZone, platform: Platform, globalRippleOptions: RippleGlobalOptions | null, tabIndex: string, focusMonitor: FocusMonitor, animationMode?: string);
    ngOnDestroy(): void;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatTabLink, "[mat-tab-link], [matTabLink]", ["matTabLink"], { 'disabled': "disabled", 'disableRipple': "disableRipple", 'tabIndex': "tabIndex" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTabLink>;
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
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_selectedIndex: NumberInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatTabNav, "[mat-tab-nav-bar]", ["matTabNavBar", "matTabNav"], { 'color': "color" }, {}, ["_items"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatTabNav>;
}

export declare const matTabsAnimations: {
    readonly translateTab: AnimationTriggerMetadata;
};

export interface MatTabsConfig {
    animationDuration?: string;
    disablePagination?: boolean;
    fitInkBarToContent?: boolean;
}

export declare class MatTabsModule {
    static ɵinj: i0.ɵɵInjectorDef<MatTabsModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatTabsModule, [typeof i1.MatTabGroup, typeof i2.MatTabLabel, typeof i3.MatTab, typeof i4.MatInkBar, typeof i5.MatTabLabelWrapper, typeof i6.MatTabNav, typeof i6.MatTabLink, typeof i7.MatTabBody, typeof i7.MatTabBodyPortal, typeof i8.MatTabHeader, typeof i9.MatTabContent], [typeof i10.CommonModule, typeof i11.MatCommonModule, typeof i12.PortalModule, typeof i11.MatRippleModule, typeof i13.ObserversModule, typeof i14.A11yModule], [typeof i11.MatCommonModule, typeof i1.MatTabGroup, typeof i2.MatTabLabel, typeof i3.MatTab, typeof i6.MatTabNav, typeof i6.MatTabLink, typeof i9.MatTabContent]>;
}

export declare type ScrollDirection = 'after' | 'before';
