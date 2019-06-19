/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation
} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'test-main',
  templateUrl: 'test-main-component.html',
  host: {
    '[class.hovering]': '_isHovering',
    '(mouseenter)': 'onMouseOver()',
    '(mouseout)': 'onMouseOut()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TestMainComponent {
  username: string;
  counter: number;
  asyncCounter: number;
  input: string;
  memo: string;
  testTools: string[];
  testMethods: string[];
  _isHovering: boolean;

  onMouseOver() {
    this._isHovering = true;
  }

  onMouseOut() {
    this._isHovering = false;
  }

  constructor(private _cdr: ChangeDetectorRef) {
    this.username = 'Yi';
    this.counter = 0;
    this.asyncCounter = 0;
    this.memo = '';
    this.testTools = ['Protractor', 'TestBed', 'Other'];
    this.testMethods = ['Unit Test', 'Integration Test', 'Performance Test', 'Mutation Test'];
    setTimeout(() => {
      this.asyncCounter = 5;
      this._cdr.markForCheck();
    }, 1000);
  }

  click() {
    this.counter++;
    setTimeout(() => {
      this.asyncCounter++;
      this._cdr.markForCheck();
    }, 500);
  }
}
