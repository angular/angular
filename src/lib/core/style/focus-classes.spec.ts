import {async, ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {Component, Renderer} from '@angular/core';
import {StyleModule} from './index';
import {By} from '@angular/platform-browser';
import {TAB} from '../keyboard/keycodes';
import {FocusOriginMonitor} from './focus-classes';
import {PlatformModule} from '../platform/index';
import {Platform} from '../platform/platform';


// NOTE: Firefox only fires focus & blur events when it is the currently active window.
// This is not always the case on our CI setup, therefore we disable tests that depend on these
// events firing for Firefox. We may be able to fix this by configuring our CI to start Firefox with
// the following preference: focusmanager.testmode = true


describe('FocusOriginMonitor', () => {
  let fixture: ComponentFixture<PlainButton>;
  let buttonElement: HTMLElement;
  let buttonRenderer: Renderer;
  let focusOriginMonitor: FocusOriginMonitor;
  let platform: Platform;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StyleModule, PlatformModule],
      declarations: [
        PlainButton,
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([FocusOriginMonitor, Platform], (fom: FocusOriginMonitor, pfm: Platform) => {
    fixture = TestBed.createComponent(PlainButton);
    fixture.detectChanges();

    buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    buttonRenderer = fixture.componentInstance.renderer;
    focusOriginMonitor = fom;
    platform = pfm;

    focusOriginMonitor.registerElementForFocusClasses(buttonElement, buttonRenderer);
  }));

  it('manually registered element should receive focus classes', async(() => {
    if (platform.FIREFOX) { return; }

    buttonElement.focus();
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
    }, 0);
  }));

  it('should detect focus via keyboard', async(() => {
    if (platform.FIREFOX) { return; }

    // Simulate focus via keyboard.
    dispatchKeydownEvent(document, TAB);
    buttonElement.focus();
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-keyboard-focused'))
          .toBe(true, 'button should have cdk-keyboard-focused class');
    }, 0);
  }));

  it('should detect focus via mouse', async(() => {
    if (platform.FIREFOX) { return; }

    // Simulate focus via mouse.
    dispatchMousedownEvent(document);
    buttonElement.focus();
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-mouse-focused'))
          .toBe(true, 'button should have cdk-mouse-focused class');
    }, 0);
  }));

  it('should detect programmatic focus', async(() => {
    if (platform.FIREFOX) { return; }

    // Programmatically focus.
    buttonElement.focus();
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-program-focused'))
          .toBe(true, 'button should have cdk-program-focused class');
    }, 0);
  }));

  it('focusVia keyboard should simulate keyboard focus', async(() => {
    if (platform.FIREFOX) { return; }

    focusOriginMonitor.focusVia(buttonElement, buttonRenderer, 'keyboard');
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-keyboard-focused'))
          .toBe(true, 'button should have cdk-keyboard-focused class');
    }, 0);
  }));

  it('focusVia mouse should simulate mouse focus', async(() => {
    if (platform.FIREFOX) { return; }

    focusOriginMonitor.focusVia(buttonElement, buttonRenderer, 'mouse');
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-mouse-focused'))
          .toBe(true, 'button should have cdk-mouse-focused class');
    }, 0);
  }));

  it('focusVia program should simulate programmatic focus', async(() => {
    if (platform.FIREFOX) { return; }

    focusOriginMonitor.focusVia(buttonElement, buttonRenderer, 'program');
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-program-focused'))
          .toBe(true, 'button should have cdk-program-focused class');
    }, 0);
  }));
});


describe('cdkFocusClasses', () => {
  let fixture: ComponentFixture<ButtonWithFocusClasses>;
  let buttonElement: HTMLElement;
  let platform: Platform;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StyleModule, PlatformModule],
      declarations: [
        ButtonWithFocusClasses,
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([Platform], (pfm: Platform) => {
    fixture = TestBed.createComponent(ButtonWithFocusClasses);
    fixture.detectChanges();

    buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    platform = pfm;
  }));

  it('should initially not be focused', () => {
    expect(buttonElement.classList.length).toBe(0, 'button should not have focus classes');
  });

  it('should detect focus via keyboard', async(() => {
    if (platform.FIREFOX) { return; }

    // Simulate focus via keyboard.
    dispatchKeydownEvent(document, TAB);
    buttonElement.focus();
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-keyboard-focused'))
          .toBe(true, 'button should have cdk-keyboard-focused class');
    }, 0);
  }));

  it('should detect focus via mouse', async(() => {
    if (platform.FIREFOX) { return; }

    // Simulate focus via mouse.
    dispatchMousedownEvent(document);
    buttonElement.focus();
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-mouse-focused'))
          .toBe(true, 'button should have cdk-mouse-focused class');
    }, 0);
  }));

  it('should detect programmatic focus', async(() => {
    if (platform.FIREFOX) { return; }

    // Programmatically focus.
    buttonElement.focus();
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-program-focused'))
          .toBe(true, 'button should have cdk-program-focused class');
    }, 0);
  }));
});


@Component({template: `<button>focus me!</button>`})
class PlainButton {
  constructor(public renderer: Renderer) {}
}


@Component({template: `<button cdkFocusClasses>focus me!</button>`})
class ButtonWithFocusClasses {}


/** Dispatches a mousedown event on the specified element. */
function dispatchMousedownEvent(element: Node) {
  let event = document.createEvent('MouseEvent');
  event.initMouseEvent(
      'mousedown', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  element.dispatchEvent(event);
}


/** Dispatches a keydown event on the specified element. */
function dispatchKeydownEvent(element: Node, keyCode: number) {
  let event: any = document.createEvent('KeyboardEvent');
  (event.initKeyEvent || event.initKeyboardEvent).bind(event)(
      'keydown', true, true, window, 0, 0, 0, 0, 0, keyCode);
  Object.defineProperty(event, 'keyCode', {
    get: function() { return keyCode; }
  });
  element.dispatchEvent(event);
}
