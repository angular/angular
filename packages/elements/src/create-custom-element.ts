/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, Type} from '@angular/core';
import {Subscription} from 'rxjs';

import {ComponentNgElementStrategyFactory} from './component-factory-strategy';
import {NgElementStrategy, NgElementStrategyFactory} from './element-strategy';
import {createCustomEvent, getComponentInputs, getDefaultAttributeToPropertyInputs} from './utils';

/**
 * Prototype for a class constructor based on an Angular component
 * that can be used for custom element registration. Implemented and returned
 * by the {@link createCustomElement createCustomElement() function}.
 *
 * @publicApi
 */
export interface NgElementConstructor<P> {
  /**
   * An array of observed attribute names for the custom element,
   * derived by transforming input property names from the source component.
   */
  readonly observedAttributes: string[];

  /**
   * Initializes a constructor instance.
   * @param injector The source component's injector.
   */
  new (injector: Injector): NgElement&WithProperties<P>;
}

/**
 * Implements the functionality needed for a custom element.
 *
 * @publicApi
 */
export abstract class NgElement extends HTMLElement {
  /**
   * The strategy that controls how a component is transformed in a custom element.
   */
  // TODO(issue/24571): remove '!'.
  protected ngElementStrategy !: NgElementStrategy;
  /**
   * A subscription to change, connect, and disconnect events in the custom element.
   */
  protected ngElementEventsSubscription: Subscription|null = null;

  /**
    * Prototype for a handler that responds to a change in an observed attribute.
    * @param attrName The name of the attribute that has changed.
    * @param oldValue The previous value of the attribute.
    * @param newValue The new value of the attribute.
    * @param namespace The namespace in which the attribute is defined.
    * @returns Nothing.
    */
  abstract attributeChangedCallback(
      attrName: string, oldValue: string|null, newValue: string, namespace?: string): void;
  /**
   * Prototype for a handler that responds to the insertion of the custom element in the DOM.
   * @returns Nothing.
   */
  abstract connectedCallback(): void;
  /**
   * Prototype for a handler that responds to the deletion of the custom element from the DOM.
   * @returns Nothing.
   */
  abstract disconnectedCallback(): void;
}

/**
 * Additional type information that can be added to the NgElement class,
 * for properties that are added based
 * on the inputs and methods of the underlying component.
 *
 * @publicApi
 */
export type WithProperties<P> = {
  [property in keyof P]: P[property]
};

/**
 * A configuration that initializes an NgElementConstructor with the
 * dependencies and strategy it needs to transform a component into
 * a custom element class.
 *
 * @publicApi
 */
export interface NgElementConfig {
  /**
   * The injector to use for retrieving the component's factory.
   */
  injector: Injector;
  /**
   * An optional custom strategy factory to use instead of the default.
   * The strategy controls how the transformation is performed.
   */
  strategyFactory?: NgElementStrategyFactory;
}

/**
 *  @description Creates a custom element class based on an Angular component.
 *
 * Builds a class that encapsulates the functionality of the provided component and
 * uses the configuration information to provide more context to the class.
 * Takes the component factory's inputs and outputs to convert them to the proper
 * custom element API and add hooks to input changes.
 *
 * The configuration's injector is the initial injector set on the class,
 * and used by default for each created instance.This behavior can be overridden with the
 * static property to affect all newly created instances, or as a constructor argument for
 * one-off creations.
 *
 * @param component The component to transform.
 * @param config A configuration that provides initialization information to the created class.
 * @returns The custom-element construction class, which can be registered with
 * a browser's `CustomElementRegistry`.
 *
 * @publicApi
 */
export function createCustomElement<P>(
    component: Type<any>, config: NgElementConfig): NgElementConstructor<P> {
  const inputs = getComponentInputs(component, config.injector);

  const strategyFactory =
      config.strategyFactory || new ComponentNgElementStrategyFactory(component, config.injector);

  const attributeToPropertyInputs = getDefaultAttributeToPropertyInputs(inputs);

  class NgElementImpl extends NgElement {
    // Work around a bug in closure typed optimizations(b/79557487) where it is not honoring static
    // field externs. So using quoted access to explicitly prevent renaming.
    static readonly['observedAttributes'] = Object.keys(attributeToPropertyInputs);

    constructor(injector?: Injector) {
      super();

      // Note that some polyfills (e.g. document-register-element) do not call the constructor.
      // Do not assume this strategy has been created.
      // TODO(andrewseguin): Add e2e tests that cover cases where the constructor isn't called. For
      // now this is tested using a Google internal test suite.
      this.ngElementStrategy = strategyFactory.create(injector || config.injector);
    }

    attributeChangedCallback(
        attrName: string, oldValue: string|null, newValue: string, namespace?: string): void {
      if (!this.ngElementStrategy) {
        this.ngElementStrategy = strategyFactory.create(config.injector);
      }

      const propName = attributeToPropertyInputs[attrName] !;
      this.ngElementStrategy.setInputValue(propName, newValue);
    }

    connectedCallback(): void {
      if (!this.ngElementStrategy) {
        this.ngElementStrategy = strategyFactory.create(config.injector);
      }

      this.ngElementStrategy.connect(this);

      // Listen for events from the strategy and dispatch them as custom events
      this.ngElementEventsSubscription = this.ngElementStrategy.events.subscribe(e => {
        const customEvent = createCustomEvent(this.ownerDocument !, e.name, e.value);
        this.dispatchEvent(customEvent);
      });
    }

    disconnectedCallback(): void {
      if (this.ngElementStrategy) {
        this.ngElementStrategy.disconnect();
      }

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
