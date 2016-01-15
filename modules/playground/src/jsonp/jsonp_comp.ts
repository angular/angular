import {Component} from 'angular2/core';
import {Jsonp, Response} from 'angular2/http';
import {ObservableWrapper} from 'angular2/src/facade/async';

@Component({
  selector: 'jsonp-app',
  template: `
    <h1>people</h1>
    <ul class="people">
      <li *ngFor="#person of people">
        hello, {{person['name']}}
      </li>
    </ul>
  `
})
export class JsonpCmp {
  people: Object;
  constructor(jsonp: Jsonp) {
    jsonp.get('./people.json?callback=JSONP_CALLBACK').subscribe(res => this.people = res.json());
  }
}
