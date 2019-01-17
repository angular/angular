export declare const MAT_BOTTOM_SHEET_DATA: InjectionToken<any>;

export declare const MAT_BOTTOM_SHEET_DEFAULT_OPTIONS: InjectionToken<MatBottomSheetConfig<any>>;

export declare class MatBottomSheet implements OnDestroy {
    _openedBottomSheetRef: MatBottomSheetRef<any> | null;
    constructor(_overlay: Overlay, _injector: Injector, _parentBottomSheet: MatBottomSheet, _location?: Location | undefined, _defaultOptions?: MatBottomSheetConfig<any> | undefined);
    dismiss(): void;
    ngOnDestroy(): void;
    open<T, D = any, R = any>(template: TemplateRef<T>, config?: MatBottomSheetConfig<D>): MatBottomSheetRef<T, R>;
    open<T, D = any, R = any>(component: ComponentType<T>, config?: MatBottomSheetConfig<D>): MatBottomSheetRef<T, R>;
}

export declare const matBottomSheetAnimations: {
    readonly bottomSheetState: AnimationTriggerMetadata;
};

export declare class MatBottomSheetConfig<D = any> {
    ariaLabel?: string | null;
    autoFocus?: boolean;
    backdropClass?: string;
    closeOnNavigation?: boolean;
    data?: D | null;
    direction?: Direction;
    disableClose?: boolean;
    hasBackdrop?: boolean;
    panelClass?: string | string[];
    restoreFocus?: boolean;
    viewContainerRef?: ViewContainerRef;
}

export declare class MatBottomSheetContainer extends BasePortalOutlet implements OnDestroy {
    _animationState: 'void' | 'visible' | 'hidden';
    _animationStateChanged: EventEmitter<AnimationEvent>;
    _portalOutlet: CdkPortalOutlet;
    bottomSheetConfig: MatBottomSheetConfig;
    constructor(_elementRef: ElementRef<HTMLElement>, _changeDetectorRef: ChangeDetectorRef, _focusTrapFactory: FocusTrapFactory, breakpointObserver: BreakpointObserver, document: any,
    bottomSheetConfig: MatBottomSheetConfig);
    _onAnimationDone(event: AnimationEvent): void;
    _onAnimationStart(event: AnimationEvent): void;
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;
    enter(): void;
    exit(): void;
    ngOnDestroy(): void;
}

export declare class MatBottomSheetModule {
}

export declare class MatBottomSheetRef<T = any, R = any> {
    containerInstance: MatBottomSheetContainer;
    disableClose: boolean | undefined;
    instance: T;
    constructor(containerInstance: MatBottomSheetContainer, _overlayRef: OverlayRef, _location?: Location);
    afterDismissed(): Observable<R | undefined>;
    afterOpened(): Observable<void>;
    backdropClick(): Observable<MouseEvent>;
    dismiss(result?: R): void;
    keydownEvents(): Observable<KeyboardEvent>;
}
