export declare const fadeInItems: AnimationTriggerMetadata;

export declare const MAT_MENU_DEFAULT_OPTIONS: InjectionToken<MatMenuDefaultOptions>;

export declare const MAT_MENU_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;

export declare class MatMenu implements AfterContentInit, MatMenuPanel<MatMenuItem>, OnInit, OnDestroy {
    _animationDone: Subject<AnimationEvent>;
    _classList: {
        [key: string]: boolean;
    };
    _isAnimating: boolean;
    _panelAnimationState: 'void' | 'enter';
    backdropClass: string;
    classList: string;
    close: EventEmitter<void | "click" | "keydown" | "tab">;
    readonly closed: EventEmitter<void | 'click' | 'keydown' | 'tab'>;
    direction: Direction;
    hasBackdrop: boolean | undefined;
    items: QueryList<MatMenuItem>;
    lazyContent: MatMenuContent;
    overlapTrigger: boolean;
    panelClass: string;
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
    addItem(item: MatMenuItem): void;
    focusFirstItem(origin?: FocusOrigin): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    removeItem(item: MatMenuItem): void;
    resetActiveItem(): void;
    setElevation(depth: number): void;
    setPositionClasses(posX?: MenuPositionX, posY?: MenuPositionY): void;
}

export declare const matMenuAnimations: {
    readonly transformMenu: AnimationTriggerMetadata;
    readonly fadeInItems: AnimationTriggerMetadata;
};

export declare class MatMenuContent implements OnDestroy {
    _attached: Subject<void>;
    constructor(_template: TemplateRef<any>, _componentFactoryResolver: ComponentFactoryResolver, _appRef: ApplicationRef, _injector: Injector, _viewContainerRef: ViewContainerRef, _document: any);
    attach(context?: any): void;
    detach(): void;
    ngOnDestroy(): void;
}

export interface MatMenuDefaultOptions {
    backdropClass: string;
    hasBackdrop?: boolean;
    overlapTrigger: boolean;
    xPosition: MenuPositionX;
    yPosition: MenuPositionY;
}

export declare class MatMenuItem extends _MatMenuItemMixinBase implements FocusableOption, CanDisable, CanDisableRipple, OnDestroy {
    _highlighted: boolean;
    readonly _hovered: Subject<MatMenuItem>;
    _triggersSubmenu: boolean;
    role: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';
    constructor(_elementRef: ElementRef<HTMLElement>, document?: any, _focusMonitor?: FocusMonitor | undefined, _parentMenu?: MatMenuPanel<MatMenuItem> | undefined);
    _checkDisabled(event: Event): void;
    _getHostElement(): HTMLElement;
    _getTabIndex(): string;
    _handleMouseEnter(): void;
    focus(origin?: FocusOrigin): void;
    getLabel(): string;
    ngOnDestroy(): void;
}

export declare class MatMenuModule {
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
    focus(origin?: FocusOrigin): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    openMenu(): void;
    toggleMenu(): void;
    triggersSubmenu(): boolean;
}

export declare type MenuPositionX = 'before' | 'after';

export declare type MenuPositionY = 'above' | 'below';

export declare const transformMenu: AnimationTriggerMetadata;
