import { Observable } from 'rxjs/Observable';
var obs = new Observable(obs => {
    var i = 0;
    setInterval(_ => { obs.next(++i); }, 1000);
});
obs.subscribe(i => console.log(`${i} seconds elapsed`));
// #enddocregion
