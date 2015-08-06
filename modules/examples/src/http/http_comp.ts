import {Component, View, NgFor} from 'angular2/angular2';
import {Http, Response} from 'angular2/http';
import {ObservableWrapper} from 'angular2/src/facade/async';

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
    ObservableWrapper.subscribe<Response>(http.get('./people.json'),
                                          res => this.people = res.json());
  }
}
