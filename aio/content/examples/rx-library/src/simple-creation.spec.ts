import { of } from 'rxjs';
import { docRegionAjax } from './simple-creation';

describe('ajax', () => {
  it('should make a request and console log the status and response', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    const ajax = jasmine.createSpy('ajax').and.callFake((url: string) => {
      return of({status: 200, response: 'foo bar'});
    });

    docRegionAjax(consoleSpy, ajax);
    expect(consoleSpy.log).toHaveBeenCalledWith(200, 'foo bar');
  });
});
