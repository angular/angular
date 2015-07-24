library test_lib.spies;

import 'package:angular2/src/change_detection/change_detection.dart';
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
class SpyPipe extends SpyObject implements Pipe {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyPipeFactory extends SpyObject implements PipeFactory {
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
