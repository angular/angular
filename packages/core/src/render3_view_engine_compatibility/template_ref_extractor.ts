/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {ElementRef as ViewEngine_ElementRef} from '../ref/element_ref';
import {TemplateRef as ViewEngine_TemplateRef} from '../ref/template_ref';
import {createTemplateRef} from '../ref/view_engine_compatibility';
import {TNode} from '../render3/interfaces/node';
import {LView} from '../render3/interfaces/view';



/**
 * Retrieves `TemplateRef` instance from `Injector` when a local reference is placed on the
 * `<ng-template>` element.
 */
export function templateRefExtractor(tNode: TNode, currentView: LView) {
  return createTemplateRef(ViewEngine_TemplateRef, ViewEngine_ElementRef, tNode, currentView);
}
