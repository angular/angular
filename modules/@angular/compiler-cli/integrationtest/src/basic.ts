/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgFor, NgIf} from '@angular/common';
import {Component, Inject, LOCALE_ID, TRANSLATIONS_FORMAT} from '@angular/core';
import {FORM_DIRECTIVES} from '@angular/forms';

import {MultipleComponentsMyComp} from './a/multiple_components';

@Component({
  selector: 'basic',
  templateUrl: './basic.html',
  styles: ['.red { color: red }'],
  styleUrls: ['./basic.css'],
  directives: [MultipleComponentsMyComp, FORM_DIRECTIVES, NgIf, NgFor]
})
export class BasicComp {
  ctxProp: string;
  ctxBool: boolean;
  ctxArr: any[] = [];
  constructor(
      @Inject(LOCALE_ID) public localeId: string,
      @Inject(TRANSLATIONS_FORMAT) public translationsFormat: string) {
    this.ctxProp = 'initialValue';
  }
}
