import 'package:guinness/guinness.dart';
import 'package:unittest/unittest.dart' as unit;

import 'package:angular2/src/testing/testing_internal.dart' show testSetup;

main() {
  unit.filterStacks = true;
  unit.formatStacks = false;
  unit.unittestConfiguration.timeout = new Duration(milliseconds: 2000);

  _printWarnings();

  guinness.autoInit = false;
  guinness.initSpecs();

  testSetup();
}

_printWarnings () {
  final info = guinness.suiteInfo();

  if (info.activeIts.any((it) => it.exclusive)) {
    print("WARN: iit caused some tests to be excluded");
  }

  if (info.exclusiveDescribes.isNotEmpty) {
    print("WARN: ddescribe caused some tests to be excluded");
  }
}
