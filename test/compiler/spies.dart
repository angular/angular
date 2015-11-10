library core.spies;

import 'package:angular2/src/compiler/xhr.dart';
import 'package:angular2/testing_internal.dart';

@proxy
class SpyXHR extends SpyObject implements XHR {
  noSuchMethod(m) => super.noSuchMethod(m);
}
