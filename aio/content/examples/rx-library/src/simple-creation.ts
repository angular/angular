// #docplaster
/*
  Because of how the code is merged together using the doc regions,
  we need to indent the imports with the function below.
*/
/* tslint:disable:no-shadowed-variable */
/* tslint:disable:align */
// #docregion ajax
  import { ajax } from 'rxjs/ajax';

// Create an Observable that will create an AJAX request
// #enddocregion ajax
export function docRegionAjax(console, ajax) {
  // #docregion ajax
  const apiData = ajax('/api/data');
  // Subscribe to create the request
  apiData.subscribe(res => console.log(res.status, res.response));
  // #enddocregion ajax
}
