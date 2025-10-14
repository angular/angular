/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {createTemplateRef} from '../linker/template_ref';
/**
 * Retrieves `TemplateRef` instance from `Injector` when a local reference is placed on the
 * `<ng-template>` element.
 *
 * @codeGenApi
 */
export function ɵɵtemplateRefExtractor(tNode, lView) {
  return createTemplateRef(tNode, lView);
}
//# sourceMappingURL=view_engine_compatibility_prebound.js.map
