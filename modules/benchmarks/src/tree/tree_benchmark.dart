import 'package:angular2/core.dart';
import 'package:angular2/platform/browser_static.dart';
import 'dart:async';

import 'tree_benchmark_common.dart';
import 'tree_benchmark_common.template.dart';

main() {
  benchmarkMain(() => new Future.value(coreBootstrap(
      AppConfigInjectorFactory.create(browserStaticPlatform().injector),
      AppComponentNgFactory)));
}
