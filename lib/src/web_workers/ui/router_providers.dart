library angular2.src.web_workers.ui.router_providers;

import "platform_location.dart" show MessageBasedPlatformLocation;
import "package:angular2/src/router/browser_platform_location.dart"
    show BrowserPlatformLocation;
import "package:angular2/core.dart"
    show APP_INITIALIZER, Provider, Injector, NgZone;

const WORKER_RENDER_ROUTER = const [
  MessageBasedPlatformLocation,
  BrowserPlatformLocation,
  const Provider(APP_INITIALIZER,
      useFactory: initRouterListeners, multi: true, deps: const [Injector])
];
dynamic /* () => void */ initRouterListeners(Injector injector) {
  return () {
    var zone = injector.get(NgZone);
    zone.run(() => injector.get(MessageBasedPlatformLocation).start());
  };
}
