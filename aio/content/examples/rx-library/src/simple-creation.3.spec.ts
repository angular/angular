import { docRegionEvent } from './simple-creation.3';

describe('simple-creation.3', () => {
  let triggerMousemove;
  let mockConsole;
  let input;
  let mockDocument;

  beforeEach(() => {
    mockConsole = {log: jasmine.createSpy('log')};
    input = {
      addEventListener: jasmine
        .createSpy('addEventListener')
        .and.callFake((eventName, cb) => {
          if (eventName === 'mousemove') {
            triggerMousemove = cb;
          }
        }),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    };
    mockDocument = { getElementById: () => input };
  });

  it('should log coords when subscribing', () => {
    docRegionEvent(mockConsole, mockDocument);

    expect(mockConsole.log).not.toHaveBeenCalled();

    triggerMousemove({ clientX: 50, clientY: 50 });
    triggerMousemove({ clientX: 30, clientY: 50 });
    triggerMousemove({ clientX: 50, clientY: 30 });
    expect(mockConsole.log).toHaveBeenCalledTimes(3);
    expect(mockConsole.log.calls.allArgs()).toEqual([
      ['Coords: 50 X 50'],
      ['Coords: 30 X 50'],
      ['Coords: 50 X 30']
    ]);
  });

  it('should call unsubscribe when clientX and clientY are below < 40 ', () => {
    docRegionEvent(mockConsole, mockDocument);

    expect(mockConsole.log).not.toHaveBeenCalled();

    // Ensure that we have unsubscribed.
    triggerMousemove({ clientX: 30, clientY: 30 });
    expect(input.removeEventListener).toHaveBeenCalledWith('mousemove', triggerMousemove, undefined);
    mockConsole.log.calls.reset();

    triggerMousemove({ clientX: 50, clientY: 50 });
    expect(mockConsole.log).not.toHaveBeenCalled();
  });
});
