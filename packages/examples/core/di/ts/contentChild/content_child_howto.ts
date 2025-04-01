/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// #docregion HowTo
import {AfterContentInit, ContentChild, Directive} from '@angular/core';

@Directive({
  selector: 'child-directive',
  standalone: false,
})
class ChildDirective {}

@Directive({
  selector: 'someDir',
  standalone: false,
})
class SomeDir implements AfterContentInit {
  @ContentChild(ChildDirective) contentChild!: ChildDirective;

  ngAfterContentInit() {
    // contentChild is set
  }
}
// #enddocregion
