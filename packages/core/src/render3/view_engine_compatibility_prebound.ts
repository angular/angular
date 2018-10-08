/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {ElementRef as ViewEngine_ElementRef} from '../linker/element_ref';
import {TemplateRef as ViewEngine_TemplateRef} from '../linker/template_ref';

import {TNode} from './interfaces/node';
import {LViewData} from './interfaces/view';
import {createTemplateRef} from './view_engine_compatibility';



/**
 * Retrieves `TemplateRef` instance from `Injector` when a local reference is placed on the
 * `<ng-template>` element.
 */
export function templateRefExtractor(tNode: TNode, currentView: LViewData) {
  return createTemplateRef(ViewEngine_TemplateRef, ViewEngine_ElementRef, tNode, currentView);
}
