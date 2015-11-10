library router.spies;

import 'package:angular2/router.dart';
import 'package:angular2/testing_internal.dart';

@proxy
class SpyLocation extends SpyObject implements Location {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyRouter extends SpyObject implements Router {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyRouterOutlet extends SpyObject implements RouterOutlet {
  noSuchMethod(m) => super.noSuchMethod(m);
}
