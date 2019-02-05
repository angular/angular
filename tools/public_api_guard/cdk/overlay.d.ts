export declare class BlockScrollStrategy implements ScrollStrategy {
    constructor(_viewportRuler: ViewportRuler, document: any);
    attach(): void;
    disable(): void;
    enable(): void;
}

export declare class CdkConnectedOverlay implements OnDestroy, OnChanges {
    attach: EventEmitter<void>;
    backdropClass: string;
    backdropClick: EventEmitter<MouseEvent>;
    detach: EventEmitter<void>;
    readonly dir: Direction;
    flexibleDimensions: boolean;
    growAfterOpen: boolean;
    hasBackdrop: any;
    height: number | string;
    lockPosition: any;
    minHeight: number | string;
    minWidth: number | string;
    offsetX: number;
    offsetY: number;
    open: boolean;
    origin: CdkOverlayOrigin;
    overlayKeydown: EventEmitter<KeyboardEvent>;
    readonly overlayRef: OverlayRef;
    panelClass: string | string[];
    positionChange: EventEmitter<ConnectedOverlayPositionChange>;
    positions: ConnectedPosition[];
    push: boolean;
    scrollStrategy: ScrollStrategy;
    viewportMargin: number;
    width: number | string;
    constructor(_overlay: Overlay, templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef, scrollStrategyFactory: any, _dir: Directionality);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
}

export declare class CdkOverlayOrigin {
    elementRef: ElementRef;
    constructor(
    elementRef: ElementRef);
}

export declare class CloseScrollStrategy implements ScrollStrategy {
    constructor(_scrollDispatcher: ScrollDispatcher, _ngZone: NgZone, _viewportRuler: ViewportRuler, _config?: CloseScrollStrategyConfig | undefined);
    attach(overlayRef: OverlayReference): void;
    detach(): void;
    disable(): void;
    enable(): void;
}

export declare class ConnectedOverlayPositionChange {
    connectionPair: ConnectionPositionPair;
    scrollableViewProperties: ScrollingVisibility;
    constructor(
    connectionPair: ConnectionPositionPair,
    scrollableViewProperties: ScrollingVisibility);
}

export interface ConnectedPosition {
    offsetX?: number;
    offsetY?: number;
    originX: 'start' | 'center' | 'end';
    originY: 'top' | 'center' | 'bottom';
    overlayX: 'start' | 'center' | 'end';
    overlayY: 'top' | 'center' | 'bottom';
    panelClass?: string | string[];
    weight?: number;
}

export declare class ConnectedPositionStrategy implements PositionStrategy {
    readonly _isRtl: boolean;
    _positionStrategy: FlexibleConnectedPositionStrategy;
    _preferredPositions: ConnectionPositionPair[];
    readonly onPositionChange: Observable<ConnectedOverlayPositionChange>;
    readonly positions: ConnectionPositionPair[];
    constructor(originPos: OriginConnectionPosition, overlayPos: OverlayConnectionPosition, connectedTo: ElementRef<HTMLElement>, viewportRuler: ViewportRuler, document: Document, platform?: Platform);
    apply(): void;
    attach(overlayRef: OverlayReference): void;
    detach(): void;
    dispose(): void;
    recalculateLastPosition(): void;
    setOrigin(origin: ElementRef): this;
    withDirection(dir: 'ltr' | 'rtl'): this;
    withFallbackPosition(originPos: OriginConnectionPosition, overlayPos: OverlayConnectionPosition, offsetX?: number, offsetY?: number): this;
    withLockedPosition(isLocked: boolean): this;
    withOffsetX(offset: number): this;
    withOffsetY(offset: number): this;
    withPositions(positions: ConnectionPositionPair[]): this;
    withScrollableContainers(scrollables: CdkScrollable[]): void;
}

export declare class ConnectionPositionPair {
    offsetX?: number | undefined;
    offsetY?: number | undefined;
    originX: HorizontalConnectionPos;
    originY: VerticalConnectionPos;
    overlayX: HorizontalConnectionPos;
    overlayY: VerticalConnectionPos;
    panelClass?: string | string[] | undefined;
    constructor(origin: OriginConnectionPosition, overlay: OverlayConnectionPosition,
    offsetX?: number | undefined,
    offsetY?: number | undefined,
    panelClass?: string | string[] | undefined);
}

export declare class FlexibleConnectedPositionStrategy implements PositionStrategy {
    _preferredPositions: ConnectionPositionPair[];
    positionChanges: Observable<ConnectedOverlayPositionChange>;
    readonly positions: ConnectionPositionPair[];
    constructor(connectedTo: FlexibleConnectedPositionStrategyOrigin, _viewportRuler: ViewportRuler, _document: Document, _platform?: Platform | undefined, _overlayContainer?: OverlayContainer | undefined);
    apply(): void;
    attach(overlayRef: OverlayReference): void;
    detach(): void;
    dispose(): void;
    reapplyLastPosition(): void;
    setOrigin(origin: FlexibleConnectedPositionStrategyOrigin): this;
    withDefaultOffsetX(offset: number): this;
    withDefaultOffsetY(offset: number): this;
    withFlexibleDimensions(flexibleDimensions?: boolean): this;
    withGrowAfterOpen(growAfterOpen?: boolean): this;
    withLockedPosition(isLocked?: boolean): this;
    withPositions(positions: ConnectedPosition[]): this;
    withPush(canPush?: boolean): this;
    withScrollableContainers(scrollables: CdkScrollable[]): void;
    withTransformOriginOn(selector: string): this;
    withViewportMargin(margin: number): this;
}

export declare class FullscreenOverlayContainer extends OverlayContainer implements OnDestroy {
    constructor(_document: any);
    protected _createContainer(): void;
    getFullscreenElement(): Element;
    ngOnDestroy(): void;
}

export declare class GlobalPositionStrategy implements PositionStrategy {
    apply(): void;
    attach(overlayRef: OverlayReference): void;
    bottom(value?: string): this;
    centerHorizontally(offset?: string): this;
    centerVertically(offset?: string): this;
    dispose(): void;
    height(value?: string): this;
    left(value?: string): this;
    right(value?: string): this;
    top(value?: string): this;
    width(value?: string): this;
}

export declare type HorizontalConnectionPos = 'start' | 'center' | 'end';

export declare class NoopScrollStrategy implements ScrollStrategy {
    attach(): void;
    disable(): void;
    enable(): void;
}

export interface OriginConnectionPosition {
    originX: HorizontalConnectionPos;
    originY: VerticalConnectionPos;
}

export declare class Overlay {
    scrollStrategies: ScrollStrategyOptions;
    constructor(
    scrollStrategies: ScrollStrategyOptions, _overlayContainer: OverlayContainer, _componentFactoryResolver: ComponentFactoryResolver, _positionBuilder: OverlayPositionBuilder, _keyboardDispatcher: OverlayKeyboardDispatcher, _injector: Injector, _ngZone: NgZone, _document: any, _directionality: Directionality, _location?: Location | undefined);
    create(config?: OverlayConfig): OverlayRef;
    position(): OverlayPositionBuilder;
}

export declare const OVERLAY_PROVIDERS: Provider[];

export declare class OverlayConfig {
    backdropClass?: string | string[];
    direction?: Direction | Directionality;
    disposeOnNavigation?: boolean;
    hasBackdrop?: boolean;
    height?: number | string;
    maxHeight?: number | string;
    maxWidth?: number | string;
    minHeight?: number | string;
    minWidth?: number | string;
    panelClass?: string | string[];
    positionStrategy?: PositionStrategy;
    scrollStrategy?: ScrollStrategy;
    width?: number | string;
    constructor(config?: OverlayConfig);
}

export interface OverlayConnectionPosition {
    overlayX: HorizontalConnectionPos;
    overlayY: VerticalConnectionPos;
}

export declare class OverlayContainer implements OnDestroy {
    protected _containerElement: HTMLElement;
    protected _document: any;
    constructor(_document: any);
    protected _createContainer(): void;
    getContainerElement(): HTMLElement;
    ngOnDestroy(): void;
}

export declare class OverlayKeyboardDispatcher implements OnDestroy {
    _attachedOverlays: OverlayRef[];
    constructor(document: any);
    add(overlayRef: OverlayRef): void;
    ngOnDestroy(): void;
    remove(overlayRef: OverlayRef): void;
}

export declare class OverlayModule {
}

export declare class OverlayPositionBuilder {
    constructor(_viewportRuler: ViewportRuler, _document: any, _platform?: Platform | undefined, _overlayContainer?: OverlayContainer | undefined);
    connectedTo(elementRef: ElementRef, originPos: OriginConnectionPosition, overlayPos: OverlayConnectionPosition): ConnectedPositionStrategy;
    flexibleConnectedTo(origin: FlexibleConnectedPositionStrategyOrigin): FlexibleConnectedPositionStrategy;
    global(): GlobalPositionStrategy;
}

export declare class OverlayRef implements PortalOutlet, OverlayReference {
    _keydownEventSubscriptions: number;
    _keydownEvents: Subject<KeyboardEvent>;
    readonly backdropElement: HTMLElement | null;
    readonly hostElement: HTMLElement;
    readonly overlayElement: HTMLElement;
    constructor(_portalOutlet: PortalOutlet, _host: HTMLElement, _pane: HTMLElement, _config: ImmutableObject<OverlayConfig>, _ngZone: NgZone, _keyboardDispatcher: OverlayKeyboardDispatcher, _document: Document, _location?: Location | undefined);
    addPanelClass(classes: string | string[]): void;
    attach<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    attach<T>(portal: TemplatePortal<T>): EmbeddedViewRef<T>;
    attach(portal: any): any;
    attachments(): Observable<void>;
    backdropClick(): Observable<MouseEvent>;
    detach(): any;
    detachBackdrop(): void;
    detachments(): Observable<void>;
    dispose(): void;
    getConfig(): OverlayConfig;
    getDirection(): Direction;
    hasAttached(): boolean;
    keydownEvents(): Observable<KeyboardEvent>;
    removePanelClass(classes: string | string[]): void;
    setDirection(dir: Direction | Directionality): void;
    updatePosition(): void;
    updatePositionStrategy(strategy: PositionStrategy): void;
    updateScrollStrategy(strategy: ScrollStrategy): void;
    updateSize(sizeConfig: OverlaySizeConfig): void;
}

export interface OverlaySizeConfig {
    height?: number | string;
    maxHeight?: number | string;
    maxWidth?: number | string;
    minHeight?: number | string;
    minWidth?: number | string;
    width?: number | string;
}

export interface PositionStrategy {
    apply(): void;
    attach(overlayRef: OverlayReference): void;
    detach?(): void;
    dispose(): void;
}

export declare class RepositionScrollStrategy implements ScrollStrategy {
    constructor(_scrollDispatcher: ScrollDispatcher, _viewportRuler: ViewportRuler, _ngZone: NgZone, _config?: RepositionScrollStrategyConfig | undefined);
    attach(overlayRef: OverlayReference): void;
    detach(): void;
    disable(): void;
    enable(): void;
}

export interface RepositionScrollStrategyConfig {
    autoClose?: boolean;
    scrollThrottle?: number;
}

export declare class ScrollingVisibility {
    isOriginClipped: boolean;
    isOriginOutsideView: boolean;
    isOverlayClipped: boolean;
    isOverlayOutsideView: boolean;
}

export interface ScrollStrategy {
    attach: (overlayRef: OverlayReference) => void;
    detach?: () => void;
    disable: () => void;
    enable: () => void;
}

export declare class ScrollStrategyOptions {
    block: () => BlockScrollStrategy;
    close: (config?: CloseScrollStrategyConfig | undefined) => CloseScrollStrategy;
    noop: () => NoopScrollStrategy;
    reposition: (config?: RepositionScrollStrategyConfig | undefined) => RepositionScrollStrategy;
    constructor(_scrollDispatcher: ScrollDispatcher, _viewportRuler: ViewportRuler, _ngZone: NgZone, document: any);
}

export declare function validateHorizontalPosition(property: string, value: HorizontalConnectionPos): void;

export declare function validateVerticalPosition(property: string, value: VerticalConnectionPos): void;

export declare type VerticalConnectionPos = 'top' | 'center' | 'bottom';
