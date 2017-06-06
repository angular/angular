import { Observable } from 'rxjs/Rx';
var obs = new Observable((obs) => {
    var i = 0;
    setInterval(() => { obs.next(++i); }, 1000);
});
obs.subscribe(i => console.log(`${i} seconds elapsed`));
// #enddocregion
