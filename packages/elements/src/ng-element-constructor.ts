/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, Type} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {ComponentNgElementStrategyFactory} from './component-factory-strategy';
import {NgElementStrategy, NgElementStrategyFactory} from './element-strategy';
import {createCustomEvent, getComponentInputs, getDefaultAttributeToPropertyInputs} from './utils';

/**
 * @description Class constructor based on an Angular component, to be used for custom element registration.
 * The browser instantiates this class when the registered custom element is added to the DOM.
 * The encapsulated component is self-booting and it view can use Angular change-detection and data-binding.
 *
 * @experimental
 */
export interface NgElementConstructor<P> {
  readonly observedAttributes: string[];

  new (injector: Injector): NgElement&WithProperties<P>;
}

/**
 * @description Base class for encapsulating an Angular component as a custom element.
 * Extends HTMLElement with Angular-specific functionality. 
 *
 * @experimental
 */
export abstract class NgElement extends HTMLElement {
  /**
   * The strategy determines how the custom element handles connection and disconnection,
   * change-detection, and data binding.
   * Default is {@link ComponentFactoryNgElementStrategy}.
   */
  protected ngElementStrategy: NgElementStrategy;
  /**
   * ??? An event listener that registers the callback implementations for event handling.
   */
  protected ngElementEventsSubscription: Subscription|null = null;

  /**
   * Implementation defines change-event handling.
   * @param attrName The name of the attribute that has changed.
   * @param oldValue The previous value.
   * @param newValue The new value.
   * @param namespace Optional ???
   */
  abstract attributeChangedCallback(
      attrName: string, oldValue: string|null, newValue: string, namespace?: string): void;
  /**
   * Implementation defines connection behavior.
   */
      abstract connectedCallback(): void;
  /**
   * Implementation defines disconnection behavior.
   */
  abstract disconnectedCallback(): void;
}

/**
 * Additional type information that can be added to the NgElement class
 * for properties that are added dynamically based
 * on the inputs and methods of the underlying component.
 *
 * @experimental
 */
export type WithProperties<P> = {
  [property in keyof P]: P[property]
};

/**
 * Initialization configuration for the NgElementConstructor, which 
 * takes a component factory and provides a map of which attributes should be observed on
 * the element and which component properties they are associated with.
 *  
 * @experimental
 */
export interface NgElementConfig { 
  /**
   * The injector to be used for retrieving the component's factory.
   */
  injector: Injector;
  /**
   * An optional custom strategy factory to be used instead of the default.
   */
  strategyFactory?: NgElementStrategyFactory;
  /** 
   * An optional custom mapping of attribute names to component inputs.
   */
  attributeToPropertyInputs?: {[key: string]: string};
}

/**
 * @description Creates a custom element class based on an Angular component.
 * 
 * @param config A configuration object that provides initialization information to the created class.
 *  
 * @usageNotes Takes the component factory's inputs and outputs, converts them to the proper custom element API, 
 *  and adds hooks to input changes.
 * 
 *  By default, the configuration's injector is set on the returned class, and used for each created instance.
 *  You can change the default injector by setting the static `injector` property in the configuration object,
 *  or override it for individual instances by providing `injector` as a construction argument.
 * 
 * @returns An Angular custom-element class that can be registered with browser's `CustomElementRegistry`.
 *    The browser instantiates this class when the associated custom element is added to the DOM.
 * @experimental
 */
export function createNgElementConstructor<P>(
    component: Type<any>, config: NgElementConfig): NgElementConstructor<P> {
  const inputs = getComponentInputs(component, config.injector);

  const strategyFactory =
      config.strategyFactory || new ComponentNgElementStrategyFactory(component, config.injector);

  const attributeToPropertyInputs =
      config.attributeToPropertyInputs || getDefaultAttributeToPropertyInputs(inputs);

  class NgElementImpl extends NgElement {
    static readonly observedAttributes = Object.keys(attributeToPropertyInputs);

    constructor(injector?: Injector) {
      super();
      this.ngElementStrategy = strategyFactory.create(injector || config.injector);
    }

    attributeChangedCallback(
        attrName: string, oldValue: string|null, newValue: string, namespace?: string): void {
      const propName = attributeToPropertyInputs[attrName] !;
      this.ngElementStrategy.setInputValue(propName, newValue);
    }

    connectedCallback(): void {
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

  // Add getters and setters to the prototype for each property input. If the config does not
  // contain property inputs, use all inputs by default.
  inputs.map(({propName}) => propName).forEach(property => {
    Object.defineProperty(NgElementImpl.prototype, property, {
      get: function() { return this.ngElementStrategy.getInputValue(property); },
      set: function(newValue: any) { this.ngElementStrategy.setInputValue(property, newValue); },
      configurable: true,
      enumerable: true,
    });
  });

  return (NgElementImpl as any) as NgElementConstructor<P>;
}
