/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {makeParamDecorator} from '../util/decorators';
import {attachInjectFlag} from './injector_compatibility';
/**
 * Inject decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Inject = attachInjectFlag(
  // Disable tslint because `DecoratorFlags` is a const enum which gets inlined.
  makeParamDecorator('Inject', (token) => ({token})),
  -1 /* DecoratorFlags.Inject */,
);
/**
 * Optional decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Optional =
  // Disable tslint because `InternalInjectFlags` is a const enum which gets inlined.
  // tslint:disable-next-line: no-toplevel-property-access
  attachInjectFlag(makeParamDecorator('Optional'), 8 /* InternalInjectFlags.Optional */);
/**
 * Self decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Self =
  // Disable tslint because `InternalInjectFlags` is a const enum which gets inlined.
  // tslint:disable-next-line: no-toplevel-property-access
  attachInjectFlag(makeParamDecorator('Self'), 2 /* InternalInjectFlags.Self */);
/**
 * `SkipSelf` decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const SkipSelf =
  // Disable tslint because `InternalInjectFlags` is a const enum which gets inlined.
  // tslint:disable-next-line: no-toplevel-property-access
  attachInjectFlag(makeParamDecorator('SkipSelf'), 4 /* InternalInjectFlags.SkipSelf */);
/**
 * Host decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Host =
  // Disable tslint because `InternalInjectFlags` is a const enum which gets inlined.
  // tslint:disable-next-line: no-toplevel-property-access
  attachInjectFlag(makeParamDecorator('Host'), 1 /* InternalInjectFlags.Host */);
//# sourceMappingURL=metadata.js.map
