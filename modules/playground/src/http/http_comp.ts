import {Component} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'http-app',
  template: `
    <h1>people</h1>
    <ul class="people">
      <li *ngFor="#person of people">
        hello, {{person['name']}}
      </li>
    </ul>
  `
})
export class HttpCmp {
  people: Object[];
  constructor(http: Http) {
    http.get('./people.json')
        .map((res: Response) => res.json())
        .subscribe((people: Array<Object>) => this.people = people);
  }
}
