import {Component, View, NgFor} from 'angular2/angular2';
import {Jsonp, Response} from 'http/http';
import {ObservableWrapper} from 'angular2/src/facade/async';

@Component({selector: 'jsonp-app'})
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
export class JsonpCmp {
  people: Object;
  constructor(jsonp: Jsonp) {
    ObservableWrapper.subscribe<Response>(jsonp.get('./people.json?callback=JSONP_CALLBACK'),
                                          res => this.people = res.json());
  }
}
