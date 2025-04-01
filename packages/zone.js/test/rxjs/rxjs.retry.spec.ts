/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Observable, of, throwError, timer} from 'rxjs';
import {catchError, finalize, mergeMap, retryWhen} from 'rxjs/operators';

describe('retryWhen', () => {
  let log: any[];
  const genericRetryStrategy = (finalizer: () => void) => (attempts: Observable<any>) =>
    attempts.pipe(
      mergeMap((error, i) => {
        const retryAttempt = i + 1;
        if (retryAttempt > 3) {
          return throwError(error);
        }
        log.push(error);
        return timer(retryAttempt * 1);
      }),
      finalize(() => finalizer()),
    );

  const errorGenerator = () => {
    return throwError(new Error('error emit'));
  };
  beforeEach(() => {
    log = [];
  });

  it('should retry max 3 times', (done: DoneFn) => {
    errorGenerator()
      .pipe(
        retryWhen(
          genericRetryStrategy(() => {
            expect(log.length).toBe(3);
            done();
          }),
        ),
        catchError((error) => of(error)),
      )
      .subscribe();
  });
});
