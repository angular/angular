export declare class _MatMenu extends MatMenu {
    constructor(elementRef: ElementRef<HTMLElement>, ngZone: NgZone, defaultOptions: MatMenuDefaultOptions);
    static ngAcceptInputType_hasBackdrop: boolean | string | null | undefined;
    static ngAcceptInputType_overlapTrigger: boolean | string | null | undefined;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<_MatMenu, "mat-menu", ["matMenu"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<_MatMenu>;
}

export declare class _MatMenuBase implements AfterContentInit, MatMenuPanel<MatMenuItem>, OnInit, OnDestroy {
    _allItems: QueryList<MatMenuItem>;
    _animationDone: Subject<AnimationEvent>;
    _classList: {
        [key: string]: boolean;
    };
    _isAnimating: boolean;
    _panelAnimationState: 'void' | 'enter';
    backdropClass: string;
    classList: string;
    close: EventEmitter<void | 'click' | 'keydown' | 'tab'>;
    readonly closed: EventEmitter<void | 'click' | 'keydown' | 'tab'>;
    direction: Direction;
    hasBackdrop: boolean | undefined;
    items: QueryList<MatMenuItem>;
    lazyContent: MatMenuContent;
    overlapTrigger: boolean;
    panelClass: string;
    readonly panelId: string;
    parentMenu: MatMenuPanel | undefined;
    templateRef: TemplateRef<any>;
    xPosition: MenuPositionX;
    yPosition: MenuPositionY;
    constructor(_elementRef: ElementRef<HTMLElement>, _ngZone: NgZone, _defaultOptions: MatMenuDefaultOptions);
    _handleKeydown(event: KeyboardEvent): void;
    _hovered(): Observable<MatMenuItem>;
    _onAnimationDone(event: AnimationEvent): void;
    _onAnimationStart(event: AnimationEvent): void;
    _resetAnimation(): void;
    _startAnimation(): void;
    addItem(_item: MatMenuItem): void;
    focusFirstItem(origin?: FocusOrigin): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    removeItem(_item: MatMenuItem): void;
    resetActiveItem(): void;
    setElevation(depth: number): void;
    setPositionClasses(posX?: MenuPositionX, posY?: MenuPositionY): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<_MatMenuBase, never, never, { 'backdropClass': "backdropClass", 'xPosition': "xPosition", 'yPosition': "yPosition", 'overlapTrigger': "overlapTrigger", 'hasBackdrop': "hasBackdrop", 'panelClass': "class", 'classList': "classList" }, { 'closed': "closed", 'close': "close" }, ["lazyContent", "_allItems", "items"]>;
    static ɵfac: i0.ɵɵFactoryDef<_MatMenuBase>;
}

export declare class _MatMenuDirectivesModule {
    static ɵinj: i0.ɵɵInjectorDef<_MatMenuDirectivesModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<_MatMenuDirectivesModule, [typeof i1.MatMenuTrigger, typeof i2.MatMenuContent], never, [typeof i1.MatMenuTrigger, typeof i2.MatMenuContent, typeof i3.MatCommonModule]>;
}

export declare const fadeInItems: AnimationTriggerMetadata;

export declare const MAT_MENU_DEFAULT_OPTIONS: InjectionToken<MatMenuDefaultOptions>;

export declare const MAT_MENU_PANEL: InjectionToken<MatMenuPanel<any>>;

export declare const MAT_MENU_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;

export declare class MatMenu extends _MatMenuBase {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatMenu, never, never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatMenu>;
}

export declare const matMenuAnimations: {
    readonly transformMenu: AnimationTriggerMetadata;
    readonly fadeInItems: AnimationTriggerMetadata;
};

export declare class MatMenuContent implements OnDestroy {
    _attached: Subject<void>;
    constructor(_template: TemplateRef<any>, _componentFactoryResolver: ComponentFactoryResolver, _appRef: ApplicationRef, _injector: Injector, _viewContainerRef: ViewContainerRef, _document: any, _changeDetectorRef?: ChangeDetectorRef | undefined);
    attach(context?: any): void;
    detach(): void;
    ngOnDestroy(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatMenuContent, "ng-template[matMenuContent]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatMenuContent>;
}

export interface MatMenuDefaultOptions {
    backdropClass: string;
    hasBackdrop?: boolean;
    overlapTrigger: boolean;
    xPosition: MenuPositionX;
    yPosition: MenuPositionY;
}

export declare class MatMenuItem extends _MatMenuItemMixinBase implements FocusableOption, CanDisable, CanDisableRipple, OnDestroy {
    readonly _focused: Subject<MatMenuItem>;
    _highlighted: boolean;
    readonly _hovered: Subject<MatMenuItem>;
    _parentMenu?: MatMenuPanel<MatMenuItem> | undefined;
    _triggersSubmenu: boolean;
    role: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';
    constructor(_elementRef: ElementRef<HTMLElement>, document?: any, _focusMonitor?: FocusMonitor | undefined, _parentMenu?: MatMenuPanel<MatMenuItem> | undefined);
    _checkDisabled(event: Event): void;
    _getHostElement(): HTMLElement;
    _getTabIndex(): string;
    _handleMouseEnter(): void;
    focus(origin?: FocusOrigin, options?: FocusOptions): void;
    getLabel(): string;
    ngOnDestroy(): void;
    static ngAcceptInputType_disableRipple: boolean | string | null | undefined;
    static ngAcceptInputType_disabled: boolean | string | null | undefined;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatMenuItem, "[mat-menu-item]", ["matMenuItem"], { 'disabled': "disabled", 'disableRipple': "disableRipple", 'role': "role" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatMenuItem>;
}

export declare class MatMenuModule {
    static ɵinj: i0.ɵɵInjectorDef<MatMenuModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatMenuModule, [typeof i4._MatMenu, typeof i5.MatMenuItem], [typeof i6.CommonModule, typeof i3.MatCommonModule, typeof i3.MatRippleModule, typeof i7.OverlayModule, typeof _MatMenuDirectivesModule], [typeof i4._MatMenu, typeof i5.MatMenuItem, typeof _MatMenuDirectivesModule]>;
}

export interface MatMenuPanel<T = any> {
    addItem?: (item: T) => void;
    backdropClass?: string;
    close: EventEmitter<void | 'click' | 'keydown' | 'tab'>;
    direction?: Direction;
    focusFirstItem: (origin?: FocusOrigin) => void;
    hasBackdrop?: boolean;
    lazyContent?: MatMenuContent;
    overlapTrigger: boolean;
    readonly panelId?: string;
    parentMenu?: MatMenuPanel | undefined;
    removeItem?: (item: T) => void;
    resetActiveItem: () => void;
    setPositionClasses?: (x: MenuPositionX, y: MenuPositionY) => void;
    templateRef: TemplateRef<any>;
    xPosition: MenuPositionX;
    yPosition: MenuPositionY;
    setElevation?(depth: number): void;
}

export declare class MatMenuTrigger implements AfterContentInit, OnDestroy {
    _deprecatedMatMenuTriggerFor: MatMenuPanel;
    _openedBy: 'mouse' | 'touch' | null;
    readonly dir: Direction;
    menu: MatMenuPanel;
    readonly menuClosed: EventEmitter<void>;
    menuData: any;
    readonly menuOpen: boolean;
    readonly menuOpened: EventEmitter<void>;
    readonly onMenuClose: EventEmitter<void>;
    readonly onMenuOpen: EventEmitter<void>;
    restoreFocus: boolean;
    constructor(_overlay: Overlay, _element: ElementRef<HTMLElement>, _viewContainerRef: ViewContainerRef, scrollStrategy: any, _parentMenu: MatMenu, _menuItemInstance: MatMenuItem, _dir: Directionality, _focusMonitor?: FocusMonitor | undefined);
    _handleClick(event: MouseEvent): void;
    _handleKeydown(event: KeyboardEvent): void;
    _handleMousedown(event: MouseEvent): void;
    closeMenu(): void;
    focus(origin?: FocusOrigin, options?: FocusOptions): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    openMenu(): void;
    toggleMenu(): void;
    triggersSubmenu(): boolean;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatMenuTrigger, "[mat-menu-trigger-for], [matMenuTriggerFor]", ["matMenuTrigger"], { '_deprecatedMatMenuTriggerFor': "mat-menu-trigger-for", 'menu': "matMenuTriggerFor", 'menuData': "matMenuTriggerData", 'restoreFocus': "matMenuTriggerRestoreFocus" }, { 'menuOpened': "menuOpened", 'onMenuOpen': "onMenuOpen", 'menuClosed': "menuClosed", 'onMenuClose': "onMenuClose" }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatMenuTrigger>;
}

export declare type MenuPositionX = 'before' | 'after';

export declare type MenuPositionY = 'above' | 'below';

export declare const transformMenu: AnimationTriggerMetadata;
