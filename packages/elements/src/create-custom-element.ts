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
   * @param injector If provided, overrides the configured injector.
   */
  new(injector?: Injector): NgElement&WithProperties<P>;
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
  protected ngElementStrategy!: NgElementStrategy;
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

    protected get ngElementStrategy(): NgElementStrategy {
      // NOTE:
      // Some polyfills (e.g. `document-register-element`) do not call the constructor, therefore
      // it is not safe to set `ngElementStrategy` in the constructor and assume it will be
      // available inside the methods.
      //
      // TODO(andrewseguin): Add e2e tests that cover cases where the constructor isn't called. For
      // now this is tested using a Google internal test suite.
      if (!this._ngElementStrategy) {
        const strategy = this._ngElementStrategy =
            strategyFactory.create(this.injector || config.injector);

        // Collect pre-existing values on the element to re-apply through the strategy.
        const preExistingValues =
            inputs.filter(({propName}) => this.hasOwnProperty(propName)).map(({propName}): [
              string, any
            ] => [propName, (this as any)[propName]]);

        // In some browsers (e.g. IE10), `Object.setPrototypeOf()` (which is required by some Custom
        // Elements polyfills) is not defined and is thus polyfilled in a way that does not preserve
        // the prototype chain. In such cases, `this` will not be an instance of `NgElementImpl` and
        // thus not have the component input getters/setters defined on `NgElementImpl.prototype`.
        if (!(this instanceof NgElementImpl)) {
          // Add getters and setters to the instance itself for each property input.
          defineInputGettersSetters(inputs, this);
        } else {
          // Delete the property from the instance, so that it can go through the getters/setters
          // set on `NgElementImpl.prototype`.
          preExistingValues.forEach(([propName]) => delete (this as any)[propName]);
        }

        // Re-apply pre-existing values through the strategy.
        preExistingValues.forEach(([propName, value]) => strategy.setInputValue(propName, value));
      }

      return this._ngElementStrategy!;
    }

    private _ngElementStrategy?: NgElementStrategy;

    constructor(private readonly injector?: Injector) {
      super();
    }

    attributeChangedCallback(
        attrName: string, oldValue: string|null, newValue: string, namespace?: string): void {
      const propName = attributeToPropertyInputs[attrName]!;
      this.ngElementStrategy.setInputValue(propName, newValue);
    }

    connectedCallback(): void {
      this.ngElementStrategy.connect(this);

      // Listen for events from the strategy and dispatch them as custom events
      this.ngElementEventsSubscription = this.ngElementStrategy.events.subscribe(e => {
        const customEvent = createCustomEvent(this.ownerDocument!, e.name, e.value);
        this.dispatchEvent(customEvent);
      });
    }

    disconnectedCallback(): void {
      // Not using `this.ngElementStrategy` to avoid unnecessarily creating the `NgElementStrategy`.
      if (this._ngElementStrategy) {
        this._ngElementStrategy.disconnect();
      }

      if (this.ngElementEventsSubscription) {
        this.ngElementEventsSubscription.unsubscribe();
        this.ngElementEventsSubscription = null;
      }
    }
  }

  // TypeScript 3.9+ defines getters/setters as configurable but non-enumerable properties (in
  // compliance with the spec). This breaks emulated inheritance in ES5 on environments that do not
  // natively support `Object.setPrototypeOf()` (such as IE 9-10).
  // Update the property descriptor of `NgElementImpl#ngElementStrategy` to make it enumerable.
  Object.defineProperty(NgElementImpl.prototype, 'ngElementStrategy', {enumerable: true});

  // Add getters and setters to the prototype for each property input.
  defineInputGettersSetters(inputs, NgElementImpl.prototype);

  return (NgElementImpl as any) as NgElementConstructor<P>;
}

// Helpers
function defineInputGettersSetters(
    inputs: {propName: string, templateName: string}[], target: object): void {
  // Add getters and setters for each property input.
  inputs.forEach(({propName}) => {
    Object.defineProperty(target, propName, {
      get(): any {
        return this.ngElementStrategy.getInputValue(propName);
      },
      set(newValue: any): void {
        this.ngElementStrategy.setInputValue(propName, newValue);
      },
      configurable: true,
      enumerable: true,
    });
  });
}
