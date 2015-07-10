library angular2.examples.web_workers;

import "package:angular2/src/web-workers/ui/application.dart" show bootstrap;
import "package:angular2/src/reflection/reflection_capabilities.dart";
import "package:angular2/src/reflection/reflection.dart";

main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap("background_index.dart");
}
