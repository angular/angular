import "package:angular2/platform/browser.dart" show bootstrap;
import "./demo-app/demo-app.dart" show DemoApp;
import "package:angular2/router.dart" show ROUTER_PROVIDERS;
import "./core/platform/browser/browser_adapter.dart" show BrowserDomAdapter;

void main() {
  BrowserDomAdapter.makeCurrent();
  bootstrap(DemoApp, [ROUTER_PROVIDERS]);
}
