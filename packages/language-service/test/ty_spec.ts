/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getDOMEventType} from '../src/ty';

describe('getDOMEventType', () => {
  it('should work with known DOM event types', () => {
    const cases = [
      {
        eventName: 'blur',
        typeName: 'FocusEvent',
      },
      {
        eventName: 'click',
        typeName: 'MouseEvent',
      },
      {
        eventName: 'keyup',
        typeName: 'KeyboardEvent',
      }
    ];

    for (const {eventName, typeName} of cases) {
      const event = getDOMEventType(eventName);
      expect(event?.type.symbol.name).toBe(typeName);
    }
  });

  it('should type unknown DOM events as Event types', () => {
    const event = getDOMEventType('not-an-event');
    expect(event?.type.symbol.name).toBe('Event');
  });
});
