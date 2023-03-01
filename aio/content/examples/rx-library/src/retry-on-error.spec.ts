import { of, throwError } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { docRegionDefault } from './retry-on-error';

describe('retry-on-error', () => {
  let consoleSpy: jasmine.SpyObj<Console>;
  beforeEach(() => consoleSpy = jasmine.createSpyObj<Console>('console', ['log']));

  it('should return the response object', () => {
    const ajax = () => of({ response: { foo: 'bar' } });

    docRegionDefault(consoleSpy, ajax);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      ['data: ', { foo: 'bar' }],
    ]);
  });

  it('should return an empty array after 3 retries + 1 initial request', () => {
    const ajax =
        () => of({ noresponse: true }).pipe(tap(() => consoleSpy.log('Subscribed to AJAX')));

    docRegionDefault(consoleSpy, ajax);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      ['Subscribed to AJAX'],
      ['Error occurred.'],
      ['Subscribed to AJAX'],
      ['Error occurred.'],
      ['Subscribed to AJAX'],
      ['Error occurred.'],
      ['Subscribed to AJAX'],
      ['Error occurred.'],
      ['data: ', []],
    ]);
  });

  it('should return the response if the request succeeds upon retrying', () => {
    // Fail on the first two requests, but succeed from the 3rd onwards.
    let failCount = 2;
    const ajax = () => of(null).pipe(
      tap(() => consoleSpy.log('Subscribed to AJAX')),
      // Fail on the first 2 requests, but succeed from the 3rd onwards.
      mergeMap(() => {
        if (failCount > 0) {
          failCount--;
          return throwError('Test error');
        }
        return of({ response: { foo: 'bar' } });
      }),
    );

    docRegionDefault(consoleSpy, ajax);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      ['Subscribed to AJAX'],  // Initial request   | 1st attempt overall
      ['Subscribed to AJAX'],  // 1st retry attempt | 2nd attempt overall
      ['Subscribed to AJAX'],  // 2nd retry attempt | 3rd attempt overall
      ['data: ', { foo: 'bar' }],
    ]);
  });

  it('should return an empty array when the ajax observable throws an error', () => {
    const ajax = () => throwError('Test Error');

    docRegionDefault(consoleSpy, ajax);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      ['data: ', []],
    ]);
  });
});
