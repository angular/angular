import {inject, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Component} from '@angular/core';
import {FocusTrap} from './focus-trap';
import {InteractivityChecker} from './interactivity-checker';


describe('FocusTrap', () => {
  let checker: InteractivityChecker;
  let fixture: ComponentFixture<FocusTrapTestApp>;

  describe('with default element', () => {
    beforeEach(() => TestBed.configureTestingModule({
      declarations: [FocusTrap, FocusTrapTestApp],
      providers: [InteractivityChecker]
    }));

    beforeEach(inject([InteractivityChecker], (c: InteractivityChecker) => {
      checker = c;
      fixture = TestBed.createComponent(FocusTrapTestApp);
    }));

    it('wrap focus from end to start', () => {
      let focusTrap = fixture.debugElement.query(By.directive(FocusTrap));
      let focusTrapInstance = focusTrap.componentInstance as FocusTrap;

      // Because we can't mimic a real tab press focus change in a unit test, just call the
      // focus event handler directly.
      focusTrapInstance.focusFirstTabbableElement();

      expect(document.activeElement.nodeName.toLowerCase())
          .toBe('input', 'Expected input element to be focused');
    });

    it('should wrap focus from start to end', () => {
      let focusTrap = fixture.debugElement.query(By.directive(FocusTrap));
      let focusTrapInstance = focusTrap.componentInstance as FocusTrap;

      // Because we can't mimic a real tab press focus change in a unit test, just call the
      // focus event handler directly.
      focusTrapInstance.focusLastTabbableElement();

      expect(document.activeElement.nodeName.toLowerCase())
          .toBe('button', 'Expected button element to be focused');
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
