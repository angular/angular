import {bootstrap, Component, View, NgFor, Inject} from 'angular2/angular2';
import {Http, httpInjectables} from 'angular2/http';

@Component({selector: 'http-app'})
@View({
  directives: [NgFor],
  template: `
    <h1>people</h1>
    <ul class="people">
      <li *ng-for="#person of people">
        hello, {{person.name}}
      </li>
    </ul>
  `
})
export class HttpCmp {
  people: Object;
  constructor(http: Http) {
    http.get('./people.json').map(res => res.json()).subscribe(people => this.people = people);
  }
}