/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  BasePortalOutlet,
  CdkPortalOutlet,
  ComponentPortal,
  TemplatePortal
} from '@angular/cdk/portal';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MatSnackBarConfig, _SnackBarContainer} from '@angular/material/snack-bar';
import {MDCSnackbarAdapter, MDCSnackbarFoundation} from '@material/snackbar';
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
  selector: 'mat-mdc-snack-bar-container',
  templateUrl: 'snack-bar-container.html',
  styleUrls: ['snack-bar-container.css'],
  // In Ivy embedded views will be change detected from their declaration place, rather than
  // where they were stamped out. This means that we can't have the snack bar container be OnPush,
  // because it might cause snack bars that were opened from a template not to be out of date.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[attr.role]': '_role',
    'class': 'mdc-snackbar mat-mdc-snack-bar-container',
    '[class.mat-snack-bar-container]': 'false',
    // Mark this element with a 'mat-exit' attribute to indicate that the snackbar has
    // been dismissed and will soon be removed from the DOM. This is used by the snackbar
    // test harness.
    '[attr.mat-exit]': `_exiting ? '' : null`,
  }
})
export class MatSnackBarContainer extends BasePortalOutlet
    implements _SnackBarContainer, AfterViewChecked, OnDestroy {
  /** Subject for notifying that the snack bar has exited from view. */
  readonly _onExit: Subject<void> = new Subject();

  /** Subject for notifying that the snack bar has finished entering the view. */
  readonly _onEnter: Subject<void> = new Subject();

  /** ARIA role for the snack bar container. */
  _role: 'alert' | 'status' | null;

  /** Whether the snack bar is currently exiting. */
  _exiting = false;

  private _mdcAdapter: MDCSnackbarAdapter = {
    addClass: (className: string) => this._setClass(className, true),
    removeClass: (className: string) => this._setClass(className, false),
    announce: () => {},
    notifyClosed: () => {
      this._onExit.next();
      this._mdcFoundation.destroy();
    },
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
      private _platform: Platform) {
    super();

    // Based on the ARIA spec, `alert` and `status` roles have an
    // implicit `assertive` and `polite` politeness respectively.
    if (snackBarConfig.politeness === 'assertive' && !snackBarConfig.announcementMessage) {
      this._role = 'alert';
    } else if (snackBarConfig.politeness === 'off') {
      this._role = null;
    } else {
      this._role = 'status';
    }

    // `MatSnackBar` will use the config's timeout to determine when the snack bar should be closed.
    // Set this to `-1` to mark it as indefinitely open so that MDC does not close itself.
    this._mdcFoundation.setTimeoutMs(-1);
  }

  ngAfterViewChecked() {
    // Check to see if the attached component or template uses the MDC template structure,
    // specifically the MDC label. If not, the container should apply the MDC label class to this
    // component's label container, which will apply MDC's label styles to the attached view.
    if (!this._label.nativeElement.querySelector(`.${MDC_SNACKBAR_LABEL_CLASS}`)) {
      this._label.nativeElement.classList.add(MDC_SNACKBAR_LABEL_CLASS);
    } else {
      this._label.nativeElement.classList.remove(MDC_SNACKBAR_LABEL_CLASS);
    }
  }

  /** Makes sure the exit callbacks have been invoked when the element is destroyed. */
  ngOnDestroy() {
    this._mdcFoundation.close();
  }

  enter() {
    // MDC uses some browser APIs that will throw during server-side rendering.
    if (this._platform.isBrowser) {
      this._mdcFoundation.open();
    }
  }

  exit(): Observable<void> {
    this._exiting = true;
    this._mdcFoundation.close();
    return this._onExit;
  }

  /** Attach a component portal as content to this snack bar container. */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    this._assertNotAttached();
    this._applySnackBarClasses();
    return this._portalOutlet.attachComponentPortal(portal);
  }

  /** Attach a template portal as content to this snack bar container. */
  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    this._assertNotAttached();
    this._applySnackBarClasses();
    return this._portalOutlet.attachTemplatePortal(portal);
  }

  private _setClass(cssClass: string, active: boolean) {
    const classList = this._elementRef.nativeElement.classList;
    active ? classList.add(cssClass) : classList.remove(cssClass);
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
    if (this._portalOutlet.hasAttached()) {
      throw Error('Attempting to attach snack bar content after content is already attached');
    }
  }
}
