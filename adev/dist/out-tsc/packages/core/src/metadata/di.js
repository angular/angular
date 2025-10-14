/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {makePropDecorator} from '../util/decorators';
// Stores the default value of `emitDistinctChangesOnly` when the `emitDistinctChangesOnly` is not
// explicitly set.
export const emitDistinctChangesOnlyDefaultValue = true;
/**
 * Base class for query metadata.
 *
 * @see {@link ContentChildren}
 * @see {@link ContentChild}
 * @see {@link ViewChildren}
 * @see {@link ViewChild}
 *
 * @publicApi
 */
export class Query {}
/**
 * ContentChildren decorator and metadata.
 *
 *
 * @Annotation
 * @publicApi
 */
export const ContentChildren = makePropDecorator(
  'ContentChildren',
  (selector, opts = {}) => ({
    selector,
    first: false,
    isViewQuery: false,
    descendants: false,
    emitDistinctChangesOnly: emitDistinctChangesOnlyDefaultValue,
    ...opts,
  }),
  Query,
);
/**
 * ContentChild decorator and metadata.
 *
 *
 * @Annotation
 *
 * @publicApi
 */
export const ContentChild = makePropDecorator(
  'ContentChild',
  (selector, opts = {}) => ({
    selector,
    first: true,
    isViewQuery: false,
    descendants: true,
    ...opts,
  }),
  Query,
);
/**
 * ViewChildren decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const ViewChildren = makePropDecorator(
  'ViewChildren',
  (selector, opts = {}) => ({
    selector,
    first: false,
    isViewQuery: true,
    descendants: true,
    emitDistinctChangesOnly: emitDistinctChangesOnlyDefaultValue,
    ...opts,
  }),
  Query,
);
/**
 * ViewChild decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const ViewChild = makePropDecorator(
  'ViewChild',
  (selector, opts) => ({
    selector,
    first: true,
    isViewQuery: true,
    descendants: true,
    ...opts,
  }),
  Query,
);
//# sourceMappingURL=di.js.map
