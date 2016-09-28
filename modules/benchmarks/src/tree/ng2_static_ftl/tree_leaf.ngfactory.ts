/**
 * This file is hand tweeked based on
 * the out put of the Angular 2 template compiler
 * and then hand tweeked to show possible future output.
 */
/* tslint:disable */

import * as import7 from '@angular/core/src/change_detection/change_detection';
import * as import5 from '@angular/core/src/di/injector';
import * as import9 from '@angular/core/src/linker/component_factory';
import * as import2 from '@angular/core/src/linker/element';
import * as import1 from '@angular/core/src/linker/view';
import * as import6 from '@angular/core/src/linker/view_type';
import * as import4 from '@angular/core/src/linker/view_utils';
import * as import8 from '@angular/core/src/metadata/view';
import * as import0 from '@angular/core/src/render/api';
import * as import10 from '@angular/core/src/security';

import * as import3 from './tree';

export class View_TreeLeafComponent {
  context: import3.TreeLeafComponent;
  _el_0: any;
  _text_1: any;
  /*private*/ _expr_0: any;
  /*private*/ _expr_1: any;
  /*private*/ _expr_2: any;
  constructor(parentRenderNode: any) {
    this.context = new import3.TreeLeafComponent();
    this._el_0 = document.createElement('span');
    parentRenderNode.appendChild(this._el_0);
    this._text_1 = document.createTextNode('');
    this._el_0.appendChild(this._text_1);
    this._expr_0 = import7.UNINITIALIZED;
    this._expr_1 = import7.UNINITIALIZED;
  }
  updateData(currVal_2: any) {
    if (import4.checkBinding(false, this._expr_2, currVal_2)) {
      this.context.data = currVal_2;
      this._expr_2 = currVal_2;
    }
  }
  destroyInternal() {}
  detectChangesInternal(throwOnChange: boolean): void {
    const currVal_0: any = ((this.context.data.depth % 2) ? '' : 'grey');
    if (import4.checkBinding(throwOnChange, this._expr_0, currVal_0)) {
      this._el_0.style.backgroundColor = currVal_0;
      this._expr_0 = currVal_0;
    }
    const currVal_1: any = import4.interpolate(1, ' ', this.context.data.value, ' ');
    if (import4.checkBinding(throwOnChange, this._expr_1, currVal_1)) {
      this._text_1.nodeValue = currVal_1;
      this._expr_1 = currVal_1;
    }
  }
}
