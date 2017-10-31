/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ComponentRef,
  EmbeddedViewRef,
  ViewChild,
  NgZone,
  OnDestroy,
  Renderer2,
  ElementRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  AnimationEvent,
} from '@angular/animations';
import {
  BasePortalOutlet,
  ComponentPortal,
  CdkPortalOutlet,
} from '@angular/cdk/portal';
import {first} from 'rxjs/operators/first';
import {AnimationCurves, AnimationDurations} from '@angular/material/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {MatSnackBarConfig} from './snack-bar-config';


export const SHOW_ANIMATION =
    `${AnimationDurations.ENTERING} ${AnimationCurves.DECELERATION_CURVE}`;
export const HIDE_ANIMATION =
    `${AnimationDurations.EXITING} ${AnimationCurves.ACCELERATION_CURVE}`;

/**
 * Internal component that wraps user-provided snack bar content.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'snack-bar-container',
  templateUrl: 'snack-bar-container.html',
  styleUrls: ['snack-bar-container.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  host: {
    'role': 'alert',
    'class': 'mat-snack-bar-container',
    '[@state]': '_animationState',
    '(@state.done)': 'onAnimationEnd($event)'
  },
  animations: [
    trigger('state', [
      state('visible-top, visible-bottom', style({transform: 'translateY(0%)'})),
      transition('visible-top => hidden-top, visible-bottom => hidden-bottom',
        animate(HIDE_ANIMATION)),
      transition('void => visible-top, void => visible-bottom', animate(SHOW_ANIMATION)),
    ])
  ],
})
export class MatSnackBarContainer extends BasePortalOutlet implements OnDestroy {
  /** Whether the component has been destroyed. */
  private _destroyed = false;

  /** The portal outlet inside of this container into which the snack bar content will be loaded. */
  @ViewChild(CdkPortalOutlet) _portalOutlet: CdkPortalOutlet;

  /** Subject for notifying that the snack bar has exited from view. */
  _onExit: Subject<any> = new Subject();

  /** Subject for notifying that the snack bar has finished entering the view. */
  _onEnter: Subject<any> = new Subject();

  /** The state of the snack bar animations. */
  _animationState = 'void';

  /** The snack bar configuration. */
  snackBarConfig: MatSnackBarConfig;

  constructor(
    private _ngZone: NgZone,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  /** Attach a component portal as content to this snack bar container. */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalOutlet.hasAttached()) {
      throw Error('Attempting to attach snack bar content after content is already attached');
    }

    if (this.snackBarConfig.panelClass || this.snackBarConfig.extraClasses) {
      const classes = [
        ...this._getCssClasses(this.snackBarConfig.panelClass),
        ...this._getCssClasses(this.snackBarConfig.extraClasses)
      ];
      // Not the most efficient way of adding classes, but the renderer doesn't allow us
      // to pass in an array or a space-separated list.
      for (let cssClass of classes) {
        this._renderer.addClass(this._elementRef.nativeElement, cssClass);
      }
    }

    if (this.snackBarConfig.horizontalPosition === 'center') {
      this._renderer.addClass(this._elementRef.nativeElement, 'mat-snack-bar-center');
    }

    if (this.snackBarConfig.verticalPosition === 'top') {
      this._renderer.addClass(this._elementRef.nativeElement, 'mat-snack-bar-top');
    }

    return this._portalOutlet.attachComponentPortal(portal);
  }

  /** Attach a template portal as content to this snack bar container. */
  attachTemplatePortal(): EmbeddedViewRef<any> {
    throw Error('Not yet implemented');
  }

  /** Handle end of animations, updating the state of the snackbar. */
  onAnimationEnd(event: AnimationEvent) {
    const {fromState, toState} = event;

    if ((toState === 'void' && fromState !== 'void') || toState.startsWith('hidden')) {
      this._completeExit();
    }

    if (toState.startsWith('visible')) {
      // Note: we shouldn't use `this` inside the zone callback,
      // because it can cause a memory leak.
      const onEnter = this._onEnter;

      this._ngZone.run(() => {
        onEnter.next();
        onEnter.complete();
      });
    }
  }

  /** Begin animation of snack bar entrance into view. */
  enter(): void {
    if (!this._destroyed) {
      this._animationState = `visible-${this.snackBarConfig.verticalPosition}`;
      this._changeDetectorRef.detectChanges();
    }
  }

  /** Begin animation of the snack bar exiting from view. */
  exit(): Observable<void> {
    this._animationState = `hidden-${this.snackBarConfig.verticalPosition}`;
    return this._onExit;
  }

  /** Makes sure the exit callbacks have been invoked when the element is destroyed. */
  ngOnDestroy() {
    this._destroyed = true;
    this._completeExit();
  }

  /**
   * Waits for the zone to settle before removing the element. Helps prevent
   * errors where we end up removing an element which is in the middle of an animation.
   */
  private _completeExit() {
    this._ngZone.onMicrotaskEmpty.asObservable().pipe(first()).subscribe(() => {
      this._onExit.next();
      this._onExit.complete();
    });
  }

  /** Convert the class list to a array of classes it can apply to the dom */
  private _getCssClasses(classList: undefined | string | string[]) {
    if (classList) {
      if (Array.isArray(classList)) {
        return classList;
      } else {
        return [classList];
      }
    }
    return [];
  }
}
