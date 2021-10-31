import { docRegionFromEvent, docRegionSubscriber } from './creating';

describe('observables', () => {
  it('should create an observable using the constructor', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    docRegionSubscriber(consoleSpy);
    expect(consoleSpy.log).toHaveBeenCalledTimes(4);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      [1],
      [2],
      [3],
      ['Finished sequence'],
    ]);
  });

  it('should listen to input changes', () => {
    let triggerInputChange!: (e: {code: string}) => void;
    const input = {
      value: 'Test',
      addEventListener: jasmine
        .createSpy('addEvent')
        .and.callFake((eventName: string, cb: (e: {code: string}) => void) => {
          if (eventName === 'keydown') {
            triggerInputChange = cb;
          }
        }),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    };

    const document = { getElementById: () => input } as unknown as Document;
    docRegionFromEvent(document);
    triggerInputChange({code: 'A'});
    expect(input.value).toBe('Test');

    triggerInputChange({code: 'Escape'});
    expect(input.value).toBe('');
  });

  it('should call removeEventListener when unsubscribing', (doneFn: DoneFn) => {
    const input = {
      addEventListener: jasmine.createSpy('addEvent'),
      removeEventListener: jasmine
        .createSpy('removeEvent')
        .and.callFake((eventName: string) => {
          if (eventName === 'keydown') {
            doneFn();
          }
        })
    };

    const document = { getElementById: () => input } as unknown as Document;
    const subscription = docRegionFromEvent(document);
    subscription.unsubscribe();
  });
});
