import { docRegionEvent } from './simple-creation.3';

describe('simple-creation.3', () => {
  let triggerMousemove: (event: Partial<MouseEvent>) => void;
  let consoleSpy: jasmine.SpyObj<Console>;
  let input: HTMLInputElement;
  let mockDocument: Document;

  beforeEach(() => {
    consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    input = {
      addEventListener: jasmine
        .createSpy('addEventListener')
        .and.callFake((eventName, cb) => {
          if (eventName === 'mousemove') {
            triggerMousemove = cb;
          }
        }),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    } as unknown as HTMLInputElement;
    mockDocument = { getElementById: () => input } as unknown as Document;
  });

  it('should log coords when subscribing', () => {
    docRegionEvent(consoleSpy, mockDocument);

    expect(consoleSpy.log).not.toHaveBeenCalled();

    triggerMousemove({ clientX: 50, clientY: 50 });
    triggerMousemove({ clientX: 30, clientY: 50 });
    triggerMousemove({ clientX: 50, clientY: 30 });
    expect(consoleSpy.log).toHaveBeenCalledTimes(3);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      ['Coords: 50 X 50'],
      ['Coords: 30 X 50'],
      ['Coords: 50 X 30']
    ]);
  });

  it('should call unsubscribe when clientX and clientY are below < 40 ', () => {
    docRegionEvent(consoleSpy, mockDocument);

    expect(consoleSpy.log).not.toHaveBeenCalled();

    // Ensure that we have unsubscribed.
    triggerMousemove({ clientX: 30, clientY: 30 });
    expect(input.removeEventListener).toHaveBeenCalledWith('mousemove', triggerMousemove, undefined);
    consoleSpy.log.calls.reset();

    triggerMousemove({ clientX: 50, clientY: 50 });
    expect(consoleSpy.log).not.toHaveBeenCalled();
  });
});
