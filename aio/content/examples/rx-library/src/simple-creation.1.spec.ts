import { of } from 'rxjs';
import { docRegionPromise } from './simple-creation.1';

describe('simple-creation.1', () => {
  it('should create a promise from an observable and return an empty object', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    const fetch = () => of({foo: 42});
    docRegionPromise(consoleSpy, fetch);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      [{foo: 42}],
      ['Completed'],
    ]);
  });
});
