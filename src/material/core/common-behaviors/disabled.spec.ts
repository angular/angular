import {mixinDisabled} from './disabled';

describe('MixinDisabled', () => {
  it('should augment an existing class with a disabled property', () => {
    class EmptyClass {}

    let classWithDisabled = mixinDisabled(EmptyClass);
    let instance = new classWithDisabled();

    expect(instance.disabled)
      .withContext('Expected the mixed-into class to have a disabled property')
      .toBe(false);

    instance.disabled = true;
    expect(instance.disabled)
      .withContext('Expected the mixed-into class to have an updated disabled property')
      .toBe(true);
  });
});
