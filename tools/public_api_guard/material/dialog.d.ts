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
    readonly afterOpened: Subject<MatDialogRef<any>>;
    readonly openDialogs: MatDialogRef<any>[];
    constructor(_overlay: Overlay, _injector: Injector,
    _location: Location, _defaultOptions: MatDialogConfig, scrollStrategy: any, _parentDialog: MatDialog, _overlayContainer: OverlayContainer);
    closeAll(): void;
    getDialogById(id: string): MatDialogRef<any> | undefined;
    ngOnDestroy(): void;
    open<T, D = any, R = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>, config?: MatDialogConfig<D>): MatDialogRef<T, R>;
    static ɵfac: i0.ɵɵFactoryDef<MatDialog>;
    static ɵprov: i0.ɵɵInjectableDef<MatDialog>;
}

export declare class MatDialogActions {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatDialogActions, "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatDialogActions>;
}

export declare const matDialogAnimations: {
    readonly dialogContainer: AnimationTriggerMetadata;
};

export declare class MatDialogClose implements OnInit, OnChanges {
    _matDialogClose: any;
    ariaLabel: string;
    dialogRef: MatDialogRef<any>;
    dialogResult: any;
    type: 'submit' | 'button' | 'reset';
    constructor(dialogRef: MatDialogRef<any>, _elementRef: ElementRef<HTMLElement>, _dialog: MatDialog);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatDialogClose, "[mat-dialog-close], [matDialogClose]", ["matDialogClose"], { 'ariaLabel': "aria-label", 'type': "type", 'dialogResult': "mat-dialog-close", '_matDialogClose': "matDialogClose" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatDialogClose>;
}

export declare class MatDialogConfig<D = any> {
    ariaDescribedBy?: string | null;
    ariaLabel?: string | null;
    ariaLabelledBy?: string | null;
    autoFocus?: boolean;
    backdropClass?: string;
    closeOnNavigation?: boolean;
    componentFactoryResolver?: ComponentFactoryResolver;
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
    attachDomPortal: (portal: DomPortal<HTMLElement>) => void;
    constructor(_elementRef: ElementRef, _focusTrapFactory: FocusTrapFactory, _changeDetectorRef: ChangeDetectorRef, _document: any,
    _config: MatDialogConfig);
    _onAnimationDone(event: AnimationEvent): void;
    _onAnimationStart(event: AnimationEvent): void;
    _startExitAnimation(): void;
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatDialogContainer, "mat-dialog-container", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatDialogContainer>;
}

export declare class MatDialogContent {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatDialogContent, "[mat-dialog-content], mat-dialog-content, [matDialogContent]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatDialogContent>;
}

export declare class MatDialogModule {
    static ɵinj: i0.ɵɵInjectorDef<MatDialogModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatDialogModule, [typeof i1.MatDialogContainer, typeof i2.MatDialogClose, typeof i2.MatDialogTitle, typeof i2.MatDialogActions, typeof i2.MatDialogContent], [typeof i3.CommonModule, typeof i4.OverlayModule, typeof i5.PortalModule, typeof i6.MatCommonModule], [typeof i1.MatDialogContainer, typeof i2.MatDialogClose, typeof i2.MatDialogTitle, typeof i2.MatDialogContent, typeof i2.MatDialogActions, typeof i6.MatCommonModule]>;
}

export declare class MatDialogRef<T, R = any> {
    _containerInstance: MatDialogContainer;
    componentInstance: T;
    disableClose: boolean | undefined;
    readonly id: string;
    constructor(_overlayRef: OverlayRef, _containerInstance: MatDialogContainer, id?: string);
    addPanelClass(classes: string | string[]): this;
    afterClosed(): Observable<R | undefined>;
    afterOpened(): Observable<void>;
    backdropClick(): Observable<MouseEvent>;
    beforeClosed(): Observable<R | undefined>;
    close(dialogResult?: R): void;
    getState(): MatDialogState;
    keydownEvents(): Observable<KeyboardEvent>;
    removePanelClass(classes: string | string[]): this;
    updatePosition(position?: DialogPosition): this;
    updateSize(width?: string, height?: string): this;
}

export declare const enum MatDialogState {
    OPEN = 0,
    CLOSING = 1,
    CLOSED = 2
}

export declare class MatDialogTitle implements OnInit {
    id: string;
    constructor(_dialogRef: MatDialogRef<any>, _elementRef: ElementRef<HTMLElement>, _dialog: MatDialog);
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatDialogTitle, "[mat-dialog-title], [matDialogTitle]", ["matDialogTitle"], { 'id': "id" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatDialogTitle>;
}

export declare function throwMatDialogContentAlreadyAttachedError(): void;
