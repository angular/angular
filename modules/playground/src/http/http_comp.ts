import {Component, View, NgFor} from 'angular2/angular2';
import {Http, Response} from 'angular2/http';
import 'rxjs/operators/map';

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
  people: Object[];
  constructor(http: Http) {
    http.get('./people.json')
        .map((res: Response) => res.json())
        .subscribe((people: Array<Object>) => this.people = people);
  }
}
