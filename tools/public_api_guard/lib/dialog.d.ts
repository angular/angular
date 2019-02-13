export interface DialogPosition {
    bottom?: string;
    left?: string;
    right?: string;
    top?: string;
}

export declare type DialogRole = 'dialog' | 'alertdialog';

export declare const MAT_DIALOG_DATA: InjectionToken<any>;

export declare const MAT_DIALOG_DEFAULT_OPTIONS: InjectionToken<MatDialogConfig<any>>;

export declare const MAT_DIALOG_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;

export declare function MAT_DIALOG_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy;

export declare const MAT_DIALOG_SCROLL_STRATEGY_PROVIDER: {
    provide: InjectionToken<() => ScrollStrategy>;
    deps: (typeof Overlay)[];
    useFactory: typeof MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY;
};

export declare function MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay): () => ScrollStrategy;

export declare class MatDialog implements OnDestroy {
    readonly _afterAllClosed: Subject<void>;
    readonly afterAllClosed: Observable<void>;
    readonly afterOpen: Subject<MatDialogRef<any>>;
    readonly afterOpened: Subject<MatDialogRef<any>>;
    readonly openDialogs: MatDialogRef<any>[];
    constructor(_overlay: Overlay, _injector: Injector, _location: Location, _defaultOptions: MatDialogConfig, scrollStrategy: any, _parentDialog: MatDialog, _overlayContainer: OverlayContainer);
    closeAll(): void;
    getDialogById(id: string): MatDialogRef<any> | undefined;
    ngOnDestroy(): void;
    open<T, D = any, R = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>, config?: MatDialogConfig<D>): MatDialogRef<T, R>;
}

export declare class MatDialogActions {
}

export declare const matDialogAnimations: {
    readonly dialogContainer: AnimationTriggerMetadata;
    readonly slideDialog: AnimationTriggerMetadata;
};

export declare class MatDialogClose implements OnInit, OnChanges {
    _hasAriaLabel?: boolean;
    _matDialogClose: any;
    ariaLabel: string;
    dialogRef: MatDialogRef<any>;
    dialogResult: any;
    constructor(dialogRef: MatDialogRef<any>, _elementRef: ElementRef<HTMLElement>, _dialog: MatDialog);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
}

export declare class MatDialogConfig<D = any> {
    ariaDescribedBy?: string | null;
    ariaLabel?: string | null;
    ariaLabelledBy?: string | null;
    autoFocus?: boolean;
    backdropClass?: string;
    closeOnNavigation?: boolean;
    data?: D | null;
    direction?: Direction;
    disableClose?: boolean;
    hasBackdrop?: boolean;
    height?: string;
    id?: string;
    maxHeight?: number | string;
    maxWidth?: number | string;
    minHeight?: number | string;
    minWidth?: number | string;
    panelClass?: string | string[];
    position?: DialogPosition;
    restoreFocus?: boolean;
    role?: DialogRole;
    scrollStrategy?: ScrollStrategy;
    viewContainerRef?: ViewContainerRef;
    width?: string;
}

export declare class MatDialogContainer extends BasePortalOutlet {
    _animationStateChanged: EventEmitter<AnimationEvent>;
    _ariaLabelledBy: string | null;
    _config: MatDialogConfig;
    _id: string;
    _portalOutlet: CdkPortalOutlet;
    _state: 'void' | 'enter' | 'exit';
    constructor(_elementRef: ElementRef, _focusTrapFactory: FocusTrapFactory, _changeDetectorRef: ChangeDetectorRef, _document: any,
    _config: MatDialogConfig);
    _onAnimationDone(event: AnimationEvent): void;
    _onAnimationStart(event: AnimationEvent): void;
    _startExitAnimation(): void;
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;
}

export declare class MatDialogContent {
}

export declare class MatDialogModule {
}

export declare class MatDialogRef<T, R = any> {
    _containerInstance: MatDialogContainer;
    componentInstance: T;
    disableClose: boolean | undefined;
    readonly id: string;
    constructor(_overlayRef: OverlayRef, _containerInstance: MatDialogContainer, _location?: Location, id?: string);
    addPanelClass(classes: string | string[]): this;
    afterClosed(): Observable<R | undefined>;
    afterOpen(): Observable<void>;
    afterOpened(): Observable<void>;
    backdropClick(): Observable<MouseEvent>;
    beforeClose(): Observable<R | undefined>;
    beforeClosed(): Observable<R | undefined>;
    close(dialogResult?: R): void;
    keydownEvents(): Observable<KeyboardEvent>;
    removePanelClass(classes: string | string[]): this;
    updatePosition(position?: DialogPosition): this;
    updateSize(width?: string, height?: string): this;
}

export declare class MatDialogTitle implements OnInit {
    id: string;
    constructor(_dialogRef: MatDialogRef<any>, _elementRef: ElementRef<HTMLElement>, _dialog: MatDialog);
    ngOnInit(): void;
}

export declare function throwMatDialogContentAlreadyAttachedError(): void;
