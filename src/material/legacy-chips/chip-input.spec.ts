import {Directionality} from '@angular/cdk/bidi';
import {COMMA, ENTER, TAB} from '@angular/cdk/keycodes';
import {PlatformModule} from '@angular/cdk/platform';
import {dispatchKeyboardEvent} from '../../cdk/testing/private';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {waitForAsync, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Subject} from 'rxjs';
import {
  MAT_LEGACY_CHIPS_DEFAULT_OPTIONS,
  MatLegacyChipsDefaultOptions,
} from './chip-default-options';
import {MatLegacyChipInput, MatLegacyChipInputEvent} from './chip-input';
import {MatLegacyChipList} from './chip-list';
import {MatLegacyChipsModule} from './index';

describe('MatChipInput', () => {
  let fixture: ComponentFixture<any>;
  let testChipInput: TestChipInput;
  let inputDebugElement: DebugElement;
  let inputNativeElement: HTMLElement;
  let chipInputDirective: MatLegacyChipInput;
  const dir = 'ltr';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        PlatformModule,
        MatLegacyChipsModule,
        MatLegacyFormFieldModule,
        NoopAnimationsModule,
      ],
      declarations: [TestChipInput],
      providers: [
        {
          provide: Directionality,
          useFactory: () => {
            return {
              value: dir.toLowerCase(),
              change: new Subject(),
            };
          },
        },
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(TestChipInput);
    testChipInput = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    inputDebugElement = fixture.debugElement.query(By.directive(MatLegacyChipInput))!;
    chipInputDirective = inputDebugElement.injector.get<MatLegacyChipInput>(MatLegacyChipInput);
    inputNativeElement = inputDebugElement.nativeElement;
  }));

  describe('basic behavior', () => {
    it('emits the (chipEnd) on enter keyup', () => {
      spyOn(testChipInput, 'add');

      dispatchKeyboardEvent(inputNativeElement, 'keydown', ENTER);
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('should have a default id', () => {
      expect(inputNativeElement.getAttribute('id')).toBeTruthy();
    });

    it('should allow binding to the `placeholder` input', () => {
      expect(inputNativeElement.hasAttribute('placeholder')).toBe(false);

      testChipInput.placeholder = 'bound placeholder';
      fixture.detectChanges();

      expect(inputNativeElement.getAttribute('placeholder')).toBe('bound placeholder');
    });

    it('should propagate the dynamic `placeholder` value to the form field', () => {
      fixture.componentInstance.placeholder = 'add a chip';
      fixture.detectChanges();

      const label: HTMLElement = fixture.nativeElement.querySelector('.mat-form-field-label');

      expect(label).toBeTruthy();
      expect(label.textContent).toContain('add a chip');

      fixture.componentInstance.placeholder = "or don't";
      fixture.detectChanges();

      expect(label.textContent).toContain("or don't");
    });

    it('should become disabled if the list is disabled', () => {
      expect(inputNativeElement.hasAttribute('disabled')).toBe(false);
      expect(chipInputDirective.disabled).toBe(false);

      fixture.componentInstance.chipListInstance.disabled = true;
      fixture.detectChanges();

      expect(inputNativeElement.getAttribute('disabled')).toBe('true');
      expect(chipInputDirective.disabled).toBe(true);
    });

    it('should allow focus to escape when tabbing forwards', fakeAsync(() => {
      const listElement: HTMLElement = fixture.nativeElement.querySelector('.mat-chip-list');

      expect(listElement.getAttribute('tabindex')).toBe('0');

      dispatchKeyboardEvent(inputNativeElement, 'keydown', TAB);
      fixture.detectChanges();

      expect(listElement.getAttribute('tabindex'))
        .withContext('Expected tabIndex to be set to -1 temporarily.')
        .toBe('-1');

      tick();
      fixture.detectChanges();

      expect(listElement.getAttribute('tabindex'))
        .withContext('Expected tabIndex to be reset back to 0')
        .toBe('0');
    }));

    it('should not allow focus to escape when tabbing backwards', fakeAsync(() => {
      const listElement: HTMLElement = fixture.nativeElement.querySelector('.mat-chip-list');

      expect(listElement.getAttribute('tabindex')).toBe('0');

      dispatchKeyboardEvent(inputNativeElement, 'keydown', TAB, undefined, {shift: true});
      fixture.detectChanges();

      expect(listElement.getAttribute('tabindex'))
        .withContext('Expected tabindex to remain 0')
        .toBe('0');

      tick();
      fixture.detectChanges();

      expect(listElement.getAttribute('tabindex'))
        .withContext('Expected tabindex to remain 0')
        .toBe('0');
    }));

    it('should be aria-required if the list is required', () => {
      expect(inputNativeElement.hasAttribute('aria-required')).toBe(false);

      fixture.componentInstance.required = true;
      fixture.detectChanges();

      expect(inputNativeElement.getAttribute('aria-required')).toBe('true');
    });

    it('should set input styling classes', () => {
      expect(inputNativeElement.classList).toContain('mat-input-element');
      expect(inputNativeElement.classList).toContain('mat-chip-input');
    });
  });

  describe('[addOnBlur]', () => {
    it('allows (chipEnd) when true', () => {
      spyOn(testChipInput, 'add');

      testChipInput.addOnBlur = true;
      fixture.detectChanges();

      chipInputDirective._blur();
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('disallows (chipEnd) when false', () => {
      spyOn(testChipInput, 'add');

      testChipInput.addOnBlur = false;
      fixture.detectChanges();

      chipInputDirective._blur();
      expect(testChipInput.add).not.toHaveBeenCalled();
    });
  });

  describe('[separatorKeyCodes]', () => {
    it('does not emit (chipEnd) when a non-separator key is pressed', () => {
      spyOn(testChipInput, 'add');

      chipInputDirective.separatorKeyCodes = [COMMA];
      fixture.detectChanges();

      dispatchKeyboardEvent(inputNativeElement, 'keydown', ENTER);
      expect(testChipInput.add).not.toHaveBeenCalled();
    });

    it('emits (chipEnd) when a custom separator keys is pressed', () => {
      spyOn(testChipInput, 'add');

      chipInputDirective.separatorKeyCodes = [COMMA];
      fixture.detectChanges();

      dispatchKeyboardEvent(inputNativeElement, 'keydown', COMMA);
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('emits accepts the custom separator keys in a Set', () => {
      spyOn(testChipInput, 'add');

      chipInputDirective.separatorKeyCodes = new Set([COMMA]);
      fixture.detectChanges();

      dispatchKeyboardEvent(inputNativeElement, 'keydown', COMMA);
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('emits (chipEnd) when the separator keys are configured globally', () => {
      fixture.destroy();

      TestBed.resetTestingModule()
        .configureTestingModule({
          imports: [
            MatLegacyChipsModule,
            MatLegacyFormFieldModule,
            PlatformModule,
            NoopAnimationsModule,
          ],
          declarations: [TestChipInput],
          providers: [
            {
              provide: MAT_LEGACY_CHIPS_DEFAULT_OPTIONS,
              useValue: {separatorKeyCodes: [COMMA]} as MatLegacyChipsDefaultOptions,
            },
          ],
        })
        .compileComponents();

      fixture = TestBed.createComponent(TestChipInput);
      testChipInput = fixture.debugElement.componentInstance;
      fixture.detectChanges();

      inputDebugElement = fixture.debugElement.query(By.directive(MatLegacyChipInput))!;
      chipInputDirective = inputDebugElement.injector.get<MatLegacyChipInput>(MatLegacyChipInput);
      inputNativeElement = inputDebugElement.nativeElement;

      spyOn(testChipInput, 'add');
      fixture.detectChanges();

      dispatchKeyboardEvent(inputNativeElement, 'keydown', COMMA);
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('should not emit the chipEnd event if a separator is pressed with a modifier key', () => {
      spyOn(testChipInput, 'add');

      chipInputDirective.separatorKeyCodes = [ENTER];
      fixture.detectChanges();

      dispatchKeyboardEvent(inputNativeElement, 'keydown', ENTER, undefined, {shift: true});
      expect(testChipInput.add).not.toHaveBeenCalled();
    });
  });
});

@Component({
  template: `
    <mat-form-field>
      <mat-chip-list #chipList [required]="required">
        <mat-chip>Hello</mat-chip>
        <input [matChipInputFor]="chipList"
                  [matChipInputAddOnBlur]="addOnBlur"
                  (matChipInputTokenEnd)="add($event)"
                  [placeholder]="placeholder" />
      </mat-chip-list>
    </mat-form-field>
  `,
})
class TestChipInput {
  @ViewChild(MatLegacyChipList) chipListInstance: MatLegacyChipList;
  addOnBlur = false;
  required = false;
  placeholder = '';

  add(_: MatLegacyChipInputEvent) {}
}
