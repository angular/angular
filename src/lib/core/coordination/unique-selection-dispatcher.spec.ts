import {UniqueSelectionDispatcher} from './unique-selection-dispatcher';


describe('Unique selection dispatcher', () => {

  describe('register', () => {
    it('once unregistered the listener must not be called on notify', (done) => {
      let dispatcher: UniqueSelectionDispatcher = new UniqueSelectionDispatcher();
      let called = false;

      // Register first listener
      dispatcher.listen(() => {
        called = true;
      });

      // Register a listener
      let deregisterFn = dispatcher.listen(() => {
        done.fail('Should not be called');
      });

      // Unregister
      deregisterFn();

      // Call registered listeners
      dispatcher.notify('testId', 'testName');

      expect(called).toBeTruthy('Registered listener must be called.');

      done();
    });
  });
});
