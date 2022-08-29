/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor, FocusTrapFactory, InteractivityChecker} from '@angular/cdk/a11y';
import {OverlayRef} from '@angular/cdk/overlay';
import {DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  NgZone,
  OnDestroy,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {MatDialogConfig} from './dialog-config';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {cssClasses, numbers} from '@material/dialog';
import {CdkDialogContainer} from '@angular/cdk/dialog';
import {coerceNumberProperty} from '@angular/cdk/coercion';

/** Event that captures the state of dialog container animations. */
interface LegacyDialogAnimationEvent {
  state: 'opened' | 'opening' | 'closing' | 'closed';
  totalTime: number;
}

/**
 * Base class for the `MatDialogContainer`. The base class does not implement
 * animations as these are left to implementers of the dialog container.
 */
// tslint:disable-next-line:validate-decorators
@Component({template: ''})
export abstract class _MatDialogContainerBase extends CdkDialogContainer<MatDialogConfig> {
  /** Emits when an animation state changes. */
  _animationStateChanged = new EventEmitter<LegacyDialogAnimationEvent>();

  constructor(
    elementRef: ElementRef,
    focusTrapFactory: FocusTrapFactory,
    @Optional() @Inject(DOCUMENT) _document: any,
    dialogConfig: MatDialogConfig,
    interactivityChecker: InteractivityChecker,
    ngZone: NgZone,
    overlayRef: OverlayRef,
    focusMonitor?: FocusMonitor,
  ) {
    super(
      elementRef,
      focusTrapFactory,
      _document,
      dialogConfig,
      interactivityChecker,
      ngZone,
      overlayRef,
      focusMonitor,
    );
  }

  /** Starts the dialog exit animation. */
  abstract _startExitAnimation(): void;

  protected override _captureInitialFocus(): void {
    if (!this._config.delayFocusTrap) {
      this._trapFocus();
    }
  }

  /**
   * Callback for when the open dialog animation has finished. Intended to
   * be called by sub-classes that use different animation implementations.
   */
  protected _openAnimationDone(totalTime: number) {
    if (this._config.delayFocusTrap) {
      this._trapFocus();
    }

    this._animationStateChanged.next({state: 'opened', totalTime});
  }
}

const TRANSITION_DURATION_PROPERTY = '--mat-dialog-transition-duration';

// TODO(mmalerba): Remove this function after animation durations are required
//  to be numbers.
/**
 * Converts a CSS time string to a number in ms. If the given time is already a
 * number, it is assumed to be in ms.
 */
function parseCssTime(time: string | number | undefined): number | null {
  if (time == null) {
    return null;
  }
  if (typeof time === 'number') {
    return time;
  }
  if (time.endsWith('ms')) {
    return coerceNumberProperty(time.substring(0, time.length - 2));
  }
  if (time.endsWith('s')) {
    return coerceNumberProperty(time.substring(0, time.length - 1)) * 1000;
  }
  if (time === '0') {
    return 0;
  }
  return null; // anything else is invalid.
}

/**
 * Internal component that wraps user-provided dialog content in a MDC dialog.
 * @docs-private
 */
@Component({
  selector: 'mat-dialog-container',
  templateUrl: 'dialog-container.html',
  styleUrls: ['dialog.css'],
  encapsulation: ViewEncapsulation.None,
  // Disabled for consistency with the non-MDC dialog container.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  host: {
    'class': 'mat-mdc-dialog-container mdc-dialog',
    'tabindex': '-1',
    '[attr.aria-modal]': '_config.ariaModal',
    '[id]': '_config.id',
    '[attr.role]': '_config.role',
    '[attr.aria-labelledby]': '_config.ariaLabel ? null : _ariaLabelledBy',
    '[attr.aria-label]': '_config.ariaLabel',
    '[attr.aria-describedby]': '_config.ariaDescribedBy || null',
    '[class._mat-animation-noopable]': '!_animationsEnabled',
  },
})
export class MatDialogContainer extends _MatDialogContainerBase implements OnDestroy {
  /** Whether animations are enabled. */
  _animationsEnabled: boolean = this._animationMode !== 'NoopAnimations';

  /** Host element of the dialog container component. */
  private _hostElement: HTMLElement = this._elementRef.nativeElement;
  /** Duration of the dialog open animation. */
  private _openAnimationDuration = this._animationsEnabled
    ? parseCssTime(this._config.enterAnimationDuration) ?? numbers.DIALOG_ANIMATION_OPEN_TIME_MS
    : 0;
  /** Duration of the dialog close animation. */
  private _closeAnimationDuration = this._animationsEnabled
    ? parseCssTime(this._config.exitAnimationDuration) ?? numbers.DIALOG_ANIMATION_CLOSE_TIME_MS
    : 0;
  /** Current timer for dialog animations. */
  private _animationTimer: number | null = null;

  constructor(
    elementRef: ElementRef,
    focusTrapFactory: FocusTrapFactory,
    @Optional() @Inject(DOCUMENT) document: any,
    dialogConfig: MatDialogConfig,
    checker: InteractivityChecker,
    ngZone: NgZone,
    overlayRef: OverlayRef,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) private _animationMode?: string,
    focusMonitor?: FocusMonitor,
  ) {
    super(
      elementRef,
      focusTrapFactory,
      document,
      dialogConfig,
      checker,
      ngZone,
      overlayRef,
      focusMonitor,
    );
  }

  protected override _contentAttached(): void {
    // Delegate to the original dialog-container initialization (i.e. saving the
    // previous element, setting up the focus trap and moving focus to the container).
    super._contentAttached();

    // Note: Usually we would be able to use the MDC dialog foundation here to handle
    // the dialog animation for us, but there are a few reasons why we just leverage
    // their styles and not use the runtime foundation code:
    //   1. Foundation does not allow us to disable animations.
    //   2. Foundation contains unnecessary features we don't need and aren't
    //      tree-shakeable. e.g. background scrim, keyboard event handlers for ESC button.
    //   3. Foundation uses unnecessary timers for animations to work around limitations
    //      in React's `setState` mechanism.
    //      https://github.com/material-components/material-components-web/pull/3682.
    this._startOpenAnimation();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();

    if (this._animationTimer !== null) {
      clearTimeout(this._animationTimer);
    }
  }

  /** Starts the dialog open animation if enabled. */
  private _startOpenAnimation() {
    this._animationStateChanged.emit({state: 'opening', totalTime: this._openAnimationDuration});

    if (this._animationsEnabled) {
      // One would expect that the open class is added once the animation finished, but MDC
      // uses the open class in combination with the opening class to start the animation.
      this._hostElement.style.setProperty(
        TRANSITION_DURATION_PROPERTY,
        `${this._openAnimationDuration}ms`,
      );
      this._hostElement.classList.add(cssClasses.OPENING);
      this._hostElement.classList.add(cssClasses.OPEN);
      this._waitForAnimationToComplete(this._openAnimationDuration, this._finishDialogOpen);
    } else {
      this._hostElement.classList.add(cssClasses.OPEN);
      // Note: We could immediately finish the dialog opening here with noop animations,
      // but we defer until next tick so that consumers can subscribe to `afterOpened`.
      // Executing this immediately would mean that `afterOpened` emits synchronously
      // on `dialog.open` before the consumer had a change to subscribe to `afterOpened`.
      Promise.resolve().then(() => this._finishDialogOpen());
    }
  }

  /**
   * Starts the exit animation of the dialog if enabled. This method is
   * called by the dialog ref.
   */
  _startExitAnimation(): void {
    this._animationStateChanged.emit({state: 'closing', totalTime: this._closeAnimationDuration});
    this._hostElement.classList.remove(cssClasses.OPEN);

    if (this._animationsEnabled) {
      this._hostElement.style.setProperty(
        TRANSITION_DURATION_PROPERTY,
        `${this._openAnimationDuration}ms`,
      );
      this._hostElement.classList.add(cssClasses.CLOSING);
      this._waitForAnimationToComplete(this._closeAnimationDuration, this._finishDialogClose);
    } else {
      // This subscription to the `OverlayRef#backdropClick` observable in the `DialogRef` is
      // set up before any user can subscribe to the backdrop click. The subscription triggers
      // the dialog close and this method synchronously. If we'd synchronously emit the `CLOSED`
      // animation state event if animations are disabled, the overlay would be disposed
      // immediately and all other subscriptions to `DialogRef#backdropClick` would be silently
      // skipped. We work around this by waiting with the dialog close until the next tick when
      // all subscriptions have been fired as expected. This is not an ideal solution, but
      // there doesn't seem to be any other good way. Alternatives that have been considered:
      //   1. Deferring `DialogRef.close`. This could be a breaking change due to a new microtask.
      //      Also this issue is specific to the MDC implementation where the dialog could
      //      technically be closed synchronously. In the non-MDC one, Angular animations are used
      //      and closing always takes at least a tick.
      //   2. Ensuring that user subscriptions to `backdropClick`, `keydownEvents` in the dialog
      //      ref are first. This would solve the issue, but has the risk of memory leaks and also
      //      doesn't solve the case where consumers call `DialogRef.close` in their subscriptions.
      // Based on the fact that this is specific to the MDC-based implementation of the dialog
      // animations, the defer is applied here.
      Promise.resolve().then(() => this._finishDialogClose());
    }
  }

  /**
   * Completes the dialog open by clearing potential animation classes, trapping
   * focus and emitting an opened event.
   */
  private _finishDialogOpen = () => {
    this._clearAnimationClasses();
    this._openAnimationDone(this._openAnimationDuration);
  };

  /**
   * Completes the dialog close by clearing potential animation classes, restoring
   * focus and emitting a closed event.
   */
  private _finishDialogClose = () => {
    this._clearAnimationClasses();
    this._animationStateChanged.emit({state: 'closed', totalTime: this._closeAnimationDuration});
  };

  /** Clears all dialog animation classes. */
  private _clearAnimationClasses() {
    this._hostElement.classList.remove(cssClasses.OPENING);
    this._hostElement.classList.remove(cssClasses.CLOSING);
  }

  private _waitForAnimationToComplete(duration: number, callback: () => void) {
    if (this._animationTimer !== null) {
      clearTimeout(this._animationTimer);
    }

    // Note that we want this timer to run inside the NgZone, because we want
    // the related events like `afterClosed` to be inside the zone as well.
    this._animationTimer = setTimeout(callback, duration);
  }
}
