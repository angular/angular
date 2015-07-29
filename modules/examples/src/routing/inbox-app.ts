import {NgIf, NgFor, EventEmitter, Component, View, Inject, Injectable} from 'angular2/angular2';
import {
  RouterLink,
  RouteConfig,
  Router,
  Route,
  RouterOutlet,
  Location,
  RouteParams
} from 'angular2/router';
import {Http} from 'angular2/http';
import {ObservableWrapper, PromiseWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';
import {isPresent} from 'angular2/src/facade/lang';

class InboxRecord {
  id: string = '';
  subject: string = '';
  content: string = '';
  email: string = '';
  firstName: string = '';
  lastName: string = '';
  date: string = '';
  draft: boolean = false;

  constructor(data: {
    id: string,
    subject: string,
    content: string,
    email: string,
    firstName: string,
    lastName: string,
    date: string, draft?: boolean
  } = null) {
    if (isPresent(data)) {
      this.setData(data);
    }
  }

  setData(record: {
    id: string,
    subject: string,
    content: string,
    email: string,
    firstName: string,
    lastName: string,
    date: string, draft?: boolean
  }) {
    this.id = record['id'];
    this.subject = record['subject'];
    this.content = record['content'];
    this.email = record['email'];
    this.firstName = record['first-name'];
    this.lastName = record['last-name'];
    this.date = record['date'];
    this.draft = record['draft'] == true ? true : false;
  }
}

@Injectable()
class DbService {
  constructor(public http: Http) {}

  getData() {
    var p = PromiseWrapper.completer();
    ObservableWrapper.subscribe(this.http.get('./db.json'), (resp) => { p.resolve(resp.json()); });
    return p.promise;
  }

  drafts() {
    return PromiseWrapper.then(this.getData(), (data) => {
      return ListWrapper.filter(data,
                                (record => isPresent(record['draft']) && record['draft'] == true));
    });
  }

  emails() {
    return PromiseWrapper.then(this.getData(), (data) => {
      return ListWrapper.filter(data, (record => !isPresent(record['draft'])));
    });
  }

  email(id) {
    return PromiseWrapper.then(this.getData(), (data) => {
      for (var i = 0; i < data.length; i++) {
        var entry = data[i];
        if (entry['id'] == id) {
          return entry;
        }
      }
    });
  }
}

@Component({selector: 'inbox-detail'})
@View({templateUrl: "inbox-detail.html", directives: [NgFor, RouterLink]})
class InboxDetailCmp {
  record: InboxRecord = new InboxRecord();
  ready: boolean = false;

  constructor(db: DbService, params: RouteParams) {
    var id = params.get('id');
    PromiseWrapper.then(db.email(id), (data) => { this.record.setData(data); });
  }
}

@Component({selector: 'inbox'})
@View({templateUrl: "inbox.html", directives: [NgFor, RouterLink]})
class InboxCmp {
  items: List<InboxRecord> = [];
  ready: boolean = false;

  constructor(public router: Router, db: DbService) {
    PromiseWrapper.then(db.emails(), (emails) => {
      this.ready = true;
      this.items = ListWrapper.map(emails, (email) => { return new InboxRecord(email); });
    });
  }
}


@Component({selector: 'drafts'})
@View({templateUrl: "drafts.html", directives: [NgFor, RouterLink]})
class DraftsCmp {
  items: List<InboxRecord> = [];
  ready: boolean = false;

  constructor(public router: Router, db: DbService) {
    PromiseWrapper.then(db.drafts(), (drafts) => {
      this.ready = true;
      this.items = ListWrapper.map(drafts, (email) => { return new InboxRecord(email); });
    });
  }
}

@Component({selector: 'inbox-app', viewBindings: [DbService]})
@View({templateUrl: "inbox-app.html", directives: [RouterOutlet, RouterLink]})
@RouteConfig([
  new Route({path: '/', component: InboxCmp, as: 'inbox'}),
  new Route({path: '/drafts', component: DraftsCmp, as: 'drafts'}),
  new Route({path: '/detail/:id', component: InboxDetailCmp, as: 'detailPage'})
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
