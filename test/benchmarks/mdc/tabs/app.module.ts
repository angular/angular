/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material-experimental/mdc-tabs';
import {threeTabs, tenTabs, twentyTabs} from './fake-tab-data';

/** component: mdc-tab */

@Component({
  selector: 'app-root',
  template: `
    <button id="show-three-tabs" (click)="showThreeTabs()">Show Three Tabs</button>
    <button id="show-ten-tabs" (click)="showTenTabs()">Show Ten Tabs</button>
    <button id="show-twenty-tabs" (click)="showTwentyTabs()">Show Twenty Tabs</button>
    <button id="hide" (click)="hide()">Hide</button>

    <mat-tab-group *ngIf="areThreeTabsVisible">${threeTabs}</mat-tab-group>
    <mat-tab-group *ngIf="areTenTabsVisible">${tenTabs}</mat-tab-group>
    <mat-tab-group *ngIf="areTwentyTabsVisible">${twentyTabs}</mat-tab-group>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class TabsBenchmarkApp {
  areThreeTabsVisible = false;
  areTenTabsVisible = false;
  areTwentyTabsVisible = false;

  showThreeTabs() {
    this.areThreeTabsVisible = true;
  }
  showTenTabs() {
    this.areTenTabsVisible = true;
  }
  showTwentyTabs() {
    this.areTwentyTabsVisible = true;
  }

  hide() {
    this.areThreeTabsVisible = false;
    this.areTenTabsVisible = false;
    this.areTwentyTabsVisible = false;
  }
}

@NgModule({
  declarations: [TabsBenchmarkApp],
  imports: [BrowserModule, BrowserAnimationsModule, MatTabsModule],
  bootstrap: [TabsBenchmarkApp],
})
export class AppModule {}
