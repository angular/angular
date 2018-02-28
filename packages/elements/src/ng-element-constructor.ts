/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subscription} from 'rxjs/Subscription';

import {NgElementStrategy, NgElementStrategyFactory} from './element-strategy';
import {createCustomEvent} from './utils';

/**
 * Class constructor based on an Angular Component to be used for custom element registration.
 *
 * @experimental
 */
export interface NgElementConstructor<P> {
  readonly observedAttributes: string[];

  new (): NgElement&WithProperties<P>;
}

/**
 * Class that extends HTMLElement and implements the functionality needed for a custom element.
 *
 * @experimental
 */
export abstract class NgElement extends HTMLElement {
  protected ngElementStrategy: NgElementStrategy;
  protected ngElementEventsSubscription: Subscription|null = null;

  abstract attributeChangedCallback(
      attrName: string, oldValue: string|null, newValue: string, namespace?: string): void;
  abstract connectedCallback(): void;
  abstract disconnectedCallback(): void;
}

/**
 * Additional type information that can be added to the NgElement class for properties added based
 * on the inputs and methods of the underlying component.
 */
export type WithProperties<P> = {
  [property in keyof P]: P[property]
};

/**
 * Initialization configuration for the NgElementConstructor. Provides the strategy factory
 * that produces a strategy for each instantiated element. Additionally, provides a function
 * that takes the component factory and provides a map of which attributes should be observed on
 * the element and which property they are associated with.
 *
 * @experimental
 */
export interface NgElementConfig {
  strategyFactory: NgElementStrategyFactory;
  propertyInputs: string[];
  attributeToPropertyInputs: Map<string, string>;
}

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
export function createNgElementConstructor<P>(config: NgElementConfig): NgElementConstructor<P> {
  class NgElementImpl extends NgElement {
    static readonly observedAttributes = Array.from(config.attributeToPropertyInputs.keys());

    constructor(strategyFactoryOverride?: NgElementStrategyFactory) {
      super();

      // Use the constructor's strategy factory override if it is present, otherwise default to
      // the config's factory.
      const strategyFactory = strategyFactoryOverride || config.strategyFactory;
      this.ngElementStrategy = strategyFactory.create();
    }

    attributeChangedCallback(
        attrName: string, oldValue: string|null, newValue: string, namespace?: string): void {
      const propName = config.attributeToPropertyInputs.get(attrName) !;
      this.ngElementStrategy.setPropertyValue(propName, newValue);
    }

    connectedCallback(): void {
      // Take element attribute inputs and set them as inputs on the strategy
      config.attributeToPropertyInputs.forEach((propName, attrName) => {
        const value = this.getAttribute(attrName);
        if (value) {
          this.ngElementStrategy.setPropertyValue(propName, value);
        }
      });

      this.ngElementStrategy.connect(this);

      // Listen for events from the strategy and dispatch them as custom events
      this.ngElementEventsSubscription = this.ngElementStrategy.events.subscribe(e => {
        const customEvent = createCustomEvent(this.ownerDocument, e.name, e.value);
        this.dispatchEvent(customEvent);
      });
    }

    disconnectedCallback(): void {
      this.ngElementStrategy.disconnect();

      if (this.ngElementEventsSubscription) {
        this.ngElementEventsSubscription.unsubscribe();
        this.ngElementEventsSubscription = null;
      }
    }
  }

  // Add getters and setters for each input defined on the Angular Component so that the input
  // changes can be known.
  config.propertyInputs.forEach(property => {
    Object.defineProperty(NgElementImpl.prototype, property, {
      get: function() { return this.ngElementStrategy.getPropertyValue(property); },
      set: function(newValue: any) { this.ngElementStrategy.setPropertyValue(property, newValue); },
      configurable: true,
      enumerable: true,
    });
  });

  return (NgElementImpl as any) as NgElementConstructor<P>;
}
