import { Subject, throwError } from 'rxjs';
import { docRegionDefault } from './error-handling';

describe('error-handling', () => {
  let mockConsole;
  let ajaxSubject;
  let ajax;

  beforeEach(() => {
    mockConsole = {log: jasmine.createSpy('log')};
    ajaxSubject = new Subject();
    ajax = jasmine
      .createSpy('ajax')
      .and.callFake((url: string) => ajaxSubject);
  });

  afterEach(() => ajaxSubject.unsubscribe());

  it('should return the response object', () => {
    docRegionDefault(mockConsole, ajax);

    ajaxSubject.next({response: {foo: 'bar'}});
    expect(mockConsole.log.calls.allArgs()).toEqual([
      ['data: ', {foo: 'bar'}]
    ]);
  });

  it('should return an empty array when using an object without a `response` property', () => {
    docRegionDefault(mockConsole, ajax);

    ajaxSubject.next({foo: 'bar'});
    expect(mockConsole.log.calls.allArgs()).toEqual([
      ['data: ', []]
    ]);
  });

  it('should return an empty array when the ajax observable errors', () => {
    ajax.and.returnValue(throwError('Test Error'));

    docRegionDefault(mockConsole, ajax);

    expect(mockConsole.log.calls.allArgs()).toEqual([
      ['data: ', []]
    ]);
  });
});
