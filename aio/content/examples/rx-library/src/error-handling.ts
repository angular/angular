
import { of } from 'rxjs';

// #docregion

import { ajax } from 'rxjs/ajax';
import { map, catchError } from 'rxjs/operators';
// API 요청 결과로 받은 객체에서 "response"를 반환합니다.
// 에러가 발생하면 빈 배열을 반환합니다.
const apiData = ajax('/api/data').pipe(
  map(res => {
    if (!res.response) {
      throw new Error('Value expected!');
    }
    return res.response;
  }),
  catchError(err => of([]))
);

apiData.subscribe({
  next(x) { console.log('data: ', x); },
  error(err) { console.log('errors already caught... will not run'); }
});

// #enddocregion
