library angular2.src.core.application_tokens;

import "package:angular2/src/core/di.dart" show OpaqueToken, Provider;
import "package:angular2/src/facade/lang.dart" show Math, StringWrapper;

/**
 *  @internal
 */
const APP_COMPONENT_REF_PROMISE = const OpaqueToken("Promise<ComponentRef>");
/**
 * An [angular2/di/OpaqueToken] representing the application root type in the {@link
 * Injector}.
 *
 * ```
 * @Component(...)
 * class MyApp {
 *   ...
 * }
 *
 * bootstrap(MyApp).then((appRef:ApplicationRef) {
 *   expect(appRef.injector.get(appComponentTypeToken)).toEqual(MyApp);
 * });
 *
 * ```
 */
const OpaqueToken APP_COMPONENT = const OpaqueToken("AppComponent");
/**
 * A DI Token representing a unique string id assigned to the application by Angular and used
 * primarily for prefixing application attributes and CSS styles when
 * [ViewEncapsulation#Emulated] is being used.
 *
 * If you need to avoid randomly generated value to be used as an application id, you can provide
 * a custom value via a DI provider <!-- TODO: provider --> configuring the root [Injector]
 * using this token.
 */
const OpaqueToken APP_ID = const OpaqueToken("AppId");
_appIdRandomProviderFactory() {
  return '''${ _randomChar ( )}${ _randomChar ( )}${ _randomChar ( )}''';
}

/**
 * Providers that will generate a random APP_ID_TOKEN.
 */
const Provider APP_ID_RANDOM_PROVIDER = const Provider(APP_ID,
    useFactory: _appIdRandomProviderFactory, deps: const []);
String _randomChar() {
  return StringWrapper.fromCharCode(97 + Math.floor(Math.random() * 25));
}

/**
 * A function that will be executed when a platform is initialized.
 */
const OpaqueToken PLATFORM_INITIALIZER =
    const OpaqueToken("Platform Initializer");
/**
 * A function that will be executed when an application is initialized.
 */
const OpaqueToken APP_INITIALIZER =
    const OpaqueToken("Application Initializer");
