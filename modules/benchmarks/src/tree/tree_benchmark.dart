import 'package:angular2/core.dart';
import 'package:angular2/platform/browser_static.dart';
import 'dart:async';

import 'tree_benchmark_common.dart';
import 'tree_benchmark_common.template.dart';
import 'tree_benchmark_module.template.dart';

main() {
  benchmarkMain(() => new Future.value(coreBootstrap(
      AppModuleInjectorFactory.create(browserStaticPlatform().injector),
      AppComponentNgFactory)));
}
