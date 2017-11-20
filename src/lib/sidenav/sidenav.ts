/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, ContentChild,
  ContentChildren, forwardRef, Inject, Input,
  ViewEncapsulation
} from '@angular/core';
import {MatDrawer, MatDrawerContainer, MatDrawerContent} from './drawer';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';


@Component({
  moduleId: module.id,
  selector: 'mat-sidenav-content',
  template: '<ng-content></ng-content>',
  host: {
    'class': 'mat-drawer-content mat-sidenav-content',
    '[style.margin-left.px]': '_margins.left',
    '[style.margin-right.px]': '_margins.right',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatSidenavContent extends MatDrawerContent {
  constructor(
      changeDetectorRef: ChangeDetectorRef,
      @Inject(forwardRef(() => MatSidenavContainer)) container: MatSidenavContainer) {
    super(changeDetectorRef, container);
  }
}


@Component({
  moduleId: module.id,
  selector: 'mat-sidenav',
  exportAs: 'matSidenav',
  template: '<ng-content></ng-content>',
  animations: [
    trigger('transform', [
      state('open, open-instant', style({
        transform: 'translate3d(0, 0, 0)',
        visibility: 'visible',
      })),
      state('void', style({
        visibility: 'hidden',
      })),
      transition('void => open-instant', animate('0ms')),
      transition('void <=> open, open-instant => void',
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
    ])
  ],
  host: {
    'class': 'mat-drawer mat-sidenav',
    'tabIndex': '-1',
    '[@transform]': '_animationState',
    '(@transform.start)': '_onAnimationStart($event)',
    '(@transform.done)': '_onAnimationEnd($event)',
    '(keydown)': 'handleKeydown($event)',
    // must prevent the browser from aligning text based on value
    '[attr.align]': 'null',
    '[class.mat-drawer-end]': 'position === "end"',
    '[class.mat-drawer-over]': 'mode === "over"',
    '[class.mat-drawer-push]': 'mode === "push"',
    '[class.mat-drawer-side]': 'mode === "side"',
    '[class.mat-sidenav-fixed]': 'fixedInViewport',
    '[style.top.px]': 'fixedInViewport ? fixedTopGap : null',
    '[style.bottom.px]': 'fixedInViewport ? fixedBottomGap : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatSidenav extends MatDrawer {
  /** Whether the sidenav is fixed in the viewport. */
  @Input()
  get fixedInViewport(): boolean { return this._fixedInViewport; }
  set fixedInViewport(value) { this._fixedInViewport = coerceBooleanProperty(value); }
  private _fixedInViewport = false;

  /**
   * The gap between the top of the sidenav and the top of the viewport when the sidenav is in fixed
   * mode.
   */
  @Input()
  get fixedTopGap(): number { return this._fixedTopGap; }
  set fixedTopGap(value) { this._fixedTopGap = coerceNumberProperty(value); }
  private _fixedTopGap = 0;

  /**
   * The gap between the bottom of the sidenav and the bottom of the viewport when the sidenav is in
   * fixed mode.
   */
  @Input()
  get fixedBottomGap(): number { return this._fixedBottomGap; }
  set fixedBottomGap(value) { this._fixedBottomGap = coerceNumberProperty(value); }
  private _fixedBottomGap = 0;
}


@Component({
  moduleId: module.id,
  selector: 'mat-sidenav-container',
  exportAs: 'matSidenavContainer',
  templateUrl: 'sidenav-container.html',
  styleUrls: ['drawer.css'],
  host: {
    'class': 'mat-drawer-container mat-sidenav-container',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatSidenavContainer extends MatDrawerContainer {
  @ContentChildren(MatSidenav) _drawers;

  @ContentChild(MatSidenavContent) _content;
}
