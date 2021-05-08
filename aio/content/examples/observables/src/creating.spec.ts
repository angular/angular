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
    let triggerInputChange!: (e: {keyCode: number}) => void;
    const input = {
      value: 'Test',
      addEventListener: jasmine
        .createSpy('addEvent')
        .and.callFake((eventName: string, cb: (e: {keyCode: number}) => void) => {
          if (eventName === 'keydown') {
            triggerInputChange = cb;
          }
        }),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    };

    const document = { getElementById: () => input } as unknown as Document;
    docRegionFromEvent(document);
    triggerInputChange({keyCode: 65});
    expect(input.value).toBe('Test');

    triggerInputChange({keyCode: 27});
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
