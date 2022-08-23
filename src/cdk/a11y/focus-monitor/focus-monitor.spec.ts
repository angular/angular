import {TAB} from '@angular/cdk/keycodes';
import {
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  patchElementFocus,
  createMouseEvent,
  dispatchEvent,
} from '../../testing/private';
import {DOCUMENT} from '@angular/common';
import {Component, NgZone, ViewChild} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, inject, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {A11yModule, CdkMonitorFocus} from '../index';
import {TOUCH_BUFFER_MS} from '../input-modality/input-modality-detector';
import {
  FocusMonitor,
  FocusMonitorDetectionMode,
  FocusOrigin,
  FOCUS_MONITOR_DEFAULT_OPTIONS,
} from './focus-monitor';

describe('FocusMonitor', () => {
  let fixture: ComponentFixture<PlainButton>;
  let buttonElement: HTMLElement;
  let focusMonitor: FocusMonitor;
  let changeHandler: (origin: FocusOrigin) => void;
  let fakeActiveElement: HTMLElement | null;

  beforeEach(() => {
    fakeActiveElement = null;

    TestBed.configureTestingModule({
      imports: [A11yModule],
      declarations: [PlainButton],
      providers: [
        {
          provide: DOCUMENT,
          useFactory: () => {
            // We have to stub out the `document` in order to be able to fake `activeElement`.
            const fakeDocument = {body: document.body};

            [
              'createElement',
              'dispatchEvent',
              'querySelectorAll',
              'addEventListener',
              'removeEventListener',
            ].forEach(method => {
              (fakeDocument as any)[method] = function () {
                return (document as any)[method].apply(document, arguments);
              };
            });

            Object.defineProperty(fakeDocument, 'activeElement', {
              get: () => fakeActiveElement || document.activeElement,
            });

            return fakeDocument;
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(inject([FocusMonitor], (fm: FocusMonitor) => {
    fixture = TestBed.createComponent(PlainButton);
    fixture.detectChanges();

    buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
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
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledTimes(1);
  }));

  it('should detect focus via keyboard', fakeAsync(() => {
    // Simulate focus via keyboard.
    dispatchKeyboardEvent(document, 'keydown', TAB);
    buttonElement.focus();
    fixture.detectChanges();
    flush();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-keyboard-focused'))
      .withContext('button should have cdk-keyboard-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
  }));

  it('should detect focus via mouse', fakeAsync(() => {
    // Simulate focus via mouse.
    dispatchMouseEvent(buttonElement, 'mousedown');
    buttonElement.focus();
    fixture.detectChanges();
    flush();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-mouse-focused'))
      .withContext('button should have cdk-mouse-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('mouse');
  }));

  it('should detect focus via touch', fakeAsync(() => {
    // Simulate focus via touch.
    dispatchFakeEvent(buttonElement, 'touchstart');
    buttonElement.focus();
    fixture.detectChanges();
    tick(TOUCH_BUFFER_MS);

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-touch-focused'))
      .withContext('button should have cdk-touch-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('touch');
  }));

  it('should detect programmatic focus', fakeAsync(() => {
    // Programmatically focus.
    buttonElement.focus();
    fixture.detectChanges();
    tick();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-program-focused'))
      .withContext('button should have cdk-program-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('program');
  }));

  it('should detect fake mousedown from a screen reader on Chrome', fakeAsync(() => {
    // Simulate focus via a fake mousedown from a screen reader.
    dispatchMouseEvent(buttonElement, 'mousedown');
    const event = createMouseEvent('mousedown');
    Object.defineProperties(event, {offsetX: {get: () => 0}, offsetY: {get: () => 0}});
    dispatchEvent(buttonElement, event);

    buttonElement.focus();
    fixture.detectChanges();
    flush();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-keyboard-focused'))
      .withContext('button should have cdk-keyboard-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
  }));

  it('should detect fake mousedown from a screen reader on Firefox', fakeAsync(() => {
    // Simulate focus via a fake mousedown from a screen reader.
    dispatchMouseEvent(buttonElement, 'mousedown');
    const event = createMouseEvent('mousedown');
    Object.defineProperties(event, {buttons: {get: () => 0}});
    dispatchEvent(buttonElement, event);

    buttonElement.focus();
    fixture.detectChanges();
    flush();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-keyboard-focused'))
      .withContext('button should have cdk-keyboard-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
  }));

  it('focusVia keyboard should simulate keyboard focus', fakeAsync(() => {
    focusMonitor.focusVia(buttonElement, 'keyboard');
    flush();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-keyboard-focused'))
      .withContext('button should have cdk-keyboard-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
  }));

  it('focusVia mouse should simulate mouse focus', fakeAsync(() => {
    focusMonitor.focusVia(buttonElement, 'mouse');
    fixture.detectChanges();
    flush();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-mouse-focused'))
      .withContext('button should have cdk-mouse-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('mouse');
  }));

  it('focusVia touch should simulate touch focus', fakeAsync(() => {
    focusMonitor.focusVia(buttonElement, 'touch');
    fixture.detectChanges();
    flush();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-touch-focused'))
      .withContext('button should have cdk-touch-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('touch');
  }));

  it('focusVia program should simulate programmatic focus', fakeAsync(() => {
    focusMonitor.focusVia(buttonElement, 'program');
    fixture.detectChanges();
    flush();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-program-focused'))
      .withContext('button should have cdk-program-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('program');
  }));

  it('should remove focus classes on blur', fakeAsync(() => {
    buttonElement.focus();
    fixture.detectChanges();
    tick();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(changeHandler).toHaveBeenCalledWith('program');

    // Call `blur` directly because invoking `buttonElement.blur()` does not always trigger the
    // handler on IE11 on SauceLabs.
    focusMonitor._onBlur({} as any, buttonElement);
    fixture.detectChanges();

    expect(buttonElement.classList.length)
      .withContext('button should not have any focus classes')
      .toBe(0);
    expect(changeHandler).toHaveBeenCalledWith(null);
  }));

  it('should remove classes on stopMonitoring', fakeAsync(() => {
    buttonElement.focus();
    fixture.detectChanges();
    tick();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);

    focusMonitor.stopMonitoring(buttonElement);
    fixture.detectChanges();

    expect(buttonElement.classList.length)
      .withContext('button should not have any focus classes')
      .toBe(0);
  }));

  it('should remove classes when destroyed', fakeAsync(() => {
    buttonElement.focus();
    fixture.detectChanges();
    tick();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);

    // Destroy manually since destroying the fixture won't do it.
    focusMonitor.ngOnDestroy();
    fixture.detectChanges();

    expect(buttonElement.classList.length)
      .withContext('button should not have any focus classes')
      .toBe(0);
  }));

  it('should pass focus options to the native focus method', fakeAsync(() => {
    spyOn(buttonElement, 'focus');

    focusMonitor.focusVia(buttonElement, 'program', {preventScroll: true});
    fixture.detectChanges();
    flush();

    expect(buttonElement.focus).toHaveBeenCalledWith(
      jasmine.objectContaining({
        preventScroll: true,
      }),
    );
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

  it('should clear the focus origin after one tick with "immediate" detection', fakeAsync(() => {
    dispatchKeyboardEvent(document, 'keydown', TAB);
    tick(2);
    buttonElement.focus();

    // After 2 ticks, the timeout has cleared the origin. Default is 'program'.
    expect(changeHandler).toHaveBeenCalledWith('program');
  }));

  it('should check children if monitor was called with different checkChildren', fakeAsync(() => {
    const parent = fixture.nativeElement.querySelector('.parent');

    focusMonitor.monitor(parent, true);
    focusMonitor.monitor(parent, false);

    // Simulate focus via mouse.
    dispatchMouseEvent(buttonElement, 'mousedown');
    buttonElement.focus();
    fixture.detectChanges();
    flush();

    expect(parent.classList).toContain('cdk-focused');
    expect(parent.classList).toContain('cdk-mouse-focused');
  }));

  it('focusVia should change the focus origin when called on the focused node', fakeAsync(() => {
    spyOn(buttonElement, 'focus').and.callThrough();
    focusMonitor.focusVia(buttonElement, 'keyboard');
    flush();
    fakeActiveElement = buttonElement;

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-keyboard-focused'))
      .withContext('button should have cdk-keyboard-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
    expect(buttonElement.focus).toHaveBeenCalledTimes(1);

    focusMonitor.focusVia(buttonElement, 'mouse');
    flush();
    fakeActiveElement = buttonElement;

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-mouse-focused'))
      .withContext('button should have cdk-mouse-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledTimes(2);
    expect(changeHandler).toHaveBeenCalledWith('mouse');
    expect(buttonElement.focus).toHaveBeenCalledTimes(1);
  }));

  it('focusVia should change the focus origin when called a focused child node', fakeAsync(() => {
    const parent = fixture.nativeElement.querySelector('.parent');
    focusMonitor.stopMonitoring(buttonElement); // The button gets monitored by default.
    focusMonitor.monitor(parent, true).subscribe(changeHandler);
    spyOn(buttonElement, 'focus').and.callThrough();
    focusMonitor.focusVia(buttonElement, 'keyboard');
    flush();
    fakeActiveElement = buttonElement;

    expect(parent.classList.length)
      .withContext('Parent should have exactly 2 focus classes and the `parent` class')
      .toBe(3);
    expect(parent.classList.contains('cdk-focused'))
      .withContext('Parent should have cdk-focused class')
      .toBe(true);
    expect(parent.classList.contains('cdk-keyboard-focused'))
      .withContext('Parent should have cdk-keyboard-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
    expect(buttonElement.focus).toHaveBeenCalledTimes(1);

    focusMonitor.focusVia(buttonElement, 'mouse');
    flush();
    fakeActiveElement = buttonElement;

    expect(parent.classList.length)
      .withContext('Parent should have exactly 2 focus classes and the `parent` class')
      .toBe(3);
    expect(parent.classList.contains('cdk-focused'))
      .withContext('Parent should have cdk-focused class')
      .toBe(true);
    expect(parent.classList.contains('cdk-mouse-focused'))
      .withContext('Parent should have cdk-mouse-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledTimes(2);
    expect(changeHandler).toHaveBeenCalledWith('mouse');
    expect(buttonElement.focus).toHaveBeenCalledTimes(1);
  }));
});

describe('FocusMonitor with "eventual" detection', () => {
  let fixture: ComponentFixture<PlainButton>;
  let buttonElement: HTMLElement;
  let focusMonitor: FocusMonitor;
  let changeHandler: (origin: FocusOrigin) => void;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [A11yModule],
      declarations: [PlainButton],
      providers: [
        {
          provide: FOCUS_MONITOR_DEFAULT_OPTIONS,
          useValue: {
            detectionMode: FocusMonitorDetectionMode.EVENTUAL,
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(inject([FocusMonitor], (fm: FocusMonitor) => {
    fixture = TestBed.createComponent(PlainButton);
    fixture.detectChanges();

    buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
    focusMonitor = fm;

    changeHandler = jasmine.createSpy('focus origin change handler');
    focusMonitor.monitor(buttonElement).subscribe(changeHandler);
    patchElementFocus(buttonElement);
  }));

  it('should not clear the focus origin, even after a few seconds', fakeAsync(() => {
    dispatchKeyboardEvent(document, 'keydown', TAB);
    tick(2000);

    buttonElement.focus();

    expect(changeHandler).toHaveBeenCalledWith('keyboard');
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
        FocusMonitorOnCommentNode,
        ExportedFocusMonitor,
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
      buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
      patchElementFocus(buttonElement);
    });

    it('should initially not be focused', () => {
      expect(buttonElement.classList.length)
        .withContext('button should not have focus classes')
        .toBe(0);
    });

    it('should detect focus via keyboard', fakeAsync(() => {
      // Simulate focus via keyboard.
      dispatchKeyboardEvent(document, 'keydown', TAB);
      buttonElement.focus();
      fixture.detectChanges();
      flush();

      expect(buttonElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
      expect(buttonElement.classList.contains('cdk-focused'))
        .withContext('button should have cdk-focused class')
        .toBe(true);
      expect(buttonElement.classList.contains('cdk-keyboard-focused'))
        .withContext('button should have cdk-keyboard-focused class')
        .toBe(true);
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('keyboard');
    }));

    it('should detect focus via mouse', fakeAsync(() => {
      // Simulate focus via mouse.
      dispatchMouseEvent(buttonElement, 'mousedown');
      buttonElement.focus();
      fixture.detectChanges();
      flush();

      expect(buttonElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
      expect(buttonElement.classList.contains('cdk-focused'))
        .withContext('button should have cdk-focused class')
        .toBe(true);
      expect(buttonElement.classList.contains('cdk-mouse-focused'))
        .withContext('button should have cdk-mouse-focused class')
        .toBe(true);
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('mouse');
    }));

    it('should detect focus via touch', fakeAsync(() => {
      // Simulate focus via touch.
      dispatchFakeEvent(buttonElement, 'touchstart');
      buttonElement.focus();
      fixture.detectChanges();
      tick(TOUCH_BUFFER_MS);

      expect(buttonElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
      expect(buttonElement.classList.contains('cdk-focused'))
        .withContext('button should have cdk-focused class')
        .toBe(true);
      expect(buttonElement.classList.contains('cdk-touch-focused'))
        .withContext('button should have cdk-touch-focused class')
        .toBe(true);
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('touch');
    }));

    it('should detect programmatic focus', fakeAsync(() => {
      // Programmatically focus.
      buttonElement.focus();
      fixture.detectChanges();
      tick();

      expect(buttonElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
      expect(buttonElement.classList.contains('cdk-focused'))
        .withContext('button should have cdk-focused class')
        .toBe(true);
      expect(buttonElement.classList.contains('cdk-program-focused'))
        .withContext('button should have cdk-program-focused class')
        .toBe(true);
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('program');
    }));

    it('should remove focus classes on blur', fakeAsync(() => {
      buttonElement.focus();
      fixture.detectChanges();
      tick();

      expect(buttonElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('program');

      buttonElement.blur();
      fixture.detectChanges();

      expect(buttonElement.classList.length)
        .withContext('button should not have any focus classes')
        .toBe(0);
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

      parentElement = fixture.debugElement.query(By.css('div'))!.nativeElement;
      childElement = fixture.debugElement.query(By.css('button'))!.nativeElement;

      patchElementFocus(parentElement);
      patchElementFocus(childElement);
    });

    it('should add focus classes on parent focus', fakeAsync(() => {
      parentElement.focus();
      fixture.detectChanges();
      tick();

      expect(parentElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
    }));

    it('should not add focus classes on child focus', fakeAsync(() => {
      childElement.focus();
      fixture.detectChanges();
      tick();

      expect(parentElement.classList.length)
        .withContext('button should not have any focus classes')
        .toBe(0);
    }));
  });

  describe('complex component with cdkMonitorSubtreeFocus', () => {
    let fixture: ComponentFixture<ComplexComponentWithMonitorSubtreeFocus>;
    let parentElement: HTMLElement;
    let childElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ComplexComponentWithMonitorSubtreeFocus);
      fixture.detectChanges();

      parentElement = fixture.debugElement.query(By.css('div'))!.nativeElement;
      childElement = fixture.debugElement.query(By.css('button'))!.nativeElement;

      patchElementFocus(parentElement);
      patchElementFocus(childElement);
    });

    it('should add focus classes on parent focus', fakeAsync(() => {
      parentElement.focus();
      fixture.detectChanges();
      tick();

      expect(parentElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
    }));

    it('should add focus classes on child focus', fakeAsync(() => {
      childElement.focus();
      fixture.detectChanges();
      tick();

      expect(parentElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
    }));
  });

  describe('complex component with cdkMonitorSubtreeFocus and cdkMonitorElementFocus', () => {
    let fixture: ComponentFixture<ComplexComponentWithMonitorSubtreeFocusAndMonitorElementFocus>;
    let parentElement: HTMLElement;
    let childElement: HTMLElement;
    let focusMonitor: FocusMonitor;

    beforeEach(inject([FocusMonitor], (fm: FocusMonitor) => {
      focusMonitor = fm;
      fixture = TestBed.createComponent(
        ComplexComponentWithMonitorSubtreeFocusAndMonitorElementFocus,
      );
      fixture.detectChanges();

      parentElement = fixture.debugElement.query(By.css('div'))!.nativeElement;
      childElement = fixture.debugElement.query(By.css('button'))!.nativeElement;

      patchElementFocus(parentElement);
      patchElementFocus(childElement);
    }));

    it('should add keyboard focus classes on both elements when child is focused via keyboard', fakeAsync(() => {
      focusMonitor.focusVia(childElement, 'keyboard');
      fixture.detectChanges();
      flush();

      expect(parentElement.classList).toContain('cdk-keyboard-focused');
      expect(childElement.classList).toContain('cdk-keyboard-focused');
    }));
  });

  describe('button with exported cdkMonitorElementFocus', () => {
    let fixture: ComponentFixture<ExportedFocusMonitor>;
    let buttonElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ExportedFocusMonitor);
      fixture.detectChanges();

      buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
      patchElementFocus(buttonElement);
    });

    it('should initially not be focused', () => {
      expect(fixture.componentInstance.exportedDirRef.focusOrigin)
        .withContext('initial focus origin should be null')
        .toBeNull();
    });

    it('should detect focus via keyboard', fakeAsync(() => {
      // Simulate focus via keyboard.
      dispatchKeyboardEvent(document, 'keydown', TAB);
      buttonElement.focus();
      fixture.detectChanges();
      flush();

      expect(fixture.componentInstance.exportedDirRef.focusOrigin).toEqual('keyboard');
    }));

    it('should detect focus via mouse', fakeAsync(() => {
      // Simulate focus via mouse.
      dispatchMouseEvent(buttonElement, 'mousedown');
      buttonElement.focus();
      fixture.detectChanges();
      flush();

      expect(fixture.componentInstance.exportedDirRef.focusOrigin).toEqual('mouse');
    }));

    it('should detect focus via touch', fakeAsync(() => {
      // Simulate focus via touch.
      dispatchFakeEvent(buttonElement, 'touchstart');
      buttonElement.focus();
      fixture.detectChanges();
      tick(TOUCH_BUFFER_MS);

      expect(fixture.componentInstance.exportedDirRef.focusOrigin).toEqual('touch');
    }));

    it('should detect programmatic focus', fakeAsync(() => {
      // Programmatically focus.
      buttonElement.focus();
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.exportedDirRef.focusOrigin).toEqual('program');
    }));

    it('should remove focus classes on blur', fakeAsync(() => {
      buttonElement.focus();
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.exportedDirRef.focusOrigin).toEqual('program');

      buttonElement.blur();
      fixture.detectChanges();

      expect(fixture.componentInstance.exportedDirRef.focusOrigin).toEqual(null);
    }));
  });

  it('should not throw when trying to monitor focus on a non-element node', () => {
    expect(() => {
      const fixture = TestBed.createComponent(FocusMonitorOnCommentNode);
      fixture.detectChanges();
      fixture.destroy();
    }).not.toThrow();
  });
});

describe('FocusMonitor observable stream', () => {
  let fixture: ComponentFixture<PlainButton>;
  let buttonElement: HTMLElement;
  let focusMonitor: FocusMonitor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [A11yModule],
      declarations: [PlainButton],
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

describe('FocusMonitor input label detection', () => {
  let fixture: ComponentFixture<CheckboxWithLabel>;
  let inputElement: HTMLElement;
  let labelElement: HTMLElement;
  let focusMonitor: FocusMonitor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [A11yModule],
      declarations: [CheckboxWithLabel],
    }).compileComponents();
  });

  beforeEach(inject([FocusMonitor], (fm: FocusMonitor) => {
    fixture = TestBed.createComponent(CheckboxWithLabel);
    focusMonitor = fm;
    fixture.detectChanges();
    inputElement = fixture.nativeElement.querySelector('input');
    labelElement = fixture.nativeElement.querySelector('label');
    patchElementFocus(inputElement);
  }));

  it('should detect label click focus as `mouse`', fakeAsync(() => {
    const spy = jasmine.createSpy('monitor spy');
    focusMonitor.monitor(inputElement).subscribe(spy);
    expect(spy).not.toHaveBeenCalled();

    // Unlike most focus, focus from labels moves to the connected input on click rather than
    // `mousedown`. To simulate it we have to dispatch both `mousedown` and `click` so the
    // modality detector will pick it up.
    dispatchMouseEvent(labelElement, 'mousedown');
    labelElement.click();
    fixture.detectChanges();
    flush();

    // The programmatic click from above won't move focus so we have to focus the input ourselves.
    inputElement.focus();
    fixture.detectChanges();
    tick();

    expect(inputElement.classList).toContain('cdk-mouse-focused');
    expect(spy.calls.mostRecent()?.args[0]).toBe('mouse');
  }));
});

@Component({
  template: `<div class="parent"><button>focus me!</button></div>`,
})
class PlainButton {}

@Component({
  template: `<button cdkMonitorElementFocus (cdkFocusChange)="focusChanged($event)"></button>`,
})
class ButtonWithFocusClasses {
  focusChanged(_origin: FocusOrigin) {}
}

@Component({
  template: `<div tabindex="0" cdkMonitorElementFocus><button></button></div>`,
})
class ComplexComponentWithMonitorElementFocus {}

@Component({
  template: `<div tabindex="0" cdkMonitorSubtreeFocus><button></button></div>`,
})
class ComplexComponentWithMonitorSubtreeFocus {}

@Component({
  template: `<div cdkMonitorSubtreeFocus><button cdkMonitorElementFocus></button></div>`,
})
class ComplexComponentWithMonitorSubtreeFocusAndMonitorElementFocus {}

@Component({
  template: `<ng-container cdkMonitorElementFocus></ng-container>`,
})
class FocusMonitorOnCommentNode {}

@Component({
  template: `
    <label for="test-checkbox">Check me</label>
    <input id="test-checkbox" type="checkbox">
  `,
})
class CheckboxWithLabel {}

@Component({
  template: `<button cdkMonitorElementFocus #exportedDir="cdkMonitorFocus"></button>`,
})
class ExportedFocusMonitor {
  @ViewChild('exportedDir') exportedDirRef: CdkMonitorFocus;
}
