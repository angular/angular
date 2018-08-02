/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgElementPropertyStrategy} from './element-property-strategy';

/**
 * Exposes property names on the Custom Element matching those of the property
 * names from Angular Component class. This is the default naming strategy.
 *
 * @experimental
 */
export class PropertyNameNgElementPropertyStrategy implements NgElementPropertyStrategy {
  /**
   * Exposes an input property on the Element using the corresponding property
   * name from the component.
   * Example: Given @Input('foo') bar: string, expose bar as a property on
   * the element.
   */
  defineElementInputProperty(element: object, propName: string, templateName: string) {
    this.defineElementInputPropertyImpl(element, propName, propName);
  }

  /**
   * Checks if the specified input exists directly on the input element object.
   * If so, clears it so that the property getter/setter on the element's prototype
   * can be reached.
   */
  updateExistingInputProperty(element: object, propName: string, templateName: string) {
    this.updateExistingInputPropertyImpl(element, propName, propName);
  }

  protected updateExistingInputPropertyImpl(
      element: object, internalName: string, externalName: string) {
    const elem: any = element;
    if (!elem.hasOwnProperty(externalName)) return;

    const value = elem[externalName];
    delete elem[externalName];
    elem[externalName] = value;

    // IE 10: deleting the property is not adequate to cause subsequent
    // accesses to go up the prototype chain.
    // Instead, re-define the property directly on this.
    if (elem.hasOwnProperty(externalName)) {
      delete elem[externalName];
      this.defineElementInputPropertyImpl(elem, internalName, externalName);
      elem[externalName] = value;
    }
  }

  protected defineElementInputPropertyImpl(
      element: object, internalName: string, externalName: string) {
    Object.defineProperty(element, externalName, {
      get: function() { return this.ngElementStrategy.getInputValue(internalName); },
      set: function(newValue: any) {
        this.ngElementStrategy.setInputValue(internalName, newValue);
      },
      configurable: true,
      enumerable: true,
    });
  }
}
