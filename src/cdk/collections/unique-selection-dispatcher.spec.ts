import {UniqueSelectionDispatcher} from './unique-selection-dispatcher';


describe('Unique selection dispatcher', () => {
  let dispatcher: UniqueSelectionDispatcher;

  beforeEach(() => dispatcher = new UniqueSelectionDispatcher());

  it('should notify registered listeners', () => {
    const spy = jasmine.createSpy('listen handler');

    dispatcher.listen(spy);
    dispatcher.notify('id', 'name');

    expect(spy).toHaveBeenCalledWith('id', 'name');
  });

  it('should not notify unregistered listeners', () => {
    const spy = jasmine.createSpy('listen handler');
    const unregister = dispatcher.listen(spy);

    unregister();
    dispatcher.notify('id', 'name');

    expect(spy).not.toHaveBeenCalled();
  });

  it('should remove all listeners when destroyed', () => {
    const spy = jasmine.createSpy('listen handler');
    dispatcher.listen(spy);

    dispatcher.ngOnDestroy();
    dispatcher.notify('id', 'name');

    expect(spy).not.toHaveBeenCalled();
  });
});
