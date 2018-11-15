/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {Component} from '@angular/core';
import {Observable} from 'rxjs';


@Component({
  moduleId: module.id,
  selector: 'screen-type',
  templateUrl: 'screen-type-demo.html',
  styleUrls: ['screen-type-demo.css'],
})
export class ScreenTypeDemo {
  isHandset: Observable<BreakpointState>;
  isTablet: Observable<BreakpointState>;
  isWeb: Observable<BreakpointState>;
  isPortrait: Observable<BreakpointState>;
  isLandscape: Observable<BreakpointState>;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.isHandset = this.breakpointObserver.observe([Breakpoints.HandsetLandscape,
                                       Breakpoints.HandsetPortrait]);
    this.isTablet = this.breakpointObserver.observe(Breakpoints.Tablet);
    this.isWeb = this.breakpointObserver.observe([Breakpoints.WebLandscape,
                                  Breakpoints.WebPortrait]);
    this.isPortrait = this.breakpointObserver.observe('(orientation: portrait)');
    this.isLandscape = this.breakpointObserver.observe('(orientation: landscape)');
  }
}
