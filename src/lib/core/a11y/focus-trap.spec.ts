import {inject, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Component} from '@angular/core';
import {FocusTrap} from './focus-trap';
import {InteractivityChecker} from './interactivity-checker';


describe('FocusTrap', () => {
  describe('with default element', () => {
    let fixture: ComponentFixture<FocusTrapTestApp>;
    let focusTrapInstance: FocusTrap;

    beforeEach(() => TestBed.configureTestingModule({
      declarations: [FocusTrap, FocusTrapTestApp],
      providers: [InteractivityChecker]
    }));

    beforeEach(inject([InteractivityChecker], (c: InteractivityChecker) => {
      fixture = TestBed.createComponent(FocusTrapTestApp);
      focusTrapInstance = fixture.debugElement.query(By.directive(FocusTrap)).componentInstance;
    }));

    it('wrap focus from end to start', () => {
      // Because we can't mimic a real tab press focus change in a unit test, just call the
      // focus event handler directly.
      focusTrapInstance.focusFirstTabbableElement();

      expect(document.activeElement.nodeName.toLowerCase())
          .toBe('input', 'Expected input element to be focused');
    });

    it('should wrap focus from start to end', () => {
      // Because we can't mimic a real tab press focus change in a unit test, just call the
      // focus event handler directly.
      focusTrapInstance.focusLastTabbableElement();

      expect(document.activeElement.nodeName.toLowerCase())
          .toBe('button', 'Expected button element to be focused');
    });
  });

  describe('with focus targets', () => {
    let fixture: ComponentFixture<FocusTrapTargetTestApp>;
    let focusTrapInstance: FocusTrap;

    beforeEach(() => TestBed.configureTestingModule({
      declarations: [FocusTrap, FocusTrapTargetTestApp],
      providers: [InteractivityChecker]
    }));

    beforeEach(inject([InteractivityChecker], (c: InteractivityChecker) => {
      fixture = TestBed.createComponent(FocusTrapTargetTestApp);
      focusTrapInstance = fixture.debugElement.query(By.directive(FocusTrap)).componentInstance;
    }));

    it('should be able to prioritize the first focus target', () => {
      // Because we can't mimic a real tab press focus change in a unit test, just call the
      // focus event handler directly.
      focusTrapInstance.focusFirstTabbableElement();
      expect(document.activeElement.id).toBe('first');
    });

    it('should be able to prioritize the last focus target', () => {
      // Because we can't mimic a real tab press focus change in a unit test, just call the
      // focus event handler directly.
      focusTrapInstance.focusLastTabbableElement();
      expect(document.activeElement.id).toBe('last');
    });
  });
});


@Component({
  template: `
    <focus-trap>
      <input>
      <button>SAVE</button>
    </focus-trap>
    `
})
class FocusTrapTestApp { }


@Component({
  template: `
    <focus-trap>
      <input>
      <button id="last" md-focus-end></button>
      <button id="first" md-focus-start>SAVE</button>
      <input>
    </focus-trap>
    `
})
class FocusTrapTargetTestApp { }
