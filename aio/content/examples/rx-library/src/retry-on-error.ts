// #docplaster
/*
  Because of how the code is merged together using the doc regions,
  we need to indent the imports with the function below.
*/
/* tslint:disable:no-shadowed-variable */
/* tslint:disable:align */
// #docregion
  import { of } from 'rxjs';
  import { ajax } from 'rxjs/ajax';
  import { map, retry, catchError } from 'rxjs/operators';

// #enddocregion

export function docRegionDefault(console, ajax) {
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
    catchError(err => of([]))
  );

  apiData.subscribe({
    next(x) { console.log('data: ', x); },
    error(err) { console.log('errors already caught... will not run'); }
  });

  // #enddocregion
}
