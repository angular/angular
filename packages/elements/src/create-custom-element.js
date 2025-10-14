/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ComponentNgElementStrategyFactory} from './component-factory-strategy';
import {getComponentInputs, getDefaultAttributeToPropertyInputs} from './utils';
/**
 * Implements the functionality needed for a custom element.
 *
 * @publicApi
 */
export class NgElement extends HTMLElement {
  constructor() {
    super(...arguments);
    /**
     * A subscription to change, connect, and disconnect events in the custom element.
     */
    this.ngElementEventsSubscription = null;
  }
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
 * @see [Angular Elements Overview](guide/elements "Turning Angular components into custom elements")
 *
 * @param component The component to transform.
 * @param config A configuration that provides initialization information to the created class.
 * @returns The custom-element construction class, which can be registered with
 * a browser's `CustomElementRegistry`.
 *
 * @publicApi
 */
export function createCustomElement(component, config) {
  const inputs = getComponentInputs(component, config.injector);
  const strategyFactory =
    config.strategyFactory || new ComponentNgElementStrategyFactory(component, config.injector);
  const attributeToPropertyInputs = getDefaultAttributeToPropertyInputs(inputs);
  class NgElementImpl extends NgElement {
    get ngElementStrategy() {
      // TODO(andrewseguin): Add e2e tests that cover cases where the constructor isn't called. For
      // now this is tested using a Google internal test suite.
      if (!this._ngElementStrategy) {
        const strategy = (this._ngElementStrategy = strategyFactory.create(
          this.injector || config.injector,
        ));
        // Re-apply pre-existing input values (set as properties on the element) through the
        // strategy.
        // TODO(alxhub): why are we doing this? this makes no sense.
        inputs.forEach(({propName, transform}) => {
          if (!this.hasOwnProperty(propName)) {
            // No pre-existing value for `propName`.
            return;
          }
          // Delete the property from the DOM node and re-apply it through the strategy.
          const value = this[propName];
          delete this[propName];
          strategy.setInputValue(propName, value, transform);
        });
      }
      return this._ngElementStrategy;
    }
    constructor(injector) {
      super();
      this.injector = injector;
    }
    attributeChangedCallback(attrName, oldValue, newValue, namespace) {
      const [propName, transform] = attributeToPropertyInputs[attrName];
      this.ngElementStrategy.setInputValue(propName, newValue, transform);
    }
    connectedCallback() {
      // For historical reasons, some strategies may not have initialized the `events` property
      // until after `connect()` is run. Subscribe to `events` if it is available before running
      // `connect()` (in order to capture events emitted during initialization), otherwise subscribe
      // afterwards.
      //
      // TODO: Consider deprecating/removing the post-connect subscription in a future major version
      //       (e.g. v11).
      let subscribedToEvents = false;
      if (this.ngElementStrategy.events) {
        // `events` are already available: Subscribe to it asap.
        this.subscribeToEvents();
        subscribedToEvents = true;
      }
      this.ngElementStrategy.connect(this);
      if (!subscribedToEvents) {
        // `events` were not initialized before running `connect()`: Subscribe to them now.
        // The events emitted during the component initialization have been missed, but at least
        // future events will be captured.
        this.subscribeToEvents();
      }
    }
    disconnectedCallback() {
      // Not using `this.ngElementStrategy` to avoid unnecessarily creating the `NgElementStrategy`.
      if (this._ngElementStrategy) {
        this._ngElementStrategy.disconnect();
      }
      if (this.ngElementEventsSubscription) {
        this.ngElementEventsSubscription.unsubscribe();
        this.ngElementEventsSubscription = null;
      }
    }
    subscribeToEvents() {
      // Listen for events from the strategy and dispatch them as custom events.
      this.ngElementEventsSubscription = this.ngElementStrategy.events.subscribe((e) => {
        const customEvent = new CustomEvent(e.name, {detail: e.value});
        this.dispatchEvent(customEvent);
      });
    }
  }
  // Work around a bug in closure typed optimizations(b/79557487) where it is not honoring static
  // field externs. So using quoted access to explicitly prevent renaming.
  NgElementImpl['observedAttributes'] = Object.keys(attributeToPropertyInputs);
  // Add getters and setters to the prototype for each property input.
  inputs.forEach(({propName, transform}) => {
    Object.defineProperty(NgElementImpl.prototype, propName, {
      get() {
        return this.ngElementStrategy.getInputValue(propName);
      },
      set(newValue) {
        this.ngElementStrategy.setInputValue(propName, newValue, transform);
      },
      configurable: true,
      enumerable: true,
    });
  });
  return NgElementImpl;
}
//# sourceMappingURL=create-custom-element.js.map
