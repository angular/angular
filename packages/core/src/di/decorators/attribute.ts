/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {makeParamDecorator} from '../../utils/decorators';


/**
 * Type of the Attribute decorator / constructor function.
 *
 * @publicApi
 */
export interface AttributeDecorator {
  /**
   * Specifies that a constant attribute value should be injected.
   *
   * The directive can inject constant string literals of host element attributes.
   *
   * @usageNotes
   * ### Example
   *
   * Suppose we have an `<input>` element and want to know its `type`.
   *
   * ```html
   * <input type="text">
   * ```
   *
   * A decorator can inject string literal `text` like so:
   *
   * {@example core/ts/metadata/metadata.ts region='attributeMetadata'}
   *
   * ### Example as TypeScript Decorator
   *
   * {@example core/ts/metadata/metadata.ts region='attributeFactory'}
   *
   * ### Example as ES5 annotation
   *
   * ```
   * var MyComponent = function(title) {
   *   ...
   * };
   *
   * MyComponent.annotations = [
   *   new ng.Component({...})
   * ]
   * MyComponent.parameters = [
   *   [new ng.Attribute('title')]
   * ]
   * ```
   *
   * @publicApi
   */
  (name: string): any;
  new (name: string): Attribute;
}


/**
 * Type of the Attribute metadata.
 *
 * @publicApi
 */
export interface Attribute { attributeName?: string; }

/**
 * Attribute decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Attribute: AttributeDecorator =
    makeParamDecorator('Attribute', (attributeName?: string) => ({attributeName}));
