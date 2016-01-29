import "package:angular2/platform/browser.dart" show bootstrap;
import "./demo-app/demo-app.dart" show DemoApp;
import "package:angular2/router.dart" show ROUTER_PROVIDERS;

void main() {
  bootstrap(DemoApp, [ROUTER_PROVIDERS]);
}
