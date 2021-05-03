import { of } from 'rxjs';
import { docRegionPromise } from './simple-creation.1';

describe('simple-creation.1', () => {
  it('should create a promise from an observable and return an empty object', () => {
    const console = {log: jasmine.createSpy('log')};
    const fetch = () => of({foo: 42});
    docRegionPromise(console, fetch);
    expect(console.log.calls.allArgs()).toEqual([
      [{foo: 42}],
      ['Completed'],
    ]);
  });
});
