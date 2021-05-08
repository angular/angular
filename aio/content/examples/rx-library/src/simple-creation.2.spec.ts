import { docRegionInterval } from './simple-creation.2';

describe('simple-creation.2', () => {
  beforeEach(() => jasmine.clock().install());
  afterEach(() => jasmine.clock().uninstall());

  it('should create an Observable that will publish a value on an interval', () => {
    const spy = spyOn(console, 'log');
    const subscription = docRegionInterval(console);
    jasmine.clock().tick(1000);
    expect(spy).toHaveBeenCalledWith('It\'s been 1 seconds since subscribing!');
    spy.calls.reset();

    jasmine.clock().tick(999);
    expect(spy).not.toHaveBeenCalled();

    jasmine.clock().tick(1);
    expect(spy).toHaveBeenCalledWith('It\'s been 2 seconds since subscribing!');
    subscription.unsubscribe();
  });
});
