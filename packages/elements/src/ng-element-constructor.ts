/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, Injector} from '@angular/core';

import {NgElementImpl, NgElementWithProps} from './ng-element';
import {camelToKebabCase} from './utils';

/**
 * Class constructor based on an Angular Component to be used for custom element registration.
 *
 * @experimental
 */
export interface NgElementConstructor<T, P> {
  readonly observedAttributes: string[];

  injector: Injector;

  new (): NgElementWithProps<T, P>;
}

type WithProperties<P> = {
  [property in keyof P]: P[property]
};

/**
 * @whatItDoes Creates a custom element class based on an Angular Component. Uses the provided
 * injection to understand where to put the component in the dependency injection hierarchy.
 * Injector may be changed so that subsequent custom elements use a different module.
 *
 * @description Builds a class that encapsulates the functionality of the provided component and
 * uses the module for its location in dependency injection. May be registered with the browser's
 * CustomElementRegistry to use it as a native web component
 *
 * @experimental
 */
export function createNgElementConstructor<T, P>(
    componentFactory: ComponentFactory<T>, injector: Injector): NgElementConstructor<T, P> {
  const inputs = componentFactory.inputs.map(({propName, templateName}) => ({
                                               propName,
                                               attrName: camelToKebabCase(templateName),
                                             }));
  const outputs = componentFactory.outputs.map(({propName, templateName}) => ({
                                                 propName,
                                                 eventName: templateName,
                                               }));

  // Note: According to the spec, this needs to be an ES2015 class
  // (i.e. not transpiled to an ES5 constructor function).
  // TODO(gkalpak): Document that if you are using ES5 sources you need to include a polyfill (e.g.
  //                https://github.com/webcomponents/custom-elements/blob/32f043c3a/src/native-shim.js).
  class NgElementConstructorImpl extends NgElementImpl<T> {
    static readonly observedAttributes = inputs.map(input => input.attrName);

    static injector = injector;

    constructor() { super(NgElementConstructorImpl.injector, componentFactory, inputs, outputs); }
  }

  // Add getters and setters for each input defined on the Angular Component so that the input
  // changes can be known.
  inputs.forEach(({propName}) => {
    Object.defineProperty(NgElementConstructorImpl.prototype, propName, {
      get: function(this: NgElementImpl<any>) { return this.getInputValue(propName); },
      set: function(this: NgElementImpl<any>, newValue: any) {
        this.setInputValue(propName, newValue);
      },
      configurable: true,
      enumerable: true,
    });
  });

  return NgElementConstructorImpl as typeof NgElementConstructorImpl & {
    new (): NgElementConstructorImpl&WithProperties<P>;
  };
}
