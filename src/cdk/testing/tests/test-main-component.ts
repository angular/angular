/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ENTER} from '@angular/cdk/keycodes';
import {_supportsShadowDom} from '@angular/cdk/platform';
import {FormControl} from '@angular/forms';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'test-main',
  templateUrl: 'test-main-component.html',
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
  isHovering = false;
  isPointerOver = false;
  specialKey = '';
  modifiers: string;
  singleSelect: string;
  singleSelectChangeEventCount = 0;
  multiSelect: string[] = [];
  multiSelectChangeEventCount = 0;
  basicEvent = 0;
  customEventData: string | null = null;
  _shadowDomSupported = _supportsShadowDom();
  clickResult = {x: -1, y: -1};
  rightClickResult = {x: -1, y: -1, button: -1};
  numberControl = new FormControl<number | null>(null);

  @ViewChild('clickTestElement') clickTestElement: ElementRef<HTMLElement>;
  @ViewChild('taskStateResult') taskStateResultElement: ElementRef<HTMLElement>;

  private _fakeOverlayElement: HTMLElement;

  constructor(private _cdr: ChangeDetectorRef, private _zone: NgZone) {
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
    this._fakeOverlayElement.remove();
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
    this._assignRelativeCoordinates(event, this.clickResult);

    this.modifiers = ['Shift', 'Alt', 'Control', 'Meta']
      .map(key => (event.getModifierState(key) ? key.toLowerCase() : ''))
      .join('-');
  }

  onRightClick(event: MouseEvent) {
    this.rightClickResult.button = event.button;
    this._assignRelativeCoordinates(event, this.rightClickResult);

    this.modifiers = ['Shift', 'Alt', 'Control', 'Meta']
      .map(key => (event.getModifierState(key) ? key.toLowerCase() : ''))
      .join('-');
  }

  onCustomEvent(event: any) {
    this.customEventData = JSON.stringify({message: event.message, value: event.value});
  }

  runTaskOutsideZone() {
    this._zone.runOutsideAngular(() =>
      setTimeout(() => {
        this.taskStateResultElement.nativeElement.textContent = 'result';
      }, 100),
    );
  }

  private _assignRelativeCoordinates(event: MouseEvent, obj: {x: number; y: number}) {
    obj.x = Math.round(event.offsetX);
    obj.y = Math.round(event.offsetY);
  }
}
