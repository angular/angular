import {bootstrap, Component, View, NgFor, NgIf, Inject} from 'angular2/angular2';
import {httpInjectables} from 'angular2/http';
import {Http} from 'angular2/src/http/http';
import {IHttp} from 'angular2/src/http/interfaces';
import {Response} from 'angular2/src/http/static_response';
import {LocalVariable} from './assign_local_directive';

@Component({selector: 'http-app', appInjector: [httpInjectables]})
@View({
  directives: [NgFor, NgIf, LocalVariable],
  template: `
    <h1>people</h1>
    <div *assign-local="#unwrappedPeople to people | rx">
      <ul *ng-if="unwrappedPeople" class="people">
        <li *ng-for="#person of unwrappedPeople">
          hello, {{person.name}}
        </li>
      </ul>
      <span *ng-if="!unwrappedPeople">
        Fetching people...
      </span>
    </div>
  `
})
export class HttpCmp {
  people: Rx.Observable<Object>;
  constructor(@Inject(Http) http: IHttp) {
    this.people = http('./people.json').map(res => res.json());
  }
}