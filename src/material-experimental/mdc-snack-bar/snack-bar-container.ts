/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AriaLivePoliteness} from '@angular/cdk/a11y';
import {
  BasePortalOutlet,
  CdkPortalOutlet,
  ComponentPortal,
  TemplatePortal,
} from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  Inject,
  NgZone,
  OnDestroy,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {MatSnackBarConfig, _SnackBarContainer} from '@angular/material/snack-bar';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {MDCSnackbarAdapter, MDCSnackbarFoundation, cssClasses} from '@material/snackbar';
import {Platform} from '@angular/cdk/platform';
import {Observable, Subject} from 'rxjs';

/**
 * The MDC label class that should wrap the label content of the snack bar.
 * @docs-private
 */
const MDC_SNACKBAR_LABEL_CLASS = 'mdc-snackbar__label';

/**
 * Internal component that wraps user-provided snack bar content.
 * @docs-private
 */
@Component({
  selector: 'mat-snack-bar-container',
  templateUrl: 'snack-bar-container.html',
  styleUrls: ['snack-bar-container.css'],
  // In Ivy embedded views will be change detected from their declaration place, rather than
  // where they were stamped out. This means that we can't have the snack bar container be OnPush,
  // because it might cause snack bars that were opened from a template not to be out of date.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'mdc-snackbar mat-mdc-snack-bar-container',
    '[class.mat-snack-bar-container]': 'false',
    // Mark this element with a 'mat-exit' attribute to indicate that the snackbar has
    // been dismissed and will soon be removed from the DOM. This is used by the snackbar
    // test harness.
    '[attr.mat-exit]': `_exiting ? '' : null`,
    '[class._mat-animation-noopable]': `_animationMode === 'NoopAnimations'`,
  },
})
export class MatSnackBarContainer
  extends BasePortalOutlet
  implements _SnackBarContainer, OnDestroy
{
  /** The number of milliseconds to wait before announcing the snack bar's content. */
  private readonly _announceDelay: number = 150;

  /** The timeout for announcing the snack bar's content. */
  private _announceTimeoutId: number;

  /** Subject for notifying that the snack bar has announced to screen readers. */
  readonly _onAnnounce: Subject<void> = new Subject();

  /** Subject for notifying that the snack bar has exited from view. */
  readonly _onExit: Subject<void> = new Subject();

  /** Subject for notifying that the snack bar has finished entering the view. */
  readonly _onEnter: Subject<void> = new Subject();

  /** aria-live value for the live region. */
  _live: AriaLivePoliteness;

  /** Whether the snack bar is currently exiting. */
  _exiting = false;

  /**
   * Role of the live region. This is only for Firefox as there is a known issue where Firefox +
   * JAWS does not read out aria-live message.
   */
  _role?: 'status' | 'alert';

  private _mdcAdapter: MDCSnackbarAdapter = {
    addClass: (className: string) => this._setClass(className, true),
    removeClass: (className: string) => this._setClass(className, false),
    announce: () => {},
    notifyClosed: () => this._finishExit(),
    notifyClosing: () => {},
    notifyOpened: () => this._onEnter.next(),
    notifyOpening: () => {},
  };

  _mdcFoundation = new MDCSnackbarFoundation(this._mdcAdapter);

  /** The portal outlet inside of this container into which the snack bar content will be loaded. */
  @ViewChild(CdkPortalOutlet, {static: true}) _portalOutlet: CdkPortalOutlet;

  /** Element that acts as the MDC surface container which should contain the label and actions. */
  @ViewChild('surface', {static: true}) _surface: ElementRef;

  /**
   * Element that will have the `mdc-snackbar__label` class applied if the attached component
   * or template does not have it. This ensures that the appropriate structure, typography, and
   * color is applied to the attached view.
   */
  @ViewChild('label', {static: true}) _label: ElementRef;

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    public snackBarConfig: MatSnackBarConfig,
    private _platform: Platform,
    private _ngZone: NgZone,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string,
  ) {
    super();

    // Use aria-live rather than a live role like 'alert' or 'status'
    // because NVDA and JAWS have show inconsistent behavior with live roles.
    if (snackBarConfig.politeness === 'assertive' && !snackBarConfig.announcementMessage) {
      this._live = 'assertive';
    } else if (snackBarConfig.politeness === 'off') {
      this._live = 'off';
    } else {
      this._live = 'polite';
    }

    // Only set role for Firefox. Set role based on aria-live because setting role="alert" implies
    // aria-live="assertive" which may cause issues if aria-live is set to "polite" above.
    if (this._platform.FIREFOX) {
      if (this._live === 'polite') {
        this._role = 'status';
      }
      if (this._live === 'assertive') {
        this._role = 'alert';
      }
    }

    // `MatSnackBar` will use the config's timeout to determine when the snack bar should be closed.
    // Set this to `-1` to mark it as indefinitely open so that MDC does not close itself.
    this._mdcFoundation.setTimeoutMs(-1);
  }

  /** Makes sure the exit callbacks have been invoked when the element is destroyed. */
  ngOnDestroy() {
    this._mdcFoundation.close();
  }

  enter() {
    // MDC uses some browser APIs that will throw during server-side rendering.
    if (this._platform.isBrowser) {
      this._ngZone.run(() => {
        this._mdcFoundation.open();
        this._screenReaderAnnounce();
      });
    }
  }

  exit(): Observable<void> {
    const classList = this._elementRef.nativeElement.classList;

    // MDC won't complete the closing sequence if it starts while opening hasn't finished.
    // If that's the case, destroy immediately to ensure that our stream emits as expected.
    if (classList.contains(cssClasses.OPENING) || !classList.contains(cssClasses.OPEN)) {
      this._finishExit();
    } else {
      // It's common for snack bars to be opened by random outside calls like HTTP requests or
      // errors. Run inside the NgZone to ensure that it functions correctly.
      this._ngZone.run(() => {
        this._exiting = true;
        this._mdcFoundation.close();
      });
    }

    // If the snack bar hasn't been announced by the time it exits it wouldn't have been open
    // long enough to visually read it either, so clear the timeout for announcing.
    clearTimeout(this._announceTimeoutId);

    return this._onExit;
  }

  /** Attach a component portal as content to this snack bar container. */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    this._assertNotAttached();
    this._applySnackBarClasses();
    const componentRef = this._portalOutlet.attachComponentPortal(portal);
    this._applyLabelClass();
    return componentRef;
  }

  /** Attach a template portal as content to this snack bar container. */
  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    this._assertNotAttached();
    this._applySnackBarClasses();
    const viewRef = this._portalOutlet.attachTemplatePortal(portal);
    this._applyLabelClass();
    return viewRef;
  }

  private _setClass(cssClass: string, active: boolean) {
    this._elementRef.nativeElement.classList.toggle(cssClass, active);
  }

  /** Applies the user-configured CSS classes to the snack bar. */
  private _applySnackBarClasses() {
    const panelClasses = this.snackBarConfig.panelClass;
    if (panelClasses) {
      if (Array.isArray(panelClasses)) {
        // Note that we can't use a spread here, because IE doesn't support multiple arguments.
        panelClasses.forEach(cssClass => this._setClass(cssClass, true));
      } else {
        this._setClass(panelClasses, true);
      }
    }
  }

  /** Asserts that no content is already attached to the container. */
  private _assertNotAttached() {
    if (this._portalOutlet.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('Attempting to attach snack bar content after content is already attached');
    }
  }

  /** Finishes the exit sequence of the container. */
  private _finishExit() {
    this._onExit.next();
    this._onExit.complete();

    if (this._platform.isBrowser) {
      this._mdcFoundation.destroy();
    }
  }

  /**
   * Starts a timeout to move the snack bar content to the live region so screen readers will
   * announce it.
   */
  private _screenReaderAnnounce() {
    if (!this._announceTimeoutId) {
      this._ngZone.runOutsideAngular(() => {
        this._announceTimeoutId = setTimeout(() => {
          const inertElement = this._elementRef.nativeElement.querySelector('[aria-hidden]');
          const liveElement = this._elementRef.nativeElement.querySelector('[aria-live]');

          if (inertElement && liveElement) {
            // If an element in the snack bar content is focused before being moved
            // track it and restore focus after moving to the live region.
            let focusedElement: HTMLElement | null = null;
            if (
              document.activeElement instanceof HTMLElement &&
              inertElement.contains(document.activeElement)
            ) {
              focusedElement = document.activeElement;
            }

            inertElement.removeAttribute('aria-hidden');
            liveElement.appendChild(inertElement);
            focusedElement?.focus();

            this._onAnnounce.next();
            this._onAnnounce.complete();
          }
        }, this._announceDelay);
      });
    }
  }

  /** Applies the correct CSS class to the label based on its content. */
  private _applyLabelClass() {
    // Check to see if the attached component or template uses the MDC template structure,
    // specifically the MDC label. If not, the container should apply the MDC label class to this
    // component's label container, which will apply MDC's label styles to the attached view.
    const label = this._label.nativeElement;

    if (!label.querySelector(`.${MDC_SNACKBAR_LABEL_CLASS}`)) {
      label.classList.add(MDC_SNACKBAR_LABEL_CLASS);
    } else {
      label.classList.remove(MDC_SNACKBAR_LABEL_CLASS);
    }
  }
}
