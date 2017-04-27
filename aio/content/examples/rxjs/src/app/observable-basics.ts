// #docregion
/*
// #docregion basic-1
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

const heroObservable = Observable.create((observer: Observer) => {
  // notify observer of values
  observer.next('Mr. Nice');

  // notify observer of an error
  observer.error(new Error('I failed the mission'));

  // notify observer of completion
  observer.complete();
});
// #enddocregion basic-1
// #docregion basic-2
const heroObservable = Observable.create((observer: Observer) => {
  // notify observer of values
  observer.next('Mr. Nice');
  observer.next('Narco');
});
// #enddocregion basic-2
// #docregion basic-3
import { Subscription } from 'rxjs/Subscription';

const observer: Observer = {
  next: (hero) => { console.log(`Hero: ${hero}`); },
  error: (error) => { console.log(`Something went wrong: ${error}`); },
  complete: () => { console.log('All done here'); }
};

const subscription = heroObservable.subscribe(observer);
// #enddocregion basic-3
// #docregion basic-4
subscription.unsubscribe();
// #enddocregion basic-4
*/
