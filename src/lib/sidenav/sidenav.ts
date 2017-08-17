/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ViewEncapsulation
} from '@angular/core';
import {MdDrawer, MdDrawerContainer} from './drawer';
import {animate, state, style, transition, trigger} from '@angular/animations';


@Component({
  moduleId: module.id,
  selector: 'md-sidenav, mat-sidenav',
  templateUrl: 'drawer.html',
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
    '[@transform]': '_animationState',
    '(@transform.start)': '_onAnimationStart()',
    '(@transform.done)': '_onAnimationEnd($event)',
    '(keydown)': 'handleKeydown($event)',
    // must prevent the browser from aligning text based on value
    '[attr.align]': 'null',
    '[class.mat-drawer-end]': 'position === "end"',
    '[class.mat-drawer-over]': 'mode === "over"',
    '[class.mat-drawer-push]': 'mode === "push"',
    '[class.mat-drawer-side]': 'mode === "side"',
    'tabIndex': '-1',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MdSidenav extends MdDrawer {}


@Component({
  moduleId: module.id,
  selector: 'md-sidenav-container, mat-sidenav-container',
  templateUrl: 'drawer-container.html',
  styleUrls: [
    'drawer.css',
    'drawer-transitions.css',
  ],
  host: {
    'class': 'mat-drawer-container mat-sidenav-container',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MdSidenavContainer extends MdDrawerContainer {
  @ContentChildren(MdSidenav) _drawers;
}
