library angular2.render.dom.events.hammer_gestures.test;

import 'package:angular2/testing_internal.dart';
import 'package:angular2/src/core/render/dom/events/hammer_gestures.dart';

main() {
  describe('HammerGesturesSupport', () {

    it('should return false if Hammer.js is not loaded', () {
      HammerGesturesPlugin h = new HammerGesturesPlugin();
      expect(h.supports('press'), false);
    });

  });
}
