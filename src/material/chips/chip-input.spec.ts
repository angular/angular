import {Directionality} from '@angular/cdk/bidi';
import {COMMA, ENTER, TAB} from '@angular/cdk/keycodes';
import {PlatformModule} from '@angular/cdk/platform';
import {dispatchKeyboardEvent} from '../../cdk/testing/private';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {waitForAsync, ComponentFixture, fakeAsync, TestBed, flush} from '@angular/core/testing';
import {MatFormFieldModule} from '@angular/material/form-field';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Subject} from 'rxjs';
import {
  MAT_CHIPS_DEFAULT_OPTIONS,
  MatChipGrid,
  MatChipInput,
  MatChipInputEvent,
  MatChipsDefaultOptions,
  MatChipsModule,
} from './index';

describe('MDC-based MatChipInput', () => {
  let fixture: ComponentFixture<any>;
  let testChipInput: TestChipInput;
  let inputDebugElement: DebugElement;
  let inputNativeElement: HTMLElement;
  let chipInputDirective: MatChipInput;
  let dir = 'ltr';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PlatformModule, MatChipsModule, MatFormFieldModule, NoopAnimationsModule],
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

    inputDebugElement = fixture.debugElement.query(By.directive(MatChipInput))!;
    chipInputDirective = inputDebugElement.injector.get<MatChipInput>(MatChipInput);
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

    it('should become disabled if the list is disabled', () => {
      expect(inputNativeElement.hasAttribute('disabled')).toBe(false);
      expect(chipInputDirective.disabled).toBe(false);

      fixture.componentInstance.chipGridInstance.disabled = true;
      fixture.detectChanges();

      expect(inputNativeElement.getAttribute('disabled')).toBe('true');
      expect(chipInputDirective.disabled).toBe(true);
    });

    it('should be aria-required if the list is required', () => {
      expect(inputNativeElement.hasAttribute('aria-required')).toBe(false);

      fixture.componentInstance.required = true;
      fixture.detectChanges();

      expect(inputNativeElement.getAttribute('aria-required')).toBe('true');
    });

    it('should be required if the list is required', () => {
      expect(inputNativeElement.hasAttribute('required')).toBe(false);

      fixture.componentInstance.required = true;
      fixture.detectChanges();

      expect(inputNativeElement.getAttribute('required')).toBe('true');
    });

    it('should allow focus to escape when tabbing forwards', fakeAsync(() => {
      const gridElement: HTMLElement = fixture.nativeElement.querySelector('mat-chip-grid');

      expect(gridElement.getAttribute('tabindex')).toBe('0');

      dispatchKeyboardEvent(gridElement, 'keydown', TAB);
      fixture.detectChanges();

      expect(gridElement.getAttribute('tabindex'))
        .withContext('Expected tabIndex to be set to -1 temporarily.')
        .toBe('-1');

      flush();
      fixture.detectChanges();

      expect(gridElement.getAttribute('tabindex'))
        .withContext('Expected tabIndex to be reset back to 0')
        .toBe('0');
    }));

    it('should set input styling classes', () => {
      expect(inputNativeElement.classList).toContain('mat-mdc-input-element');
      expect(inputNativeElement.classList).toContain('mat-mdc-form-field-input-control');
      expect(inputNativeElement.classList).toContain('mat-mdc-chip-input');
      expect(inputNativeElement.classList).toContain('mdc-text-field__input');
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
          imports: [MatChipsModule, MatFormFieldModule, PlatformModule, NoopAnimationsModule],
          declarations: [TestChipInput],
          providers: [
            {
              provide: MAT_CHIPS_DEFAULT_OPTIONS,
              useValue: {separatorKeyCodes: [COMMA]} as MatChipsDefaultOptions,
            },
          ],
        })
        .compileComponents();

      fixture = TestBed.createComponent(TestChipInput);
      testChipInput = fixture.debugElement.componentInstance;
      fixture.detectChanges();

      inputDebugElement = fixture.debugElement.query(By.directive(MatChipInput))!;
      chipInputDirective = inputDebugElement.injector.get<MatChipInput>(MatChipInput);
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

    it('should set aria-describedby correctly when a non-empty list of ids is passed to setDescribedByIds', fakeAsync(() => {
      const ids = ['a', 'b', 'c'];

      testChipInput.chipGridInstance.setDescribedByIds(ids);
      flush();
      fixture.detectChanges();

      expect(inputNativeElement.getAttribute('aria-describedby')).toEqual('a b c');
    }));

    it('should set aria-describedby correctly when an empty list of ids is passed to setDescribedByIds', fakeAsync(() => {
      const ids: string[] = [];

      testChipInput.chipGridInstance.setDescribedByIds(ids);
      flush();
      fixture.detectChanges();

      expect(inputNativeElement.getAttribute('aria-describedby')).toBeNull();
    }));
  });
});

@Component({
  template: `
    <mat-form-field>
      <mat-chip-grid #chipGrid [required]="required">
        <mat-chip-row>Hello</mat-chip-row>
        <input [matChipInputFor]="chipGrid"
                  [matChipInputAddOnBlur]="addOnBlur"
                  (matChipInputTokenEnd)="add($event)"
                  [placeholder]="placeholder" />
      </mat-chip-grid>
    </mat-form-field>
  `,
})
class TestChipInput {
  @ViewChild(MatChipGrid) chipGridInstance: MatChipGrid;
  addOnBlur: boolean = false;
  placeholder = '';
  required = false;

  add(_: MatChipInputEvent) {}
}
