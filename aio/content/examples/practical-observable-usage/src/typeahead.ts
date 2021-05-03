/*
  Because of how the code is merged together using the doc regions,
  we need to indent the imports with the function below.
*/
// #docplaster
// #docregion
  import { fromEvent } from 'rxjs';
  import { ajax } from 'rxjs/ajax';
  import { debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

// #enddocregion
/* tslint:disable:no-shadowed-variable */
/* tslint:disable:align */
export function docRegionTypeahead(document, ajax) {
  // #docregion
  const searchBox = document.getElementById('search-box');

  const typeahead = fromEvent(searchBox, 'input').pipe(
    map((e: KeyboardEvent) => (e.target as HTMLInputElement).value),
    filter(text => text.length > 2),
    debounceTime(10),
    distinctUntilChanged(),
    switchMap(searchTerm => ajax(`/api/endpoint?search=${searchTerm}`))
  );

  typeahead.subscribe(data => {
    // Handle the data from the API
  });

  // #enddocregion
  return typeahead;
}
