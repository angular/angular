// #docregion
/*
// #docregion basic-1
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription }  from 'rxjs/Subscription';

const heroObservable = Observable.create((observer: Observer) => {
  // notify observer of values
  observer.next('Mr. Nice');
  observer.next('Narco');
  observer.complete();
});

// map each hero value to new value
const subscription = heroObservable
  .map(hero => `(( ${hero} ))` )
  .subscribe(
    // next
    (heroName) => { console.log(`Mapped hero: ${heroName}`); },
    // error
    () => {},
    // complete
    () => { console.log('Finished'); }
  );
// #enddocregion basic-1
// #docregion basic-2
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/interval';
import { Observable } from 'rxjs/Observable';
import { Subscription }  from 'rxjs/Subscription';

const intervalObservable = Observable.interval(1000);

const subscription: Subscription = intervalObservable.take(5).subscribe();
// #enddocregion basic-2
*/
