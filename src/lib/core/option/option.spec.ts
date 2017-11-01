import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent} from '@angular/cdk/testing';
import {MatOption, MatOptionModule} from './index';

describe('MatOption component', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatOptionModule],
      declarations: [OptionWithDisable]
    }).compileComponents();
  }));

  describe('ripples', () => {
    let fixture: ComponentFixture<OptionWithDisable>;
    let optionDebugElement: DebugElement;
    let optionNativeElement: HTMLElement;
    let optionInstance: MatOption;

    beforeEach(() => {
      fixture = TestBed.createComponent(OptionWithDisable);
      fixture.detectChanges();

      optionDebugElement = fixture.debugElement.query(By.directive(MatOption));
      optionNativeElement = optionDebugElement.nativeElement;
      optionInstance = optionDebugElement.componentInstance;
    });

    it('should show ripples by default', () => {
      expect(optionInstance.disableRipple).toBeFalsy('Expected ripples to be enabled by default');
      expect(optionNativeElement.querySelectorAll('.mat-ripple-element').length)
        .toBe(0, 'Expected no ripples to show up initially');

      dispatchFakeEvent(optionNativeElement, 'mousedown');
      dispatchFakeEvent(optionNativeElement, 'mouseup');

      expect(optionNativeElement.querySelectorAll('.mat-ripple-element').length)
        .toBe(1, 'Expected one ripple to show up after a fake click.');
    });

    it('should not show ripples if the option is disabled', () => {
      expect(optionNativeElement.querySelectorAll('.mat-ripple-element').length)
        .toBe(0, 'Expected no ripples to show up initially');

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      dispatchFakeEvent(optionNativeElement, 'mousedown');
      dispatchFakeEvent(optionNativeElement, 'mouseup');

      expect(optionNativeElement.querySelectorAll('.mat-ripple-element').length)
        .toBe(0, 'Expected no ripples to show up after click on a disabled option.');
    });

  });

});

@Component({
  template: `<mat-option [disabled]="disabled"></mat-option>`
})
class OptionWithDisable {
  disabled: boolean;
}
