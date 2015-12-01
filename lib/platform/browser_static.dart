library angular2.platform.browser_static;

export "package:angular2/src/core/angular_entrypoint.dart"
    show AngularEntrypoint;
export "package:angular2/src/platform/browser_common.dart"
    show
        BROWSER_PROVIDERS,
        ELEMENT_PROBE_BINDINGS,
        ELEMENT_PROBE_PROVIDERS,
        inspectNativeElement,
        BrowserDomAdapter,
        By,
        Title,
        enableDebugTools,
        disableDebugTools;
import "package:angular2/src/facade/lang.dart" show Type, isPresent;
import "package:angular2/src/facade/promise.dart" show Future;
import "package:angular2/src/platform/browser_common.dart"
    show BROWSER_PROVIDERS, BROWSER_APP_COMMON_PROVIDERS;
import "package:angular2/core.dart" show ComponentRef, platform;

/**
 * An array of providers that should be passed into `application()` when bootstrapping a component
 * when all templates
 * have been precompiled offline.
 */
const List<dynamic> BROWSER_APP_PROVIDERS = BROWSER_APP_COMMON_PROVIDERS;
/**
 * See [bootstrap] for more information.
 */
Future<ComponentRef> bootstrapStatic(Type appComponentType,
    [List<dynamic> customProviders, Function initReflector]) {
  if (isPresent(initReflector)) {
    initReflector();
  }
  var appProviders = isPresent(customProviders)
      ? [BROWSER_APP_PROVIDERS, customProviders]
      : BROWSER_APP_PROVIDERS;
  return platform(BROWSER_PROVIDERS)
      .application(appProviders)
      .bootstrap(appComponentType);
}
