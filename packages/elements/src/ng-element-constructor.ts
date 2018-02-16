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

export interface NgElementConstructor<T, P> {
  readonly observedAttributes: string[];
  new (): NgElementWithProps<T, P>;
}

/** Type to provide additional interface information to the NgElementConstructor. */
type WithProperties<P> = {
  [property in keyof P]: P[property]
};

/**
 * Initialization configuration for the NgElementConstructor.
 *
 * @experimental
 */
export interface NgElementConfig { injector: Injector; }

/**
 * @whatItDoes Creates a custom element class based on an Angular Component. Takes a configuration
 * that provides initialization information to the created class. E.g. the configuration's injector
 * will be the initial injector set on the class which will be used for each created instance.
 *
 * @description Builds a class that encapsulates the functionality of the provided component and
 * uses the config's information to provide more context to the class. Takes the component factory's
 * inputs and outputs to convert them to the proper custom element API and add hooks to input
 * changes. Passes the config's injector to each created instance (may be overriden with the
 * static property to affect all newly created instances, or as a constructor argument for
 * one-off creations).
 *
 * @experimental
 */
export function createNgElementConstructor<T, P>(
    componentFactory: ComponentFactory<T>, config: NgElementConfig): NgElementConstructor<T, P> {
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

    static injector = config.injector;

    constructor(injector: Injector) {
      super(injector || NgElementConstructorImpl.injector, componentFactory, inputs, outputs);
    }
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
