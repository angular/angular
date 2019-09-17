/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ENTER} from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
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

export class TestMainComponent implements OnDestroy {
  username: string;
  counter: number;
  asyncCounter: number;
  input: string;
  memo: string;
  testTools: string[];
  testMethods: string[];
  _isHovering: boolean;
  specialKey = '';
  relativeX = 0;
  relativeY = 0;

  @ViewChild('clickTestElement', {static: false}) clickTestElement: ElementRef<HTMLElement>;

  private _fakeOverlayElement: HTMLElement;

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

    this._fakeOverlayElement = document.createElement('div');
    this._fakeOverlayElement.classList.add('fake-overlay');
    this._fakeOverlayElement.innerText = 'This is a fake overlay.';
    document.body.appendChild(this._fakeOverlayElement);
  }

  ngOnDestroy() {
    document.body.removeChild(this._fakeOverlayElement);
  }

  click() {
    this.counter++;
    setTimeout(() => {
      this.asyncCounter++;
      this._cdr.markForCheck();
    }, 500);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === ENTER && event.key === 'Enter') {
      this.specialKey = 'enter';
    }
    if (event.key === 'j' && event.altKey) {
      this.specialKey = 'alt-j';
    }
  }

  onClick(event: MouseEvent) {
    const {top, left} = this.clickTestElement.nativeElement.getBoundingClientRect();
    this.relativeX = Math.round(event.clientX - left);
    this.relativeY = Math.round(event.clientY - top);
  }
}
