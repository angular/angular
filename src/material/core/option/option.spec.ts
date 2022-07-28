import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  createKeyboardEvent,
  dispatchEvent,
} from '@angular/cdk/testing/private';
import {SPACE, ENTER} from '@angular/cdk/keycodes';
import {MatOption, MatOptionModule, MAT_OPTION_PARENT_COMPONENT} from './index';

describe('MatOption component', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatOptionModule],
      declarations: [BasicOption],
    }).compileComponents();
  }));

  it('should complete the `stateChanges` stream on destroy', () => {
    const fixture = TestBed.createComponent(BasicOption);
    fixture.detectChanges();

    const optionInstance: MatOption = fixture.debugElement.query(
      By.directive(MatOption),
    )!.componentInstance;
    const completeSpy = jasmine.createSpy('complete spy');
    const subscription = optionInstance._stateChanges.subscribe({complete: completeSpy});

    fixture.destroy();
    expect(completeSpy).toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('should not emit to `onSelectionChange` if selecting an already-selected option', () => {
    const fixture = TestBed.createComponent(BasicOption);
    fixture.detectChanges();

    const optionInstance: MatOption = fixture.debugElement.query(
      By.directive(MatOption),
    )!.componentInstance;

    optionInstance.select();
    expect(optionInstance.selected).toBe(true);

    const spy = jasmine.createSpy('selection change spy');
    const subscription = optionInstance.onSelectionChange.subscribe(spy);

    optionInstance.select();
    fixture.detectChanges();

    expect(optionInstance.selected).toBe(true);
    expect(spy).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should not emit to `onSelectionChange` if deselecting an unselected option', () => {
    const fixture = TestBed.createComponent(BasicOption);
    fixture.detectChanges();

    const optionInstance: MatOption = fixture.debugElement.query(
      By.directive(MatOption),
    )!.componentInstance;

    optionInstance.deselect();
    expect(optionInstance.selected).toBe(false);

    const spy = jasmine.createSpy('selection change spy');
    const subscription = optionInstance.onSelectionChange.subscribe(spy);

    optionInstance.deselect();
    fixture.detectChanges();

    expect(optionInstance.selected).toBe(false);
    expect(spy).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should be able to set a custom id', () => {
    const fixture = TestBed.createComponent(BasicOption);

    fixture.componentInstance.id = 'custom-option';
    fixture.detectChanges();

    const optionInstance = fixture.debugElement.query(By.directive(MatOption))!.componentInstance;

    expect(optionInstance.id).toBe('custom-option');
  });

  it('should select the option when pressing space', () => {
    const fixture = TestBed.createComponent(BasicOption);
    fixture.detectChanges();

    const optionDebugElement = fixture.debugElement.query(By.directive(MatOption))!;
    const optionNativeElement: HTMLElement = optionDebugElement.nativeElement;
    const optionInstance: MatOption = optionDebugElement.componentInstance;
    const spy = jasmine.createSpy('selection change spy');
    const subscription = optionInstance.onSelectionChange.subscribe(spy);

    const event = dispatchKeyboardEvent(optionNativeElement, 'keydown', SPACE);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
    subscription.unsubscribe();
  });

  it('should select the option when pressing enter', () => {
    const fixture = TestBed.createComponent(BasicOption);
    fixture.detectChanges();

    const optionDebugElement = fixture.debugElement.query(By.directive(MatOption))!;
    const optionNativeElement: HTMLElement = optionDebugElement.nativeElement;
    const optionInstance: MatOption = optionDebugElement.componentInstance;
    const spy = jasmine.createSpy('selection change spy');
    const subscription = optionInstance.onSelectionChange.subscribe(spy);

    const event = dispatchKeyboardEvent(optionNativeElement, 'keydown', ENTER);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
    subscription.unsubscribe();
  });

  it('should not do anything when pressing the selection keys with a modifier', () => {
    const fixture = TestBed.createComponent(BasicOption);
    fixture.detectChanges();

    const optionDebugElement = fixture.debugElement.query(By.directive(MatOption))!;
    const optionNativeElement: HTMLElement = optionDebugElement.nativeElement;
    const optionInstance: MatOption = optionDebugElement.componentInstance;
    const spy = jasmine.createSpy('selection change spy');
    const subscription = optionInstance.onSelectionChange.subscribe(spy);

    [ENTER, SPACE].forEach(key => {
      const event = createKeyboardEvent('keydown', key);
      Object.defineProperty(event, 'shiftKey', {get: () => true});
      dispatchEvent(optionNativeElement, event);
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(false);
    });

    expect(spy).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });

  describe('ripples', () => {
    let fixture: ComponentFixture<BasicOption>;
    let optionDebugElement: DebugElement;
    let optionNativeElement: HTMLElement;
    let optionInstance: MatOption;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicOption);
      fixture.detectChanges();

      optionDebugElement = fixture.debugElement.query(By.directive(MatOption))!;
      optionNativeElement = optionDebugElement.nativeElement;
      optionInstance = optionDebugElement.componentInstance;
    });

    it('should show ripples by default', () => {
      expect(optionInstance.disableRipple)
        .withContext('Expected ripples to be enabled by default')
        .toBeFalsy();
      expect(optionNativeElement.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected no ripples to show up initially')
        .toBe(0);

      dispatchFakeEvent(optionNativeElement, 'mousedown');
      dispatchFakeEvent(optionNativeElement, 'mouseup');

      expect(optionNativeElement.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected one ripple to show up after a fake click.')
        .toBe(1);
    });

    it('should not show ripples if the option is disabled', () => {
      expect(optionNativeElement.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected no ripples to show up initially')
        .toBe(0);

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      dispatchFakeEvent(optionNativeElement, 'mousedown');
      dispatchFakeEvent(optionNativeElement, 'mouseup');

      expect(optionNativeElement.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected no ripples to show up after click on a disabled option.')
        .toBe(0);
    });
  });

  it('should have a focus indicator', () => {
    const fixture = TestBed.createComponent(BasicOption);
    const optionNativeElement = fixture.debugElement.query(By.directive(MatOption))!.nativeElement;

    expect(optionNativeElement.classList.contains('mat-mdc-focus-indicator')).toBe(true);
  });

  describe('inside inert group', () => {
    let fixture: ComponentFixture<InsideGroup>;

    beforeEach(waitForAsync(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [MatOptionModule],
        declarations: [InsideGroup],
        providers: [
          {
            provide: MAT_OPTION_PARENT_COMPONENT,
            useValue: {inertGroups: true},
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(InsideGroup);
      fixture.detectChanges();
    }));

    it('should remove all accessibility-related attributes from the group', () => {
      const group: HTMLElement = fixture.nativeElement.querySelector('mat-optgroup');
      expect(group.hasAttribute('role')).toBe(false);
      expect(group.hasAttribute('aria-disabled')).toBe(false);
      expect(group.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('should mirror the group label inside the option', () => {
      const option: HTMLElement = fixture.nativeElement.querySelector('mat-option');
      expect(option.textContent?.trim()).toBe('Option(Group)');
    });
  });
});

@Component({
  template: `<mat-option [id]="id" [disabled]="disabled"></mat-option>`,
})
class BasicOption {
  disabled: boolean;
  id: string;
}

@Component({
  template: `
    <mat-optgroup label="Group">
      <mat-option>Option</mat-option>
    </mat-optgroup>
  `,
})
class InsideGroup {}
