/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Direction, Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ESCAPE} from '@angular/cdk/keycodes';
import {TemplatePortal} from '@angular/cdk/portal';
import {ScrollDispatcher, ViewportRuler} from '@angular/cdk/scrolling';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  inject,
  InjectionToken,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {Overlay} from './overlay';
import {OverlayConfig} from './overlay-config';
import {OverlayRef} from './overlay-ref';
import {ConnectedOverlayPositionChange} from './position/connected-position';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
} from './position/flexible-connected-position-strategy';
import {
  RepositionScrollStrategy,
  RepositionScrollStrategyConfig,
  ScrollStrategy,
} from './scroll/index';


/** Default set of positions for the overlay. Follows the behavior of a dropdown. */
const defaultPositionList: ConnectedPosition[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top'
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom'
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom'
  },
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top'
  }
];

/** Injection token that determines the scroll handling while the connected overlay is open. */
export const CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('cdk-connected-overlay-scroll-strategy', {
  providedIn: 'root',
  factory: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_FACTORY,
});

/** @docs-private */
export function CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_FACTORY(): () => ScrollStrategy {
  // Store the injected deps here because we can't use the `inject` function outside
  // this function's context (including the inner function).
  const scrollDispatcher = inject(ScrollDispatcher);
  const viewportRuler = inject(ViewportRuler);
  const ngZone = inject(NgZone);
  return (config?: RepositionScrollStrategyConfig) =>
      new RepositionScrollStrategy(scrollDispatcher, viewportRuler, ngZone, config);
}

/**
 * Directive applied to an element to make it usable as an origin for an Overlay using a
 * ConnectedPositionStrategy.
 */
@Directive({
  selector: '[cdk-overlay-origin], [overlay-origin], [cdkOverlayOrigin]',
  exportAs: 'cdkOverlayOrigin',
})
export class CdkOverlayOrigin {
  constructor(
      /** Reference to the element on which the directive is applied. */
      public elementRef: ElementRef) { }
}


/**
 * Directive to facilitate declarative creation of an Overlay using a ConnectedPositionStrategy.
 */
@Directive({
  selector: '[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]',
  exportAs: 'cdkConnectedOverlay'
})
export class CdkConnectedOverlay implements OnDestroy, OnChanges {
  private _overlayRef: OverlayRef;
  private _templatePortal: TemplatePortal;
  private _hasBackdrop = false;
  private _lockPosition = false;
  private _backdropSubscription = Subscription.EMPTY;
  private _offsetX: number;
  private _offsetY: number;
  private _position: FlexibleConnectedPositionStrategy;

  /** Origin for the connected overlay. */
  @Input('cdkConnectedOverlayOrigin') origin: CdkOverlayOrigin;

  /** Registered connected position pairs. */
  @Input('cdkConnectedOverlayPositions') positions: ConnectedPosition[];

  /** The offset in pixels for the overlay connection point on the x-axis */
  @Input('cdkConnectedOverlayOffsetX')
  get offsetX(): number { return this._offsetX; }
  set offsetX(offsetX: number) {
    this._offsetX = offsetX;

    if (this._position) {
      this._setPositions(this._position);
    }
  }

  /** The offset in pixels for the overlay connection point on the y-axis */
  @Input('cdkConnectedOverlayOffsetY')
  get offsetY() { return this._offsetY; }
  set offsetY(offsetY: number) {
    this._offsetY = offsetY;

    if (this._position) {
      this._setPositions(this._position);
    }
  }

  /** The width of the overlay panel. */
  @Input('cdkConnectedOverlayWidth') width: number | string;

  /** The height of the overlay panel. */
  @Input('cdkConnectedOverlayHeight') height: number | string;

  /** The min width of the overlay panel. */
  @Input('cdkConnectedOverlayMinWidth') minWidth: number | string;

  /** The min height of the overlay panel. */
  @Input('cdkConnectedOverlayMinHeight') minHeight: number | string;

  /** The custom class to be set on the backdrop element. */
  @Input('cdkConnectedOverlayBackdropClass') backdropClass: string;

  /** Strategy to be used when handling scroll events while the overlay is open. */
  @Input('cdkConnectedOverlayScrollStrategy') scrollStrategy: ScrollStrategy =
      this._scrollStrategy();

  /** Whether the overlay is open. */
  @Input('cdkConnectedOverlayOpen') open: boolean = false;

  /** Whether or not the overlay should attach a backdrop. */
  @Input('cdkConnectedOverlayHasBackdrop')
  get hasBackdrop() { return this._hasBackdrop; }
  set hasBackdrop(value: any) { this._hasBackdrop = coerceBooleanProperty(value); }

  /** Whether or not the overlay should be locked when scrolling. */
  @Input('cdkConnectedOverlayLockPosition')
  get lockPosition() { return this._lockPosition; }
  set lockPosition(value: any) { this._lockPosition = coerceBooleanProperty(value); }

  /** Event emitted when the backdrop is clicked. */
  @Output() backdropClick = new EventEmitter<MouseEvent>();

  /** Event emitted when the position has changed. */
  @Output() positionChange = new EventEmitter<ConnectedOverlayPositionChange>();

  /** Event emitted when the overlay has been attached. */
  @Output() attach = new EventEmitter<void>();

  /** Event emitted when the overlay has been detached. */
  @Output() detach = new EventEmitter<void>();

  // TODO(jelbourn): inputs for size, scroll behavior, animation, etc.

  constructor(
      private _overlay: Overlay,
      templateRef: TemplateRef<any>,
      viewContainerRef: ViewContainerRef,
      @Inject(CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY) private _scrollStrategy,
      @Optional() private _dir: Directionality) {
    this._templatePortal = new TemplatePortal(templateRef, viewContainerRef);
  }

  /** The associated overlay reference. */
  get overlayRef(): OverlayRef {
    return this._overlayRef;
  }

  /** The element's layout direction. */
  get dir(): Direction {
    return this._dir ? this._dir.value : 'ltr';
  }

  ngOnDestroy() {
    this._destroyOverlay();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this._position) {
      if (changes['positions'] || changes['_deprecatedPositions']) {
        this._position.withPositions(this.positions);
      }

      if (changes['lockPosition']) {
        this._position.withLockedPosition(this.lockPosition);
      }

      if (changes['origin'] || changes['_deprecatedOrigin']) {
        this._position.setOrigin(this.origin.elementRef);

        if (this.open) {
          this._position.apply();
        }
      }
    }

    if (changes['open'] || changes['_deprecatedOpen']) {
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
  private _buildConfig(): OverlayConfig {
    const positionStrategy = this._position = this._createPositionStrategy();
    const overlayConfig = new OverlayConfig({
      positionStrategy,
      scrollStrategy: this.scrollStrategy,
      hasBackdrop: this.hasBackdrop
    });

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

    if (this.backdropClass) {
      overlayConfig.backdropClass = this.backdropClass;
    }

    return overlayConfig;
  }

  /** Returns the position strategy of the overlay to be set on the overlay config */
  private _createPositionStrategy(): FlexibleConnectedPositionStrategy {
    const strategy = this._overlay.position()
      .flexibleConnectedTo(this.origin.elementRef)
      // Turn off all of the flexible positioning features for now to have it behave
      // the same way as the old ConnectedPositionStrategy and to avoid breaking changes.
      // TODO(crisbeto): make these on by default and add inputs for them
      // next time we do breaking changes.
      .withFlexibleDimensions(false)
      .withPush(false)
      .withGrowAfterOpen(false)
      .withLockedPosition(this.lockPosition);

    this._setPositions(strategy);
    strategy.positionChanges.subscribe(p => this.positionChange.emit(p));

    return strategy;
  }

  /**
   * Sets the primary and fallback positions of a positions strategy,
   * based on the current directive inputs.
   */
  private _setPositions(positionStrategy: FlexibleConnectedPositionStrategy) {
    const positions: ConnectedPosition[] = this.positions.map(pos => ({
      originX: pos.originX,
      originY: pos.originY,
      overlayX: pos.overlayX,
      overlayY: pos.overlayY,
      offsetX: pos.offsetX || this.offsetX,
      offsetY: pos.offsetY || this.offsetY
    }));

    positionStrategy.withPositions(positions);
  }

  /** Attaches the overlay and subscribes to backdrop clicks if backdrop exists */
  private _attachOverlay() {
    if (!this._overlayRef) {
      this._createOverlay();

      this._overlayRef!.keydownEvents().subscribe((event: KeyboardEvent) => {
        if (event.keyCode === ESCAPE) {
          this._detachOverlay();
        }
      });
    } else {
      // Update the overlay size, in case the directive's inputs have changed
      this._overlayRef.updateSize({
        width: this.width,
        minWidth: this.minWidth,
        height: this.height,
        minHeight: this.minHeight,
      });
    }

    this._overlayRef.setDirection(this.dir);

    if (!this._overlayRef.hasAttached()) {
      this._overlayRef.attach(this._templatePortal);
      this.attach.emit();
    }

    if (this.hasBackdrop) {
      this._backdropSubscription = this._overlayRef.backdropClick().subscribe(event => {
        this.backdropClick.emit(event);
      });
    }
  }

  /** Detaches the overlay and unsubscribes to backdrop clicks if backdrop exists */
  private _detachOverlay() {
    if (this._overlayRef) {
      this._overlayRef.detach();
      this.detach.emit();
    }

    this._backdropSubscription.unsubscribe();
  }

  /** Destroys the overlay created by this directive. */
  private _destroyOverlay() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
    }

    this._backdropSubscription.unsubscribe();
  }
}


/** @docs-private @deprecated @deletion-target 7.0.0 */
export function CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay):
    () => RepositionScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

/** @docs-private @deprecated @deletion-target 7.0.0 */
export const CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER = {
  provide: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY,
};
