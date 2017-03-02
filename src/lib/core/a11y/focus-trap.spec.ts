import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {FocusTrapFactory, FocusTrapDirective, FocusTrap} from './focus-trap';
import {InteractivityChecker} from './interactivity-checker';
import {Platform} from '../platform/platform';


describe('FocusTrap', () => {

  describe('with default element', () => {

    let fixture: ComponentFixture<FocusTrapTestApp>;
    let focusTrapInstance: FocusTrap;
    let platform: Platform = new Platform();

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [FocusTrapDirective, FocusTrapTestApp],
        providers: [InteractivityChecker, Platform, FocusTrapFactory]
      });

      TestBed.compileComponents();

      fixture = TestBed.createComponent(FocusTrapTestApp);
      fixture.detectChanges();
      focusTrapInstance = fixture.componentInstance.focusTrapDirective.focusTrap;
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

      // In iOS button elements are never tabbable, so the last element will be the input.
      let lastElement = platform.IOS ? 'input' : 'button';

      expect(document.activeElement.nodeName.toLowerCase())
          .toBe(lastElement, `Expected ${lastElement} element to be focused`);
    });

    it('should clean up its anchor sibling elements on destroy', () => {
      const rootElement = fixture.debugElement.nativeElement as HTMLElement;

      expect(rootElement.querySelectorAll('div.cdk-visually-hidden').length).toBe(2);

      fixture.componentInstance.renderFocusTrap = false;
      fixture.detectChanges();

      expect(rootElement.querySelectorAll('div.cdk-visually-hidden').length).toBe(0);
    });

    it('should set the appropriate tabindex on the anchors, based on the disabled state', () => {
      const anchors = Array.from(
        fixture.debugElement.nativeElement.querySelectorAll('div.cdk-visually-hidden')
      ) as HTMLElement[];

      expect(anchors.every(current => current.getAttribute('tabindex') === '0')).toBe(true);

      fixture.componentInstance.isFocusTrapEnabled = false;
      fixture.detectChanges();

      expect(anchors.every(current => current.getAttribute('tabindex') === '-1')).toBe(true);
    });
  });

  describe('with focus targets', () => {
    let fixture: ComponentFixture<FocusTrapTargetTestApp>;
    let focusTrapInstance: FocusTrap;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [FocusTrapDirective, FocusTrapTargetTestApp],
        providers: [InteractivityChecker, Platform, FocusTrapFactory]
      });

      TestBed.compileComponents();

      fixture = TestBed.createComponent(FocusTrapTargetTestApp);
      fixture.detectChanges();
      focusTrapInstance = fixture.componentInstance.focusTrapDirective.focusTrap;
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
    <div *ngIf="renderFocusTrap" [cdkTrapFocus]="isFocusTrapEnabled">
      <input>
      <button>SAVE</button>
    </div>
    `
})
class FocusTrapTestApp {
  @ViewChild(FocusTrapDirective) focusTrapDirective: FocusTrapDirective;
  renderFocusTrap = true;
  isFocusTrapEnabled = true;
}


@Component({
  template: `
    <div cdkTrapFocus>
      <input>
      <button id="last" cdk-focus-end></button>
      <button id="first" cdk-focus-start>SAVE</button>
      <input>
    </div>
    `
})
class FocusTrapTargetTestApp {
  @ViewChild(FocusTrapDirective) focusTrapDirective: FocusTrapDirective;
}
