import { docRegionObserver } from './subscribing';

describe('subscribing', () => {
  it('should subscribe and emit', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    docRegionObserver(consoleSpy);
    expect(consoleSpy.log).toHaveBeenCalledTimes(11);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      // Subscribe without parameters emits nothing
      // Subscribe with only a next() handler emits 3 values
      ['Observable emitted the next value: 1'],
      ['Observable emitted the next value: 2'],
      ['Observable emitted the next value: 3'],
      // Subscribe with an object parameter emits 3 values and the complete notification
      ['Observable emitted the next value: 1'],
      ['Observable emitted the next value: 2'],
      ['Observable emitted the next value: 3'],
      ['Observable emitted the complete notification'],
      // Subscribe with an object defined by functions emits 3 values and the complete notification
      ['Observable emitted the next value: 1'],
      ['Observable emitted the next value: 2'],
      ['Observable emitted the next value: 3'],
      ['Observable emitted the complete notification'],
    ]);
  });
});
