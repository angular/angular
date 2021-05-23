import { Observable, Subscription } from 'rxjs';
import { docRegionDelaySequence, docRegionMulticastSequence } from './multicasting';

describe('multicasting', () => {
  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create an observable and emit in sequence', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    docRegionDelaySequence(consoleSpy);
    jasmine.clock().tick(10000);
    expect(consoleSpy.log).toHaveBeenCalledTimes(12);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      [1],
      ['1st subscribe: 1'],
      ['2nd subscribe: 1'],
      [2],
      ['1st subscribe: 2'],
      ['2nd subscribe: 2'],
      [3],
      ['Finished sequence'],
      ['1st subscribe: 3'],
      ['1st sequence finished.'],
      ['2nd subscribe: 3'],
      ['2nd sequence finished.'],
    ]);
  });

  it('should create an observable and multicast the emissions', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    docRegionMulticastSequence(consoleSpy, /* runSequence */ true);
    jasmine.clock().tick(10000);
    expect(consoleSpy.log).toHaveBeenCalledTimes(10);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      ['Emitting 1'],
      ['1st subscribe: 1'],
      ['Emitting 2'],
      ['1st subscribe: 2'],
      ['2nd subscribe: 2'],
      ['Emitting 3'],
      ['1st subscribe: 3'],
      ['2nd subscribe: 3'],
      ['1st sequence finished.'],
      ['2nd sequence finished.'],
    ]);
  });

  it('should stop the sequence emission when the last observer unsubscribes from a multicast observable',
    () => {
      const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
      const multicastSequenceSubscriber =
        docRegionMulticastSequence(consoleSpy, /* runSequence */ false);

      const multicastSequence = new Observable(multicastSequenceSubscriber());

      const subscription1 = multicastSequence.subscribe({
        next(num) {
          consoleSpy.log('1st subscribe: ' + num);
        },
        complete() {
          consoleSpy.log('1st sequence finished.');
        }
      });

      let subscription2: Subscription;
      setTimeout(() => {
        subscription2 = multicastSequence.subscribe({
          next(num) {
            consoleSpy.log('2nd subscribe: ' + num);
          },
          complete() {
            consoleSpy.log('2nd sequence finished.');
          }
        });
      }, 1500);

      setTimeout(() => subscription1.unsubscribe(), 2500);
      setTimeout(() => subscription2.unsubscribe(), 2800);

      jasmine.clock().tick(5000);

      expect(consoleSpy.log).toHaveBeenCalledTimes(5);
      expect(consoleSpy.log.calls.allArgs()).toEqual([
        ['Emitting 1'],
        ['1st subscribe: 1'],
        ['Emitting 2'],
        ['1st subscribe: 2'],
        ['2nd subscribe: 2'],
      ]);
    });
});
