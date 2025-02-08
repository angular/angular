/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// #docregion HowTo
import {AfterViewInit, Component, Directive, ViewChild} from '@angular/core';

@Directive({
  selector: 'child-directive',
  standalone: false,
})
class ChildDirective {}

@Component({
  selector: 'someCmp',
  templateUrl: 'someCmp.html',
  standalone: false,
})
class SomeCmp implements AfterViewInit {
  @ViewChild(ChildDirective) child!: ChildDirective;

  ngAfterViewInit() {
    // child is set
  }
}
// #enddocregion
