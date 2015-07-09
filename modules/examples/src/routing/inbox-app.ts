import {NgIf, NgFor, EventEmitter, Component, View, Inject, Injectable} from 'angular2/angular2';
import {
  RouterLink,
  RouteConfig,
  Router,
  RouterOutlet,
  Location,
  RouteParams
} from 'angular2/router';
import {Http} from 'angular2/http';
import {ObservableWrapper, PromiseWrapper} from 'angular2/src/facade/async';

@Injectable()
class DbService {
  constructor(public http: Http) {}

  getData() {
    var p = PromiseWrapper.completer();
    ObservableWrapper.subscribe(this.http.get('./db.json'), (resp) => { p.resolve(resp.json()); });
    return p.promise;
  }

  drafts() {
    return PromiseWrapper.then(this.getData(),
                               (data) => { return data.filter(record => record.draft); });
  }

  emails() {
    return PromiseWrapper.then(this.getData(),
                               (data) => { return data.filter(record => !record.draft); });
  }

  email(id) {
    return PromiseWrapper.then(this.getData(), (data) => {
      for (var i = 0; i < data.length; i++) {
        var entry = data[i];
        if (entry.id == id) {
          return entry;
        }
      }
    });
  }
}

@Component({selector: 'inbox-detail'})
@View({templateUrl: "inbox-detail.html", directives: [NgFor, RouterLink]})
class InboxDetailCmp {
  id: string;
  subject: string;
  content: string;
  email: string;
  firstName: string;
  lastName: string;
  date: string;

  constructor(db: DbService, params: RouteParams) {
    var id = params.get('id');
    PromiseWrapper.then(db.email(id), (data) => { this.setEmailRecord(data); });
  }

  get fullName() { return this.firstName + ' ' + this.lastName; }

  setEmailRecord(record) {
    this.id = record['id'];
    this.subject = record['subject'];
    this.content = record['content'];
    this.email = record['email'];
    this.firstName = record['first-name'];
    this.lastName = record['last-name'];
    this.date = record['date'];
  }
}

@Component({selector: 'inbox'})
@View({templateUrl: "inbox.html", directives: [NgFor, RouterLink]})
class InboxCmp {
  q: string;
  items: List = [];
  constructor(public router: Router, db: DbService) {
    PromiseWrapper.then(db.emails(), (emails) => { this.items = emails; });
  }
}


@Component({selector: 'drafts'})
@View({templateUrl: "drafts.html", directives: [NgFor, RouterLink]})
class DraftsCmp {
  items: List = [];
  constructor(public router: Router, db: DbService) {
    PromiseWrapper.then(db.drafts(), (drafts) => { this.items = drafts; });
  }
}


@Component({selector: 'inbox-app', viewInjector: [DbService]})
@View({templateUrl: "inbox-app.html", directives: [RouterOutlet, RouterLink]})
@RouteConfig([
  {path: '/', component: InboxCmp, as: 'inbox'},
  {path: '/drafts', component: DraftsCmp, as: 'drafts'},
  {path: '/detail/:id', component: InboxDetailCmp, as: 'detailPage'}
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
