library benchmarks.src.naive_infinite_scroll.index;

import "package:angular2/bootstrap.dart" show bootstrap;
import "app.dart" show App;
import "package:angular2/src/core/linker/view_pool.dart"
    show APP_VIEW_POOL_CAPACITY;
import "package:angular2/core.dart" show bind;

main() {
  bootstrap(App, createBindings());
}
List<dynamic> createBindings() {
  return [bind(APP_VIEW_POOL_CAPACITY).toValue(100000)];
}
