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
import * as import12 from '@angular/core/src/security';

import {createAnchorAndAppend, createElementAndAppend, createTextAndAppend} from './ftl_util';
import * as import3 from './tree';
import * as import11 from './tree_leaf.ngfactory';

export class View_TreeTreeComponent {
  context: import3.TreeBranchComponent;
  ref: any;
  _el_0: any;
  _text_1: any;
  _el_2: any;
  _TreeComponent20_2_4View: any;
  _el_3: any;
  _TreeComponent20_3_4View: any;
  /*private*/ _expr_0: any;
  /*private*/ _expr_1: any;
  /*private*/ _expr_2: any;
  constructor(depth: number, parentRenderNode: any) {
    this.context = new import3.TreeBranchComponent();
    this._el_0 = createElementAndAppend(parentRenderNode, 'span');
    this._text_1 = createTextAndAppend(this._el_0);
    this._el_2 = createElementAndAppend(parentRenderNode, 'tree');
    this._TreeComponent20_2_4View = depth > 0 ? new View_TreeTreeComponent(depth - 1, this._el_2) :
                                                new import11.View_TreeLeafComponent(this._el_2);
    this._el_3 = createElementAndAppend(parentRenderNode, 'tree');
    this._TreeComponent20_3_4View = depth > 0 ? new View_TreeTreeComponent(depth - 1, this._el_3) :
                                                new import11.View_TreeLeafComponent(this._el_3);
    this._expr_0 = import7.UNINITIALIZED;
    this._expr_1 = import7.UNINITIALIZED;
    this._expr_2 = import7.UNINITIALIZED;
  }
  destroyInternal() {
    this._TreeComponent20_2_4View.destroyInternal();
    this._TreeComponent20_3_4View.destroyInternal();
  }
  updateData(currVal_2: any) {
    if (import4.checkBinding(false, this._expr_2, currVal_2)) {
      this.context.data = currVal_2;
      this._expr_2 = currVal_2;
    }
  }
  detectChangesInternal(throwOnChange: boolean): void {
    this._TreeComponent20_2_4View.updateData(this.context.data.right);
    this._TreeComponent20_3_4View.updateData(this.context.data.left);

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
    this._TreeComponent20_2_4View.detectChangesInternal(throwOnChange);
    this._TreeComponent20_3_4View.detectChangesInternal(throwOnChange);
  }
}
