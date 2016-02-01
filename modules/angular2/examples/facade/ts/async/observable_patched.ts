// #docregion Observable
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

var obs = new Observable(obs => {
  var i = 0;
  setInterval(_ => obs.next(++i), 1000);
});
obs.map(i => `${i} seconds elapsed`).subscribe(msg => console.log(msg));
// #enddocregion
