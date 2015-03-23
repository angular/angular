library angular2.dom.html5lib_adapter.test;

import 'package:guinness/guinness.dart';
import 'package:unittest/unittest.dart' hide expect;
import 'package:angular2/src/dom/html_adapter.dart';

// A smoke-test of the adapter. It is primarily tested by the compiler.
main() {
  describe('Html5Lib DOM Adapter', () {
    Html5LibDomAdapter subject;

    beforeEach(() {
      subject = new Html5LibDomAdapter();
    });

    it('should parse HTML', () {
      expect(subject.parse('<div>hi</div>'), isNotNull);
    });
  });
}
