import {
  Directive,
  ElementRef,
  Input,
  Inject,
  NgZone,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  OpaqueToken,
  Optional,
} from '@angular/core';
import {RippleConfig, RippleRenderer} from './ripple-renderer';
import {ViewportRuler} from '../overlay/position/viewport-ruler';
import {RippleRef} from './ripple-ref';

/** OpaqueToken that can be used to specify the global ripple options. */
export const MD_RIPPLE_GLOBAL_OPTIONS = new OpaqueToken('md-ripple-global-options');

export type RippleGlobalOptions = {
  disabled?: boolean;
  baseSpeedFactor?: number;
};

@Directive({
  selector: '[md-ripple], [mat-ripple], [mdRipple], [matRipple]',
  exportAs: 'mdRipple',
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

  /** Options that are set globally for all ripples. */
  private _globalOptions: RippleGlobalOptions;

  constructor(
    elementRef: ElementRef,
    ngZone: NgZone,
    ruler: ViewportRuler,
    // Type needs to be `any` because of https://github.com/angular/angular/issues/12631
    @Optional() @Inject(MD_RIPPLE_GLOBAL_OPTIONS) globalOptions: any
  ) {
    this._rippleRenderer = new RippleRenderer(elementRef, ngZone, ruler);
    this._globalOptions = globalOptions ? globalOptions : {};
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['trigger'] && this.trigger) {
      this._rippleRenderer.setTriggerElement(this.trigger);
    }

    this._rippleRenderer.rippleDisabled = this._globalOptions.disabled || this.disabled;
    this._rippleRenderer.rippleConfig = this.rippleConfig;
  }

  ngOnDestroy() {
    // Set the trigger element to null to cleanup all listeners.
    this._rippleRenderer.setTriggerElement(null);
  }

  /** Launches a manual ripple at the specified position. */
  launch(pageX: number, pageY: number, config = this.rippleConfig): RippleRef {
    return this._rippleRenderer.fadeInRipple(pageX, pageY, config);
  }

  /** Fades out all currently showing ripple elements. */
  fadeOutAll() {
    this._rippleRenderer.fadeOutAll();
  }

  /** Ripple configuration from the directive's input values. */
  get rippleConfig(): RippleConfig {
    return {
      centered: this.centered,
      speedFactor: this.speedFactor * (this._globalOptions.baseSpeedFactor || 1),
      radius: this.radius,
      color: this.color
    };
  }
}
