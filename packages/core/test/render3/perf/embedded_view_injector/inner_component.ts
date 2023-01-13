/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type, ɵɵadvance, ɵɵdefineComponent, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵproperty, ɵɵreference, ɵɵtemplate, ɵɵtemplateRefExtractor} from '@angular/core';
import {RenderFlags} from '@angular/core/src/render3';

import {InjectorComp} from './injector_component';

/**
 * Creates a component that will be rendered inside the main app that adds a few layers of elements
 * between the root and where the template with the injector component will be rendered.
 * Template corresponds to:
 *
 *
 * <div>
 *   <div>
 *     <div>
 *       <div>
 *         <div [renderTemplate]="template"></div>
 *         <div>
 *           <ng-template #template>
 *             <div>
 *               <div>
 *                 <div>
 *                   <div>
 *                     <div>
 *                       <injector-comp></injector-comp>
 *                     </div>
 *                   </div>
 *                 </div>
 *               </div>
 *             </div>
 *           </ng-template>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 */
export function createInnerComponent(renderTemplateDirective: Type<{}>) {
  function InnerComp_ng_template_6_Template(rf: RenderFlags, ctx: any) {
    if (rf & 1) {
      ɵɵelementStart(0, 'div')(1, 'div')(2, 'div')(3, 'div')(4, 'div');
      ɵɵelement(5, 'injector-comp');
      ɵɵelementEnd()()()()();
    }
  }

  return class InnerComp {
    static ɵfac() {
      return new InnerComp();
    }

    static ɵcmp = ɵɵdefineComponent({
      type: InnerComp,
      selectors: [['inner-comp']],
      decls: 8,
      vars: 1,
      consts: [[3, 'renderTemplate'], ['template', '']],
      template:
          function InnerComp_Template(rf, ctx: any) {
            if (rf & 1) {
              ɵɵelementStart(0, 'div')(1, 'div')(2, 'div')(3, 'div');
              ɵɵelement(4, 'div', 0);
              ɵɵelementStart(5, 'div');
              ɵɵtemplate(
                  6, InnerComp_ng_template_6_Template, 6, 0, 'ng-template', null, 1,
                  ɵɵtemplateRefExtractor);
              ɵɵelementEnd()()()()();
            }
            if (rf & 2) {
              const _r0 = ɵɵreference(7);
              ɵɵadvance(4);
              ɵɵproperty('renderTemplate', _r0);
            }
          },
      dependencies: [renderTemplateDirective, InjectorComp],
      encapsulation: 2
    });
  };
}
