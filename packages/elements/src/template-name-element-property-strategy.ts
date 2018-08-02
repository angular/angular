/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PropertyNameNgElementPropertyStrategy} from './property-name-element-property-strategy';

/**
 * Exposes property names on the Custom Element matching those of the @Input template
 * names from Angular Component class. Use this strategy if you wish to treat the
 * specified name of a component's @Inputs rather than the names of the properties themselves.
 *
 * This is also useful for working around Closure Compiler's full property renaming,
 * which mangles the names of properties but leaves the @Input name in place.
 *
 * @experimental
 */
export class TemplateNameNgElementPropertyStrategy extends PropertyNameNgElementPropertyStrategy {
  /**
   * Exposes an input property on the Element using the corresponding template
   * name from the component.
   * Example: Given @Input('foo') bar: string, expose foo as a property on
   * the element.
   */
  defineElementInputProperty(element: object, propName: string, templateName: string) {
    this.defineElementInputPropertyImpl(element, propName, templateName);
  }

  /**
   * Checks if the specified input exists directly on the input element object.
   * If so, clears it so that the property getter/setter on the element's prototype
   * can be reached.
   */
  updateExistingInputProperty(element: object, propName: string, templateName: string) {
    this.updateExistingInputPropertyImpl(element, propName, templateName);
  }
}
