// #docplaster
/*
  Because of how the code is merged together using the doc regions,
  we need to indent the imports with the function below.
*/
/* tslint:disable:no-shadowed-variable */
/* tslint:disable:align */
// #docregion
  import { Observable, of } from 'rxjs';
  import { ajax } from 'rxjs/ajax';
  import { map, retry, catchError } from 'rxjs/operators';

// #enddocregion

export function docRegionDefault<T>(console: Console, ajax: (url: string) => Observable<T>) {
  // #docregion
  const apiData = ajax('/api/data').pipe(
    map((res: any) => {
      if (!res.response) {
        console.log('Error occurred.');
        throw new Error('Value expected!');
      }
      return res.response;
    }),
    retry(3), // Retry up to 3 times before failing
    catchError(() => of([]))
  );

  apiData.subscribe({
    next(x: T) { console.log('data: ', x); },
    error() { console.log('errors already caught... will not run'); }
  });

  // #enddocregion
}
