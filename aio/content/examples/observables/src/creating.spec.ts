import { docRegionFromEvent, docRegionSubscriber } from './creating';

describe('observables', () => {
  it('should create an observable using the constructor', () => {
    const console = {log: jasmine.createSpy('log')};
    docRegionSubscriber(console);
    expect(console.log).toHaveBeenCalledTimes(4);
    expect(console.log.calls.allArgs()).toEqual([
      [1],
      [2],
      [3],
      ['Finished sequence'],
    ]);
  });

  it('should listen to input changes', () => {
    let triggerInputChange;
    const input = {
      value: 'Test',
      addEventListener: jasmine
        .createSpy('addEvent')
        .and.callFake((eventName: string, cb: (e) => void) => {
          if (eventName === 'keydown') {
            triggerInputChange = cb;
          }
        }),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    };

    const document = { getElementById: () => input };
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
        .and.callFake((eventName: string, cb: (e) => void) => {
          if (eventName === 'keydown') {
            doneFn();
          }
        })
    };

    const document = { getElementById: () => input };
    const subscription = docRegionFromEvent(document);
    subscription.unsubscribe();
  });
});
