// #docplaster
/*
  Because of how the code is merged together using the doc regions,
  we need to indent the imports with the function below.
*/
/* tslint:disable:no-shadowed-variable */
/* tslint:disable:align */
// #docregion ajax
  import { ajax } from 'rxjs/ajax';

// AJAX 요청을 옵저버블로 변환합니다.
// #enddocregion ajax
export function docRegionAjax(console, ajax) {
  // #docregion ajax
  const apiData = ajax('/api/data');
  // 구독을 시작하고 AJAX 요청을 보냅니다.
  apiData.subscribe(res => console.log(res.status, res.response));
  // #enddocregion ajax
}
