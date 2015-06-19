import {bootstrap, Component, View, NgFor, Inject} from 'angular2/angular2';
import {ObservableWrapper} from 'angular2/src/facade/async';
import {Http, httpInjectables} from 'angular2/http';

@Component({selector: 'http-app'})
@View({
  directives: [NgFor],
  template: `
    <h1>people</h1>
    <ul class="people">
      <li *ng-for="#person of people">
        hello, {{person['name']}}
      </li>
    </ul>
  `
})
export class HttpCmp {
  people: Object;
  constructor(http: Http) {
    ObservableWrapper.subscribe(http.get('./people.json'), res => this.people = res.json());
  }
}