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
  OnDestroy,
  ElementRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
  EventEmitter,
  Inject,
  Optional,
} from '@angular/core';
import {AnimationEvent} from '@angular/animations';
import {
  BasePortalOutlet,
  ComponentPortal,
  TemplatePortal,
  CdkPortalOutlet,
} from '@angular/cdk/portal';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {MatBottomSheetConfig} from './bottom-sheet-config';
import {matBottomSheetAnimations} from './bottom-sheet-animations';
import {Subscription} from 'rxjs';
import {DOCUMENT} from '@angular/common';
import {FocusTrap, FocusTrapFactory} from '@angular/cdk/a11y';

// TODO(crisbeto): consolidate some logic between this, MatDialog and MatSnackBar

/**
 * Internal component that wraps user-provided bottom sheet content.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'mat-bottom-sheet-container',
  templateUrl: 'bottom-sheet-container.html',
  styleUrls: ['bottom-sheet-container.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [matBottomSheetAnimations.bottomSheetState],
  host: {
    'class': 'mat-bottom-sheet-container',
    'tabindex': '-1',
    'role': 'dialog',
    'aria-modal': 'true',
    '[attr.aria-label]': 'bottomSheetConfig?.ariaLabel',
    '[@state]': '_animationState',
    '(@state.start)': '_onAnimationStart($event)',
    '(@state.done)': '_onAnimationDone($event)'
  },
})
export class MatBottomSheetContainer extends BasePortalOutlet implements OnDestroy {
  private _breakpointSubscription: Subscription;

  /** The portal outlet inside of this container into which the content will be loaded. */
  @ViewChild(CdkPortalOutlet, {static: true}) _portalOutlet: CdkPortalOutlet;

  /** The state of the bottom sheet animations. */
  _animationState: 'void' | 'visible' | 'hidden' = 'void';

  /** Emits whenever the state of the animation changes. */
  _animationStateChanged = new EventEmitter<AnimationEvent>();

  /** The class that traps and manages focus within the bottom sheet. */
  private _focusTrap: FocusTrap;

  /** Element that was focused before the bottom sheet was opened. */
  private _elementFocusedBeforeOpened: HTMLElement | null = null;

  /** Server-side rendering-compatible reference to the global document object. */
  private _document: Document;

  /** Whether the component has been destroyed. */
  private _destroyed: boolean;

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _focusTrapFactory: FocusTrapFactory,
    breakpointObserver: BreakpointObserver,
    @Optional() @Inject(DOCUMENT) document: any,
    /** The bottom sheet configuration. */
    public bottomSheetConfig: MatBottomSheetConfig) {
    super();

    this._document = document;
    this._breakpointSubscription = breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe(() => {
        this._toggleClass('mat-bottom-sheet-container-medium',
            breakpointObserver.isMatched(Breakpoints.Medium));
        this._toggleClass('mat-bottom-sheet-container-large',
            breakpointObserver.isMatched(Breakpoints.Large));
        this._toggleClass('mat-bottom-sheet-container-xlarge',
            breakpointObserver.isMatched(Breakpoints.XLarge));
      });
  }

  /** Attach a component portal as content to this bottom sheet container. */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    this._validatePortalAttached();
    this._setPanelClass();
    this._savePreviouslyFocusedElement();
    return this._portalOutlet.attachComponentPortal(portal);
  }

  /** Attach a template portal as content to this bottom sheet container. */
  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    this._validatePortalAttached();
    this._setPanelClass();
    this._savePreviouslyFocusedElement();
    return this._portalOutlet.attachTemplatePortal(portal);
  }

  /** Begin animation of bottom sheet entrance into view. */
  enter(): void {
    if (!this._destroyed) {
      this._animationState = 'visible';
      this._changeDetectorRef.detectChanges();
    }
  }

  /** Begin animation of the bottom sheet exiting from view. */
  exit(): void {
    if (!this._destroyed) {
      this._animationState = 'hidden';
      this._changeDetectorRef.markForCheck();
    }
  }

  ngOnDestroy() {
    this._breakpointSubscription.unsubscribe();
    this._destroyed = true;
  }

  _onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'hidden') {
      this._restoreFocus();
    } else if (event.toState === 'visible') {
      this._trapFocus();
    }

    this._animationStateChanged.emit(event);
  }

  _onAnimationStart(event: AnimationEvent) {
    this._animationStateChanged.emit(event);
  }

  private _toggleClass(cssClass: string, add: boolean) {
    const classList = this._elementRef.nativeElement.classList;
    add ? classList.add(cssClass) : classList.remove(cssClass);
  }

  private _validatePortalAttached() {
    if (this._portalOutlet.hasAttached()) {
      throw Error('Attempting to attach bottom sheet content after content is already attached');
    }
  }

  private _setPanelClass() {
    const element: HTMLElement = this._elementRef.nativeElement;
    const panelClass = this.bottomSheetConfig.panelClass;

    if (Array.isArray(panelClass)) {
      // Note that we can't use a spread here, because IE doesn't support multiple arguments.
      panelClass.forEach(cssClass => element.classList.add(cssClass));
    } else if (panelClass) {
      element.classList.add(panelClass);
    }
  }


  /** Moves the focus inside the focus trap. */
  private _trapFocus() {
    if (!this._focusTrap) {
      this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
    }

    if (this.bottomSheetConfig.autoFocus) {
      this._focusTrap.focusInitialElementWhenReady();
    }
  }

  /** Restores focus to the element that was focused before the bottom sheet was opened. */
  private _restoreFocus() {
    const toFocus = this._elementFocusedBeforeOpened;

    // We need the extra check, because IE can set the `activeElement` to null in some cases.
    if (this.bottomSheetConfig.restoreFocus && toFocus && typeof toFocus.focus === 'function') {
      toFocus.focus();
    }

    if (this._focusTrap) {
      this._focusTrap.destroy();
    }
  }

  /** Saves a reference to the element that was focused before the bottom sheet was opened. */
  private _savePreviouslyFocusedElement() {
    this._elementFocusedBeforeOpened = this._document.activeElement as HTMLElement;

    // The `focus` method isn't available during server-side rendering.
    if (this._elementRef.nativeElement.focus) {
      Promise.resolve().then(() => this._elementRef.nativeElement.focus());
    }
  }
}
