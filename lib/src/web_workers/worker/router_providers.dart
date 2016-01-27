library angular2.src.web_workers.worker.router_providers;

import "package:angular2/core.dart"
    show ApplicationRef, Provider, NgZone, APP_INITIALIZER;
import "package:angular2/src/router/platform_location.dart"
    show PlatformLocation;
import "platform_location.dart" show WebWorkerPlatformLocation;
import "package:angular2/src/router/router_providers_common.dart"
    show ROUTER_PROVIDERS_COMMON;
import "package:angular2/src/facade/async.dart" show Future;

var WORKER_APP_ROUTER = [
  ROUTER_PROVIDERS_COMMON,
  new Provider(PlatformLocation, useClass: WebWorkerPlatformLocation),
  new Provider(APP_INITIALIZER,
      useFactory: (WebWorkerPlatformLocation platformLocation, NgZone zone) =>
          () => initRouter(platformLocation, zone),
      multi: true,
      deps: [PlatformLocation, NgZone])
];
Future<bool> initRouter(
    WebWorkerPlatformLocation platformLocation, NgZone zone) {
  return zone.run(() {
    return platformLocation.init();
  });
}
