import {__esDecorate, __runInitializers} from 'tslib';
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {NoopAnimationPlayer} from '../../../src/animations';
import {Injectable} from '@angular/core';
import {containsElement, getParentElement, invokeQuery, validateStyleProperty} from './shared';
/**
 * @publicApi
 *
 * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
 *
 * `AnimationDriver` implentation for Noop animations
 */
let NoopAnimationDriver = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var NoopAnimationDriver = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      NoopAnimationDriver = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /**
     * @returns Whether `prop` is a valid CSS property
     */
    validateStyleProperty(prop) {
      return validateStyleProperty(prop);
    }
    /**
     *
     * @returns Whether elm1 contains elm2.
     */
    containsElement(elm1, elm2) {
      return containsElement(elm1, elm2);
    }
    /**
     * @returns Rhe parent of the given element or `null` if the element is the `document`
     */
    getParentElement(element) {
      return getParentElement(element);
    }
    /**
     * @returns The result of the query selector on the element. The array will contain up to 1 item
     *     if `multi` is  `false`.
     */
    query(element, selector, multi) {
      return invokeQuery(element, selector, multi);
    }
    /**
     * @returns The `defaultValue` or empty string
     */
    computeStyle(element, prop, defaultValue) {
      return defaultValue || '';
    }
    /**
     * @returns An `NoopAnimationPlayer`
     */
    animate(
      element,
      keyframes,
      duration,
      delay,
      easing,
      previousPlayers = [],
      scrubberAccessRequested,
    ) {
      return new NoopAnimationPlayer(duration, delay);
    }
  };
  return (NoopAnimationDriver = _classThis);
})();
export {NoopAnimationDriver};
/**
 * @publicApi
 *
 * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
 */
export class AnimationDriver {
  /**
   * @deprecated Use the NoopAnimationDriver class.
   */
  static NOOP = new NoopAnimationDriver();
}
//# sourceMappingURL=animation_driver.js.map
