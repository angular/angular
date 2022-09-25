/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEvent} from '@angular/animations';
import {CdkDialogContainer, DialogConfig} from '@angular/cdk/dialog';
import {FocusMonitor, FocusTrapFactory, InteractivityChecker} from '@angular/cdk/a11y';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {OverlayRef} from '@angular/cdk/overlay';
import {_getFocusedElementPierceShadowDom} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  NgZone,
  OnDestroy,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {matBottomSheetAnimations} from './bottom-sheet-animations';

/**
 * Internal component that wraps user-provided bottom sheet content.
 * @docs-private
 */
@Component({
  selector: 'mat-bottom-sheet-container',
  templateUrl: 'bottom-sheet-container.html',
  styleUrls: ['bottom-sheet-container.css'],
  // In Ivy embedded views will be change detected from their declaration place, rather than where
  // they were stamped out. This means that we can't have the bottom sheet container be OnPush,
  // because it might cause the sheets that were opened from a template not to be out of date.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  animations: [matBottomSheetAnimations.bottomSheetState],
  host: {
    'class': 'mat-bottom-sheet-container',
    'tabindex': '-1',
    '[attr.role]': '_config.role',
    '[attr.aria-modal]': '_config.ariaModal',
    '[attr.aria-label]': '_config.ariaLabel',
    '[@state]': '_animationState',
    '(@state.start)': '_onAnimationStart($event)',
    '(@state.done)': '_onAnimationDone($event)',
  },
})
export class MatBottomSheetContainer extends CdkDialogContainer implements OnDestroy {
  private _breakpointSubscription: Subscription;

  /** The state of the bottom sheet animations. */
  _animationState: 'void' | 'visible' | 'hidden' = 'void';

  /** Emits whenever the state of the animation changes. */
  _animationStateChanged = new EventEmitter<AnimationEvent>();

  /** Whether the component has been destroyed. */
  private _destroyed: boolean;

  constructor(
    elementRef: ElementRef,
    focusTrapFactory: FocusTrapFactory,
    @Optional() @Inject(DOCUMENT) document: any,
    config: DialogConfig,
    checker: InteractivityChecker,
    ngZone: NgZone,
    overlayRef: OverlayRef,
    breakpointObserver: BreakpointObserver,
    private _changeDetectorRef: ChangeDetectorRef,
    focusMonitor?: FocusMonitor,
  ) {
    super(
      elementRef,
      focusTrapFactory,
      document,
      config,
      checker,
      ngZone,
      overlayRef,
      focusMonitor,
    );

    this._breakpointSubscription = breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe(() => {
        this._toggleClass(
          'mat-bottom-sheet-container-medium',
          breakpointObserver.isMatched(Breakpoints.Medium),
        );
        this._toggleClass(
          'mat-bottom-sheet-container-large',
          breakpointObserver.isMatched(Breakpoints.Large),
        );
        this._toggleClass(
          'mat-bottom-sheet-container-xlarge',
          breakpointObserver.isMatched(Breakpoints.XLarge),
        );
      });
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

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._breakpointSubscription.unsubscribe();
    this._destroyed = true;
  }

  _onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'visible') {
      this._trapFocus();
    }

    this._animationStateChanged.emit(event);
  }

  _onAnimationStart(event: AnimationEvent) {
    this._animationStateChanged.emit(event);
  }

  protected override _captureInitialFocus(): void {}

  private _toggleClass(cssClass: string, add: boolean) {
    this._elementRef.nativeElement.classList.toggle(cssClass, add);
  }
}
