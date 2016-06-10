library playground.src.routing.inbox_app;

import "package:angular2/core.dart";
import "package:angular2/router.dart";
import "package:angular2/platform/common.dart";
import 'package:angular2/platform/browser_static.dart';

import "inbox-app-common.dart";
import "inbox-app-common.template.dart";

@Component(
    selector: "inbox-app",
    viewProviders: const [DbService],
    templateUrl: "inbox-app.html",
    directives: const [RouterOutlet, RouterLink])
@RouteConfig(const [
  const Route(path: "/", component: InboxCmpNgFactory, name: "Inbox"),
  const Route(path: "/drafts", component: DraftsCmpNgFactory, name: "Drafts"),
  const Route(
      path: "/detail/:id", component: InboxDetailCmpNgFactory, name: "DetailPage")
])
class InboxApp {
  Router router;
  Location location;
  InboxApp(Router router, Location location) {
    this.router = router;
    this.location = location;
  }
  inboxPageActive() {
    return this.location.path() == "";
  }

  draftsPageActive() {
    return this.location.path() == "/drafts";
  }
}

@InjectorModule(
  providers: const [
    BROWSER_APP_PROVIDERS,
    ROUTER_PROVIDERS,
    const Provider(LocationStrategy, useClass: HashLocationStrategy)
  ]
)
class InboxModule {}