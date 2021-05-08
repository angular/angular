import { docRegionInterval } from './simple-creation.2';

describe('simple-creation.2', () => {
  beforeEach(() => jasmine.clock().install());
  afterEach(() => jasmine.clock().uninstall());

  it('should create an Observable that will publish a value on an interval', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    const subscription = docRegionInterval(consoleSpy);
    jasmine.clock().tick(1000);
    expect(consoleSpy.log).toHaveBeenCalledWith('It\'s been 1 seconds since subscribing!');
    consoleSpy.log.calls.reset();

    jasmine.clock().tick(999);
    expect(consoleSpy.log).not.toHaveBeenCalled();

    jasmine.clock().tick(1);
    expect(consoleSpy.log).toHaveBeenCalledWith('It\'s been 2 seconds since subscribing!');
    subscription.unsubscribe();
  });
});
