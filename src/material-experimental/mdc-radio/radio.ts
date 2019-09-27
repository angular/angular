/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  Input,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {MDCRadioAdapter, MDCRadioFoundation} from '@material/radio';

// Increasing integer for generating unique ids for radio components.
let nextUniqueId = 0;

@Component({
  moduleId: module.id,
  selector: 'mat-radio-button',
  templateUrl: 'radio.html',
  styleUrls: ['radio.css'],
  host: {
    'class': 'mat-mdc-radio',
    '[attr.id]': 'id',
  },
  exportAs: 'matRadioButton',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatRadioButton implements AfterViewInit, OnDestroy {

  private _uniqueId: string = `mat-radio-${++nextUniqueId}`;

  private _radioAdapter: MDCRadioAdapter = {
    addClass: (className: string) => this._setClass(className, true),
    removeClass: (className: string) => this._setClass(className, false),
    setNativeControlDisabled: (disabled: boolean) => {
      this._disabled = disabled;
      this._changeDetectorRef.markForCheck();
    },
  };

  _radioFoundation = new MDCRadioFoundation(this._radioAdapter);
  _classes: {[key: string]: boolean} = {};

  /** The unique ID for the radio button. */
  @Input() id: string = this._uniqueId;

  /** Whether the radio button is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled: boolean) {
    this._radioFoundation.setDisabled(coerceBooleanProperty(disabled));
  }
  private _disabled = false;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {}

  /** ID of the native input element inside `<mat-radio-button>` */
  get inputId(): string { return `${this.id || this._uniqueId}-input`; }

  ngAfterViewInit() {
    this._radioFoundation.init();
  }

  ngOnDestroy() {
    this._radioFoundation.destroy();
  }

  private _setClass(cssClass: string, active: boolean) {
    this._classes = {...this._classes, [cssClass]: active};
    this._changeDetectorRef.markForCheck();
  }
}
