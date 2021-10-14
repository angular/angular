import {mixinTabIndex} from './tabindex';

describe('mixinTabIndex', () => {
  it('should augment an existing class with a tabIndex property', () => {
    const classWithMixin = mixinTabIndex(TestClass);
    const instance = new classWithMixin();

    expect(instance.tabIndex)
      .withContext('Expected the mixed-into class to have a tabIndex property')
      .toBe(0);

    instance.tabIndex = 4;

    expect(instance.tabIndex)
      .withContext('Expected the mixed-into class to have an updated tabIndex property')
      .toBe(4);
  });

  it('should set tabIndex to `-1` if the disabled property is set to true', () => {
    const classWithMixin = mixinTabIndex(TestClass);
    const instance = new classWithMixin();

    expect(instance.tabIndex).withContext('Expected tabIndex to be set to 0 initially').toBe(0);

    instance.disabled = true;

    expect(instance.tabIndex)
      .withContext('Expected tabIndex to be set to -1 if the disabled property is set to true')
      .toBe(-1);
  });

  it('should allow having a custom default tabIndex value', () => {
    const classWithMixin = mixinTabIndex(TestClass, 20);
    const instance = new classWithMixin();

    expect(instance.tabIndex).withContext('Expected tabIndex to be set to 20 initially').toBe(20);

    instance.tabIndex = 0;

    expect(instance.tabIndex).withContext('Expected tabIndex to still support 0 as value').toBe(0);
  });

  it('should allow for the default tabIndex to change after init', () => {
    const classWithMixin = mixinTabIndex(TestClass, 20);
    const instance = new classWithMixin();

    expect(instance.tabIndex).toBe(20);

    instance.defaultTabIndex = 50;
    instance.tabIndex = undefined!;

    expect(instance.tabIndex).toBe(50);
  });
});

class TestClass {
  disabled = false;
}
