// #docplaster
// #docregion observable
  import { of } from 'rxjs';

// #enddocregion observable
export function docRegionObserver(console: Console) {

  // #docregion observable
  const numbers$ = of(1, 2, 3); // simple observable that emits three values
  // #enddocregion observable

  // #docregion no-params
  numbers$.subscribe();
  // #enddocregion no-params

  // #docregion next-param
  numbers$.subscribe(
    value => console.log('Observable emitted the next value: ' + value)
  );
  // #enddocregion next-param

  // #docregion object-param, next-or-error
  numbers$.subscribe({
    next: value => console.log('Observable emitted the next value: ' + value),
    error: err => console.error('Observable emitted an error: ' + err),
  // #enddocregion next-or-error
    complete: () => console.log('Observable emitted the complete notification')
  // #docregion next-or-error
  });
  // #enddocregion object-param, next-or-error

  // #docregion object-with-fns
  numbers$.subscribe({
    next(value) { console.log('Observable emitted the next value: ' + value); },
    error(err)  { console.error('Observable emitted an error: ' + err); },
    complete()  { console.log('Observable emitted the complete notification'); }
  });
  // #enddocregion object-with-fns

}
