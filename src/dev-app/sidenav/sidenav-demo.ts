/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'sidenav-demo',
  templateUrl: 'sidenav-demo.html',
  styleUrls: ['sidenav-demo.css'],

})
export class SidenavDemo {
  isLaunched = false;
  fillerContent = Array(30);
  fixed = false;
  coverHeader = false;
  showHeader = false;
  showFooter = false;
  modeIndex = 0;
  hasBackdrop: boolean;
  get mode() { return ['side', 'over', 'push'][this.modeIndex]; }
  get fixedTop() { return this.fixed && this.showHeader && !this.coverHeader ? 64 : 0; }
  get fixedBottom() { return this.fixed && this.showFooter && !this.coverHeader ? 64 : 0; }
}
