/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ElementRef,
  HostBinding,
  ViewChild,
  ComponentRef,
  EmbeddedViewRef,
  ChangeDetectorRef,
  Component,
  Optional,
  Inject,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {trigger, state, style, transition, animate, AnimationEvent} from '@angular/animations';
import {
  BasePortalOutlet,
  PortalHostDirective,
  ComponentPortal,
  TemplatePortal
} from '@angular/cdk/portal';
import {FocusTrapFactory} from '@angular/cdk/a11y';
import {DialogConfig} from './dialog-config';
import {Subject} from 'rxjs/Subject';


export function throwDialogContentAlreadyAttachedError() {
  throw Error('Attempting to attach dialog content after content is already attached');
}


/**
 * Internal component that wraps user-provided dialog content.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'cdk-dialog-container',
  templateUrl: './dialog-container.html',
  styleUrls: ['dialog-container.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  // Using OnPush for dialogs caused some G3 sync issues. Disabled until we can track them down.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  animations: [
    trigger('dialog', [
      state('enter', style({ opacity: 1 })),
      state('exit, void', style({ opacity: 0 })),
      transition('* => *', animate(225)),
    ])
  ],
  host: {
    '[@dialog]': '_state',
    '(@dialog.start)': '_onAnimationStart($event)',
    '(@dialog.done)': '_onAnimationDone($event)',
  },
})
export class CdkDialogContainer extends BasePortalOutlet {
  /** State of the dialog animation. */
  _state: 'void' | 'enter' | 'exit' = 'enter';

  /** Element that was focused before the dialog was opened. Save this to restore upon close. */
  private _elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;

   /** The class that traps and manages focus within the dialog. */
  private _focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement, false);

  // @HostBinding is used in the class as it is expected to be extended.  Since @Component decorator
  // metadata is not inherited by child classes, instead the host binding data is defined in a way
  // that can be inherited.
  // tslint:disable:no-host-decorator-in-concrete
  @HostBinding('attr.aria-label') get _ariaLabel() { return this._config.ariaLabel || null; }

  @HostBinding('attr.aria-describedby')
  get _ariaDescribedBy() { return this._config ? this._config.ariaDescribedBy : null; }

  @HostBinding('attr.role') get _role() { return this._config ? this._config.role : null; }

  @HostBinding('attr.tabindex') get _tabindex() { return -1; }
  // tslint:disable:no-host-decorator-in-concrete

  /** The portal host inside of this container into which the dialog content will be loaded. */
  @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

  /** A subject emitting before the dialog enters the view. */
  _beforeEnter: Subject<void> = new Subject();

  /** A subject emitting after the dialog enters the view. */
  _afterEnter: Subject<void> = new Subject();

  /** A subject emitting before the dialog exits the view. */
  _beforeExit: Subject<void> = new Subject();

  /** A subject emitting after the dialog exits the view. */
  _afterExit: Subject<void> = new Subject();

  /** The dialog configuration. */
  _config: DialogConfig;

  constructor(
    private _elementRef: ElementRef,
    private _focusTrapFactory: FocusTrapFactory,
    private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(DOCUMENT) private _document: any) {
    super();
  }

  /** Destroy focus trap to place focus back to the element focused before the dialog opened. */
  ngOnDestroy() {
    this._focusTrap.destroy();
  }

  /**
   * Attach a ComponentPortal as content to this dialog container.
   * @param portal Portal to be attached as the dialog content.
   */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalHost.hasAttached()) {
      throwDialogContentAlreadyAttachedError();
    }

    this._savePreviouslyFocusedElement();
    return this._portalHost.attachComponentPortal(portal);
  }

  /**
   * Attach a TemplatePortal as content to this dialog container.
   * @param portal Portal to be attached as the dialog content.
   */
  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    if (this._portalHost.hasAttached()) {
      throwDialogContentAlreadyAttachedError();
    }

    this._savePreviouslyFocusedElement();
    return this._portalHost.attachTemplatePortal(portal);
  }

  /** Emit lifecycle events based on animation `start` callback. */
  _onAnimationStart(event: AnimationEvent) {
    if (event.toState === 'enter') {
      this._beforeEnter.next();
    }
    if (event.toState === 'void' || event.toState === 'exit') {
      this._beforeExit.next();
    }
  }

  /** Emit lifecycle events based on animation `done` callback. */
  _onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'enter') {
      this._autoFocusFirstTabbableElement();
      this._afterEnter.next();
    }
    if (event.toState === 'void' || event.toState === 'exit') {
      this._returnFocusAfterDialog();
      this._afterExit.next();
    }
  }

  /** Starts the dialog exit animation. */
  _startExiting(): void {
    this._state = 'exit';

    // Mark the container for check so it can react if the
    // view container is using OnPush change detection.
    this._changeDetectorRef.markForCheck();
  }

  /** Saves a reference to the element that was focused before the dialog was opened. */
  private _savePreviouslyFocusedElement() {
    if (this._document) {
      this._elementFocusedBeforeDialogWasOpened = this._document.activeElement as HTMLElement;

      // Move focus onto the dialog immediately in order to prevent the user from accidentally
      // opening multiple dialogs at the same time. Needs to be async, because the element
      // may not be focusable immediately.
      Promise.resolve().then(() => this._elementRef.nativeElement.focus());
    }
  }

  /**
   * Autofocus the first tabbable element inside of the dialog, if there is not a tabbable element,
   * focus the dialog instead.
   */
  private _autoFocusFirstTabbableElement() {
    // If were to attempt to focus immediately, then the content of the dialog would not yet be
    // ready in instances where change detection has to run first. To deal with this, we simply
    // wait for the microtask queue to be empty.
    if (this._config.autoFocus) {
      this._focusTrap.focusInitialElementWhenReady().then(hasMovedFocus => {
        // If we didn't find any focusable elements inside the dialog, focus the
        // container so the user can't tab into other elements behind it.
        if (!hasMovedFocus) {
          this._elementRef.nativeElement.focus();
        }
      });
    }
  }

  /** Returns the focus to the element focused before the dialog was open. */
  private _returnFocusAfterDialog() {
    const toFocus = this._elementFocusedBeforeDialogWasOpened;
    // We need the extra check, because IE can set the `activeElement` to null in some cases.
    if (toFocus && typeof toFocus.focus === 'function') {
      toFocus.focus();
    }
  }
}
