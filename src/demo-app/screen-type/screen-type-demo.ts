import {Component, ViewEncapsulation} from '@angular/core';
import {BreakpointObserver, BreakpointState, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs/Observable';

@Component({
  moduleId: module.id,
  selector: 'screen-type',
  templateUrl: 'screen-type-demo.html',
  styleUrls: ['screen-type-demo.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ScreenTypeDemo {
  isHandset: Observable<BreakpointState>;
  isTablet: Observable<BreakpointState>;
  isWeb: Observable<BreakpointState>;
  isPortrait: Observable<BreakpointState>;
  isLandscape: Observable<BreakpointState>;

  constructor(private mqm: BreakpointObserver) {
    this.isHandset = this.mqm.observe([Breakpoints.HandsetLandscape,
                                       Breakpoints.HandsetPortrait]);
    this.isTablet = this.mqm.observe(Breakpoints.Tablet);
    this.isWeb = this.mqm.observe([Breakpoints.WebLandscape, Breakpoints.WebPortrait]);
    this.isPortrait = this.mqm.observe('(orientation: portrait)');
    this.isLandscape = this.mqm.observe('(orientation: landscape)');
  }
}
