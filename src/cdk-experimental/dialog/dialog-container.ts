/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {FocusTrapFactory, InteractivityChecker} from '@angular/cdk/a11y';
import {_getFocusedElementPierceShadowDom} from '@angular/cdk/platform';
import {
  BasePortalOutlet,
  CdkPortalOutlet,
  ComponentPortal,
  DomPortal,
  TemplatePortal,
} from '@angular/cdk/portal';
import {DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  HostBinding,
  Inject,
  NgZone,
  OnDestroy,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {Subject} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {DialogConfig} from './dialog-config';


export function throwDialogContentAlreadyAttachedError() {
  throw Error('Attempting to attach dialog content after content is already attached');
}


/**
 * Internal component that wraps user-provided dialog content.
 * @docs-private
 */
@Component({
  selector: 'cdk-dialog-container',
  templateUrl: './dialog-container.html',
  styleUrls: ['dialog-container.css'],
  encapsulation: ViewEncapsulation.None,
  // Using OnPush for dialogs caused some G3 sync issues. Disabled until we can track them down.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  animations: [
    trigger('dialog', [
      state('enter', style({opacity: 1})),
      state('exit, void', style({opacity: 0})),
      transition('* => enter', animate('{{enterAnimationDuration}}')),
      transition('* => exit, * => void', animate('{{exitAnimationDuration}}')),
    ])
  ],
  host: {
    '[@dialog]': `{
      value: _state,
      params: {
        enterAnimationDuration: _config.enterAnimationDuration,
        exitAnimationDuration: _config.exitAnimationDuration
      }
    }`,
    '(@dialog.start)': '_onAnimationStart($event)',
    '(@dialog.done)': '_animationDone.next($event)',
  },
})
export class CdkDialogContainer extends BasePortalOutlet implements OnDestroy {
  private readonly _document: Document;

  /** State of the dialog animation. */
  _state: 'void' | 'enter' | 'exit' = 'enter';

  /** Element that was focused before the dialog was opened. Save this to restore upon close. */
  private _elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;

   /** The class that traps and manages focus within the dialog. */
  private _focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);

  // @HostBinding is used in the class as it is expected to be extended. Since @Component decorator
  // metadata is not inherited by child classes, instead the host binding data is defined in a way
  // that can be inherited.
  // tslint:disable:no-host-decorator-in-concrete no-private-getters
  @HostBinding('attr.aria-label') get _ariaLabel() { return this._config.ariaLabel || null; }

  @HostBinding('attr.aria-describedby')
  get _ariaDescribedBy() { return this._config.ariaDescribedBy; }

  @HostBinding('attr.role') get _role() { return this._config.role; }

  @HostBinding('attr.aria-modal') _ariaModal: boolean = true;

  @HostBinding('attr.tabindex') get _tabindex() { return -1; }
  // tslint:disable:no-host-decorator-in-concrete no-private-getters

  /** The portal host inside of this container into which the dialog content will be loaded. */
  @ViewChild(CdkPortalOutlet, {static: true}) _portalHost: CdkPortalOutlet;

  /** A subject emitting before the dialog enters the view. */
  readonly _beforeEnter = new Subject<void>();

  /** A subject emitting after the dialog enters the view. */
  readonly _afterEnter = new Subject<void>();

  /** A subject emitting before the dialog exits the view. */
  readonly _beforeExit = new Subject<void>();

  /** A subject emitting after the dialog exits the view. */
  readonly _afterExit = new Subject<void>();

  /** Stream of animation `done` events. */
  readonly _animationDone = new Subject<AnimationEvent>();

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _focusTrapFactory: FocusTrapFactory,
    private _changeDetectorRef: ChangeDetectorRef,
    private readonly _interactivityChecker: InteractivityChecker,
    private readonly _ngZone: NgZone,
    @Optional() @Inject(DOCUMENT) _document: any,
    /** The dialog configuration. */
    public _config: DialogConfig) {
    super();

    this._document = _document;

    // We use a Subject with a distinctUntilChanged, rather than a callback attached to .done,
    // because some browsers fire the done event twice and we don't want to emit duplicate events.
    // See: https://github.com/angular/angular/issues/24084
    this._animationDone.pipe(distinctUntilChanged((x, y) => {
      return x.fromState === y.fromState && x.toState === y.toState;
    })).subscribe(event => {
      // Emit lifecycle events based on animation `done` callback.
      if (event.toState === 'enter') {
        this._autoFocus();
        this._afterEnter.next();
        this._afterEnter.complete();
      }

      if (event.fromState === 'enter' && (event.toState === 'void' || event.toState === 'exit')) {
        this._returnFocusAfterDialog();
        this._afterExit.next();
        this._afterExit.complete();
      }
    });
  }

  /** Initializes the dialog container with the attached content. */
  _initializeWithAttachedContent() {
    // Save the previously focused element. This element will be re-focused
    // when the dialog closes.
    this._savePreviouslyFocusedElement();
    // Move focus onto the dialog immediately in order to prevent the user
    // from accidentally opening multiple dialogs at the same time.
    this._focusDialogContainer();
  }

  /** Destroy focus trap to place focus back to the element focused before the dialog opened. */
  ngOnDestroy() {
    this._focusTrap.destroy();
    this._animationDone.complete();
  }

  /**
   * Attach a ComponentPortal as content to this dialog container.
   * @param portal Portal to be attached as the dialog content.
   */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalHost.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throwDialogContentAlreadyAttachedError();
    }

    return this._portalHost.attachComponentPortal(portal);
  }

  /**
   * Attach a TemplatePortal as content to this dialog container.
   * @param portal Portal to be attached as the dialog content.
   */
  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    if (this._portalHost.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throwDialogContentAlreadyAttachedError();
    }

    return this._portalHost.attachTemplatePortal(portal);
  }

  /**
   * Attaches a DOM portal to the dialog container.
   * @param portal Portal to be attached.
   * @deprecated To be turned into a method.
   * @breaking-change 10.0.0
   */
  override attachDomPortal = (portal: DomPortal) => {
    if (this._portalHost.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throwDialogContentAlreadyAttachedError();
    }

    return this._portalHost.attachDomPortal(portal);
  }

  /** Emit lifecycle events based on animation `start` callback. */
  _onAnimationStart(event: AnimationEvent) {
    if (event.toState === 'enter') {
      this._beforeEnter.next();
      this._beforeEnter.complete();
    }
    if (event.fromState === 'enter' && (event.toState === 'void' || event.toState === 'exit')) {
      this._beforeExit.next();
      this._beforeExit.complete();
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
      this._elementFocusedBeforeDialogWasOpened = _getFocusedElementPierceShadowDom();
    }
  }

  /** Focuses the dialog container. */
  private _focusDialogContainer() {
    // Note that there is no focus method when rendering on the server.
    if (this._elementRef.nativeElement.focus) {
      this._elementRef.nativeElement.focus();
    }
  }

  /**
   * Focuses the provided element. If the element is not focusable, it will add a tabIndex
   * attribute to forcefully focus it. The attribute is removed after focus is moved.
   * @param element The element to focus.
   */
  private _forceFocus(element: HTMLElement, options?: FocusOptions) {
    if (!this._interactivityChecker.isFocusable(element)) {
      element.tabIndex = -1;
      // The tabindex attribute should be removed to avoid navigating to that element again
      this._ngZone.runOutsideAngular(() => {
        element.addEventListener('blur', () => element.removeAttribute('tabindex'));
        element.addEventListener('mousedown', () => element.removeAttribute('tabindex'));
      });
    }
    element.focus(options);
  }

  /**
   * Focuses the first element that matches the given selector within the focus trap.
   * @param selector The CSS selector for the element to set focus to.
   */
  private _focusByCssSelector(selector: string, options?: FocusOptions) {
    let elementToFocus =
      this._elementRef.nativeElement.querySelector(selector) as HTMLElement | null;
    if (elementToFocus) {
      this._forceFocus(elementToFocus, options);
    }
  }

  /**
   * Autofocus the element specified by the autoFocus field. When autoFocus is not 'dialog', if
   * for some reason the element cannot be focused, the dialog container will be focused.
   */
  private _autoFocus() {
    const element = this._elementRef.nativeElement;

    // If were to attempt to focus immediately, then the content of the dialog would not yet be
    // ready in instances where change detection has to run first. To deal with this, we simply
    // wait for the microtask queue to be empty when setting focus when autoFocus isn't set to
    // dialog. If the element inside the dialog can't be focused, then the container is focused
    // so the user can't tab into other elements behind it.
    switch (this._config.autoFocus) {
      case false:
      case 'dialog':
        const activeElement = _getFocusedElementPierceShadowDom();
        // Ensure that focus is on the dialog container. It's possible that a different
        // component tried to move focus while the open animation was running. See:
        // https://github.com/angular/components/issues/16215. Note that we only want to do this
        // if the focus isn't inside the dialog already, because it's possible that the consumer
        // turned off `autoFocus` in order to move focus themselves.
        if (activeElement !== element && !element.contains(activeElement)) {
          element.focus();
        }
        break;
      case true:
      case 'first-tabbable':
        this._focusTrap.focusInitialElementWhenReady()
          .then(hasMovedFocus => {
            if (!hasMovedFocus) {
              element.focus();
            }
          });
        break;
        case 'first-heading':
          this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
          break;
        default:
          this._focusByCssSelector(this._config.autoFocus!);
          break;
    }
  }

  /** Returns the focus to the element focused before the dialog was open. */
  private _returnFocusAfterDialog() {
    const toFocus = this._elementFocusedBeforeDialogWasOpened;
    // We need the extra check, because IE can set the `activeElement` to null in some cases.
    if (toFocus && typeof toFocus.focus === 'function') {
      const activeElement = _getFocusedElementPierceShadowDom();
      const element = this._elementRef.nativeElement;

      // Make sure that focus is still inside the dialog or is on the body (usually because a
      // non-focusable element like the backdrop was clicked) before moving it. It's possible that
      // the consumer moved it themselves before the animation was done, in which case we shouldn't
      // do anything.
      if (!activeElement || activeElement === this._document.body || activeElement === element ||
        element.contains(activeElement)) {
        toFocus.focus();
      }
    }
  }
}
