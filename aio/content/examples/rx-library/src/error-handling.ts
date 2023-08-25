// #docplaster
/*
  Because of how the code is merged together using the doc regions,
  we need to indent the imports with the function below.
*/
// #docregion
  import { Observable, of } from 'rxjs';
  import { ajax } from 'rxjs/ajax';
  import { map, catchError } from 'rxjs/operators';

// #enddocregion

// eslint-disable-next-line @typescript-eslint/no-shadow
export function docRegionDefault<T>(console: Console, ajax: (url: string) => Observable<T>) {
  // #docregion
  // Return good response from the API.
  // If the response is bad, throw an error.
  const apiData = ajax('/api/data').pipe(
    map((res: any) => {
      if (!res?.response) {
        throw new Error('Value expected!');
      }
      return res.response;
    }),
    /*
     * Catch the error, either from the AJAX call or from the map operator,
     * and return an observable of empty array.
     * The `catchError` argument must be a function that returns an observable.
     */
    catchError(() => of([]))
  );

  apiData.subscribe({
    next(x: T) { console.log('data: ', x); },
    error() { console.log('errors already caught... will not run'); }
  });

  // #enddocregion
  return apiData;
}
