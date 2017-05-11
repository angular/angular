import {
    NgModule,
    Directive,
    EventEmitter,
    TemplateRef,
    ViewContainerRef,
    Optional,
    Input,
    OnDestroy,
    Output,
    ElementRef,
    Renderer2,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import {Overlay, OVERLAY_PROVIDERS} from './overlay';
import {OverlayRef} from './overlay-ref';
import {TemplatePortal} from '../portal/portal';
import {OverlayState} from './overlay-state';
import {
    ConnectionPositionPair,
    ConnectedOverlayPositionChange
} from './position/connected-position';
import {PortalModule} from '../portal/portal-directives';
import {ConnectedPositionStrategy} from './position/connected-position-strategy';
import {Dir, LayoutDirection} from '../rtl/dir';
import {Scrollable} from './scroll/scrollable';
import {RepositionScrollStrategy} from './scroll/reposition-scroll-strategy';
import {ScrollStrategy} from './scroll/scroll-strategy';
import {coerceBooleanProperty} from '../coercion/boolean-property';
import {ESCAPE} from '../keyboard/keycodes';
import {ScrollDispatcher} from './scroll/scroll-dispatcher';
import {Subscription} from 'rxjs/Subscription';
import {ScrollDispatchModule} from './scroll/index';


/** Default set of positions for the overlay. Follows the behavior of a dropdown. */
let defaultPositionList = [
  new ConnectionPositionPair(
      {originX: 'start', originY: 'bottom'},
      {overlayX: 'start', overlayY: 'top'}),
  new ConnectionPositionPair(
      {originX: 'start', originY: 'top'},
      {overlayX: 'start', overlayY: 'bottom'}),
];


/**
 * Directive applied to an element to make it usable as an origin for an Overlay using a
 * ConnectedPositionStrategy.
 */
@Directive({
  selector: '[cdk-overlay-origin], [overlay-origin], [cdkOverlayOrigin]',
  exportAs: 'cdkOverlayOrigin',
})
export class OverlayOrigin {
  constructor(public elementRef: ElementRef) { }
}



/**
 * Directive to facilitate declarative creation of an Overlay using a ConnectedPositionStrategy.
 */
@Directive({
  selector: '[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]',
  exportAs: 'cdkConnectedOverlay'
})
export class ConnectedOverlayDirective implements OnDestroy, OnChanges {
  private _overlayRef: OverlayRef;
  private _templatePortal: TemplatePortal;
  private _hasBackdrop = false;
  private _backdropSubscription: Subscription;
  private _positionSubscription: Subscription;
  private _offsetX: number = 0;
  private _offsetY: number = 0;
  private _position: ConnectedPositionStrategy;
  private _escapeListener: Function;

  /** Origin for the connected overlay. */
  @Input() origin: OverlayOrigin;

  /** Registered connected position pairs. */
  @Input() positions: ConnectionPositionPair[];

  /** The offset in pixels for the overlay connection point on the x-axis */
  @Input()
  get offsetX(): number {
    return this._offsetX;
  }

  set offsetX(offsetX: number) {
    this._offsetX = offsetX;
    if (this._position) {
      this._position.withOffsetX(offsetX);
    }
  }

  /** The offset in pixels for the overlay connection point on the y-axis */
  @Input()
  get offsetY() {
    return this._offsetY;
  }

  set offsetY(offsetY: number) {
    this._offsetY = offsetY;
    if (this._position) {
      this._position.withOffsetY(offsetY);
    }
  }

  /** The width of the overlay panel. */
  @Input() width: number | string;

  /** The height of the overlay panel. */
  @Input() height: number | string;

  /** The min width of the overlay panel. */
  @Input() minWidth: number | string;

  /** The min height of the overlay panel. */
  @Input() minHeight: number | string;

  /** The custom class to be set on the backdrop element. */
  @Input() backdropClass: string;

  /** Strategy to be used when handling scroll events while the overlay is open. */
  @Input() scrollStrategy: ScrollStrategy = new RepositionScrollStrategy(this._scrollDispatcher);

  /** Whether the overlay is open. */
  @Input() open: boolean = false;

  /** Whether or not the overlay should attach a backdrop. */
  @Input()
  get hasBackdrop() {
    return this._hasBackdrop;
  }

  set hasBackdrop(value: any) {
    this._hasBackdrop = coerceBooleanProperty(value);
  }

  /** Event emitted when the backdrop is clicked. */
  @Output() backdropClick = new EventEmitter<void>();

  /** Event emitted when the position has changed. */
  @Output() positionChange = new EventEmitter<ConnectedOverlayPositionChange>();

  /** Event emitted when the overlay has been attached. */
  @Output() attach = new EventEmitter<void>();

  /** Event emitted when the overlay has been detached. */
  @Output() detach = new EventEmitter<void>();

  // TODO(jelbourn): inputs for size, scroll behavior, animation, etc.

  constructor(
      private _overlay: Overlay,
      private _renderer: Renderer2,
      private _scrollDispatcher: ScrollDispatcher,
      templateRef: TemplateRef<any>,
      viewContainerRef: ViewContainerRef,
      @Optional() private _dir: Dir) {
    this._templatePortal = new TemplatePortal(templateRef, viewContainerRef);
  }

  /** The associated overlay reference. */
  get overlayRef(): OverlayRef {
    return this._overlayRef;
  }

  /** The element's layout direction. */
  get dir(): LayoutDirection {
    return this._dir ? this._dir.value : 'ltr';
  }

  ngOnDestroy() {
    this._destroyOverlay();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open']) {
      this.open ? this._attachOverlay() : this._detachOverlay();
    }
  }

  /** Creates an overlay */
  private _createOverlay() {
    if (!this.positions || !this.positions.length) {
      this.positions = defaultPositionList;
    }

    this._overlayRef = this._overlay.create(this._buildConfig());
  }

  /** Builds the overlay config based on the directive's inputs */
  private _buildConfig(): OverlayState {
    let overlayConfig = new OverlayState();

    if (this.width || this.width === 0) {
      overlayConfig.width = this.width;
    }

    if (this.height || this.height === 0) {
      overlayConfig.height = this.height;
    }

    if (this.minWidth || this.minWidth === 0) {
      overlayConfig.minWidth = this.minWidth;
    }

    if (this.minHeight || this.minHeight === 0) {
      overlayConfig.minHeight = this.minHeight;
    }

    overlayConfig.hasBackdrop = this.hasBackdrop;

    if (this.backdropClass) {
      overlayConfig.backdropClass = this.backdropClass;
    }

    this._position = this._createPositionStrategy() as ConnectedPositionStrategy;
    overlayConfig.positionStrategy = this._position;
    overlayConfig.scrollStrategy = this.scrollStrategy;

    return overlayConfig;
  }

  /** Returns the position strategy of the overlay to be set on the overlay config */
  private _createPositionStrategy(): ConnectedPositionStrategy {
    const pos = this.positions[0];
    const originPoint = {originX: pos.originX, originY: pos.originY};
    const overlayPoint = {overlayX: pos.overlayX, overlayY: pos.overlayY};

    const strategy = this._overlay.position()
      .connectedTo(this.origin.elementRef, originPoint, overlayPoint)
      .withOffsetX(this.offsetX)
      .withOffsetY(this.offsetY);

    this._handlePositionChanges(strategy);

    return strategy;
  }

  private _handlePositionChanges(strategy: ConnectedPositionStrategy): void {
    for (let i = 1; i < this.positions.length; i++) {
      strategy.withFallbackPosition(
          {originX: this.positions[i].originX, originY: this.positions[i].originY},
          {overlayX: this.positions[i].overlayX, overlayY: this.positions[i].overlayY}
      );
    }

    this._positionSubscription =
        strategy.onPositionChange.subscribe(pos => this.positionChange.emit(pos));
  }

  /** Attaches the overlay and subscribes to backdrop clicks if backdrop exists */
  private _attachOverlay() {
    if (!this._overlayRef) {
      this._createOverlay();
    }

    this._position.withDirection(this.dir);
    this._overlayRef.getState().direction = this.dir;
    this._initEscapeListener();

    if (!this._overlayRef.hasAttached()) {
      this._overlayRef.attach(this._templatePortal);
      this.attach.emit();
    }

    if (this.hasBackdrop) {
      this._backdropSubscription = this._overlayRef.backdropClick().subscribe(() => {
        this.backdropClick.emit();
      });
    }
  }

  /** Detaches the overlay and unsubscribes to backdrop clicks if backdrop exists */
  private _detachOverlay() {
    if (this._overlayRef) {
      this._overlayRef.detach();
      this.detach.emit();
    }

    if (this._backdropSubscription) {
      this._backdropSubscription.unsubscribe();
      this._backdropSubscription = null;
    }

    if (this._escapeListener) {
      this._escapeListener();
    }
  }

  /** Destroys the overlay created by this directive. */
  private _destroyOverlay() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
    }

    if (this._backdropSubscription) {
      this._backdropSubscription.unsubscribe();
    }

    if (this._positionSubscription) {
      this._positionSubscription.unsubscribe();
    }

    if (this._escapeListener) {
      this._escapeListener();
    }
  }

  /** Sets the event listener that closes the overlay when pressing Escape. */
  private _initEscapeListener() {
    this._escapeListener = this._renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
      if (event.keyCode === ESCAPE) {
        this._detachOverlay();
      }
    });
  }
}


@NgModule({
  imports: [PortalModule, ScrollDispatchModule],
  exports: [ConnectedOverlayDirective, OverlayOrigin, ScrollDispatchModule],
  declarations: [ConnectedOverlayDirective, OverlayOrigin],
  providers: [OVERLAY_PROVIDERS],
})
export class OverlayModule {}
