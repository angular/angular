/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {removeListeners} from '../src/event_delegation_utils';

describe('removeListeners', () => {
  it('should clear the cached jsaction map', () => {
    const element = document.createElement('a');
    element.setAttribute('jsaction', 'click:;');
    element.__jsaction = {click: 'handleClick'};

    removeListeners(element);

    expect(element.hasAttribute('jsaction')).toBeFalse();
    expect(element.__jsaction).toBeUndefined();
  });
});
