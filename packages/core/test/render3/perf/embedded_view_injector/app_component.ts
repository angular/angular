/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {RenderFlags, ɵɵadvance, ɵɵdefineComponent, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵproperty, ɵɵreference, ɵɵtemplate, ɵɵtemplateRefExtractor} from '@angular/core/src/render3';

import {createInnerComponent} from './inner_component';
import {createRenderTemplateDirective} from './render_template_directive';

/**
 * Creates the root component of the benchmark. The goal is to add a few more layers of elements
 * between the root and the `ng-template` that renders out the `inner-comp`.
 * The template corresponds to:
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
 *                       <inner-comp></inner-comp>
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
export function createAppComponent(injector: Injector|undefined) {
  const RenderTemplate = createRenderTemplateDirective(injector);
  const InnerComp = createInnerComponent(RenderTemplate);

  function App_ng_template_6_Template(rf: RenderFlags, ctx: any) {
    if (rf & 1) {
      ɵɵelementStart(0, 'div')(1, 'div')(2, 'div')(3, 'div')(4, 'div');
      ɵɵelement(5, 'inner-comp');
      ɵɵelementEnd()()()()();
    }
  }

  return class App {
    static ɵfac() {
      return new App();
    }

    static ɵcmp = ɵɵdefineComponent({
                    type: App,
                    selectors: [['app']],
                    decls: 8,
                    vars: 1,
                    consts: [[3, 'renderTemplate'], ['template', '']],
                    template:
                        function App_Template(rf, ctx) {
                          if (rf & 1) {
                            ɵɵelementStart(0, 'div')(1, 'div')(2, 'div')(3, 'div');
                            ɵɵelement(4, 'div', 0);
                            ɵɵelementStart(5, 'div');
                            ɵɵtemplate(
                                6, App_ng_template_6_Template, 6, 0, 'ng-template', null, 1,
                                ɵɵtemplateRefExtractor);
                            ɵɵelementEnd()()()()();
                          }
                          if (rf & 2) {
                            const _r0 = ɵɵreference(7);
                            ɵɵadvance(4);
                            ɵɵproperty('renderTemplate', _r0);
                          }
                        },
                    dependencies: [RenderTemplate, InnerComp],
                    encapsulation: 2
                  }) as never;
  };
}
