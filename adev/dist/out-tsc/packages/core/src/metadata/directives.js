/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ChangeDetectionStrategy} from '../change_detection/constants';
import {compileComponent, compileDirective} from '../render3/jit/directive';
import {compilePipe} from '../render3/jit/pipe';
import {makeDecorator, makePropDecorator} from '../util/decorators';
/**
 * Type of the Directive metadata.
 *
 * @publicApi
 */
export const Directive = makeDecorator(
  'Directive',
  (dir = {}) => dir,
  undefined,
  undefined,
  (type, meta) => compileDirective(type, meta),
);
/**
 * Component decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Component = makeDecorator(
  'Component',
  (c = {}) => ({changeDetection: ChangeDetectionStrategy.Default, ...c}),
  Directive,
  undefined,
  (type, meta) => compileComponent(type, meta),
);
/**
 * @Annotation
 * @publicApi
 */
export const Pipe = makeDecorator(
  'Pipe',
  (p) => ({pure: true, ...p}),
  undefined,
  undefined,
  (type, meta) => compilePipe(type, meta),
);
/**
 * @Annotation
 * @publicApi
 */
export const Input = makePropDecorator('Input', (arg) => {
  if (!arg) {
    return {};
  }
  return typeof arg === 'string' ? {alias: arg} : arg;
});
/**
 * @Annotation
 * @publicApi
 */
export const Output = makePropDecorator('Output', (alias) => ({alias}));
/**
 * @Annotation
 * @publicApi
 */
export const HostBinding = makePropDecorator('HostBinding', (hostPropertyName) => ({
  hostPropertyName,
}));
/**
 * @Annotation
 * @publicApi
 */
export const HostListener = makePropDecorator('HostListener', (eventName, args) => ({
  eventName,
  args,
}));
//# sourceMappingURL=directives.js.map
