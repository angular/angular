import {mixinDisableRipple} from './disable-ripple';

describe('mixinDisableRipple', () => {
  it('should augment an existing class with a disableRipple property', () => {
    const classWithMixin = mixinDisableRipple(TestClass);
    const instance = new classWithMixin();

    expect(instance.disableRipple)
      .withContext('Expected the mixed-into class to have a disable-ripple property')
      .toBe(false);

    instance.disableRipple = true;

    expect(instance.disableRipple)
      .withContext('Expected the mixed-into class to have an updated disable-ripple property')
      .toBe(true);
  });

  it('should coerce values being passed to the disableRipple property', () => {
    const classWithMixin = mixinDisableRipple(TestClass);
    const instance = new classWithMixin();

    expect(instance.disableRipple)
      .withContext('Expected disableRipple to be set to false initially')
      .toBe(false);

    // Setting string values to the disableRipple property should be prevented by TypeScript's
    // type checking, but developers can still set string values from their template bindings.
    (instance as any).disableRipple = '';

    expect(instance.disableRipple)
      .withContext('Expected disableRipple to be set to true if an empty string is set as value')
      .toBe(true);
  });
});

class TestClass {}
