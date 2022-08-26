import {getSupportedInputTypes, _supportsShadowDom} from '@angular/cdk/platform';
import {
  createFakeEvent,
  dispatchFakeEvent,
  wrappedErrorMessage,
  MockNgZone,
} from '../../cdk/testing/private';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  Type,
  Provider,
  NgZone,
  Directive,
  ViewEncapsulation,
  ElementRef,
} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher,
  ThemePalette,
} from '@angular/material/core';
import {
  getMatLegacyFormFieldDuplicatedHintError,
  getMatLegacyFormFieldMissingControlError,
  getMatLegacyFormFieldPlaceholderConflictError,
  MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS,
  MatLegacyFormField,
  MatLegacyFormFieldAppearance,
  MatLegacyFormFieldModule,
  LegacyFloatLabelType,
} from '@angular/material/legacy-form-field';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Directionality, Direction} from '@angular/cdk/bidi';
import {Subject} from 'rxjs';
import {MatLegacyInputModule, MatLegacyInput, MAT_LEGACY_INPUT_VALUE_ACCESSOR} from './index';

describe('MatInput without forms', () => {
  it('should default to floating labels', fakeAsync(() => {
    const fixture = createComponent(MatInputWithId);
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.directive(MatLegacyFormField))!
      .componentInstance as MatLegacyFormField;
    expect(formField.floatLabel)
      .withContext('Expected MatInput to set floatingLabel to auto by default.')
      .toBe('auto');
  }));

  it('should default to floating label type provided by global default options', fakeAsync(() => {
    const fixture = createComponent(MatInputWithId, [
      {
        provide: MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {floatLabel: 'always'},
      },
    ]);
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.directive(MatLegacyFormField))!
      .componentInstance as MatLegacyFormField;
    expect(formField.floatLabel)
      .withContext('Expected MatInput to set floatingLabel to always from global option.')
      .toBe('always');
  }));

  it('should not be treated as empty if type is date', fakeAsync(() => {
    const fixture = createComponent(MatInputDateTestController);
    fixture.detectChanges();

    if (getSupportedInputTypes().has('date')) {
      const el = fixture.debugElement.query(By.css('label'))!.nativeElement;
      expect(el).not.toBeNull();
      expect(el.classList.contains('mat-form-field-empty')).toBe(false);
    }
  }));

  it('should be treated as empty if type is date on unsupported browser', fakeAsync(() => {
    const fixture = createComponent(MatInputDateTestController);
    fixture.detectChanges();

    if (!getSupportedInputTypes().has('date')) {
      const el = fixture.debugElement.query(By.css('label'))!.nativeElement;
      expect(el).not.toBeNull();
      expect(el.classList.contains('mat-form-field-empty')).toBe(true);
    }
  }));

  it('should treat text input type as empty at init', fakeAsync(() => {
    const fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;
    expect(labelEl).not.toBeNull();
    expect(labelEl.classList.contains('mat-form-field-empty')).toBe(true);
  }));

  it('should treat password input type as empty at init', fakeAsync(() => {
    const fixture = createComponent(MatInputPasswordTestController);
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;
    expect(labelEl).not.toBeNull();
    expect(labelEl.classList.contains('mat-form-field-empty')).toBe(true);
  }));

  it('should treat number input type as empty at init', fakeAsync(() => {
    const fixture = createComponent(MatInputNumberTestController);
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;
    expect(labelEl).not.toBeNull();
    expect(labelEl.classList.contains('mat-form-field-empty')).toBe(true);
  }));

  it('should not be empty after input entered', fakeAsync(() => {
    const fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    const inputElement = fixture.debugElement.query(By.css('input'))!;
    let labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;
    expect(labelEl).not.toBeNull();
    expect(labelEl.classList.contains('mat-form-field-empty'))
      .withContext('should be empty')
      .toBe(true);

    inputElement.nativeElement.value = 'hello';
    // Simulate input event.
    inputElement.triggerEventHandler('input', {target: inputElement.nativeElement});
    fixture.detectChanges();

    labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;
    expect(labelEl.classList.contains('mat-form-field-empty'))
      .withContext('should not be empty')
      .toBe(false);
  }));

  it('should update the placeholder when input entered', fakeAsync(() => {
    const fixture = createComponent(MatInputWithStaticLabel);
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input'))!;
    const labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;

    expect(labelEl.classList).toContain('mat-form-field-empty');
    expect(labelEl.classList).not.toContain('mat-form-field-float');

    // Update the value of the input.
    inputEl.nativeElement.value = 'Text';

    // Fake behavior of the `(input)` event which should trigger a change detection.
    fixture.detectChanges();

    expect(labelEl.classList).not.toContain('mat-form-field-empty');
    expect(labelEl.classList).not.toContain('mat-form-field-float');
  }));

  it('should not be empty when the value set before view init', fakeAsync(() => {
    const fixture = createComponent(MatInputWithValueBinding);
    fixture.detectChanges();
    const labelEl = fixture.debugElement.query(By.css('.mat-form-field-label'))!.nativeElement;

    expect(labelEl.classList).not.toContain('mat-form-field-empty');

    fixture.componentInstance.value = '';
    fixture.detectChanges();

    expect(labelEl.classList).toContain('mat-form-field-empty');
  }));

  it('should add id', fakeAsync(() => {
    const fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    const inputElement: HTMLInputElement = fixture.debugElement.query(
      By.css('input'),
    )!.nativeElement;
    const labelElement: HTMLInputElement = fixture.debugElement.query(
      By.css('label'),
    )!.nativeElement;

    expect(inputElement.id).toBeTruthy();
    expect(inputElement.id).toEqual(labelElement.getAttribute('for')!);
  }));

  it('should add aria-owns to the label for the associated control', fakeAsync(() => {
    const fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    const inputElement: HTMLInputElement = fixture.debugElement.query(
      By.css('input'),
    )!.nativeElement;
    const labelElement: HTMLInputElement = fixture.debugElement.query(
      By.css('label'),
    )!.nativeElement;

    expect(labelElement.getAttribute('aria-owns')).toBe(inputElement.id);
  }));

  it('should add aria-required reflecting the required state', fakeAsync(() => {
    const fixture = createComponent(MatInputWithRequired);
    fixture.detectChanges();

    const inputElement: HTMLInputElement = fixture.debugElement.query(
      By.css('input'),
    )!.nativeElement;

    expect(inputElement.getAttribute('aria-required'))
      .withContext('Expected aria-required to reflect required state of false')
      .toBe('false');

    fixture.componentInstance.required = true;
    fixture.detectChanges();

    expect(inputElement.getAttribute('aria-required'))
      .withContext('Expected aria-required to reflect required state of true')
      .toBe('true');
  }));

  it('should not overwrite existing id', fakeAsync(() => {
    const fixture = createComponent(MatInputWithId);
    fixture.detectChanges();

    const inputElement: HTMLInputElement = fixture.debugElement.query(
      By.css('input'),
    )!.nativeElement;
    const labelElement: HTMLInputElement = fixture.debugElement.query(
      By.css('label'),
    )!.nativeElement;

    expect(inputElement.id).toBe('test-id');
    expect(labelElement.getAttribute('for')).toBe('test-id');
  }));

  it("validates there's only one hint label per side", fakeAsync(() => {
    const fixture = createComponent(MatInputInvalidHintTestController);

    expect(() => {
      try {
        fixture.detectChanges();
        flush();
      } catch {
        flush();
      }
    }).toThrowError(wrappedErrorMessage(getMatLegacyFormFieldDuplicatedHintError('start')));
  }));

  it("validates there's only one hint label per side (attribute)", fakeAsync(() => {
    const fixture = createComponent(MatInputInvalidHint2TestController);

    expect(() => {
      try {
        fixture.detectChanges();
        flush();
      } catch {
        flush();
      }
    }).toThrowError(wrappedErrorMessage(getMatLegacyFormFieldDuplicatedHintError('start')));
  }));

  it("validates there's only one placeholder", fakeAsync(() => {
    const fixture = createComponent(MatInputInvalidPlaceholderTestController);

    expect(() => {
      try {
        fixture.detectChanges();
        flush();
      } catch {
        flush();
      }
    }).toThrowError(wrappedErrorMessage(getMatLegacyFormFieldPlaceholderConflictError()));
  }));

  it('validates that matInput child is present', fakeAsync(() => {
    const fixture = createComponent(MatInputMissingMatInputTestController);

    expect(() => fixture.detectChanges()).toThrowError(
      wrappedErrorMessage(getMatLegacyFormFieldMissingControlError()),
    );
  }));

  it('validates that matInput child is present after initialization', fakeAsync(() => {
    const fixture = createComponent(MatInputWithNgIf);

    expect(() => fixture.detectChanges()).not.toThrowError(
      wrappedErrorMessage(getMatLegacyFormFieldMissingControlError()),
    );

    fixture.componentInstance.renderInput = false;

    expect(() => fixture.detectChanges()).toThrowError(
      wrappedErrorMessage(getMatLegacyFormFieldMissingControlError()),
    );
  }));

  it('validates the type', fakeAsync(() => {
    const fixture = createComponent(MatInputInvalidTypeTestController);

    // Technically this throws during the OnChanges detection phase,
    // so the error is really a ChangeDetectionError and it becomes
    // hard to build a full exception to compare with.
    // We just check for any exception in this case.
    expect(() => fixture.detectChanges())
      .toThrow
      /* new MatInputUnsupportedTypeError('file') */
      ();
  }));

  it('supports hint labels attribute', fakeAsync(() => {
    const fixture = createComponent(MatInputHintLabelTestController);
    fixture.detectChanges();

    // If the hint label is empty, expect no label.
    expect(fixture.debugElement.query(By.css('.mat-hint'))).toBeNull();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.mat-hint'))).not.toBeNull();
  }));

  it('sets an id on hint labels', fakeAsync(() => {
    const fixture = createComponent(MatInputHintLabelTestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    const hint = fixture.debugElement.query(By.css('.mat-hint'))!.nativeElement;

    expect(hint.getAttribute('id')).toBeTruthy();
  }));

  it('supports hint labels elements', fakeAsync(() => {
    const fixture = createComponent(MatInputHintLabel2TestController);
    fixture.detectChanges();

    // In this case, we should have an empty <mat-hint>.
    let hintLabelEl = fixture.debugElement.query(By.css('mat-hint'))!.nativeElement;
    expect(hintLabelEl.textContent).toBeFalsy();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    hintLabelEl = fixture.debugElement.query(By.css('mat-hint'))!.nativeElement;
    expect(hintLabelEl.textContent).toBe('label');
  }));

  it('sets an id on the hint element', fakeAsync(() => {
    const fixture = createComponent(MatInputHintLabel2TestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    const hint = fixture.debugElement.query(By.css('mat-hint'))!.nativeElement;

    expect(hint.getAttribute('id')).toBeTruthy();
  }));

  it('supports placeholder attribute', fakeAsync(() => {
    const fixture = createComponent(MatInputPlaceholderAttrTestComponent);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('label'))).toBeNull();

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label'))!;

    expect(labelEl).not.toBeNull();
    expect(labelEl.nativeElement.textContent).toBe('Other placeholder');
  }));

  it('should not render the native placeholder when its value is mirrored in the label', fakeAsync(() => {
    const fixture = createComponent(MatInputPlaceholderAttrTestComponent);
    fixture.componentInstance.placeholder = 'Enter a name';
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    const labelEl = fixture.debugElement.query(By.css('label'));

    expect(inputEl.hasAttribute('placeholder')).toBe(false);
    expect(labelEl.nativeElement.textContent).toContain('Enter a name');
  }));

  it('supports placeholder element', fakeAsync(() => {
    const fixture = createComponent(MatInputPlaceholderElementTestComponent);
    fixture.detectChanges();

    let labelEl = fixture.debugElement.query(By.css('label'))!;
    expect(labelEl).not.toBeNull();
    expect(labelEl.nativeElement.textContent).toMatch('Default Placeholder');

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();

    labelEl = fixture.debugElement.query(By.css('label'))!;
    expect(labelEl).not.toBeNull();
    expect(labelEl.nativeElement.textContent).toBe('Other placeholder');
  }));

  it('supports placeholder required star', fakeAsync(() => {
    const fixture = createComponent(MatInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label'))!;
    expect(labelEl).not.toBeNull();
    expect(labelEl.nativeElement.textContent).toBe('hello *');
  }));

  it('should show the required star when using a FormControl', fakeAsync(() => {
    const fixture = createComponent(MatInputWithRequiredFormControl);
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label'))!;
    expect(labelEl).not.toBeNull();
    expect(labelEl.nativeElement.textContent).toBe('Hello *');
  }));

  it('should hide the required star if input is disabled', () => {
    const fixture = createComponent(MatInputPlaceholderRequiredTestComponent);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label'))!;

    expect(labelEl).not.toBeNull();
    expect(labelEl.nativeElement.textContent).toBe('hello');
  });

  it('should hide the required star from screen readers', fakeAsync(() => {
    const fixture = createComponent(MatInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    const matFormFieldElement = fixture.debugElement.query(
      By.css('.mat-form-field-required-marker'),
    )!.nativeElement;

    expect(matFormFieldElement.getAttribute('aria-hidden')).toBe('true');
  }));

  it('hide placeholder required star when set to hide the required marker', fakeAsync(() => {
    const fixture = createComponent(MatInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label'))!;
    expect(labelEl).not.toBeNull();
    expect(labelEl.nativeElement.textContent).toBe('hello *');

    fixture.componentInstance.hideRequiredMarker = true;
    fixture.detectChanges();

    expect(labelEl.nativeElement.textContent).toBe('hello');
  }));

  it('supports the disabled attribute as binding', fakeAsync(() => {
    const fixture = createComponent(MatInputWithDisabled);
    fixture.detectChanges();

    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field'))!.nativeElement;
    const inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(formFieldEl.classList.contains('mat-form-field-disabled'))
      .withContext(`Expected form field not to start out disabled.`)
      .toBe(false);
    expect(inputEl.disabled).toBe(false);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    expect(formFieldEl.classList.contains('mat-form-field-disabled'))
      .withContext(`Expected form field to look disabled after property is set.`)
      .toBe(true);
    expect(inputEl.disabled).toBe(true);
  }));

  it('supports the disabled attribute as binding for select', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field'))!.nativeElement;
    const selectEl = fixture.debugElement.query(By.css('select'))!.nativeElement;

    expect(formFieldEl.classList.contains('mat-form-field-disabled'))
      .withContext(`Expected form field not to start out disabled.`)
      .toBe(false);
    expect(selectEl.disabled).toBe(false);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    expect(formFieldEl.classList.contains('mat-form-field-disabled'))
      .withContext(`Expected form field to look disabled after property is set.`)
      .toBe(true);
    expect(selectEl.disabled).toBe(true);
  }));

  it('should add a class to the form field if it has a native select', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.css('.mat-form-field'))!.nativeElement;

    expect(formField.classList).toContain('mat-form-field-type-mat-native-select');
  }));

  it('supports the required attribute as binding', fakeAsync(() => {
    const fixture = createComponent(MatInputWithRequired);
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(inputEl.required).toBe(false);

    fixture.componentInstance.required = true;
    fixture.detectChanges();

    expect(inputEl.required).toBe(true);
  }));

  it('supports the required attribute as binding for select', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const selectEl = fixture.debugElement.query(By.css('select'))!.nativeElement;

    expect(selectEl.required).toBe(false);

    fixture.componentInstance.required = true;
    fixture.detectChanges();

    expect(selectEl.required).toBe(true);
  }));

  it('supports the type attribute as binding', fakeAsync(() => {
    const fixture = createComponent(MatInputWithType);
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(inputEl.type).toBe('text');

    fixture.componentInstance.type = 'password';
    fixture.detectChanges();

    expect(inputEl.type).toBe('password');
  }));

  it('supports textarea', fakeAsync(() => {
    const fixture = createComponent(MatInputTextareaWithBindings);
    fixture.detectChanges();

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea).not.toBeNull();
  }));

  it('supports select', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const nativeSelect: HTMLTextAreaElement = fixture.nativeElement.querySelector('select');
    expect(nativeSelect).not.toBeNull();
  }));

  it('sets the aria-describedby when a hintLabel is set', fakeAsync(() => {
    const fixture = createComponent(MatInputHintLabelTestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    const hint = fixture.debugElement.query(By.css('.mat-hint'))!.nativeElement;
    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;
    const hintId = hint.getAttribute('id');

    expect(input.getAttribute('aria-describedby')).toBe(`initial ${hintId}`);
  }));

  it('supports user binding to aria-describedby', fakeAsync(() => {
    const fixture = createComponent(MatInputWithSubscriptAndAriaDescribedBy);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    const hint = fixture.debugElement.query(By.css('.mat-hint'))!.nativeElement;
    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;
    const hintId = hint.getAttribute('id');

    expect(input.getAttribute('aria-describedby')).toBe(hintId);

    fixture.componentInstance.userDescribedByValue = 'custom-error custom-error-two';
    fixture.detectChanges();
    expect(input.getAttribute('aria-describedby')).toBe(`custom-error custom-error-two ${hintId}`);

    fixture.componentInstance.userDescribedByValue = 'custom-error';
    fixture.detectChanges();
    expect(input.getAttribute('aria-describedby')).toBe(`custom-error ${hintId}`);

    fixture.componentInstance.showError = true;
    fixture.componentInstance.formControl.markAsTouched();
    fixture.componentInstance.formControl.setErrors({invalid: true});
    fixture.detectChanges();
    expect(input.getAttribute('aria-describedby')).toMatch(/^custom-error mat-error-\d+$/);

    fixture.componentInstance.label = '';
    fixture.componentInstance.userDescribedByValue = '';
    fixture.componentInstance.showError = false;
    fixture.detectChanges();
    expect(input.hasAttribute('aria-describedby')).toBe(false);
  }));

  it('sets the aria-describedby to the id of the mat-hint', fakeAsync(() => {
    const fixture = createComponent(MatInputHintLabel2TestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    const hint = fixture.debugElement.query(By.css('.mat-hint'))!.nativeElement;
    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
  }));

  it('sets the aria-describedby with multiple mat-hint instances', fakeAsync(() => {
    const fixture = createComponent(MatInputMultipleHintTestController);

    fixture.componentInstance.startId = 'start';
    fixture.componentInstance.endId = 'end';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe('start end');
  }));

  it('should set a class on the hint element based on its alignment', fakeAsync(() => {
    const fixture = createComponent(MatInputMultipleHintTestController);

    fixture.componentInstance.startId = 'start';
    fixture.componentInstance.endId = 'end';
    fixture.detectChanges();

    const start = fixture.nativeElement.querySelector('#start');
    const end = fixture.nativeElement.querySelector('#end');

    expect(start.classList).not.toContain('mat-form-field-hint-end');
    expect(end.classList).toContain('mat-form-field-hint-end');
  }));

  it('sets the aria-describedby when a hintLabel is set, in addition to a mat-hint', fakeAsync(() => {
    const fixture = createComponent(MatInputMultipleHintMixedTestController);

    fixture.detectChanges();

    const hintLabel = fixture.debugElement.query(
      By.css('.mat-hint:not(.mat-form-field-hint-end)'),
    )!.nativeElement;
    const endLabel = fixture.debugElement.query(
      By.css('.mat-hint.mat-form-field-hint-end'),
    )!.nativeElement;
    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;
    const ariaValue = input.getAttribute('aria-describedby');

    expect(ariaValue).toBe(`${hintLabel.getAttribute('id')} ${endLabel.getAttribute('id')}`);
  }));

  it('should float when floatLabel is set to default and text is entered', fakeAsync(() => {
    const fixture = createComponent(MatInputWithDynamicLabel);
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field'))!.nativeElement;

    expect(formFieldEl.classList).toContain('mat-form-field-can-float');
    expect(formFieldEl.classList).toContain('mat-form-field-should-float');

    fixture.componentInstance.shouldFloat = 'auto';
    fixture.detectChanges();

    expect(formFieldEl.classList).toContain('mat-form-field-can-float');
    expect(formFieldEl.classList).not.toContain('mat-form-field-should-float');

    // Update the value of the input.
    inputEl.value = 'Text';

    // Fake behavior of the `(input)` event which should trigger a change detection.
    fixture.detectChanges();

    expect(formFieldEl.classList).toContain('mat-form-field-can-float');
    expect(formFieldEl.classList).toContain('mat-form-field-should-float');
  }));

  it('should always float the label when floatLabel is set to true', fakeAsync(() => {
    const fixture = createComponent(MatInputWithDynamicLabel);
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field'))!.nativeElement;

    expect(formFieldEl.classList).toContain('mat-form-field-can-float');
    expect(formFieldEl.classList).toContain('mat-form-field-should-float');

    fixture.detectChanges();

    // Update the value of the input.
    inputEl.value = 'Text';

    // Fake behavior of the `(input)` event which should trigger a change detection.
    fixture.detectChanges();

    expect(formFieldEl.classList).toContain('mat-form-field-can-float');
    expect(formFieldEl.classList).toContain('mat-form-field-should-float');
  }));

  it('should float labels when select has value', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field'))!.nativeElement;
    expect(formFieldEl.classList).toContain('mat-form-field-should-float');
  }));

  it('should mark a multi-select as being inline', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');

    expect(select.classList).not.toContain('mat-native-select-inline');

    select.multiple = true;
    fixture.detectChanges();

    expect(select.classList).toContain('mat-native-select-inline');
  }));

  it('should mark a select with a size as being inline', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');

    expect(select.classList).not.toContain('mat-native-select-inline');

    select.size = 3;
    fixture.detectChanges();
    expect(select.classList).toContain('mat-native-select-inline');

    select.size = 1;
    fixture.detectChanges();
    expect(select.classList).not.toContain('mat-native-select-inline');
  }));

  it('should not float the label if the selectedIndex is negative', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field'))!.nativeElement;
    const selectEl: HTMLSelectElement = formFieldEl.querySelector('select');

    expect(formFieldEl.classList).toContain('mat-form-field-should-float');

    selectEl.selectedIndex = -1;
    fixture.detectChanges();

    expect(formFieldEl.classList).not.toContain('mat-form-field-should-float');
  }));

  it(
    'should not float labels when select has no value, no option label, ' + 'no option innerHtml',
    fakeAsync(() => {
      const fixture = createComponent(MatInputSelectWithNoLabelNoValue);
      fixture.detectChanges();

      const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field'))!.nativeElement;
      expect(formFieldEl.classList).not.toContain('mat-form-field-should-float');
    }),
  );

  it('should floating labels when select has no value but has option label', fakeAsync(() => {
    const fixture = createComponent(MatInputSelectWithLabel);
    fixture.detectChanges();

    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field'))!.nativeElement;
    expect(formFieldEl.classList).toContain('mat-form-field-should-float');
  }));

  it('should floating labels when select has no value but has option innerHTML', fakeAsync(() => {
    const fixture = createComponent(MatInputSelectWithInnerHtml);
    fixture.detectChanges();

    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field'))!.nativeElement;
    expect(formFieldEl.classList).toContain('mat-form-field-should-float');
  }));

  it('should not throw if a native select does not have options', fakeAsync(() => {
    const fixture = createComponent(MatInputSelectWithoutOptions);
    expect(() => fixture.detectChanges()).not.toThrow();
  }));

  it('should never float the label when floatLabel is set to false', fakeAsync(() => {
    const fixture = createComponent(MatInputWithDynamicLabel);

    fixture.componentInstance.shouldFloat = 'never';
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
    const labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;

    expect(labelEl.classList).toContain('mat-form-field-empty');
    expect(labelEl.classList).not.toContain('mat-form-field-float');

    // Update the value of the input.
    inputEl.value = 'Text';

    // Fake behavior of the `(input)` event which should trigger a change detection.
    fixture.detectChanges();

    expect(labelEl.classList).not.toContain('mat-form-field-empty');
    expect(labelEl.classList).not.toContain('mat-form-field-float');
  }));

  it('should be able to toggle the floating label programmatically', fakeAsync(() => {
    const fixture = createComponent(MatInputWithId);

    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.directive(MatLegacyFormField))!;
    const containerInstance = formField.componentInstance as MatLegacyFormField;
    const label = formField.nativeElement.querySelector('.mat-form-field-label');

    expect(containerInstance.floatLabel).toBe('auto');
    expect(label.classList)
      .withContext('Expected input to be considered empty.')
      .toContain('mat-form-field-empty');

    containerInstance.floatLabel = 'always';
    fixture.detectChanges();

    expect(label.classList).not.toContain(
      'mat-form-field-empty',
      'Expected input to be considered not empty.',
    );
  }));

  it('should not have prefix and suffix elements when none are specified', fakeAsync(() => {
    const fixture = createComponent(MatInputWithId);
    fixture.detectChanges();

    const prefixEl = fixture.debugElement.query(By.css('.mat-form-field-prefix'));
    const suffixEl = fixture.debugElement.query(By.css('.mat-form-field-suffix'));

    expect(prefixEl).toBeNull();
    expect(suffixEl).toBeNull();
  }));

  it('should add prefix and suffix elements when specified', fakeAsync(() => {
    const fixture = createComponent(MatInputWithPrefixAndSuffix);
    fixture.detectChanges();

    const prefixEl = fixture.debugElement.query(By.css('.mat-form-field-prefix'))!;
    const suffixEl = fixture.debugElement.query(By.css('.mat-form-field-suffix'))!;

    expect(prefixEl).not.toBeNull();
    expect(suffixEl).not.toBeNull();
    expect(prefixEl.nativeElement.innerText.trim()).toEqual('Prefix');
    expect(suffixEl.nativeElement.innerText.trim()).toEqual('Suffix');
  }));

  it('should update empty class when value changes programmatically and OnPush', fakeAsync(() => {
    const fixture = createComponent(MatInputOnPush);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const label = fixture.debugElement.query(By.css('.mat-form-field-label'))!.nativeElement;

    expect(label.classList).withContext('Input initially empty').toContain('mat-form-field-empty');

    component.formControl.setValue('something');
    fixture.detectChanges();

    expect(label.classList).not.toContain('mat-form-field-empty', 'Input no longer empty');
  }));

  it('should set the focused class when the input is focused', fakeAsync(() => {
    const fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    const input = fixture.debugElement
      .query(By.directive(MatLegacyInput))!
      .injector.get<MatLegacyInput>(MatLegacyInput);
    const container = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;

    // Call the focus handler directly to avoid flakyness where
    // browsers don't focus elements if the window is minimized.
    input._focusChanged(true);
    fixture.detectChanges();

    expect(container.classList).toContain('mat-focused');
  }));

  it('should remove the focused class if the input becomes disabled while focused', fakeAsync(() => {
    const fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    const input = fixture.debugElement
      .query(By.directive(MatLegacyInput))!
      .injector.get<MatLegacyInput>(MatLegacyInput);
    const container = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;

    // Call the focus handler directly to avoid flakyness where
    // browsers don't focus elements if the window is minimized.
    input._focusChanged(true);
    fixture.detectChanges();

    expect(container.classList).toContain('mat-focused');

    input.disabled = true;
    fixture.detectChanges();

    expect(container.classList).not.toContain('mat-focused');
  }));

  it('should be able to animate the label up and lock it in position', fakeAsync(() => {
    const fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    const inputContainer = fixture.debugElement.query(By.directive(MatLegacyFormField))!
      .componentInstance as MatLegacyFormField;
    const label = fixture.debugElement.query(By.css('.mat-form-field-label'))!.nativeElement;

    expect(inputContainer.floatLabel).toBe('auto');

    inputContainer._animateAndLockLabel();
    fixture.detectChanges();

    expect(inputContainer._shouldAlwaysFloat()).toBe(false);
    expect(inputContainer.floatLabel).toBe('always');

    const fakeEvent = createFakeEvent('transitionend');
    (fakeEvent as any).propertyName = 'transform';
    label.dispatchEvent(fakeEvent);
    fixture.detectChanges();

    expect(inputContainer._shouldAlwaysFloat()).toBe(true);
    expect(inputContainer.floatLabel).toBe('always');
  }));

  it('should not throw when trying to animate and lock too early', fakeAsync(() => {
    const fixture = createComponent(MatInputTextTestController);
    const formField = fixture.debugElement.query(By.directive(MatLegacyFormField))!
      .componentInstance as MatLegacyFormField;
    expect(() => formField._animateAndLockLabel()).not.toThrow();
  }));

  it('should only show the native placeholder, when there is a label, on focus', () => {
    const fixture = createComponent(MatInputWithLabelAndPlaceholder);
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;
    const label = fixture.debugElement.query(By.css('.mat-form-field-label'))!.nativeElement;
    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(container.classList).toContain('mat-form-field-hide-placeholder');
    expect(container.classList).not.toContain('mat-form-field-should-float');
    expect(label.textContent.trim()).toBe('Label');

    input.value = 'Value';
    fixture.detectChanges();

    expect(container.classList).not.toContain('mat-form-field-hide-placeholder');
    expect(container.classList).toContain('mat-form-field-should-float');
  });

  it('should always show the native placeholder when floatLabel is set to "always"', () => {
    const fixture = createComponent(MatInputWithLabelAndPlaceholder);

    fixture.componentInstance.floatLabel = 'always';
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;

    expect(container.classList).not.toContain('mat-form-field-hide-placeholder');
  });

  it('should not add the `placeholder` attribute if there is no placeholder', () => {
    const fixture = createComponent(MatInputWithoutPlaceholder);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(input.hasAttribute('placeholder')).toBe(false);
  });

  it('should not show the native placeholder when floatLabel is set to "never"', () => {
    const fixture = createComponent(MatInputWithLabelAndPlaceholder);

    fixture.componentInstance.floatLabel = 'never';
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;
    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(container.classList).toContain('mat-form-field-hide-placeholder');
    expect(container.classList).not.toContain('mat-form-field-should-float');

    input.value = 'Value';
    fixture.detectChanges();

    expect(container.classList).toContain('mat-form-field-hide-placeholder');
    expect(container.classList).not.toContain('mat-form-field-should-float');
  });

  it('should preserve the native placeholder on a non-legacy appearance', fakeAsync(() => {
    const fixture = createComponent(MatInputWithLabelAndPlaceholder);
    fixture.componentInstance.floatLabel = 'auto';
    fixture.componentInstance.appearance = 'standard';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input').getAttribute('placeholder')).toBe(
      'Placeholder',
    );
  }));

  it('should not add the native select class if the control is not a native select', () => {
    const fixture = createComponent(MatInputWithId);
    fixture.detectChanges();
    const formField = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;

    expect(formField.classList).not.toContain('mat-form-field-type-mat-native-select');
  });

  it(
    'should use the native input value when determining whether ' +
      'the element is empty with a custom accessor',
    fakeAsync(() => {
      const fixture = createComponent(MatInputWithCustomAccessor, [], [], [CustomMatInputAccessor]);
      fixture.detectChanges();
      const label = fixture.debugElement.query(By.css('label'))!.nativeElement;

      expect(label.classList).toContain('mat-form-field-empty');

      fixture.nativeElement.querySelector('input').value = 'abc';
      fixture.detectChanges();

      expect(label.classList).not.toContain('mat-form-field-empty');
    }),
  );

  it('should not throw when there is a default ngIf on the label element', fakeAsync(() => {
    expect(() => {
      createComponent(MatInputWithDefaultNgIf).detectChanges();
    }).not.toThrow();
  }));

  it('should not throw when there is a default ngIf on the input element', fakeAsync(() => {
    expect(() => {
      createComponent(MatInputWithAnotherNgIf).detectChanges();
    }).not.toThrow();
  }));

  it('should default the form field color to primary', fakeAsync(() => {
    const fixture = createComponent(MatInputWithColor);
    fixture.detectChanges();

    const formField = fixture.nativeElement.querySelector('.mat-form-field');
    expect(formField.classList).toContain('mat-primary');
  }));

  it('should be able to change the form field color', fakeAsync(() => {
    const fixture = createComponent(MatInputWithColor);
    fixture.componentInstance.color = 'accent';
    fixture.detectChanges();
    const formField = fixture.nativeElement.querySelector('.mat-form-field');

    expect(formField.classList).toContain('mat-accent');

    fixture.componentInstance.color = 'warn';
    fixture.detectChanges();
    expect(formField.classList).toContain('mat-warn');
  }));
});

describe('MatInput with forms', () => {
  describe('error messages', () => {
    let fixture: ComponentFixture<MatInputWithFormErrorMessages>;
    let testComponent: MatInputWithFormErrorMessages;
    let containerEl: HTMLElement;
    let inputEl: HTMLInputElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(MatInputWithFormErrorMessages);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      containerEl = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;
      inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
    }));

    it('should not show any errors if the user has not interacted', fakeAsync(() => {
      expect(testComponent.formControl.untouched)
        .withContext('Expected untouched form control')
        .toBe(true);
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected no error message')
        .toBe(0);
      expect(inputEl.getAttribute('aria-invalid'))
        .withContext('Expected aria-invalid to be set to "false".')
        .toBe('false');
    }));

    it('should display an error message when the input is touched and invalid', fakeAsync(() => {
      expect(testComponent.formControl.invalid)
        .withContext('Expected form control to be invalid')
        .toBe(true);
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected no error message')
        .toBe(0);

      inputEl.value = 'not valid';
      testComponent.formControl.markAsTouched();
      fixture.detectChanges();
      flush();

      expect(containerEl.classList)
        .withContext('Expected container to have the invalid CSS class.')
        .toContain('mat-form-field-invalid');
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected one error message to have been rendered.')
        .toBe(1);
      expect(inputEl.getAttribute('aria-invalid'))
        .withContext('Expected aria-invalid to be set to "true".')
        .toBe('true');
    }));

    it('should display an error message when the parent form is submitted', fakeAsync(() => {
      expect(testComponent.form.submitted)
        .withContext('Expected form not to have been submitted')
        .toBe(false);
      expect(testComponent.formControl.invalid)
        .withContext('Expected form control to be invalid')
        .toBe(true);
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected no error message')
        .toBe(0);

      inputEl.value = 'not valid';
      dispatchFakeEvent(fixture.debugElement.query(By.css('form'))!.nativeElement, 'submit');
      fixture.detectChanges();
      flush();

      expect(testComponent.form.submitted)
        .withContext('Expected form to have been submitted')
        .toBe(true);
      expect(containerEl.classList)
        .withContext('Expected container to have the invalid CSS class.')
        .toContain('mat-form-field-invalid');
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected one error message to have been rendered.')
        .toBe(1);
      expect(inputEl.getAttribute('aria-invalid'))
        .withContext('Expected aria-invalid to be set to "true".')
        .toBe('true');
    }));

    it('should display an error message when the parent form group is submitted', fakeAsync(() => {
      fixture.destroy();
      TestBed.resetTestingModule();

      const groupFixture = createComponent(MatInputWithFormGroupErrorMessages);
      let component: MatInputWithFormGroupErrorMessages;

      groupFixture.detectChanges();
      component = groupFixture.componentInstance;
      containerEl = groupFixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;
      inputEl = groupFixture.debugElement.query(By.css('input'))!.nativeElement;

      expect(component.formGroup.invalid)
        .withContext('Expected form control to be invalid')
        .toBe(true);
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected no error message')
        .toBe(0);
      expect(inputEl.getAttribute('aria-invalid'))
        .withContext('Expected aria-invalid to be set to "false".')
        .toBe('false');
      expect(component.formGroupDirective.submitted)
        .withContext('Expected form not to have been submitted')
        .toBe(false);

      inputEl.value = 'not valid';
      dispatchFakeEvent(groupFixture.debugElement.query(By.css('form'))!.nativeElement, 'submit');
      groupFixture.detectChanges();
      flush();

      expect(component.formGroupDirective.submitted)
        .withContext('Expected form to have been submitted')
        .toBe(true);
      expect(containerEl.classList)
        .withContext('Expected container to have the invalid CSS class.')
        .toContain('mat-form-field-invalid');
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected one error message to have been rendered.')
        .toBe(1);
      expect(inputEl.getAttribute('aria-invalid'))
        .withContext('Expected aria-invalid to be set to "true".')
        .toBe('true');
    }));

    it('should hide the errors and show the hints once the input becomes valid', fakeAsync(() => {
      testComponent.formControl.markAsTouched();
      fixture.detectChanges();
      flush();

      expect(containerEl.classList)
        .withContext('Expected container to have the invalid CSS class.')
        .toContain('mat-form-field-invalid');
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected one error message to have been rendered.')
        .toBe(1);
      expect(containerEl.querySelectorAll('mat-hint').length)
        .withContext('Expected no hints to be shown.')
        .toBe(0);

      testComponent.formControl.setValue('valid value');
      fixture.detectChanges();
      flush();

      expect(containerEl.classList).not.toContain(
        'mat-form-field-invalid',
        'Expected container not to have the invalid class when valid.',
      );
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected no error messages when the input is valid.')
        .toBe(0);
      expect(containerEl.querySelectorAll('mat-hint').length)
        .withContext('Expected one hint to be shown once the input is valid.')
        .toBe(1);
    }));

    it('should not hide the hint if there are no error messages', fakeAsync(() => {
      testComponent.renderError = false;
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('mat-hint').length)
        .withContext('Expected one hint to be shown on load.')
        .toBe(1);

      testComponent.formControl.markAsTouched();
      fixture.detectChanges();
      flush();

      expect(containerEl.querySelectorAll('mat-hint').length)
        .withContext('Expected one hint to still be shown.')
        .toBe(1);
    }));

    it('should set the proper aria-live attribute on the error messages', fakeAsync(() => {
      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelector('mat-error')!.getAttribute('aria-live')).toBe('polite');
    }));

    it('sets the aria-describedby to reference errors when in error state', fakeAsync(() => {
      const hintId = fixture.debugElement
        .query(By.css('.mat-hint'))!
        .nativeElement.getAttribute('id');
      let describedBy = inputEl.getAttribute('aria-describedby');

      expect(hintId).withContext('hint should be shown').toBeTruthy();
      expect(describedBy).toBe(hintId);

      fixture.componentInstance.formControl.markAsTouched();
      fixture.detectChanges();

      const errorIds = fixture.debugElement
        .queryAll(By.css('.mat-error'))
        .map(el => el.nativeElement.getAttribute('id'))
        .join(' ');
      describedBy = inputEl.getAttribute('aria-describedby');

      expect(errorIds).withContext('errors should be shown').toBeTruthy();
      expect(describedBy).toBe(errorIds);
    }));

    it('should set `aria-invalid` to true if the input is empty', fakeAsync(() => {
      // Submit the form since it's the one that triggers the default error state matcher.
      dispatchFakeEvent(fixture.nativeElement.querySelector('form'), 'submit');
      fixture.detectChanges();
      flush();

      expect(testComponent.formControl.invalid)
        .withContext('Expected form control to be invalid')
        .toBe(true);
      expect(inputEl.value).toBe('incorrect');
      expect(inputEl.getAttribute('aria-invalid'))
        .withContext('Expected aria-invalid to be set to "true".')
        .toBe('true');

      inputEl.value = 'not valid';
      fixture.detectChanges();

      expect(testComponent.formControl.invalid)
        .withContext('Expected form control to be invalid')
        .toBe(true);
      expect(inputEl.getAttribute('aria-invalid'))
        .withContext('Expected aria-invalid to be set to "true".')
        .toBe('true');
    }));
  });

  describe('custom error behavior', () => {
    it('should display an error message when a custom error matcher returns true', fakeAsync(() => {
      const fixture = createComponent(MatInputWithCustomErrorStateMatcher);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const containerEl = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;

      const control = component.formGroup.get('name')!;

      expect(control.invalid).withContext('Expected form control to be invalid').toBe(true);
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected no error messages')
        .toBe(0);

      control.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected no error messages after being touched.')
        .toBe(0);

      component.errorState = true;
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected one error messages to have been rendered.')
        .toBe(1);
    }));

    it('should display an error message when global error matcher returns true', fakeAsync(() => {
      const fixture = createComponent(MatInputWithFormErrorMessages, [
        {
          provide: ErrorStateMatcher,
          useValue: {isErrorState: () => true},
        },
      ]);

      fixture.detectChanges();

      const containerEl = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;
      const testComponent = fixture.componentInstance;

      // Expect the control to still be untouched but the error to show due to the global setting
      // Expect the control to still be untouched but the error to show due to the global setting
      expect(testComponent.formControl.untouched)
        .withContext('Expected untouched form control')
        .toBe(true);
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected an error message')
        .toBe(1);
    }));

    it('should display an error message when using ShowOnDirtyErrorStateMatcher', fakeAsync(() => {
      const fixture = createComponent(MatInputWithFormErrorMessages, [
        {
          provide: ErrorStateMatcher,
          useClass: ShowOnDirtyErrorStateMatcher,
        },
      ]);
      fixture.detectChanges();

      const containerEl = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;
      const testComponent = fixture.componentInstance;

      expect(testComponent.formControl.invalid)
        .withContext('Expected form control to be invalid')
        .toBe(true);
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected no error message')
        .toBe(0);

      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected no error messages when touched')
        .toBe(0);

      testComponent.formControl.markAsDirty();
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected one error message when dirty')
        .toBe(1);
    }));
  });

  it('should update the value when using FormControl.setValue', fakeAsync(() => {
    const fixture = createComponent(MatInputWithFormControl);
    fixture.detectChanges();

    const input = fixture.debugElement
      .query(By.directive(MatLegacyInput))!
      .injector.get<MatLegacyInput>(MatLegacyInput);

    expect(input.value).toBeFalsy();

    fixture.componentInstance.formControl.setValue('something');

    expect(input.value).toBe('something');
  }));

  it('should display disabled styles when using FormControl.disable()', fakeAsync(() => {
    const fixture = createComponent(MatInputWithFormControl);
    fixture.detectChanges();

    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field'))!.nativeElement;
    const inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(formFieldEl.classList).not.toContain(
      'mat-form-field-disabled',
      `Expected form field not to start out disabled.`,
    );
    expect(inputEl.disabled).toBe(false);

    fixture.componentInstance.formControl.disable();
    fixture.detectChanges();

    expect(formFieldEl.classList)
      .withContext(`Expected form field to look disabled after disable() is called.`)
      .toContain('mat-form-field-disabled');
    expect(inputEl.disabled).toBe(true);
  }));

  it('should not treat the number 0 as empty', fakeAsync(() => {
    const fixture = createComponent(MatInputZeroTestController);
    fixture.detectChanges();
    flush();

    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;
    expect(labelEl).not.toBeNull();
    expect(labelEl.classList.contains('mat-form-field-empty')).toBe(false);
  }));

  it('should update when the form field value is patched without emitting', fakeAsync(() => {
    const fixture = createComponent(MatInputWithFormControl);
    fixture.detectChanges();

    const el = fixture.debugElement.query(By.css('label'))!.nativeElement;

    expect(el.classList).toContain('mat-form-field-empty');

    fixture.componentInstance.formControl.patchValue('value', {emitEvent: false});
    fixture.detectChanges();

    expect(el.classList).not.toContain('mat-form-field-empty');
  }));
});

describe('MatInput with appearance', () => {
  const nonLegacyAppearances: MatLegacyFormFieldAppearance[] = ['standard', 'fill'];
  let fixture: ComponentFixture<MatInputWithAppearance>;
  let testComponent: MatInputWithAppearance;
  let containerEl: HTMLElement;

  beforeEach(fakeAsync(() => {
    fixture = createComponent(MatInputWithAppearance);
    fixture.detectChanges();
    testComponent = fixture.componentInstance;
    containerEl = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;
  }));

  it('legacy appearance should promote placeholder to label', fakeAsync(() => {
    testComponent.appearance = 'legacy';
    fixture.detectChanges();

    expect(containerEl.classList).toContain('mat-form-field-appearance-legacy');
    expect(testComponent.formField._hasFloatingLabel()).toBe(true);
    expect(testComponent.formField._hideControlPlaceholder()).toBe(true);
  }));

  it('non-legacy appearances should not promote placeholder to label', fakeAsync(() => {
    for (let appearance of nonLegacyAppearances) {
      testComponent.appearance = appearance;
      fixture.detectChanges();

      expect(containerEl.classList).toContain(`mat-form-field-appearance-${appearance}`);
      expect(testComponent.formField._hasFloatingLabel()).toBe(false);
      expect(testComponent.formField._hideControlPlaceholder()).toBe(false);
    }
  }));

  it('legacy appearance should respect float never', fakeAsync(() => {
    testComponent.appearance = 'legacy';
    fixture.detectChanges();

    expect(containerEl.classList).toContain('mat-form-field-appearance-legacy');
    expect(testComponent.formField.floatLabel).toBe('never');
  }));

  it('non-legacy appearances should not respect float never', fakeAsync(() => {
    for (let appearance of nonLegacyAppearances) {
      testComponent.appearance = appearance;
      fixture.detectChanges();

      expect(containerEl.classList).toContain(`mat-form-field-appearance-${appearance}`);
      expect(testComponent.formField.floatLabel).toBe('auto');
    }
  }));

  it('should recalculate gaps when switching to outline appearance after init', fakeAsync(() => {
    fixture.destroy();
    TestBed.resetTestingModule();

    const outlineFixture = createComponent(MatInputWithAppearanceAndLabel);

    outlineFixture.detectChanges();
    outlineFixture.componentInstance.appearance = 'legacy';
    outlineFixture.detectChanges();
    flush();

    outlineFixture.componentInstance.appearance = 'outline';
    outlineFixture.detectChanges();
    flush();
    outlineFixture.detectChanges();

    const wrapperElement = outlineFixture.nativeElement;
    const outlineStart = wrapperElement.querySelector('.mat-form-field-outline-start');
    const outlineGap = wrapperElement.querySelector('.mat-form-field-outline-gap');

    expect(parseInt(outlineStart.style.width)).toBeGreaterThan(0);
    expect(parseInt(outlineGap.style.width)).toBeGreaterThan(0);
  }));

  it('should calculate the gap when starting off in RTL', fakeAsync(() => {
    fixture.destroy();
    TestBed.resetTestingModule();

    const outlineFixture = createComponent(MatInputWithAppearanceAndLabel, [
      {
        provide: Directionality,
        useValue: {change: new Subject<Direction>(), value: 'rtl'},
      },
    ]);

    outlineFixture.componentInstance.appearance = 'outline';
    outlineFixture.detectChanges();
    flush();
    outlineFixture.detectChanges();

    const wrapperElement = outlineFixture.nativeElement;
    const outlineStart = wrapperElement.querySelector('.mat-form-field-outline-start');
    const outlineGap = wrapperElement.querySelector('.mat-form-field-outline-gap');

    expect(parseInt(outlineStart.style.width)).toBeGreaterThan(0);
    expect(parseInt(outlineGap.style.width)).toBeGreaterThan(0);
  }));

  it('should not set an outline gap if the label is empty', fakeAsync(() => {
    fixture.destroy();
    TestBed.resetTestingModule();

    const outlineFixture = createComponent(MatInputWithAppearanceAndLabel);

    outlineFixture.componentInstance.labelContent = '';
    outlineFixture.detectChanges();
    outlineFixture.componentInstance.appearance = 'outline';
    outlineFixture.detectChanges();
    flush();
    outlineFixture.detectChanges();

    const outlineGap = outlineFixture.nativeElement.querySelector('.mat-form-field-outline-gap');

    expect(parseInt(outlineGap.style.width)).toBeFalsy();
  }));

  it('should calculate the gaps if the default appearance is provided through DI', fakeAsync(() => {
    fixture.destroy();
    TestBed.resetTestingModule();

    let zone: MockNgZone;
    const labelFixture = createComponent(MatInputWithLabel, [
      {
        provide: MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {appearance: 'outline'},
      },
      {
        provide: NgZone,
        useFactory: () => (zone = new MockNgZone()),
      },
    ]);

    labelFixture.detectChanges();
    zone!.simulateZoneExit();
    flush();
    labelFixture.detectChanges();

    const wrapperElement = labelFixture.nativeElement;
    const outlineStart = wrapperElement.querySelector('.mat-form-field-outline-start');
    const outlineGap = wrapperElement.querySelector('.mat-form-field-outline-gap');

    expect(parseInt(outlineStart.style.width)).toBeGreaterThan(0);
    expect(parseInt(outlineGap.style.width)).toBeGreaterThan(0);
  }));

  it('should update the outline gap when the prefix/suffix is added or removed', fakeAsync(() => {
    fixture.destroy();
    TestBed.resetTestingModule();

    const outlineFixture = createComponent(MatInputWithAppearanceAndLabel);

    outlineFixture.componentInstance.appearance = 'outline';
    outlineFixture.detectChanges();
    flush();
    outlineFixture.detectChanges();

    spyOn(outlineFixture.componentInstance.formField, 'updateOutlineGap');

    outlineFixture.componentInstance.showPrefix = true;
    outlineFixture.detectChanges();
    flush();
    outlineFixture.detectChanges();

    expect(outlineFixture.componentInstance.formField.updateOutlineGap).toHaveBeenCalled();
  }));

  it('should calculate the outline gaps if the element starts off invisible', fakeAsync(() => {
    fixture.destroy();
    TestBed.resetTestingModule();

    let zone: MockNgZone;
    const invisibleFixture = createComponent(MatInputWithOutlineInsideInvisibleElement, [
      {
        provide: NgZone,
        useFactory: () => (zone = new MockNgZone()),
      },
    ]);

    invisibleFixture.detectChanges();
    zone!.simulateZoneExit();
    flush();
    invisibleFixture.detectChanges();

    const wrapperElement = invisibleFixture.nativeElement;
    const formField = wrapperElement.querySelector('.mat-form-field');
    const outlineStart = wrapperElement.querySelector('.mat-form-field-outline-start');
    const outlineGap = wrapperElement.querySelector('.mat-form-field-outline-gap');

    formField.style.display = '';
    invisibleFixture.detectChanges();
    zone!.simulateZoneExit();
    flush();
    invisibleFixture.detectChanges();

    expect(parseInt(outlineStart.style.width)).toBeGreaterThan(0);
    expect(parseInt(outlineGap.style.width)).toBeGreaterThan(0);
  }));

  it('should update the outline gap if the direction changes', fakeAsync(() => {
    fixture.destroy();
    TestBed.resetTestingModule();

    const fakeDirectionality = {change: new Subject<Direction>(), value: 'ltr'};
    const outlineFixture = createComponent(MatInputWithAppearanceAndLabel, [
      {
        provide: Directionality,
        useValue: fakeDirectionality,
      },
    ]);

    outlineFixture.componentInstance.appearance = 'outline';
    outlineFixture.detectChanges();
    flush();
    outlineFixture.detectChanges();

    spyOn(outlineFixture.componentInstance.formField, 'updateOutlineGap');

    fakeDirectionality.value = 'rtl';
    fakeDirectionality.change.next('rtl');
    outlineFixture.detectChanges();
    tick(16.6); // Angular replaces requestAnimationFrame calls with 16.6ms timeouts in tests.
    outlineFixture.detectChanges();

    expect(outlineFixture.componentInstance.formField.updateOutlineGap).toHaveBeenCalled();
  }));

  it('should update the outline gap correctly if the direction changes multiple times', fakeAsync(() => {
    fixture.destroy();
    TestBed.resetTestingModule();

    let zone: MockNgZone;
    const fakeDirectionality = {change: new Subject<Direction>(), value: 'ltr'};
    const outlineFixture = createComponent(MatInputWithAppearanceAndLabel, [
      {
        provide: Directionality,
        useValue: fakeDirectionality,
      },
      {
        provide: NgZone,
        useFactory: () => (zone = new MockNgZone()),
      },
    ]);

    outlineFixture.componentInstance.appearance = 'outline';
    outlineFixture.detectChanges();
    zone!.simulateZoneExit();
    flush();
    outlineFixture.detectChanges();

    spyOn(outlineFixture.componentInstance.formField, 'updateOutlineGap');

    fakeDirectionality.value = 'rtl';
    fakeDirectionality.change.next('rtl');
    outlineFixture.detectChanges();
    tick(16.6); // Angular replaces requestAnimationFrame calls with 16.6ms timeouts in tests.
    outlineFixture.detectChanges();

    let wrapperElement = outlineFixture.nativeElement;
    let outlineStart = wrapperElement.querySelector('.mat-form-field-outline-start');
    // outlineGapPadding 5px + containerRect margin/padding in worst case 3px
    const maxOutlineStart = '8px';

    expect(outlineFixture.componentInstance.formField.updateOutlineGap).toHaveBeenCalled();
    expect(parseInt(outlineStart.style.width)).toBeLessThan(parseInt(maxOutlineStart));

    fakeDirectionality.value = 'ltr';
    fakeDirectionality.change.next('ltr');
    outlineFixture.detectChanges();
    tick(16.6);
    outlineFixture.detectChanges();

    wrapperElement = outlineFixture.nativeElement;
    outlineStart = wrapperElement.querySelector('.mat-form-field-outline-start');

    expect(outlineFixture.componentInstance.formField.updateOutlineGap).toHaveBeenCalled();
    expect(parseInt(outlineStart.style.width)).toBeLessThan(parseInt(maxOutlineStart));
  }));

  it('should calculate the outline gaps inside the shadow DOM', fakeAsync(() => {
    if (!_supportsShadowDom()) {
      return;
    }

    fixture.destroy();
    TestBed.resetTestingModule();

    const outlineFixture = createComponent(MatInputWithOutlineAppearanceInShadowDOM);
    outlineFixture.detectChanges();
    flush();
    outlineFixture.detectChanges();

    const formField = outlineFixture.componentInstance.formField.nativeElement;
    const outlineStart = formField.querySelector('.mat-form-field-outline-start') as HTMLElement;
    const outlineGap = formField.querySelector('.mat-form-field-outline-gap') as HTMLElement;

    expect(parseInt(outlineStart.style.width || '0')).toBeGreaterThan(0);
    expect(parseInt(outlineGap.style.width || '0')).toBeGreaterThan(0);
  }));

  it('should recalculate the outline gap when the label changes to empty after init', fakeAsync(() => {
    fixture.destroy();
    TestBed.resetTestingModule();

    const outlineFixture = createComponent(MatInputWithAppearanceAndLabel);

    outlineFixture.componentInstance.appearance = 'outline';
    outlineFixture.detectChanges();
    flush();
    outlineFixture.detectChanges();

    const wrapperElement = outlineFixture.nativeElement;
    const outlineStart = wrapperElement.querySelector('.mat-form-field-outline-start');
    const outlineGap = wrapperElement.querySelector('.mat-form-field-outline-gap');

    expect(parseInt(outlineStart.style.width)).toBeGreaterThan(0);
    expect(parseInt(outlineGap.style.width)).toBeGreaterThan(0);

    outlineFixture.componentInstance.labelContent = '';
    outlineFixture.detectChanges();

    outlineFixture.componentInstance.formField.updateOutlineGap();
    outlineFixture.detectChanges();

    expect(parseInt(outlineStart.style.width)).toBe(0);
    expect(parseInt(outlineGap.style.width)).toBe(0);
  }));
});

describe('MatFormField default options', () => {
  it('should be legacy appearance if no default options provided', () => {
    const fixture = createComponent(MatInputWithAppearance);
    fixture.detectChanges();
    expect(fixture.componentInstance.formField.appearance).toBe('legacy');
  });

  it('should be legacy appearance if empty default options provided', () => {
    const fixture = createComponent(MatInputWithAppearance, [
      {
        provide: MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {},
      },
    ]);

    fixture.detectChanges();
    expect(fixture.componentInstance.formField.appearance).toBe('legacy');
  });

  it('should be able to change the default appearance', () => {
    const fixture = createComponent(MatInputWithAppearance, [
      {
        provide: MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {appearance: 'fill'},
      },
    ]);
    fixture.detectChanges();
    expect(fixture.componentInstance.formField.appearance).toBe('fill');
  });

  it('should default hideRequiredMarker to false', () => {
    const fixture = createComponent(MatInputWithAppearance, [
      {
        provide: MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {},
      },
    ]);

    fixture.detectChanges();
    expect(fixture.componentInstance.formField.hideRequiredMarker).toBe(false);
  });

  it('should be able to change the default value of hideRequiredMarker and appearance', () => {
    const fixture = createComponent(MatInputWithAppearance, [
      {
        provide: MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {
          hideRequiredMarker: true,
          appearance: 'outline',
        },
      },
    ]);

    fixture.detectChanges();
    expect(fixture.componentInstance.formField.hideRequiredMarker).toBe(true);
    expect(fixture.componentInstance.formField.appearance).toBe('outline');
  });

  it('should be able to change the default color', () => {
    const fixture = createComponent(MatInputWithColor, [
      {
        provide: MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {color: 'accent'},
      },
    ]);
    fixture.detectChanges();
    const formField = fixture.nativeElement.querySelector('.mat-form-field');
    expect(formField.classList).toContain('mat-accent');
  });
});

function createComponent<T>(
  component: Type<T>,
  providers: Provider[] = [],
  imports: any[] = [],
  declarations: any[] = [],
): ComponentFixture<T> {
  TestBed.configureTestingModule({
    imports: [
      FormsModule,
      MatLegacyFormFieldModule,
      MatLegacyInputModule,
      BrowserAnimationsModule,
      ReactiveFormsModule,
      ...imports,
    ],
    declarations: [component, ...declarations],
    providers,
  }).compileComponents();

  return TestBed.createComponent<T>(component);
}

@Component({
  template: `
    <mat-form-field>
      <input matNativeControl id="test-id" placeholder="test">
    </mat-form-field>`,
})
class MatInputWithId {}

@Component({
  template: `<mat-form-field><input matInput [disabled]="disabled"></mat-form-field>`,
})
class MatInputWithDisabled {
  disabled: boolean;
}

@Component({
  template: `<mat-form-field><input matInput [required]="required"></mat-form-field>`,
})
class MatInputWithRequired {
  required: boolean;
}

@Component({
  template: `<mat-form-field><input matInput [type]="type"></mat-form-field>`,
})
class MatInputWithType {
  type: string;
}

@Component({
  template: `<mat-form-field [hideRequiredMarker]="hideRequiredMarker">
                <input matInput required [disabled]="disabled" placeholder="hello">
             </mat-form-field>`,
})
class MatInputPlaceholderRequiredTestComponent {
  hideRequiredMarker: boolean = false;
  disabled: boolean = false;
}

@Component({
  template: `
    <mat-form-field>
      <input matInput>
      <mat-placeholder>{{placeholder}}</mat-placeholder>
    </mat-form-field>`,
})
class MatInputPlaceholderElementTestComponent {
  placeholder: string = 'Default Placeholder';
}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="Hello" [formControl]="formControl">
    </mat-form-field>`,
})
class MatInputWithFormControl {
  formControl = new FormControl('');
}

@Component({
  template: `<mat-form-field><input matInput [placeholder]="placeholder"></mat-form-field>`,
})
class MatInputPlaceholderAttrTestComponent {
  placeholder: string = '';
}

@Component({
  template: `<mat-form-field><input matInput><mat-hint>{{label}}</mat-hint></mat-form-field>`,
})
class MatInputHintLabel2TestController {
  label: string = '';
}

@Component({
  template: `
    <mat-form-field [hintLabel]="label">
      <input matInput aria-describedby="initial">
    </mat-form-field>`,
})
class MatInputHintLabelTestController {
  label: string = '';
}

@Component({
  template: `
    <mat-form-field [hintLabel]="label">
      <input matInput [formControl]="formControl" [aria-describedby]="userDescribedByValue">
      <mat-error *ngIf="showError">Some error</mat-error>
    </mat-form-field>`,
})
class MatInputWithSubscriptAndAriaDescribedBy {
  label: string = '';
  userDescribedByValue: string = '';
  showError = false;
  formControl = new FormControl('');
}

@Component({template: `<mat-form-field><input matInput [type]="t"></mat-form-field>`})
class MatInputInvalidTypeTestController {
  t = 'file';
}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="Hello">
      <mat-placeholder>World</mat-placeholder>
    </mat-form-field>`,
})
class MatInputInvalidPlaceholderTestController {}

@Component({
  template: `
    <mat-form-field hintLabel="Hello">
      <input matInput>
      <mat-hint>World</mat-hint>
    </mat-form-field>`,
})
class MatInputInvalidHint2TestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput>
      <mat-hint>Hello</mat-hint>
      <mat-hint>World</mat-hint>
    </mat-form-field>`,
})
class MatInputInvalidHintTestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput>
      <mat-hint align="start" [id]="startId">Hello</mat-hint>
      <mat-hint align="end" [id]="endId">World</mat-hint>
    </mat-form-field>`,
})
class MatInputMultipleHintTestController {
  startId: string;
  endId: string;
}

@Component({
  template: `
    <mat-form-field hintLabel="Hello">
      <input matInput>
      <mat-hint align="end">World</mat-hint>
    </mat-form-field>`,
})
class MatInputMultipleHintMixedTestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput type="date" placeholder="Placeholder">
    </mat-form-field>`,
})
class MatInputDateTestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput type="text" placeholder="Placeholder">
    </mat-form-field>`,
})
class MatInputTextTestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput type="password" placeholder="Placeholder">
    </mat-form-field>`,
})
class MatInputPasswordTestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput type="number" placeholder="Placeholder">
    </mat-form-field>`,
})
class MatInputNumberTestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput type="number" placeholder="Placeholder" [(ngModel)]="value">
    </mat-form-field>`,
})
class MatInputZeroTestController {
  value = 0;
}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="Label" [value]="value">
    </mat-form-field>`,
})
class MatInputWithValueBinding {
  value: string = 'Initial';
}

@Component({
  template: `
    <mat-form-field floatLabel="never">
      <input matInput placeholder="Label">
    </mat-form-field>
  `,
})
class MatInputWithStaticLabel {}

@Component({
  template: `
    <mat-form-field [floatLabel]="shouldFloat">
      <input matInput placeholder="Label">
    </mat-form-field>`,
})
class MatInputWithDynamicLabel {
  shouldFloat: string = 'always';
}

@Component({
  template: `
    <mat-form-field>
      <textarea matNativeControl [rows]="rows" [cols]="cols" [wrap]="wrap" placeholder="Snacks">
      </textarea>
    </mat-form-field>`,
})
class MatInputTextareaWithBindings {
  rows: number = 4;
  cols: number = 8;
  wrap: string = 'hard';
}

@Component({
  template: `<mat-form-field><input></mat-form-field>`,
})
class MatInputMissingMatInputTestController {}

@Component({
  template: `
    <form #form="ngForm" novalidate>
      <mat-form-field>
        <input matInput [formControl]="formControl">
        <mat-hint>Please type something</mat-hint>
        <mat-error *ngIf="renderError">This field is required</mat-error>
      </mat-form-field>
    </form>
  `,
})
class MatInputWithFormErrorMessages {
  @ViewChild('form') form: NgForm;
  formControl = new FormControl('incorrect', [
    Validators.required,
    Validators.pattern(/valid value/),
  ]);
  renderError = true;
}

@Component({
  template: `
    <form [formGroup]="formGroup">
      <mat-form-field>
        <input matInput
            formControlName="name"
            [errorStateMatcher]="customErrorStateMatcher">
        <mat-hint>Please type something</mat-hint>
        <mat-error>This field is required</mat-error>
      </mat-form-field>
    </form>
  `,
})
class MatInputWithCustomErrorStateMatcher {
  formGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.pattern(/valid value/)]),
  });

  errorState = false;

  customErrorStateMatcher = {
    isErrorState: () => this.errorState,
  };
}

@Component({
  template: `
    <form [formGroup]="formGroup" novalidate>
      <mat-form-field>
        <input matInput formControlName="name">
        <mat-hint>Please type something</mat-hint>
        <mat-error>This field is required</mat-error>
      </mat-form-field>
    </form>
  `,
})
class MatInputWithFormGroupErrorMessages {
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;
  formGroup = new FormGroup({
    name: new FormControl('incorrect', [Validators.required, Validators.pattern(/valid value/)]),
  });
}

@Component({
  template: `
    <mat-form-field>
      <div matPrefix>Prefix</div>
      <input matInput>
      <div matSuffix>Suffix</div>
    </mat-form-field>
  `,
})
class MatInputWithPrefixAndSuffix {}

@Component({
  template: `
    <mat-form-field>
      <input matInput *ngIf="renderInput">
    </mat-form-field>
  `,
})
class MatInputWithNgIf {
  renderInput = true;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field>
      <input matInput placeholder="Label" [formControl]="formControl">
    </mat-form-field>
  `,
})
class MatInputOnPush {
  formControl = new FormControl('');
}

@Component({
  template: `
    <mat-form-field>
      <mat-label>Label</mat-label>
      <input matInput>
    </mat-form-field>
  `,
})
class MatInputWithLabel {}

@Component({
  template: `
    <mat-form-field [floatLabel]="floatLabel" [appearance]="appearance">
      <mat-label>Label</mat-label>
      <input matInput placeholder="Placeholder">
    </mat-form-field>
  `,
})
class MatInputWithLabelAndPlaceholder {
  floatLabel: LegacyFloatLabelType;
  appearance: MatLegacyFormFieldAppearance = 'legacy';
}

@Component({
  template: `
    <mat-form-field [appearance]="appearance" floatLabel="never">
      <input matInput placeholder="Placeholder">
    </mat-form-field>
  `,
})
class MatInputWithAppearance {
  @ViewChild(MatLegacyFormField) formField: MatLegacyFormField;
  appearance: MatLegacyFormFieldAppearance;
}

@Component({
  template: `
    <mat-form-field [appearance]="appearance">
      <span matPrefix *ngIf="showPrefix">Somewhat long prefix</span>
      <mat-label>{{labelContent}}</mat-label>
      <input matInput>
    </mat-form-field>
  `,
})
class MatInputWithAppearanceAndLabel {
  @ViewChild(MatLegacyFormField) formField: MatLegacyFormField;
  appearance: MatLegacyFormFieldAppearance;
  showPrefix: boolean;
  labelContent = 'Label';
}

@Component({
  template: `
    <mat-form-field>
      <input matInput>
    </mat-form-field>
  `,
})
class MatInputWithoutPlaceholder {}

@Component({
  template: `
    <mat-form-field appearance="outline" style="display: none;">
      <mat-label>Label</mat-label>
      <input matInput>
    </mat-form-field>
  `,
})
class MatInputWithOutlineInsideInvisibleElement {}

@Component({
  template: `
    <mat-form-field appearance="outline" #formField>
      <mat-label>Hello</mat-label>
      <input matInput>
    </mat-form-field>
  `,
  encapsulation: ViewEncapsulation.ShadowDom,
})
class MatInputWithOutlineAppearanceInShadowDOM {
  @ViewChild('formField', {read: ElementRef}) formField: ElementRef<HTMLElement>;
}

@Component({
  template: `
    <mat-form-field>
      <select matNativeControl id="test-id" [disabled]="disabled" [required]="required">
        <option value="volvo">Volvo</option>
        <option value="saab">Saab</option>
        <option value="mercedes">Mercedes</option>
        <option value="audi">Audi</option>
      </select>
    </mat-form-field>`,
})
class MatInputSelect {
  disabled: boolean;
  required: boolean;
}

@Component({
  template: `
    <mat-form-field>
      <select matNativeControl>
        <option value="" disabled selected></option>
        <option value="saab">Saab</option>
        <option value="mercedes">Mercedes</option>
        <option value="audi">Audi</option>
      </select>
    </mat-form-field>`,
})
class MatInputSelectWithNoLabelNoValue {}

@Component({
  template: `
    <mat-form-field>
      <select matNativeControl>
        <option value="" label="select a car"></option>
        <option value="saab">Saab</option>
        <option value="mercedes">Mercedes</option>
        <option value="audi">Audi</option>
      </select>
    </mat-form-field>`,
})
class MatInputSelectWithLabel {}

@Component({
  template: `
    <mat-form-field>
      <select matNativeControl>
        <option value="">select a car</option>
        <option value="saab">Saab</option>
        <option value="mercedes">Mercedes</option>
        <option value="audi">Audi</option>
      </select>
    </mat-form-field>`,
})
class MatInputSelectWithInnerHtml {}

@Component({
  template: `
    <mat-form-field floatLabel="never">
      <input matInput customInputAccessor placeholder="Placeholder">
    </mat-form-field>`,
})
class MatInputWithCustomAccessor {}

@Component({
  template: `
    <mat-form-field>
      <select matNativeControl>
      </select>
    </mat-form-field>`,
})
class MatInputSelectWithoutOptions {}

/** Custom component that never has a value. Used for testing the `MAT_INPUT_VALUE_ACCESSOR`. */
@Directive({
  selector: 'input[customInputAccessor]',
  providers: [
    {
      provide: MAT_LEGACY_INPUT_VALUE_ACCESSOR,
      useExisting: CustomMatInputAccessor,
    },
  ],
})
class CustomMatInputAccessor {
  get value() {
    return this._value;
  }
  set value(_value: any) {}
  private _value = null;
}

// Note that the DOM structure is slightly weird, but it's
// testing a specific g3 issue. See the discussion on #10466.
@Component({
  template: `
    <mat-form-field appearance="outline">
      <mat-label *ngIf="true">My Label</mat-label>
      <ng-container *ngIf="true">
        <input matInput>
      </ng-container>
    </mat-form-field>
  `,
})
class MatInputWithDefaultNgIf {}

// Note that the DOM structure is slightly weird, but it's
// testing a specific g3 issue. See the discussion on #10466.
@Component({
  template: `
    <mat-form-field>
      <mat-label>App name</mat-label>
      <input matInput *ngIf="true" placeholder="My placeholder" [value]="inputValue">
    </mat-form-field>
  `,
})
class MatInputWithAnotherNgIf {
  inputValue = 'test';
}

@Component({
  template: `
    <mat-form-field [color]="color">
      <input matNativeControl>
    </mat-form-field>`,
})
class MatInputWithColor {
  color: ThemePalette;
}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="Hello" [formControl]="formControl">
    </mat-form-field>`,
})
class MatInputWithRequiredFormControl {
  formControl = new FormControl('', [Validators.required]);
}
