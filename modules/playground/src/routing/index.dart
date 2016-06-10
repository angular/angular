library playground.src.routing.index;

import 'package:angular2/core.dart';
import 'package:angular2/platform/browser_static.dart';

import "inbox-app.template.dart"
    show InboxAppNgFactory, InboxModuleInjectorFactory;

main() {
  coreBootstrap(
      InboxModuleInjectorFactory.create(browserStaticPlatform().injector),
      InboxAppNgFactory);
}
