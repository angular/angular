/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {BreakpointObserver, Breakpoints, BreakpointState, LayoutModule} from '@angular/cdk/layout';
import {CommonModule} from '@angular/common';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {Observable} from 'rxjs';

@Component({
  selector: 'screen-type',
  templateUrl: 'screen-type-demo.html',
  styleUrls: ['screen-type-demo.css'],
  standalone: true,
  imports: [CommonModule, LayoutModule, MatGridListModule, MatIconModule],
})
export class ScreenTypeDemo {
  isHandset: Observable<BreakpointState>;
  isTablet: Observable<BreakpointState>;
  isWeb: Observable<BreakpointState>;
  isPortrait: Observable<BreakpointState>;
  isLandscape: Observable<BreakpointState>;

  constructor(breakpointObserver: BreakpointObserver) {
    this.isHandset = breakpointObserver.observe([
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait,
    ]);
    this.isTablet = breakpointObserver.observe(Breakpoints.Tablet);
    this.isWeb = breakpointObserver.observe([Breakpoints.WebLandscape, Breakpoints.WebPortrait]);
    this.isPortrait = breakpointObserver.observe('(orientation: portrait)');
    this.isLandscape = breakpointObserver.observe('(orientation: landscape)');
  }
}
