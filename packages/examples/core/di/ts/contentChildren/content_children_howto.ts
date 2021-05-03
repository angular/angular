/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docregion HowTo
import {AfterContentInit, ContentChildren, Directive, QueryList} from '@angular/core';

@Directive({selector: 'child-directive'})
class ChildDirective {
}

@Directive({selector: 'someDir'})
class SomeDir implements AfterContentInit {
  @ContentChildren(ChildDirective) contentChildren!: QueryList<ChildDirective>;

  ngAfterContentInit() {
    // contentChildren is set
  }
}
// #enddocregion
