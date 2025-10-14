/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {makeDecorator} from '../util/decorators';
import {compileInjectable} from './jit/injectable';
export {compileInjectable};
/**
 * Injectable decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Injectable = makeDecorator(
  'Injectable',
  undefined,
  undefined,
  undefined,
  (type, meta) => compileInjectable(type, meta),
);
//# sourceMappingURL=injectable.js.map
