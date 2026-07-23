/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createTemplateRef, TemplateRef} from '../linker/template_ref';
import {TNode} from './interfaces/node';
import {LView} from './interfaces/view';

/**
 * Retrieves `TemplateRef` instance from `Injector` when a local reference is placed on the
 * `<ng-template>` element.
 *
 * @codeGenApi
 */
export function ɵɵtemplateRefExtractor(tNode: TNode, lView: LView): TemplateRef<any> | null {
  return createTemplateRef(tNode, lView);
}
