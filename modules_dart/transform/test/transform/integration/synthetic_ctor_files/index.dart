library web_foo;

import 'package:angular2/bootstrap.dart';
import 'package:angular2/src/reflection/reflection_capabilities.dart';
import 'bar.dart';

void main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(MyComponent);
}
