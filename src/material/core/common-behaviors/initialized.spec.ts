import {mixinInitialized} from './initialized';
import {HasInitialized} from '@angular/material/core';

describe('MixinHasInitialized', () => {
  class EmptyClass {}
  let instance: HasInitialized;

  beforeEach(() => {
    const classWithHasInitialized = mixinInitialized(EmptyClass);
    instance = new classWithHasInitialized();
  });

  it('should emit for subscriptions made before the directive was marked as initialized', done => {
    // Listen for an event from the initialized stream and mark the test as done when it emits.
    instance.initialized.subscribe(() => done());

    // Mark the class as initialized so that the stream emits and the test completes.
    instance._markInitialized();
  });

  it('should emit for subscriptions made after the directive was marked as initialized', done => {
    // Mark the class as initialized so the stream emits when subscribed and the test completes.
    instance._markInitialized();

    // Listen for an event from the initialized stream and mark the test as done when it emits.
    instance.initialized.subscribe(() => done());
  });

  it('should emit for multiple subscriptions made before and after marked as initialized', done => {
    // Should expect the number of notifications to match the number of subscriptions.
    const expectedNotificationCount = 4;
    let currentNotificationCount = 0;

    // Function that completes the test when the number of notifications meets the expectation.
    function onNotified() {
      currentNotificationCount++;
      if (currentNotificationCount === expectedNotificationCount) {
        done();
      }
    }

    instance.initialized.subscribe(onNotified); // Subscription 1
    instance.initialized.subscribe(onNotified); // Subscription 2

    instance._markInitialized();

    instance.initialized.subscribe(onNotified); // Subscription 3
    instance.initialized.subscribe(onNotified); // Subscription 4
  });
});
