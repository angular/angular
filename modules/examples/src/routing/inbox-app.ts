import {NgIf, NgFor, EventEmitter, Component, View, Inject} from 'angular2/angular2';
import {RouterLink, RouteConfig, Router, RouterOutlet} from 'angular2/router';
import {Http} from 'angular2/src/http/http';
import {ObservableWrapper} from 'angular2/src/facade/async';

@Component({selector: 'inbox-detail'})
@View({templateUrl: "inbox-detail.html", directives: [NgFor, RouterLink]})
class InboxDetailCmp {
  constructor() {}
}

@Component({selector: 'inbox'})
@View({templateUrl: "inbox.html", directives: [NgFor, RouterLink]})
class InboxCmp {
  items: List = [];
  router: Router;

  constructor(http: Http, router: Router) {
    this.items = [];
    this.router = router;

    ObservableWrapper.subscribe(http.get('./db.json'), (resp) => {
      this.items = resp.json().filter(email => !email.draft);
    });
  }
}


@Component({selector: 'drafts'})
@View({templateUrl: "drafts.html", directives: [NgFor, RouterLink]})
class DraftsCmp {
  items: List = [];
  router: Router;

  constructor(http: Http, router: Router) {
    this.router = router;

    ObservableWrapper.subscribe(http.get('./db.json'), (resp) => {
      this.items = resp.json().filter(email => email.draft);
    });
  }
}


@Component({selector: 'inbox-app'})
@View({
  // <a router-link=\"gamePage\" [router-params]=\"{'id':3}\">ddd</a>
  templateUrl: "inbox-app.html",
  directives: [RouterOutlet, RouterLink]
})
@RouteConfig([
  {path: '/', component: InboxCmp, as: 'inbox'},
  {path: '/drafts', component: DraftsCmp, as: 'drafts'},
  {path: '/detail/:id', component: InboxDetailCmp, as: 'detailPage'}

])
export class InboxApp {
  router: Router;
  constructor(router: Router) { this.router = router; }
}
