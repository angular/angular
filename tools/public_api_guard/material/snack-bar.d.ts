export interface _SnackBarContainer {
    _onAnnounce: Subject<any>;
    _onEnter: Subject<any>;
    _onExit: Subject<any>;
    attachComponentPortal: <T>(portal: ComponentPortal<T>) => ComponentRef<T>;
    attachTemplatePortal: <C>(portal: TemplatePortal<C>) => EmbeddedViewRef<C>;
    enter: () => void;
    exit: () => Observable<void>;
    snackBarConfig: MatSnackBarConfig;
}

export declare const MAT_SNACK_BAR_DATA: InjectionToken<any>;

export declare const MAT_SNACK_BAR_DEFAULT_OPTIONS: InjectionToken<MatSnackBarConfig<any>>;

export declare function MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY(): MatSnackBarConfig;

export declare class MatSnackBar implements OnDestroy {
    get _openedSnackBarRef(): MatSnackBarRef<any> | null;
    set _openedSnackBarRef(value: MatSnackBarRef<any> | null);
    protected handsetCssClass: string;
    protected simpleSnackBarComponent: Type<TextOnlySnackBar>;
    protected snackBarContainerComponent: Type<_SnackBarContainer>;
    constructor(_overlay: Overlay, _live: LiveAnnouncer, _injector: Injector, _breakpointObserver: BreakpointObserver, _parentSnackBar: MatSnackBar, _defaultConfig: MatSnackBarConfig);
    dismiss(): void;
    ngOnDestroy(): void;
    open(message: string, action?: string, config?: MatSnackBarConfig): MatSnackBarRef<TextOnlySnackBar>;
    openFromComponent<T>(component: ComponentType<T>, config?: MatSnackBarConfig): MatSnackBarRef<T>;
    openFromTemplate(template: TemplateRef<any>, config?: MatSnackBarConfig): MatSnackBarRef<EmbeddedViewRef<any>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSnackBar, [null, null, null, null, { optional: true; skipSelf: true; }, null]>;
    static ɵprov: i0.ɵɵInjectableDef<MatSnackBar>;
}

export declare const matSnackBarAnimations: {
    readonly snackBarState: AnimationTriggerMetadata;
};

export declare class MatSnackBarConfig<D = any> {
    announcementMessage?: string;
    data?: D | null;
    direction?: Direction;
    duration?: number;
    horizontalPosition?: MatSnackBarHorizontalPosition;
    panelClass?: string | string[];
    politeness?: AriaLivePoliteness;
    verticalPosition?: MatSnackBarVerticalPosition;
    viewContainerRef?: ViewContainerRef;
}

export declare class MatSnackBarContainer extends BasePortalOutlet implements OnDestroy, _SnackBarContainer {
    _animationState: string;
    _live: AriaLivePoliteness;
    readonly _onAnnounce: Subject<void>;
    readonly _onEnter: Subject<void>;
    readonly _onExit: Subject<void>;
    _portalOutlet: CdkPortalOutlet;
    _role?: 'status' | 'alert';
    attachDomPortal: (portal: DomPortal) => void;
    snackBarConfig: MatSnackBarConfig;
    constructor(_ngZone: NgZone, _elementRef: ElementRef<HTMLElement>, _changeDetectorRef: ChangeDetectorRef, _platform: Platform,
    snackBarConfig: MatSnackBarConfig);
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;
    enter(): void;
    exit(): Observable<void>;
    ngOnDestroy(): void;
    onAnimationEnd(event: AnimationEvent): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatSnackBarContainer, "snack-bar-container", never, {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSnackBarContainer, never>;
}

export interface MatSnackBarDismiss {
    dismissedByAction: boolean;
}

export declare type MatSnackBarHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';

export declare class MatSnackBarModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSnackBarModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatSnackBarModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatSnackBarModule, [typeof i1.MatSnackBarContainer, typeof i2.SimpleSnackBar], [typeof i3.OverlayModule, typeof i4.PortalModule, typeof i5.CommonModule, typeof i6.MatButtonModule, typeof i7.MatCommonModule], [typeof i1.MatSnackBarContainer, typeof i7.MatCommonModule]>;
}

export declare class MatSnackBarRef<T> {
    containerInstance: _SnackBarContainer;
    instance: T;
    constructor(containerInstance: _SnackBarContainer, _overlayRef: OverlayRef);
    _dismissAfter(duration: number): void;
    _open(): void;
    afterDismissed(): Observable<MatSnackBarDismiss>;
    afterOpened(): Observable<void>;
    closeWithAction(): void;
    dismiss(): void;
    dismissWithAction(): void;
    onAction(): Observable<void>;
}

export declare type MatSnackBarVerticalPosition = 'top' | 'bottom';

export declare class SimpleSnackBar implements TextOnlySnackBar {
    data: {
        message: string;
        action: string;
    };
    get hasAction(): boolean;
    snackBarRef: MatSnackBarRef<SimpleSnackBar>;
    constructor(snackBarRef: MatSnackBarRef<SimpleSnackBar>, data: any);
    action(): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<SimpleSnackBar, "simple-snack-bar", never, {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SimpleSnackBar, never>;
}

export interface TextOnlySnackBar {
    action: () => void;
    data: {
        message: string;
        action: string;
    };
    hasAction: boolean;
    snackBarRef: MatSnackBarRef<TextOnlySnackBar>;
}
