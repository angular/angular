import {Component} from 'angular2/core';
import {RouterLink, RouteConfig, Router, Route, RouterOutlet} from 'angular2/router';
import {Location} from 'angular2/platform/common';
import {InboxCmp, DraftsCmp, InboxDetailCmp} from './inbox-app-common';

@Component({
  selector: 'inbox-app',
  viewProviders: [DbService],
  templateUrl: 'inbox-app.html',
  directives: [RouterOutlet, RouterLink]
})
@RouteConfig([
  new Route({path: '/', component: InboxCmp, name: 'Inbox'}),
  new Route({path: '/drafts', component: DraftsCmp, name: 'Drafts'}),
  new Route({path: '/detail/:id', component: InboxDetailCmp, name: 'DetailPage'})
])
export class InboxApp {
  router: Router;
  location: Location;
  constructor(router: Router, location: Location) {
    this.router = router;
    this.location = location;
  }
  inboxPageActive() { return this.location.path() == ''; }
  draftsPageActive() { return this.location.path() == '/drafts'; }
}
