import {
    NgModule,
    ModuleWithProviders,
    Directive,
    EventEmitter,
    TemplateRef,
    ViewContainerRef,
    Optional,
    Input,
    OnDestroy,
    Output,
    ElementRef
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
import {Subscription} from 'rxjs/Subscription';
import {Dir, LayoutDirection} from '../rtl/dir';

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
  selector: '[overlay-origin]',
  exportAs: 'overlayOrigin',
})
export class OverlayOrigin {
  constructor(private _elementRef: ElementRef) { }

  get elementRef() {
    return this._elementRef;
  }
}



/**
 * Directive to facilitate declarative creation of an Overlay using a ConnectedPositionStrategy.
 */
@Directive({
  selector: '[connected-overlay]',
  exportAs: 'connectedOverlay'
})
export class ConnectedOverlayDirective implements OnDestroy {
  private _overlayRef: OverlayRef;
  private _templatePortal: TemplatePortal;
  private _open = false;
  private _hasBackdrop = false;
  private _backdropSubscription: Subscription;
  private _positionSubscription: Subscription;

  @Input() origin: OverlayOrigin;
  @Input() positions: ConnectionPositionPair[];

  /** The offset in pixels for the overlay connection point on the x-axis */
  @Input() offsetX: number = 0;

  /** The offset in pixels for the overlay connection point on the y-axis */
  @Input() offsetY: number = 0;

  /** The width of the overlay panel. */
  @Input() width: number | string;

  /** The height of the overlay panel. */
  @Input() height: number | string;

  /** The custom class to be set on the backdrop element. */
  @Input() backdropClass: string;

  /** Whether or not the overlay should attach a backdrop. */
  @Input()
  get hasBackdrop() {
    return this._hasBackdrop;
  }

  // TODO: move the boolean coercion logic to a shared function in core
  set hasBackdrop(value: any) {
    this._hasBackdrop = value != null && `${value}` !== 'false';
  }

  @Input()
  get open() {
    return this._open;
  }

  set open(value: boolean) {
    value ? this._attachOverlay() : this._detachOverlay();
    this._open = value;
  }

  /** Event emitted when the backdrop is clicked. */
  @Output() backdropClick = new EventEmitter<void>();
  @Output() positionChange = new EventEmitter<ConnectedOverlayPositionChange>();

  // TODO(jelbourn): inputs for size, scroll behavior, animation, etc.

  constructor(
      private _overlay: Overlay,
      templateRef: TemplateRef<any>,
      viewContainerRef: ViewContainerRef,
      @Optional() private _dir: Dir) {
    this._templatePortal = new TemplatePortal(templateRef, viewContainerRef);
  }

  get overlayRef(): OverlayRef {
    return this._overlayRef;
  }

  get dir(): LayoutDirection {
    return this._dir ? this._dir.value : 'ltr';
  }

  /** TODO: internal */
  ngOnDestroy() {
    this._destroyOverlay();
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

    overlayConfig.hasBackdrop = this.hasBackdrop;

    if (this.backdropClass) {
      overlayConfig.backdropClass = this.backdropClass;
    }

    overlayConfig.positionStrategy = this._createPositionStrategy();

    overlayConfig.direction = this.dir;

    return overlayConfig;
  }

  /** Returns the position strategy of the overlay to be set on the overlay config */
  private _createPositionStrategy(): ConnectedPositionStrategy {
    const pos = this.positions[0];
    const originPoint = {originX: pos.originX, originY: pos.originY};
    const overlayPoint = {overlayX: pos.overlayX, overlayY: pos.overlayY};

    const strategy = this._overlay.position()
      .connectedTo(this.origin.elementRef, originPoint, overlayPoint)
      .withDirection(this.dir)
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

    if (!this._overlayRef.hasAttached()) {
      this._overlayRef.attach(this._templatePortal);
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
    }

    if (this._backdropSubscription) {
      this._backdropSubscription.unsubscribe();
      this._backdropSubscription = null;
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
  }
}


@NgModule({
  imports: [PortalModule],
  exports: [ConnectedOverlayDirective, OverlayOrigin],
  declarations: [ConnectedOverlayDirective, OverlayOrigin],
})
export class OverlayModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: OverlayModule,
      providers: OVERLAY_PROVIDERS,
    };
  }
}
