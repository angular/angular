import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
var obs = new Observable((obs) => {
    var i = 0;
    setInterval(() => obs.next(++i), 1000);
});
obs.map((i) => `${i} seconds elapsed`).subscribe(msg => console.log(msg));
// #enddocregion
