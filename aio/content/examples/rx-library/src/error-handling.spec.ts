import { Subject, throwError } from 'rxjs';
import { docRegionDefault } from './error-handling';

describe('error-handling', () => {
  let consoleSpy: jasmine.SpyObj<Console>;
  let ajaxSubject: Subject<any>;
  let ajax: jasmine.Spy;

  beforeEach(() => {
    consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    ajaxSubject = new Subject();
    ajax = jasmine
      .createSpy('ajax')
      .and.callFake((url: string) => ajaxSubject);
  });

  afterEach(() => ajaxSubject.unsubscribe());

  it('should return the response object', () => {
    docRegionDefault(consoleSpy, ajax);

    ajaxSubject.next({response: {foo: 'bar'}});
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      ['data: ', {foo: 'bar'}]
    ]);
  });

  it('should return an empty array when using an object without a `response` property', () => {
    docRegionDefault(consoleSpy, ajax);

    ajaxSubject.next({foo: 'bar'});
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      ['data: ', []]
    ]);
  });

  it('should return an empty array when the ajax observable errors', () => {
    ajax.and.returnValue(throwError('Test Error'));

    docRegionDefault(consoleSpy, ajax);

    expect(consoleSpy.log.calls.allArgs()).toEqual([
      ['data: ', []]
    ]);
  });
});
