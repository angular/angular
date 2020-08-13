import {Component, DebugElement} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {CdkComboboxModule} from './combobox-module';
import {CdkCombobox} from './combobox';
import {dispatchMouseEvent} from '@angular/cdk/testing/private';

describe('Combobox', () => {
  describe('with a basic toggle trigger', () => {
    let fixture: ComponentFixture<ComboboxToggle>;

    let combobox: DebugElement;
    let comboboxInstance: CdkCombobox<unknown>;
    let comboboxElement: HTMLElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkComboboxModule],
        declarations: [ComboboxToggle],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ComboboxToggle);
      fixture.detectChanges();

      combobox = fixture.debugElement.query(By.directive(CdkCombobox));
      comboboxInstance = combobox.injector.get<CdkCombobox<unknown>>(CdkCombobox);
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
  });

});

@Component({
  template: `
  <button cdkCombobox #toggleCombobox class="example-combobox"
          [cdkComboboxTriggerFor]="panel"
          [openActions]="'focus'">
    No Value
  </button>

  <ng-template cdkComboboxPanel #panel="cdkComboboxPanel">
    Panel Content
  </ng-template>`,
})
class ComboboxToggle {
}
