library core.spies;

import 'package:angular2/common.dart';
import 'package:angular2/src/core/change_detection/change_detection.dart';
import 'package:angular2/testing_internal.dart';

@proxy
class SpyNgControl extends SpyObject implements NgControl {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyValueAccessor extends SpyObject implements ControlValueAccessor {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyChangeDetectorRef extends SpyObject implements ChangeDetectorRef {
  noSuchMethod(m) => super.noSuchMethod(m);
}
