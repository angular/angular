import {NgIf} from '@angular/common';
import {TemplateRef, ViewContainerRef} from '@angular/core';
import * as import7 from '@angular/core/src/change_detection/change_detection';
import * as import4 from '@angular/core/src/linker/view_utils';

export class NgIfWrapper {
  directive: NgIf;
  _expr_0: any;
  constructor(viewContainerRef: ViewContainerRef, templateRef: TemplateRef<any>) {
    this.directive = new NgIf(viewContainerRef, templateRef);
    this._expr_0 = import7.UNINITIALIZED;
  }

  updateNgIf(throwOnChange: boolean, currVal: any) {
    if (import4.checkBinding(throwOnChange, this._expr_0, currVal)) {
      this.directive.ngIf = currVal;
      this._expr_0 = currVal;
    }
  }
}
