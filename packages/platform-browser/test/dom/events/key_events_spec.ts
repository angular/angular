/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KeyEventsPlugin} from '@angular/platform-browser/src/dom/events/key_events';

{
  describe('KeyEventsPlugin', () => {
    if (isNode) return;

    it('should ignore unrecognized events', () => {
      expect(KeyEventsPlugin.parseEventName('keydown')).toEqual(null);
      expect(KeyEventsPlugin.parseEventName('keyup')).toEqual(null);
      expect(KeyEventsPlugin.parseEventName('keydown.unknownmodifier.enter')).toEqual(null);
      expect(KeyEventsPlugin.parseEventName('keyup.unknownmodifier.enter')).toEqual(null);
      expect(KeyEventsPlugin.parseEventName('unknownevent.control.shift.enter')).toEqual(null);
      expect(KeyEventsPlugin.parseEventName('unknownevent.enter')).toEqual(null);
    });

    it('should correctly parse event names', () => {
      // key with no modifier
      expect(KeyEventsPlugin.parseEventName('keydown.enter'))
          .toEqual({'domEventName': 'keydown', 'fullKey': 'enter'});
      expect(KeyEventsPlugin.parseEventName('keyup.enter'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'enter'});

      // key with modifiers:
      expect(KeyEventsPlugin.parseEventName('keydown.control.shift.enter'))
          .toEqual({'domEventName': 'keydown', 'fullKey': 'control.shift.enter'});
      expect(KeyEventsPlugin.parseEventName('keyup.control.shift.enter'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'control.shift.enter'});

      // key with modifiers in a different order:
      expect(KeyEventsPlugin.parseEventName('keydown.shift.control.enter'))
          .toEqual({'domEventName': 'keydown', 'fullKey': 'control.shift.enter'});
      expect(KeyEventsPlugin.parseEventName('keyup.shift.control.enter'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'control.shift.enter'});

      // key that is also a modifier:
      expect(KeyEventsPlugin.parseEventName('keydown.shift.control'))
          .toEqual({'domEventName': 'keydown', 'fullKey': 'shift.control'});
      expect(KeyEventsPlugin.parseEventName('keyup.shift.control'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'shift.control'});

      expect(KeyEventsPlugin.parseEventName('keydown.control.shift'))
          .toEqual({'domEventName': 'keydown', 'fullKey': 'control.shift'});
      expect(KeyEventsPlugin.parseEventName('keyup.control.shift'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'control.shift'});
    });

    it('should alias esc to escape', () => {
      expect(KeyEventsPlugin.parseEventName('keyup.control.esc'))
          .toEqual(KeyEventsPlugin.parseEventName('keyup.control.escape'));
    });

    it('should implement addGlobalEventListener', () => {
      const plugin = new KeyEventsPlugin(document);

      spyOn(plugin, 'addEventListener').and.callFake(() => () => {});

      expect(() => plugin.addGlobalEventListener('window', 'keyup.control.esc', () => {}))
          .not.toThrowError();
    });
  });
}
