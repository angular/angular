import { of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { docRegionDefault } from './retry-on-error';

describe('retry-on-error', () => {
  let mockConsole;
  beforeEach(() => mockConsole = { log: jasmine.createSpy('log') });

  it('should return the response object', () => {
    const ajax = () => of({ response: { foo: 'bar' } });

    docRegionDefault(mockConsole, ajax);
    expect(mockConsole.log.calls.allArgs()).toEqual([
      ['data: ', { foo: 'bar' }],
    ]);
  });

  it('should return an empty array after 3 retries + 1 initial request', () => {
    const ajax = () => {
      return of({ noresponse: true }).pipe(tap(() => mockConsole.log('Subscribed to AJAX')));
    };

    docRegionDefault(mockConsole, ajax);
    expect(mockConsole.log.calls.allArgs()).toEqual([
      ['Subscribed to AJAX'],
      ['Error occured.'],
      ['Subscribed to AJAX'],
      ['Error occured.'],
      ['Subscribed to AJAX'],
      ['Error occured.'],
      ['Subscribed to AJAX'],
      ['Error occured.'],
      ['data: ', []],
    ]);
  });

  it('should return an empty array when the ajax observable throws an error', () => {
    const ajax = () => throwError('Test Error');

    docRegionDefault(mockConsole, ajax);
    expect(mockConsole.log.calls.allArgs()).toEqual([
      ['data: ', []],
    ]);
  });
});
