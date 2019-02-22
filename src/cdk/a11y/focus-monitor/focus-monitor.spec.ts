import {TAB} from '@angular/cdk/keycodes';
import {
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  patchElementFocus,
} from '@angular/cdk/testing';
import {Component, NgZone} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, inject, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {A11yModule} from '../index';
import {FocusMonitor, FocusOrigin, TOUCH_BUFFER_MS} from './focus-monitor';


describe('FocusMonitor', () => {
  let fixture: ComponentFixture<PlainButton>;
  let buttonElement: HTMLElement;
  let focusMonitor: FocusMonitor;
  let changeHandler: (origin: FocusOrigin) => void;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [A11yModule],
      declarations: [
        PlainButton,
      ],
    }).compileComponents();
  });

  beforeEach(inject([FocusMonitor], (fm: FocusMonitor) => {
    fixture = TestBed.createComponent(PlainButton);
    fixture.detectChanges();

    buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    focusMonitor = fm;

    changeHandler = jasmine.createSpy('focus origin change handler');
    focusMonitor.monitor(buttonElement).subscribe(changeHandler);
    patchElementFocus(buttonElement);
  }));

  it('manually registered element should receive focus classes', fakeAsync(() => {
    buttonElement.focus();
    fixture.detectChanges();
    tick();

    expect(buttonElement.classList.contains('cdk-focused'))
        .toBe(true, 'button should have cdk-focused class');
    expect(changeHandler).toHaveBeenCalledTimes(1);
  }));

  it('should detect focus via keyboard', fakeAsync(() => {
    // Simulate focus via keyboard.
    dispatchKeyboardEvent(document, 'keydown', TAB);
    buttonElement.focus();
    fixture.detectChanges();
    flush();

    expect(buttonElement.classList.length)
        .toBe(2, 'button should have exactly 2 focus classes');
    expect(buttonElement.classList.contains('cdk-focused'))
        .toBe(true, 'button should have cdk-focused class');
    expect(buttonElement.classList.contains('cdk-keyboard-focused'))
        .toBe(true, 'button should have cdk-keyboard-focused class');
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
  }));

  it('should detect focus via mouse', fakeAsync(() => {
    // Simulate focus via mouse.
    dispatchMouseEvent(buttonElement, 'mousedown');
    buttonElement.focus();
    fixture.detectChanges();
    flush();

    expect(buttonElement.classList.length)
        .toBe(2, 'button should have exactly 2 focus classes');
    expect(buttonElement.classList.contains('cdk-focused'))
        .toBe(true, 'button should have cdk-focused class');
    expect(buttonElement.classList.contains('cdk-mouse-focused'))
        .toBe(true, 'button should have cdk-mouse-focused class');
    expect(changeHandler).toHaveBeenCalledWith('mouse');
  }));

  it('should detect focus via touch', fakeAsync(() => {
    // Simulate focus via touch.
    dispatchFakeEvent(buttonElement, 'touchstart');
    buttonElement.focus();
    fixture.detectChanges();
    tick(TOUCH_BUFFER_MS);

    expect(buttonElement.classList.length)
        .toBe(2, 'button should have exactly 2 focus classes');
    expect(buttonElement.classList.contains('cdk-focused'))
        .toBe(true, 'button should have cdk-focused class');
    expect(buttonElement.classList.contains('cdk-touch-focused'))
        .toBe(true, 'button should have cdk-touch-focused class');
    expect(changeHandler).toHaveBeenCalledWith('touch');
  }));

  it('should detect programmatic focus', fakeAsync(() => {
    // Programmatically focus.
    buttonElement.focus();
    fixture.detectChanges();
    tick();

    expect(buttonElement.classList.length)
        .toBe(2, 'button should have exactly 2 focus classes');
    expect(buttonElement.classList.contains('cdk-focused'))
        .toBe(true, 'button should have cdk-focused class');
    expect(buttonElement.classList.contains('cdk-program-focused'))
        .toBe(true, 'button should have cdk-program-focused class');
    expect(changeHandler).toHaveBeenCalledWith('program');
  }));

  it('focusVia keyboard should simulate keyboard focus', fakeAsync(() => {
    focusMonitor.focusVia(buttonElement, 'keyboard');
    flush();

    expect(buttonElement.classList.length)
        .toBe(2, 'button should have exactly 2 focus classes');
    expect(buttonElement.classList.contains('cdk-focused'))
        .toBe(true, 'button should have cdk-focused class');
    expect(buttonElement.classList.contains('cdk-keyboard-focused'))
        .toBe(true, 'button should have cdk-keyboard-focused class');
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
  }));

  it('focusVia mouse should simulate mouse focus', fakeAsync(() => {
    focusMonitor.focusVia(buttonElement, 'mouse');
    fixture.detectChanges();
    flush();

    expect(buttonElement.classList.length)
        .toBe(2, 'button should have exactly 2 focus classes');
    expect(buttonElement.classList.contains('cdk-focused'))
        .toBe(true, 'button should have cdk-focused class');
    expect(buttonElement.classList.contains('cdk-mouse-focused'))
        .toBe(true, 'button should have cdk-mouse-focused class');
    expect(changeHandler).toHaveBeenCalledWith('mouse');
  }));

  it('focusVia touch should simulate touch focus', fakeAsync(() => {
    focusMonitor.focusVia(buttonElement, 'touch');
    fixture.detectChanges();
    flush();

    expect(buttonElement.classList.length)
        .toBe(2, 'button should have exactly 2 focus classes');
    expect(buttonElement.classList.contains('cdk-focused'))
        .toBe(true, 'button should have cdk-focused class');
    expect(buttonElement.classList.contains('cdk-touch-focused'))
        .toBe(true, 'button should have cdk-touch-focused class');
    expect(changeHandler).toHaveBeenCalledWith('touch');
  }));

  it('focusVia program should simulate programmatic focus', fakeAsync(() => {
    focusMonitor.focusVia(buttonElement, 'program');
    fixture.detectChanges();
    flush();

    expect(buttonElement.classList.length)
        .toBe(2, 'button should have exactly 2 focus classes');
    expect(buttonElement.classList.contains('cdk-focused'))
        .toBe(true, 'button should have cdk-focused class');
    expect(buttonElement.classList.contains('cdk-program-focused'))
        .toBe(true, 'button should have cdk-program-focused class');
    expect(changeHandler).toHaveBeenCalledWith('program');
  }));

  it('should remove focus classes on blur', fakeAsync(() => {
    buttonElement.focus();
    fixture.detectChanges();
    tick();

    expect(buttonElement.classList.length)
        .toBe(2, 'button should have exactly 2 focus classes');
    expect(changeHandler).toHaveBeenCalledWith('program');

    // Call `blur` directly because invoking `buttonElement.blur()` does not always trigger the
    // handler on IE11 on SauceLabs.
    focusMonitor._onBlur({} as any, buttonElement);
    fixture.detectChanges();

    expect(buttonElement.classList.length)
        .toBe(0, 'button should not have any focus classes');
    expect(changeHandler).toHaveBeenCalledWith(null);
  }));

  it('should remove classes on stopMonitoring', fakeAsync(() => {
    buttonElement.focus();
    fixture.detectChanges();
    tick();

    expect(buttonElement.classList.length).toBe(2, 'button should have exactly 2 focus classes');

    focusMonitor.stopMonitoring(buttonElement);
    fixture.detectChanges();

    expect(buttonElement.classList.length).toBe(0, 'button should not have any focus classes');
  }));

  it('should remove classes when destroyed', fakeAsync(() => {
    buttonElement.focus();
    fixture.detectChanges();
    tick();

    expect(buttonElement.classList.length).toBe(2, 'button should have exactly 2 focus classes');

    // Destroy manually since destroying the fixture won't do it.
    focusMonitor.ngOnDestroy();
    fixture.detectChanges();

    expect(buttonElement.classList.length).toBe(0, 'button should not have any focus classes');
  }));

  it('should pass focus options to the native focus method', fakeAsync(() => {
    spyOn(buttonElement, 'focus');

    focusMonitor.focusVia(buttonElement, 'program', {preventScroll: true});
    fixture.detectChanges();
    flush();

    expect(buttonElement.focus).toHaveBeenCalledWith(jasmine.objectContaining({
      preventScroll: true
    }));
  }));

  it('should not clear the focus origin too early in the current event loop', fakeAsync(() => {
    dispatchKeyboardEvent(document, 'keydown', TAB);

    // Simulate the behavior of Firefox 57 where the focus event sometimes happens *one* tick later.
    tick();

    buttonElement.focus();

    // Since the timeout doesn't clear the focus origin too early as with the `0ms` timeout, the
    // focus origin should be reported properly.
    expect(changeHandler).toHaveBeenCalledWith('keyboard');

    flush();
  }));
});


describe('cdkMonitorFocus', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [A11yModule],
      declarations: [
        ButtonWithFocusClasses,
        ComplexComponentWithMonitorElementFocus,
        ComplexComponentWithMonitorSubtreeFocus,
        ComplexComponentWithMonitorSubtreeFocusAndMonitorElementFocus,
      ],
    }).compileComponents();
  });

  describe('button with cdkMonitorElementFocus', () => {
    let fixture: ComponentFixture<ButtonWithFocusClasses>;
    let buttonElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ButtonWithFocusClasses);
      fixture.detectChanges();

      spyOn(fixture.componentInstance, 'focusChanged');
      buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
      patchElementFocus(buttonElement);
    });

    it('should initially not be focused', () => {
      expect(buttonElement.classList.length).toBe(0, 'button should not have focus classes');
    });

    it('should detect focus via keyboard', fakeAsync(() => {
      // Simulate focus via keyboard.
      dispatchKeyboardEvent(document, 'keydown', TAB);
      buttonElement.focus();
      fixture.detectChanges();
      flush();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-keyboard-focused'))
          .toBe(true, 'button should have cdk-keyboard-focused class');
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('keyboard');
    }));

    it('should detect focus via mouse', fakeAsync(() => {
      // Simulate focus via mouse.
      dispatchMouseEvent(buttonElement, 'mousedown');
      buttonElement.focus();
      fixture.detectChanges();
      flush();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-mouse-focused'))
          .toBe(true, 'button should have cdk-mouse-focused class');
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('mouse');
    }));

    it('should detect focus via touch', fakeAsync(() => {
      // Simulate focus via touch.
      dispatchFakeEvent(buttonElement, 'touchstart');
      buttonElement.focus();
      fixture.detectChanges();
      tick(TOUCH_BUFFER_MS);

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-touch-focused'))
          .toBe(true, 'button should have cdk-touch-focused class');
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('touch');
    }));

    it('should detect programmatic focus', fakeAsync(() => {
      // Programmatically focus.
      buttonElement.focus();
      fixture.detectChanges();
      tick();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(buttonElement.classList.contains('cdk-focused'))
          .toBe(true, 'button should have cdk-focused class');
      expect(buttonElement.classList.contains('cdk-program-focused'))
          .toBe(true, 'button should have cdk-program-focused class');
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('program');
    }));

    it('should remove focus classes on blur', fakeAsync(() => {
      buttonElement.focus();
      fixture.detectChanges();
      tick();

      expect(buttonElement.classList.length)
          .toBe(2, 'button should have exactly 2 focus classes');
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('program');

      buttonElement.blur();
      fixture.detectChanges();

      expect(buttonElement.classList.length)
          .toBe(0, 'button should not have any focus classes');
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith(null);
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

      patchElementFocus(parentElement);
      patchElementFocus(childElement);
    });

    it('should add focus classes on parent focus', fakeAsync(() => {
      parentElement.focus();
      fixture.detectChanges();
      tick();

      expect(parentElement.classList.length).toBe(2, 'button should have exactly 2 focus classes');
    }));

    it('should not add focus classes on child focus', fakeAsync(() => {
      childElement.focus();
      fixture.detectChanges();
      tick();

      expect(parentElement.classList.length).toBe(0, 'button should not have any focus classes');
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

      patchElementFocus(parentElement);
      patchElementFocus(childElement);
    });

    it('should add focus classes on parent focus', fakeAsync(() => {
      parentElement.focus();
      fixture.detectChanges();
      tick();

      expect(parentElement.classList.length).toBe(2, 'button should have exactly 2 focus classes');
    }));

    it('should add focus classes on child focus', fakeAsync(() => {
      childElement.focus();
      fixture.detectChanges();
      tick();

      expect(parentElement.classList.length).toBe(2, 'button should have exactly 2 focus classes');
    }));
  });

  describe('complex component with cdkMonitorSubtreeFocus and cdkMonitorElementFocus', () => {
    let fixture: ComponentFixture<ComplexComponentWithMonitorSubtreeFocusAndMonitorElementFocus>;
    let parentElement: HTMLElement;
    let childElement: HTMLElement;
    let focusMonitor: FocusMonitor;

    beforeEach(inject([FocusMonitor], (fm: FocusMonitor) => {
      focusMonitor = fm;
      fixture =
          TestBed.createComponent(ComplexComponentWithMonitorSubtreeFocusAndMonitorElementFocus);
      fixture.detectChanges();

      parentElement = fixture.debugElement.query(By.css('div')).nativeElement;
      childElement = fixture.debugElement.query(By.css('button')).nativeElement;

      patchElementFocus(parentElement);
      patchElementFocus(childElement);
    }));

    it('should add keyboard focus classes on both elements when child is focused via keyboard',
        fakeAsync(() => {
          focusMonitor.focusVia(childElement, 'keyboard');
          fixture.detectChanges();
          flush();

          expect(parentElement.classList).toContain('cdk-keyboard-focused');
          expect(childElement.classList).toContain('cdk-keyboard-focused');
        }));
  });
});

describe('FocusMonitor observable stream', () => {
  let fixture: ComponentFixture<PlainButton>;
  let buttonElement: HTMLElement;
  let focusMonitor: FocusMonitor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [A11yModule],
      declarations: [
        PlainButton,
      ],
    }).compileComponents();
  });

  beforeEach(inject([FocusMonitor], (fm: FocusMonitor) => {
    fixture = TestBed.createComponent(PlainButton);
    focusMonitor = fm;
    fixture.detectChanges();
    buttonElement = fixture.debugElement.nativeElement.querySelector('button');
    patchElementFocus(buttonElement);
  }));

  it('should emit inside the NgZone', fakeAsync(() => {
    const spy = jasmine.createSpy('zone spy');
    focusMonitor.monitor(buttonElement).subscribe(() => spy(NgZone.isInAngularZone()));
    expect(spy).not.toHaveBeenCalled();

    buttonElement.focus();
    fixture.detectChanges();
    tick();
    expect(spy).toHaveBeenCalledWith(true);
  }));
});


@Component({
  template: `<button>focus me!</button>`
})
class PlainButton {}


@Component({
  template: `<button cdkMonitorElementFocus (cdkFocusChange)="focusChanged($event)"></button>`
})
class ButtonWithFocusClasses {
  focusChanged(_origin: FocusOrigin) {}
}


@Component({
  template: `<div tabindex="0" cdkMonitorElementFocus><button></button></div>`
})
class ComplexComponentWithMonitorElementFocus {}


@Component({
  template: `<div tabindex="0" cdkMonitorSubtreeFocus><button></button></div>`
})
class ComplexComponentWithMonitorSubtreeFocus {}

@Component({
  template: `<div cdkMonitorSubtreeFocus><button cdkMonitorElementFocus></button></div>`
})
class ComplexComponentWithMonitorSubtreeFocusAndMonitorElementFocus {}
