export declare const MAT_DRAWER_DEFAULT_AUTOSIZE: InjectionToken<boolean>;

export declare function MAT_DRAWER_DEFAULT_AUTOSIZE_FACTORY(): boolean;

export declare class MatDrawer implements AfterContentInit, AfterContentChecked, OnDestroy {
    _animationEnd: Subject<AnimationEvent>;
    _animationStarted: Subject<AnimationEvent>;
    _animationState: 'open-instant' | 'open' | 'void';
    readonly _closedStream: Observable<void>;
    readonly _isFocusTrapEnabled: boolean;
    readonly _modeChanged: Subject<{}>;
    readonly _openedStream: Observable<void>;
    readonly _width: number;
    autoFocus: boolean;
    readonly closedStart: Observable<void>;
    disableClose: boolean;
    mode: 'over' | 'push' | 'side';
    onPositionChanged: EventEmitter<void>;
    opened: boolean;
    readonly openedChange: EventEmitter<boolean>;
    readonly openedStart: Observable<void>;
    position: 'start' | 'end';
    constructor(_elementRef: ElementRef<HTMLElement>, _focusTrapFactory: FocusTrapFactory, _focusMonitor: FocusMonitor, _platform: Platform, _ngZone: NgZone, _doc: any);
    close(): Promise<MatDrawerToggleResult>;
    ngAfterContentChecked(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    open(openedVia?: FocusOrigin): Promise<MatDrawerToggleResult>;
    toggle(isOpen?: boolean, openedVia?: FocusOrigin): Promise<MatDrawerToggleResult>;
}

export declare const matDrawerAnimations: {
    readonly transformDrawer: AnimationTriggerMetadata;
};

export declare class MatDrawerContainer implements AfterContentInit, DoCheck, OnDestroy {
    _backdropOverride: boolean | null;
    _content: MatDrawerContent;
    readonly _contentMarginChanges: Subject<{
        left: number | null;
        right: number | null;
    }>;
    _contentMargins: {
        left: number | null;
        right: number | null;
    };
    _drawers: QueryList<MatDrawer>;
    _userContent: MatDrawerContent;
    autosize: boolean;
    readonly backdropClick: EventEmitter<void>;
    readonly end: MatDrawer | null;
    hasBackdrop: any;
    readonly scrollable: CdkScrollable;
    readonly start: MatDrawer | null;
    constructor(_dir: Directionality, _element: ElementRef<HTMLElement>, _ngZone: NgZone, _changeDetectorRef: ChangeDetectorRef, defaultAutosize?: boolean, _animationMode?: string | undefined,
    viewportRuler?: ViewportRuler);
    _closeModalDrawer(): void;
    _isShowingBackdrop(): boolean;
    _onBackdropClicked(): void;
    close(): void;
    ngAfterContentInit(): void;
    ngDoCheck(): void;
    ngOnDestroy(): void;
    open(): void;
}

export declare class MatDrawerContent extends CdkScrollable implements AfterContentInit {
    _container: MatDrawerContainer;
    constructor(_changeDetectorRef: ChangeDetectorRef, _container: MatDrawerContainer, elementRef: ElementRef<HTMLElement>, scrollDispatcher: ScrollDispatcher, ngZone: NgZone);
    ngAfterContentInit(): void;
}

export declare type MatDrawerToggleResult = 'open' | 'close';

export declare class MatSidenav extends MatDrawer {
    fixedBottomGap: number;
    fixedInViewport: boolean;
    fixedTopGap: number;
}

export declare class MatSidenavContainer extends MatDrawerContainer {
    _content: MatSidenavContent;
    _drawers: QueryList<MatSidenav>;
}

export declare class MatSidenavContent extends MatDrawerContent {
    constructor(changeDetectorRef: ChangeDetectorRef, container: MatSidenavContainer, elementRef: ElementRef<HTMLElement>, scrollDispatcher: ScrollDispatcher, ngZone: NgZone);
}

export declare class MatSidenavModule {
}

export declare function throwMatDuplicatedDrawerError(position: string): void;
