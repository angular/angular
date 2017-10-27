import {TestBed, inject} from '@angular/core/testing';
import {dispatchKeyboardEvent} from '@angular/cdk/testing';
import {ESCAPE} from '@angular/cdk/keycodes';
import {Overlay} from '../overlay';
import {OverlayContainer} from '../overlay-container';
import {OverlayModule} from '../index';
import {OverlayKeyboardDispatcher} from './overlay-keyboard-dispatcher';

describe('OverlayKeyboardDispatcher', () => {
  let keyboardDispatcher: OverlayKeyboardDispatcher;
  let overlay: Overlay;
  let overlayContainerElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }}
      ],
    });
  });

  beforeEach(inject([OverlayKeyboardDispatcher, Overlay],
        (kbd: OverlayKeyboardDispatcher, o: Overlay) => {
    keyboardDispatcher = kbd;
    overlay = o;
  }));

  it('should track overlays in order as they are attached and detached', () => {
    const overlayOne = overlay.create();
    const overlayTwo = overlay.create();

    // Attach overlays
    keyboardDispatcher.add(overlayOne);
    keyboardDispatcher.add(overlayTwo);

    expect(keyboardDispatcher._attachedOverlays.length)
        .toBe(2, 'Expected both overlays to be tracked.');
    expect(keyboardDispatcher._attachedOverlays[0]).toBe(overlayOne, 'Expected one to be first.');
    expect(keyboardDispatcher._attachedOverlays[1]).toBe(overlayTwo, 'Expected two to be last.');

    // Detach first one and re-attach it
    keyboardDispatcher.remove(overlayOne);
    keyboardDispatcher.add(overlayOne);

    expect(keyboardDispatcher._attachedOverlays[0])
        .toBe(overlayTwo, 'Expected two to now be first.');
    expect(keyboardDispatcher._attachedOverlays[1])
        .toBe(overlayOne, 'Expected one to now be last.');
  });

  it('should dispatch body keyboard events to the most recently attached overlay', () => {
    const overlayOne = overlay.create();
    const overlayTwo = overlay.create();
    const overlayOneSpy = jasmine.createSpy('overlayOne keyboard event spy');
    const overlayTwoSpy = jasmine.createSpy('overlayOne keyboard event spy');

    overlayOne.keydownEvents().subscribe(overlayOneSpy);
    overlayTwo.keydownEvents().subscribe(overlayTwoSpy);

    // Attach overlays
    keyboardDispatcher.add(overlayOne);
    keyboardDispatcher.add(overlayTwo);

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

    // Most recent overlay should receive event
    expect(overlayOneSpy).not.toHaveBeenCalled();
    expect(overlayTwoSpy).toHaveBeenCalled();
  });

  it('should dispatch targeted keyboard events to the overlay containing that target', () => {
    const overlayOne = overlay.create();
    const overlayTwo = overlay.create();
    const overlayOneSpy = jasmine.createSpy('overlayOne keyboard event spy');
    const overlayTwoSpy = jasmine.createSpy('overlayOne keyboard event spy');

    overlayOne.keydownEvents().subscribe(overlayOneSpy);
    overlayTwo.keydownEvents().subscribe(overlayTwoSpy);

    // Attach overlays
    keyboardDispatcher.add(overlayOne);
    keyboardDispatcher.add(overlayTwo);

    const overlayOnePane = overlayOne.overlayElement;

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE, overlayOnePane);

    // Targeted overlay should receive event
    expect(overlayOneSpy).toHaveBeenCalled();
    expect(overlayTwoSpy).not.toHaveBeenCalled();
  });

});
