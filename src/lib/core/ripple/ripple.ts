import {
  NgModule,
  ModuleWithProviders,
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import {RippleConfig, RippleRenderer} from './ripple-renderer';
import {CompatibilityModule} from '../compatibility/compatibility';
import {ViewportRuler, VIEWPORT_RULER_PROVIDER} from '../overlay/position/viewport-ruler';
import {SCROLL_DISPATCHER_PROVIDER} from '../overlay/scroll/scroll-dispatcher';


@Directive({
  selector: '[md-ripple], [mat-ripple]',
  host: {
    '[class.mat-ripple]': 'true',
    '[class.mat-ripple-unbounded]': 'unbounded'
  }
})
export class MdRipple implements OnChanges, OnDestroy {

  /**
   * The element that triggers the ripple when click events are received. Defaults to the
   * directive's host element.
   */
  // Prevent TS metadata emit from referencing HTMLElement in ripple.js
  // Otherwise running this code in a Node environment (e.g Universal) will not work.
  @Input('mdRippleTrigger') trigger: HTMLElement|HTMLElement;

  /**
   * Whether the ripple always originates from the center of the host element's bounds, rather
   * than originating from the location of the click event.
   */
  @Input('mdRippleCentered') centered: boolean;

  /**
   * Whether click events will not trigger the ripple. It can still be triggered by manually
   * calling createRipple()
   */
  @Input('mdRippleDisabled') disabled: boolean;

  /**
   * If set, the radius in pixels of foreground ripples when fully expanded. If unset, the radius
   * will be the distance from the center of the ripple to the furthest corner of the host element's
   * bounding rectangle.
   */
  @Input('mdRippleRadius') radius: number = 0;

  /**
   * If set, the normal duration of ripple animations is divided by this value. For example,
   * setting it to 0.5 will cause the animations to take twice as long.
   * A changed speedFactor will not modify the fade-out duration of the ripples.
   */
  @Input('mdRippleSpeedFactor') speedFactor: number = 1;

  /** Custom color for ripples. */
  @Input('mdRippleColor') color: string;

  /** Whether foreground ripples should be visible outside the component's bounds. */
  @Input('mdRippleUnbounded') unbounded: boolean;

  /** Renderer for the ripple DOM manipulations. */
  private _rippleRenderer: RippleRenderer;

  constructor(elementRef: ElementRef, ngZone: NgZone, ruler: ViewportRuler) {
    this._rippleRenderer = new RippleRenderer(elementRef, ngZone, ruler);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['trigger'] && this.trigger) {
      this._rippleRenderer.setTriggerElement(this.trigger);
    }

    this._rippleRenderer.rippleDisabled = this.disabled;
    this._updateRippleConfig();
  }

  ngOnDestroy() {
    // Set the trigger element to null to cleanup all listeners.
    this._rippleRenderer.setTriggerElement(null);
  }

  /** Launches a manual ripple at the specified position. */
  launch(pageX: number, pageY: number, config?: RippleConfig) {
    this._rippleRenderer.fadeInRipple(pageX, pageY, config);
  }

  /** Updates the ripple configuration with the input values. */
  private _updateRippleConfig() {
    this._rippleRenderer.rippleConfig = {
      centered: this.centered,
      speedFactor: this.speedFactor,
      radius: this.radius,
      color: this.color
    };
  }

}


@NgModule({
  imports: [CompatibilityModule],
  exports: [MdRipple, CompatibilityModule],
  declarations: [MdRipple],
  providers: [VIEWPORT_RULER_PROVIDER, SCROLL_DISPATCHER_PROVIDER],
})
export class MdRippleModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdRippleModule,
      providers: []
    };
  }
}
