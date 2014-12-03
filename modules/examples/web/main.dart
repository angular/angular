import 'package:examples/hello_world/app.dart' as HelloWorldApp;
import 'package:reflection/reflection_capabilities.dart';
import 'package:reflection/reflection.dart';

// TODO(rado): templatize and make reusable for all examples.
main() {
  // enable mirrors and reflection.
  // see static_app.js for an example of a static app.
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  HelloWorldApp.main();
}
