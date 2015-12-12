import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
var obs = new Observable(obs => {
    var i = 0;
    setInterval(_ => obs.next(++i), 1000);
});
map.call(obs, i => `${i} seconds elapsed`).subscribe(msg => console.log(msg));
// #enddocregion
