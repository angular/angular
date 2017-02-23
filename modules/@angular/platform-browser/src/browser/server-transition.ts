/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_INITIALIZER, Inject, InjectionToken, Provider} from '@angular/core';

import {getDOM} from '../dom/dom_adapter';
import {DOCUMENT} from '../dom/dom_tokens';

/**
 * An id that identifies a particular application being bootstrapped, that should
 * match across the client/server boundary.
 */
export const TRANSITION_ID = new InjectionToken('TRANSITION_ID');

export function bootstrapListenerFactory(transitionId: string, document: any) {
  const factory = () => {
    const dom = getDOM();
    const styles: any[] =
        Array.prototype.slice.apply(dom.querySelectorAll(document, `style[ng-transition]`));
    styles.filter(el => dom.getAttribute(el, 'ng-transition') === transitionId)
        .forEach(el => dom.remove(el));
  };
  return factory;
}

export const SERVER_TRANSITION_PROVIDERS: Provider[] = [
  {
    provide: APP_INITIALIZER,
    useFactory: bootstrapListenerFactory,
    deps: [TRANSITION_ID, DOCUMENT],
    multi: true
  },
];
