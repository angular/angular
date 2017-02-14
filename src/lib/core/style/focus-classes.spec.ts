import {async, ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {Component, Renderer, ViewChild} from '@angular/core';
import {StyleModule} from './index';
import {By} from '@angular/platform-browser';
import {TAB} from '../keyboard/keycodes';
import {FocusOriginMonitor, FocusOrigin, CdkFocusClasses, TOUCH_BUFFER_MS} from './focus-classes';

describe('FocusOriginMonitor', () => {
  let fixture: ComponentFixture<PlainButton>;
  let buttonElement: HTMLElement;
  let buttonRenderer: Renderer;
  let focusOriginMonitor: FocusOriginMonitor;
  let changeHandler: (origin: FocusOrigin) => void;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StyleModule],
      declarations: [
        PlainButton,
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([FocusOriginMonitor], (fom: FocusOriginMonitor) => {
    fixture = TestBed.createComponent(PlainButton);
    fixture.detectChanges();

    buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    buttonRenderer = fixture.componentInstance.renderer;
    focusOriginMonitor = fom;

    changeHandler = jasmine.createSpy('focus origin change handler');
    focusOriginMonitor.registerElementForFocusClasses(buttonElement, buttonRenderer)
        .subscribe(changeHandler);

    // Patch the element focus to properly emit focus events when the browser is blurred.
    patchElementFocus(buttonElement);
  }));

  it('manually registered element should receive focus classes', async(() => {
    buttonElement.focus();
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(changeHandler).toHaveBeenCalledTimes(1);
    }, 0);
  }));

  it('should detect focus via keyboard', async(() => {
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
      expect(changeHandler).toHaveBeenCalledWith('keyboard');
    }, 0);
  }));

  it('should detect focus via mouse', async(() => {
    // Simulate focus via mouse.
    dispatchMousedownEvent(buttonElement);
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
      expect(changeHandler).toHaveBeenCalledWith('mouse');
    }, 0);
  }));

  it('should detect focus via touch', async(() => {
    // Simulate focus via touch.
    dispatchTouchstartEvent(buttonElement);
    buttonElement.focus();
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-touch-focused'))
          .toBe(true, 'button should have cdk-touch-focused class');
      expect(changeHandler).toHaveBeenCalledWith('touch');
    }, TOUCH_BUFFER_MS);
  }));

  it('should detect programmatic focus', async(() => {
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
      expect(changeHandler).toHaveBeenCalledWith('program');
    }, 0);
  }));

  it('focusVia keyboard should simulate keyboard focus', async(() => {
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
      expect(changeHandler).toHaveBeenCalledWith('keyboard');
    }, 0);
  }));

  it('focusVia mouse should simulate mouse focus', async(() => {
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
      expect(changeHandler).toHaveBeenCalledWith('mouse');
    }, 0);
  }));

  it('focusVia mouse should simulate mouse focus', async(() => {
    focusOriginMonitor.focusVia(buttonElement, buttonRenderer, 'touch');
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-touch-focused'))
          .toBe(true, 'button should have cdk-touch-focused class');
      expect(changeHandler).toHaveBeenCalledWith('touch');
    }, 0);
  }));

  it('focusVia program should simulate programmatic focus', async(() => {
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
      expect(changeHandler).toHaveBeenCalledWith('program');
    }, 0);
  }));

  it('should remove focus classes on blur', async(() => {
    buttonElement.focus();
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(changeHandler).toHaveBeenCalledWith('program');

      buttonElement.blur();
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(0, 'button should not have any focus classes');
      expect(changeHandler).toHaveBeenCalledWith(null);
    }, 0);
  }));
});


describe('cdkFocusClasses', () => {
  let fixture: ComponentFixture<ButtonWithFocusClasses>;
  let buttonElement: HTMLElement;
  let changeHandler: (origin: FocusOrigin) => void;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StyleModule],
      declarations: [
        ButtonWithFocusClasses,
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonWithFocusClasses);
    fixture.detectChanges();

    changeHandler = jasmine.createSpy('focus origin change handler');
    fixture.componentInstance.cdkFocusClasses.changes.subscribe(changeHandler);
    buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;

    // Patch the element focus to properly emit focus events when the browser is blurred.
    patchElementFocus(buttonElement);
  });

  it('should initially not be focused', () => {
    expect(buttonElement.classList.length).toBe(0, 'button should not have focus classes');
  });

  it('should detect focus via keyboard', async(() => {
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
      expect(changeHandler).toHaveBeenCalledWith('keyboard');
    }, 0);
  }));

  it('should detect focus via mouse', async(() => {
    // Simulate focus via mouse.
    dispatchMousedownEvent(buttonElement);
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
      expect(changeHandler).toHaveBeenCalledWith('mouse');
    }, 0);
  }));

  it('should detect focus via touch', async(() => {
    // Simulate focus via touch.
    dispatchTouchstartEvent(buttonElement);
    buttonElement.focus();
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-touch-focused'))
          .toBe(true, 'button should have cdk-touch-focused class');
      expect(changeHandler).toHaveBeenCalledWith('touch');
    }, TOUCH_BUFFER_MS);
  }));

  it('should detect programmatic focus', async(() => {
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
      expect(changeHandler).toHaveBeenCalledWith('program');
    }, 0);
  }));

  it('should remove focus classes on blur', async(() => {
    buttonElement.focus();
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(changeHandler).toHaveBeenCalledWith('program');

      buttonElement.blur();
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(0, 'button should not have any focus classes');
      expect(changeHandler).toHaveBeenCalledWith(null);
    }, 0);
  }));
});


@Component({template: `<button>focus me!</button>`})
class PlainButton {
  constructor(public renderer: Renderer) {}
}


@Component({template: `<button cdkFocusClasses>focus me!</button>`})
class ButtonWithFocusClasses {
  @ViewChild(CdkFocusClasses) cdkFocusClasses: CdkFocusClasses;
}

// TODO(devversion): move helper functions into a global utility file. See #2902

/** Dispatches a mousedown event on the specified element. */
function dispatchMousedownEvent(element: Node) {
  let event = document.createEvent('MouseEvent');
  event.initMouseEvent(
      'mousedown', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  element.dispatchEvent(event);
}

/** Dispatches a mousedown event on the specified element. */
function dispatchTouchstartEvent(element: Node) {
  let event = document.createEvent('MouseEvent');
  event.initMouseEvent(
      'touchstart', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
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

/** Dispatches a focus event on the specified element. */
function dispatchFocusEvent(element: Node, type = 'focus') {
  let event = document.createEvent('Event');
  event.initEvent(type, true, true);
  element.dispatchEvent(event);
}

/**
 * Patches an elements focus and blur methods to properly emit focus events when the browser is
 * blurred.
 */
function patchElementFocus(element: HTMLElement) {
  // On Saucelabs, browsers will run simultaneously and therefore can't focus all browser windows
  // at the same time. This is problematic when testing focus states. Chrome and Firefox
  // only fire FocusEvents when the window is focused. This issue also appears locally.
  let _nativeButtonFocus = element.focus.bind(element);
  let _nativeButtonBlur = element.blur.bind(element);

  element.focus = () => {
    document.hasFocus() ? _nativeButtonFocus() : dispatchFocusEvent(element);
  };
  element.blur = () => {
    document.hasFocus() ? _nativeButtonBlur() : dispatchFocusEvent(element, 'blur');
  };
}
