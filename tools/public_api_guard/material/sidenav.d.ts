export declare const MAT_DRAWER_DEFAULT_AUTOSIZE: InjectionToken<boolean>;

export declare function MAT_DRAWER_DEFAULT_AUTOSIZE_FACTORY(): boolean;

export declare class MatDrawer implements AfterContentInit, AfterContentChecked, OnDestroy {
    _animationEnd: Subject<AnimationEvent>;
    _animationStarted: Subject<AnimationEvent>;
    _animationState: 'open-instant' | 'open' | 'void';
    get _closedStream(): Observable<void>;
    _container?: MatDrawerContainer | undefined;
    readonly _modeChanged: Subject<void>;
    get _openedStream(): Observable<void>;
    get _width(): number;
    get autoFocus(): boolean;
    set autoFocus(value: boolean);
    get closedStart(): Observable<void>;
    get disableClose(): boolean;
    set disableClose(value: boolean);
    get mode(): MatDrawerMode;
    set mode(value: MatDrawerMode);
    onPositionChanged: EventEmitter<void>;
    get opened(): boolean;
    set opened(value: boolean);
    readonly openedChange: EventEmitter<boolean>;
    get openedStart(): Observable<void>;
    get position(): 'start' | 'end';
    set position(value: 'start' | 'end');
    constructor(_elementRef: ElementRef<HTMLElement>, _focusTrapFactory: FocusTrapFactory, _focusMonitor: FocusMonitor, _platform: Platform, _ngZone: NgZone, _doc: any,
    _container?: MatDrawerContainer | undefined);
    _animationDoneListener(event: AnimationEvent): void;
    _animationStartListener(event: AnimationEvent): void;
    close(): Promise<MatDrawerToggleResult>;
    ngAfterContentChecked(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    open(openedVia?: FocusOrigin): Promise<MatDrawerToggleResult>;
    toggle(isOpen?: boolean, openedVia?: FocusOrigin): Promise<MatDrawerToggleResult>;
    static ngAcceptInputType_autoFocus: BooleanInput;
    static ngAcceptInputType_disableClose: BooleanInput;
    static ngAcceptInputType_opened: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatDrawer, "mat-drawer", ["matDrawer"], { "position": "position"; "mode": "mode"; "disableClose": "disableClose"; "autoFocus": "autoFocus"; "opened": "opened"; }, { "openedChange": "openedChange"; "_openedStream": "opened"; "openedStart": "openedStart"; "_closedStream": "closed"; "closedStart": "closedStart"; "onPositionChanged": "positionChanged"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatDrawer>;
}

export declare const matDrawerAnimations: {
    readonly transformDrawer: AnimationTriggerMetadata;
};

export declare class MatDrawerContainer implements AfterContentInit, DoCheck, OnDestroy {
    _allDrawers: QueryList<MatDrawer>;
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
    get autosize(): boolean;
    set autosize(value: boolean);
    readonly backdropClick: EventEmitter<void>;
    get end(): MatDrawer | null;
    get hasBackdrop(): any;
    set hasBackdrop(value: any);
    get scrollable(): CdkScrollable;
    get start(): MatDrawer | null;
    constructor(_dir: Directionality, _element: ElementRef<HTMLElement>, _ngZone: NgZone, _changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler, defaultAutosize?: boolean, _animationMode?: string | undefined);
    _closeModalDrawer(): void;
    _isShowingBackdrop(): boolean;
    _onBackdropClicked(): void;
    close(): void;
    ngAfterContentInit(): void;
    ngDoCheck(): void;
    ngOnDestroy(): void;
    open(): void;
    updateContentMargins(): void;
    static ngAcceptInputType_autosize: BooleanInput;
    static ngAcceptInputType_hasBackdrop: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatDrawerContainer, "mat-drawer-container", ["matDrawerContainer"], { "autosize": "autosize"; "hasBackdrop": "hasBackdrop"; }, { "backdropClick": "backdropClick"; }, ["_content", "_allDrawers"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatDrawerContainer>;
}

export declare class MatDrawerContent extends CdkScrollable implements AfterContentInit {
    _container: MatDrawerContainer;
    constructor(_changeDetectorRef: ChangeDetectorRef, _container: MatDrawerContainer, elementRef: ElementRef<HTMLElement>, scrollDispatcher: ScrollDispatcher, ngZone: NgZone);
    ngAfterContentInit(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatDrawerContent, "mat-drawer-content", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatDrawerContent>;
}

export declare type MatDrawerMode = 'over' | 'push' | 'side';

export declare type MatDrawerToggleResult = 'open' | 'close';

export declare class MatSidenav extends MatDrawer {
    get fixedBottomGap(): number;
    set fixedBottomGap(value: number);
    get fixedInViewport(): boolean;
    set fixedInViewport(value: boolean);
    get fixedTopGap(): number;
    set fixedTopGap(value: number);
    static ngAcceptInputType_fixedBottomGap: NumberInput;
    static ngAcceptInputType_fixedInViewport: BooleanInput;
    static ngAcceptInputType_fixedTopGap: NumberInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatSidenav, "mat-sidenav", ["matSidenav"], { "fixedInViewport": "fixedInViewport"; "fixedTopGap": "fixedTopGap"; "fixedBottomGap": "fixedBottomGap"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatSidenav>;
}

export declare class MatSidenavContainer extends MatDrawerContainer {
    _allDrawers: QueryList<MatSidenav>;
    _content: MatSidenavContent;
    static ngAcceptInputType_hasBackdrop: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatSidenavContainer, "mat-sidenav-container", ["matSidenavContainer"], {}, {}, ["_content", "_allDrawers"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatSidenavContainer>;
}

export declare class MatSidenavContent extends MatDrawerContent {
    constructor(changeDetectorRef: ChangeDetectorRef, container: MatSidenavContainer, elementRef: ElementRef<HTMLElement>, scrollDispatcher: ScrollDispatcher, ngZone: NgZone);
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatSidenavContent, "mat-sidenav-content", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatSidenavContent>;
}

export declare class MatSidenavModule {
    static ɵinj: i0.ɵɵInjectorDef<MatSidenavModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatSidenavModule, [typeof i1.MatDrawer, typeof i1.MatDrawerContainer, typeof i1.MatDrawerContent, typeof i2.MatSidenav, typeof i2.MatSidenavContainer, typeof i2.MatSidenavContent], [typeof i3.CommonModule, typeof i4.MatCommonModule, typeof i5.ScrollingModule, typeof i6.PlatformModule], [typeof i4.MatCommonModule, typeof i1.MatDrawer, typeof i1.MatDrawerContainer, typeof i1.MatDrawerContent, typeof i2.MatSidenav, typeof i2.MatSidenavContainer, typeof i2.MatSidenavContent]>;
}

export declare function throwMatDuplicatedDrawerError(position: string): void;
