library test_lib.spies;

import 'package:angular2/change_detection.dart';
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