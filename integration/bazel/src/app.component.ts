import {HttpClient} from '@angular/common/http';
import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-component',
  template: `
    <hello-world-app></hello-world-app>
    <div>The current time is {{ time$ | async }}</div>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  constructor(private http: HttpClient) {}

  time$: Observable<string> =
      this.http.get('http://worldclockapi.com/api/json/pst/now')
          .pipe(map((result: any) => result.currentDateTime), startWith(['...']));
}
