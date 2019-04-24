import {mixinTabIndex} from './tabindex';

describe('mixinTabIndex', () => {

  it('should augment an existing class with a tabIndex property', () => {
    const classWithMixin = mixinTabIndex(TestClass);
    const instance = new classWithMixin();

    expect(instance.tabIndex)
      .toBe(0, 'Expected the mixed-into class to have a tabIndex property');

    instance.tabIndex = 4;

    expect(instance.tabIndex)
      .toBe(4, 'Expected the mixed-into class to have an updated tabIndex property');
  });

  it('should set tabIndex to `-1` if the disabled property is set to true', () => {
    const classWithMixin = mixinTabIndex(TestClass);
    const instance = new classWithMixin();

    expect(instance.tabIndex)
      .toBe(0, 'Expected tabIndex to be set to 0 initially');

    instance.disabled = true;

    expect(instance.tabIndex)
      .toBe(-1, 'Expected tabIndex to be set to -1 if the disabled property is set to true');
  });

  it('should allow having a custom default tabIndex value', () => {
    const classWithMixin = mixinTabIndex(TestClass, 20);
    const instance = new classWithMixin();

    expect(instance.tabIndex)
      .toBe(20, 'Expected tabIndex to be set to 20 initially');

    instance.tabIndex = 0;

    expect(instance.tabIndex)
      .toBe(0, 'Expected tabIndex to still support 0 as value');
  });

});

class TestClass {
  disabled = false;
}
