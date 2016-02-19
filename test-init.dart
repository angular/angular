import 'package:angular2/testing.dart';
import 'package:angular2/platform/testing/browser.dart';
import 'package:angular2/src/core/reflection/reflection.dart';
import 'package:angular2/src/core/reflection/reflection_capabilities.dart';

main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS);
}
