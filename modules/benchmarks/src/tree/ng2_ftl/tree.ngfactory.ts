/**
 * This file is hand tweeked based on
 * the out put of the Angular 2 template compiler
 * and then hand tweeked to show possible future output.
 */
/* tslint:disable */

import * as import10 from '@angular/common/src/directives/ng_if';
import * as import7 from '@angular/core/src/change_detection/change_detection';
import * as import5 from '@angular/core/src/di/injector';
import * as import9 from '@angular/core/src/linker/component_factory';
import * as import2 from '@angular/core/src/linker/element';
import * as import11 from '@angular/core/src/linker/template_ref';
import * as import1 from '@angular/core/src/linker/view';
import * as import6 from '@angular/core/src/linker/view_type';
import * as import4 from '@angular/core/src/linker/view_utils';
import * as import8 from '@angular/core/src/metadata/view';
import * as import0 from '@angular/core/src/render/api';
import * as import12 from '@angular/core/src/security';

import {FtlEmbeddedView, FtlTemplateRef, FtlView, FtlViewContainerRef, createAnchorAndAppend, createElementAndAppend, createTextAndAppend} from './ftl_util';
import {NgIfWrapper} from './ng_if.ngfactory';
import * as import3 from './tree';


export class _View_TreeComponent0 implements FtlView<import3.TreeComponent> {
  context: import3.TreeComponent;
  _el_0: any;
  _text_1: any;
  _anchor_2: any;
  _vc_2: FtlViewContainerRef;
  _TemplateRef_2_5: any;
  _NgIf_2_6: NgIfWrapper;
  _anchor_3: any;
  _vc_3: FtlViewContainerRef;
  _TemplateRef_3_5: any;
  _NgIf_3_6: NgIfWrapper;
  _expr_0: any;
  _expr_1: any;
  _expr_2: any;
  constructor(parentRenderNode: any) {
    this.context = new import3.TreeComponent();
    this._el_0 = createElementAndAppend(parentRenderNode, 'span');
    this._text_1 = createTextAndAppend(this._el_0);
    this._anchor_2 = createAnchorAndAppend(parentRenderNode);
    this._TemplateRef_2_5 = new FtlTemplateRef(2, this);
    this._vc_2 = new FtlViewContainerRef(this._anchor_2);
    this._NgIf_2_6 = new NgIfWrapper(this._vc_2, this._TemplateRef_2_5);
    this._anchor_3 = createAnchorAndAppend(parentRenderNode);
    this._TemplateRef_3_5 = new FtlTemplateRef(3, this);
    this._vc_3 = new FtlViewContainerRef(this._anchor_3);
    this._NgIf_3_6 = new NgIfWrapper(this._vc_3, this._TemplateRef_3_5);
    this._expr_0 = import7.UNINITIALIZED;
    this._expr_1 = import7.UNINITIALIZED;
    this._expr_2 = import7.UNINITIALIZED;
  }
  detectChangesInternal(throwOnChange: boolean): void {
    this._NgIf_2_6.updateNgIf(throwOnChange, (this.context.data.right != (null as any)));
    this._NgIf_3_6.updateNgIf(throwOnChange, (this.context.data.left != (null as any)));
    this._vc_2.detectChangesInternal(throwOnChange);
    this._vc_3.detectChangesInternal(throwOnChange);
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
  destroyInternal() {
    this._vc_2.destroyInternal();
    this._vc_3.destroyInternal();
  }
  updateData(throwOnChange: boolean, currVal: any) {
    if (import4.checkBinding(throwOnChange, this._expr_2, currVal)) {
      this.context.data = currVal;
      this._expr_2 = currVal;
    }
  }
  createEmbeddedView(context: any, nodeIndex: number): any {
    switch (nodeIndex) {
      case 2:
        return new _View_TreeComponent1(this, context);
      case 3:
        return new _View_TreeComponent2(this, context);
      default:
        return null;
    }
  }
}

class _View_TreeComponent1 implements FtlEmbeddedView<any> {
  _node0: any;
  _TreeComponent_0_4: _View_TreeComponent0;
  prev: FtlEmbeddedView<any>;
  next: FtlEmbeddedView<any>;
  constructor(private parent: _View_TreeComponent0, public context: any) {
    this._node0 = document.createElement('tree');
    this._TreeComponent_0_4 = new _View_TreeComponent0(this._node0);
  }
  detectChangesInternal(throwOnChange: boolean): void {
    this._TreeComponent_0_4.updateData(throwOnChange, this.parent.context.data.right);
    this._TreeComponent_0_4.detectChangesInternal(throwOnChange);
  }
  visitRootNodes(cb: (...args: any[]) => void, ctx: any) { cb(this._node0, ctx); }
  destroyInternal() { this._TreeComponent_0_4.destroyInternal(); }
}

class _View_TreeComponent2 implements FtlEmbeddedView<any> {
  _node0: any;
  _TreeComponent_0_4: _View_TreeComponent0;
  prev: FtlEmbeddedView<any>;
  next: FtlEmbeddedView<any>;
  constructor(private parent: _View_TreeComponent0, public context: any) {
    this._node0 = document.createElement('tree');
    this._TreeComponent_0_4 = new _View_TreeComponent0(this._node0);
  }
  detectChangesInternal(throwOnChange: boolean): void {
    this._TreeComponent_0_4.updateData(throwOnChange, this.parent.context.data.left);
    this._TreeComponent_0_4.detectChangesInternal(throwOnChange);
  }
  visitRootNodes(cb: (...args: any[]) => void, ctx: any) { cb(this._node0, ctx); }
  destroyInternal() { this._TreeComponent_0_4.destroyInternal(); }
}
