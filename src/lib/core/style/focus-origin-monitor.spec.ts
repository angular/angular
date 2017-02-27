import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {Component, Renderer} from '@angular/core';
import {StyleModule} from './index';
import {By} from '@angular/platform-browser';
import {TAB} from '../keyboard/keycodes';
import {FocusOrigin, FocusOriginMonitor, TOUCH_BUFFER_MS} from './focus-origin-monitor';
import {
  dispatchFakeEvent, dispatchKeyboardEvent, dispatchMouseEvent
} from '../testing/dispatch-events';


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
    focusOriginMonitor.monitor(buttonElement, buttonRenderer, false).subscribe(changeHandler);

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
    dispatchKeyboardEvent(document, 'keydown', TAB);
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
    dispatchMouseEvent(buttonElement, 'mousedown');
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
    dispatchMouseEvent(buttonElement, 'touchstart');
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

  it('should remove classes on unmonitor', async(() => {
    buttonElement.focus();
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');

      focusOriginMonitor.unmonitor(buttonElement);
      fixture.detectChanges();

      expect(buttonElement.classList.length).toBe(0, 'button should not have any focus classes');
    }, 0);
  }));
});


describe('cdkMonitorFocus', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StyleModule],
      declarations: [
        ButtonWithFocusClasses,
        ComplexComponentWithMonitorElementFocus,
        ComplexComponentWithMonitorSubtreeFocus,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('button with cdkMonitorElementFocus', () => {
    let fixture: ComponentFixture<ButtonWithFocusClasses>;
    let buttonElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ButtonWithFocusClasses);
      fixture.detectChanges();

      spyOn(fixture.componentInstance, 'focusChanged');
      buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;

      // Patch the element focus to properly emit focus events when the browser is blurred.
      patchElementFocus(buttonElement);
    });

    it('should initially not be focused', () => {
      expect(buttonElement.classList.length).toBe(0, 'button should not have focus classes');
    });

    it('should detect focus via keyboard', async(() => {
      // Simulate focus via keyboard.
      dispatchKeyboardEvent(document, 'keydown', TAB);
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
        expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('keyboard');
      }, 0);
    }));

    it('should detect focus via mouse', async(() => {
      // Simulate focus via mouse.
      dispatchMouseEvent(buttonElement, 'mousedown');
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
        expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('mouse');
      }, 0);
    }));

    it('should detect focus via touch', async(() => {
      // Simulate focus via touch.
      dispatchMouseEvent(buttonElement, 'touchstart');
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
        expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('touch');
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
        expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('program');
      }, 0);
    }));

    it('should remove focus classes on blur', async(() => {
      buttonElement.focus();
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();

        expect(buttonElement.classList.length)
            .toBe(2, 'button should have exactly 2 focus classes');
        expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('program');

        buttonElement.blur();
        fixture.detectChanges();

        expect(buttonElement.classList.length)
            .toBe(0, 'button should not have any focus classes');
        expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith(null);
      }, 0);
    }));
  });

  describe('complex component with cdkMonitorElementFocus', () => {
    let fixture: ComponentFixture<ComplexComponentWithMonitorElementFocus>;
    let parentElement: HTMLElement;
    let childElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ComplexComponentWithMonitorElementFocus);
      fixture.detectChanges();

      parentElement = fixture.debugElement.query(By.css('div')).nativeElement;
      childElement = fixture.debugElement.query(By.css('button')).nativeElement;

      // Patch the element focus to properly emit focus events when the browser is blurred.
      patchElementFocus(parentElement);
      patchElementFocus(childElement);
    });

    it('should add focus classes on parent focus', async(() => {
      parentElement.focus();
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();

        expect(parentElement.classList.length)
            .toBe(2, 'button should have exactly 2 focus classes');
      }, 0);
    }));

    it('should not add focus classes on child focus', async(() => {
      childElement.focus();
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();

        expect(parentElement.classList.length)
            .toBe(0, 'button should not have any focus classes');
      }, 0);
    }));
  });

  describe('complex component with cdkMonitorSubtreeFocus', () => {
    let fixture: ComponentFixture<ComplexComponentWithMonitorSubtreeFocus>;
    let parentElement: HTMLElement;
    let childElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ComplexComponentWithMonitorSubtreeFocus);
      fixture.detectChanges();

      parentElement = fixture.debugElement.query(By.css('div')).nativeElement;
      childElement = fixture.debugElement.query(By.css('button')).nativeElement;

      // Patch the element focus to properly emit focus events when the browser is blurred.
      patchElementFocus(parentElement);
      patchElementFocus(childElement);
    });

    it('should add focus classes on parent focus', async(() => {
      parentElement.focus();
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();

        expect(parentElement.classList.length)
            .toBe(2, 'button should have exactly 2 focus classes');
      }, 0);
    }));

    it('should add focus classes on child focus', async(() => {
      childElement.focus();
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();

        expect(parentElement.classList.length)
            .toBe(2, 'button should have exactly 2 focus classes');
      }, 0);
    }));
  });
});


@Component({
  template: `<button>focus me!</button>`
})
class PlainButton {
  constructor(public renderer: Renderer) {}
}


@Component({
  template: `<button cdkMonitorElementFocus (cdkFocusChange)="focusChanged($event)"></button>`
})
class ButtonWithFocusClasses {
  focusChanged(origin: FocusOrigin) {};
}


@Component({
  template: `<div tabindex="0" cdkMonitorElementFocus><button></button></div>`
})
class ComplexComponentWithMonitorElementFocus {}


@Component({
  template: `<div tabindex="0" cdkMonitorSubtreeFocus><button></button></div>`
})
class ComplexComponentWithMonitorSubtreeFocus {}


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
    document.hasFocus() ? _nativeButtonFocus() : dispatchFakeEvent(element, 'focus');
  };
  element.blur = () => {
    document.hasFocus() ? _nativeButtonBlur() : dispatchFakeEvent(element, 'blur');
  };
}
