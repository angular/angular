import {mixinDisabled} from './disabled';


describe('MixinDisabled', () => {
  it('should augment an existing class with a disabled property', () => {
    class EmptyClass { }

    let classWithDisabled = mixinDisabled(EmptyClass);
    let instance = new classWithDisabled();

    expect(instance.disabled)
        .toBe(false, 'Expected the mixed-into class to have a disabled property');

    instance.disabled = true;
    expect(instance.disabled)
        .toBe(true, 'Expected the mixed-into class to have an updated disabled property');
  });
});
