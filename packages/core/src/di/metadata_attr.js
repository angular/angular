/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵɵinjectAttribute} from '../render3/instructions/di_attr';
import {makeParamDecorator} from '../util/decorators';
/**
 * Attribute decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Attribute = makeParamDecorator('Attribute', (attributeName) => ({
  attributeName,
  __NG_ELEMENT_ID__: () => ɵɵinjectAttribute(attributeName),
}));
//# sourceMappingURL=metadata_attr.js.map
