import {FocusTrapManager, ManagedFocusTrap} from './focus-trap-manager';

describe('FocusTrapManager', () => {
  let manager: FocusTrapManager;

  beforeEach(() => {
    manager = new FocusTrapManager();
  });

  it('Enables a FocusTrap when it is registered', () => {
    const focusTrap = new MockManagedFocusTrap();
    spyOn(focusTrap, '_enable');
    manager.register(focusTrap);
    expect(focusTrap._enable).toHaveBeenCalledTimes(1);
  });

  it('Disables a FocusTrap when it is deregistered', () => {
    const focusTrap = new MockManagedFocusTrap();
    spyOn(focusTrap, '_disable');
    manager.deregister(focusTrap);
    expect(focusTrap._disable).toHaveBeenCalledTimes(1);
  });

  it('Disables the previous FocusTrap when a new FocusTrap is registered', () => {
    const focusTrap1 = new MockManagedFocusTrap();
    const focusTrap2 = new MockManagedFocusTrap();
    spyOn(focusTrap1, '_disable');
    manager.register(focusTrap1);
    manager.register(focusTrap2);
    expect(focusTrap1._disable).toHaveBeenCalledTimes(1);
  });

  it('Filters duplicates before registering a new FocusTrap', () => {
    const focusTrap = new MockManagedFocusTrap();
    spyOn(focusTrap, '_disable');
    manager.register(focusTrap);
    manager.register(focusTrap);
    expect(focusTrap._disable).not.toHaveBeenCalled();
  });
});

class MockManagedFocusTrap implements ManagedFocusTrap {
  _enable() {}
  _disable() {}
  focusInitialElementWhenReady(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
