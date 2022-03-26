import {Component, DebugElement, ElementRef, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {CdkComboboxModule} from './combobox-module';
import {CdkCombobox} from './combobox';
import {dispatchKeyboardEvent, dispatchMouseEvent} from '../../cdk/testing/private';
import {DOWN_ARROW, ESCAPE} from '@angular/cdk/keycodes';
import {CdkComboboxPopup} from '@angular/cdk-experimental/combobox/combobox-popup';

describe('Combobox', () => {
  describe('with a basic toggle trigger', () => {
    let fixture: ComponentFixture<ComboboxToggle>;
    let testComponent: ComboboxToggle;

    let combobox: DebugElement;
    let comboboxInstance: CdkCombobox;
    let comboboxElement: HTMLElement;

    let dialog: DebugElement;
    let dialogInstance: CdkComboboxPopup;
    let dialogElement: HTMLElement;

    let applyButton: DebugElement;
    let applyButtonElement: HTMLElement;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkComboboxModule],
        declarations: [ComboboxToggle],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ComboboxToggle);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      combobox = fixture.debugElement.query(By.directive(CdkCombobox));
      comboboxInstance = combobox.injector.get<CdkCombobox>(CdkCombobox);
      comboboxElement = combobox.nativeElement;
    });

    it('should have the combobox role', () => {
      expect(comboboxElement.getAttribute('role')).toBe('combobox');
    });

    it('should update the aria disabled attribute', () => {
      comboboxInstance.disabled = true;
      fixture.detectChanges();

      expect(comboboxElement.getAttribute('aria-disabled')).toBe('true');

      comboboxInstance.disabled = false;
      fixture.detectChanges();

      expect(comboboxElement.getAttribute('aria-disabled')).toBe('false');
    });

    it('should have aria-owns and aria-haspopup attributes', () => {
      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      dialog = fixture.debugElement.query(By.directive(CdkComboboxPopup));
      dialogInstance = dialog.injector.get<CdkComboboxPopup>(CdkComboboxPopup);

      expect(comboboxElement.getAttribute('aria-owns')).toBe(dialogInstance.id);
      expect(comboboxElement.getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('should update aria-expanded attribute upon toggle of panel', () => {
      expect(comboboxElement.getAttribute('aria-expanded')).toBe('false');

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      expect(comboboxElement.getAttribute('aria-expanded')).toBe('true');

      comboboxInstance.close();
      fixture.detectChanges();

      expect(comboboxElement.getAttribute('aria-expanded')).toBe('false');
    });

    it('should toggle focus upon toggling the panel', () => {
      comboboxElement.focus();
      testComponent.actions = 'toggle';
      fixture.detectChanges();

      expect(document.activeElement).toEqual(comboboxElement);

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeTrue();

      dialog = fixture.debugElement.query(By.directive(CdkComboboxPopup));
      dialogElement = dialog.nativeElement;

      expect(document.activeElement).toBe(dialogElement);

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      expect(document.activeElement).not.toEqual(dialogElement);
    });

    it('should have a panel that is closed by default', () => {
      expect(comboboxInstance.hasPanel()).toBeTrue();
      expect(comboboxInstance.isOpen()).toBeFalse();
    });

    it('should have an open action of click by default', () => {
      expect(comboboxInstance.isOpen()).toBeFalse();

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeTrue();
    });

    it('should not open panel when disabled', () => {
      expect(comboboxInstance.isOpen()).toBeFalse();
      comboboxInstance.disabled = true;
      fixture.detectChanges();

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();
    });

    it('should update textContent on close of panel', () => {
      expect(comboboxInstance.isOpen()).toBeFalse();

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeTrue();

      testComponent.inputElement.nativeElement.value = 'testing input';
      fixture.detectChanges();

      applyButton = fixture.debugElement.query(By.css('#applyButton'));
      applyButtonElement = applyButton.nativeElement;

      dispatchMouseEvent(applyButtonElement, 'click');
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();
      expect(comboboxElement.textContent).toEqual('testing input');
    });

    it('should close panel on outside click', () => {
      expect(comboboxInstance.isOpen()).toBeFalse();

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeTrue();

      const otherDiv = fixture.debugElement.query(By.css('#other-content'));
      const otherDivElement = otherDiv.nativeElement;

      dispatchMouseEvent(otherDivElement, 'click');
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();
    });

    it('should clean up the overlay on destroy', () => {
      expect(document.querySelectorAll('.cdk-overlay-pane').length).toBe(0);

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();
      expect(document.querySelectorAll('.cdk-overlay-pane').length).toBe(1);

      fixture.destroy();
      expect(document.querySelectorAll('.cdk-overlay-pane').length).toBe(0);
    });
  });

  describe('with a coerce open action property function', () => {
    let fixture: ComponentFixture<ComboboxToggle>;
    let testComponent: ComboboxToggle;

    let combobox: DebugElement;
    let comboboxInstance: CdkCombobox;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkComboboxModule],
        declarations: [ComboboxToggle],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ComboboxToggle);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      combobox = fixture.debugElement.query(By.directive(CdkCombobox));
      comboboxInstance = combobox.injector.get<CdkCombobox>(CdkCombobox);
    });

    it('should coerce single string into open action', () => {
      const openActions = comboboxInstance.openActions;
      expect(openActions.length).toBe(1);
      expect(openActions[0]).toBe('click');
    });

    it('should coerce actions separated by space', () => {
      testComponent.actions = 'focus click';
      fixture.detectChanges();

      const openActions = comboboxInstance.openActions;
      expect(openActions.length).toBe(2);
      expect(openActions[0]).toBe('focus');
      expect(openActions[1]).toBe('click');
    });

    it('should coerce actions separated by comma', () => {
      testComponent.actions = 'focus,click,downKey';
      fixture.detectChanges();

      const openActions = comboboxInstance.openActions;
      expect(openActions.length).toBe(3);
      expect(openActions[0]).toBe('focus');
      expect(openActions[1]).toBe('click');
      expect(openActions[2]).toBe('downKey');
    });

    it('should coerce actions separated by commas and spaces', () => {
      testComponent.actions = 'focus click,downKey';
      fixture.detectChanges();

      const openActions = comboboxInstance.openActions;
      expect(openActions.length).toBe(3);
      expect(openActions[0]).toBe('focus');
      expect(openActions[1]).toBe('click');
      expect(openActions[2]).toBe('downKey');
    });

    it('should throw error when given invalid open action', () => {
      expect(() => {
        testComponent.actions = 'invalidAction';
        fixture.detectChanges();
      }).toThrow();
    });
  });

  describe('with various open actions', () => {
    let fixture: ComponentFixture<ComboboxToggle>;
    let testComponent: ComboboxToggle;

    let combobox: DebugElement;
    let comboboxInstance: CdkCombobox;
    let comboboxElement: HTMLElement;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkComboboxModule],
        declarations: [ComboboxToggle],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ComboboxToggle);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      combobox = fixture.debugElement.query(By.directive(CdkCombobox));
      comboboxInstance = combobox.injector.get<CdkCombobox>(CdkCombobox);
      comboboxElement = combobox.nativeElement;
    });

    it('should open panel with focus open action', () => {
      testComponent.actions = 'focus';
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();

      comboboxElement.focus();
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeTrue();
    });

    it('should open panel with click open action', () => {
      testComponent.actions = 'click';
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeTrue();
    });

    it('should open panel with downKey open action', () => {
      testComponent.actions = 'downKey';
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();

      dispatchKeyboardEvent(comboboxElement, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeTrue();
    });

    it('should toggle panel with toggle open action', () => {
      testComponent.actions = 'toggle';
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeTrue();

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();
    });

    it('should close panel on escape key', () => {
      testComponent.actions = 'click';
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeTrue();

      dispatchKeyboardEvent(comboboxElement, 'keydown', ESCAPE);
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();
    });

    it('should handle multiple open actions', () => {
      testComponent.actions = 'click downKey';
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeTrue();

      dispatchKeyboardEvent(comboboxElement, 'keydown', ESCAPE);
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();

      dispatchKeyboardEvent(comboboxElement, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeTrue();
    });
  });
});

@Component({
  template: `
  <button cdkCombobox #toggleCombobox="cdkCombobox" class="example-combobox"
          [cdkComboboxTriggerFor]="panel"
          [openActions]="actions">
    No Value
  </button>
  <div id="other-content"></div>

  <ng-template #panel>
    <div #dialog cdkComboboxPopup>
      <input #input>
      <button id="applyButton" (click)="toggleCombobox.updateAndClose(input.value)">Apply</button>
    </div>
  </ng-template>`,
})
class ComboboxToggle {
  @ViewChild('input') inputElement: ElementRef<HTMLInputElement>;

  actions: string = 'click';
}
