/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {injectTemplateRef} from '@angular/core/src/linker/template_ref';
import {injectViewContainerRef} from '@angular/core/src/linker/view_container_ref';
import {TemplateRef, ViewContainerRef} from '../../../../src/linker';
import {ɵɵdefineDirective, ɵɵdirectiveInject, ɵɵtemplate} from '../../../../src/render3/index';
import {createLView, createTNode, createTView} from '../../../../src/render3/instructions/shared';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TNodeType} from '../../../../src/render3/interfaces/node';
import {LViewFlags, TViewType} from '../../../../src/render3/interfaces/view';
import {createBenchmark} from '../micro_bench';
import {createAndRenderLView} from '../setup';



class TemplateRefToken {
  /**
   * @internal
   * @nocollapse
   */
  static __NG_ELEMENT_ID__(): TemplateRef<any>|null {
    return injectTemplateRef();
  }
}
class ViewContainerRefToken {
  /**
   * @internal
   * @nocollapse
   */
  static __NG_ELEMENT_ID__(): ViewContainerRef {
    return injectViewContainerRef();
  }
}

class NgIfLike {
  static ɵfac() {
    return new NgIfLike(
        ɵɵdirectiveInject(TemplateRefToken), ɵɵdirectiveInject(ViewContainerRefToken));
  }
  static ɵdir = ɵɵdefineDirective({
    type: NgIfLike,
    selectors: [['', 'viewManipulation', '']],
  });

  constructor(private tplRef: TemplateRefToken, private vcRef: ViewContainerRefToken) {}
}

`
<ng-template viewManipulation></ng-template>
<ng-template viewManipulation></ng-template>
`;
function testTemplate(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵtemplate(0, null, 0, 0, 'ng-template', 0);
    ɵɵtemplate(1, null, 0, 0, 'ng-template', 0);
  }
}

const rootLView = createLView(
    null, createTView(TViewType.Root, null, null, 0, 0, null, null, null, null, null), {},
    LViewFlags.IsRoot, null, null, null, null, null, null);

const viewTNode = createTNode(null!, null, TNodeType.Element, -1, null, null);
const embeddedTView = createTView(
    TViewType.Root, null, testTemplate, 2, 0, [NgIfLike.ɵdir], null, null, null,
    [['viewManipulation', '']]);

// create view once so we don't profile first template pass
createAndRenderLView(rootLView, embeddedTView, viewTNode);

// scenario to benchmark
const elementTextCreate = createBenchmark('ng_template');
const createTime = elementTextCreate('create');

console.profile('ng_template_create');
while (createTime()) {
  createAndRenderLView(rootLView, embeddedTView, viewTNode);
}
console.profileEnd();

// report results
elementTextCreate.report();
