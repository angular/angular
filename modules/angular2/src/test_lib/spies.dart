library test_lib.spies;

import 'package:angular2/src/core/change_detection/change_detection.dart';
import 'package:angular2/di.dart';
import './test_lib.dart';

@proxy
class SpyChangeDetector extends SpyObject implements ChangeDetector {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyProtoChangeDetector extends SpyObject implements ProtoChangeDetector {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyDependencyProvider extends SpyObject implements DependencyProvider {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyChangeDetectorRef extends SpyObject implements ChangeDetectorRef {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyIterableDifferFactory extends SpyObject
    implements IterableDifferFactory {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyInjector extends SpyObject implements Injector {
  noSuchMethod(m) => super.noSuchMethod(m);
}
