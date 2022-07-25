import {dispatchFakeEvent, wrappedErrorMessage} from '../../cdk/testing/private';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ErrorHandler,
  Provider,
  Type,
  ViewChild,
} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed} from '@angular/core/testing';
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
  FloatLabelType,
  getMatFormFieldDuplicatedHintError,
  getMatFormFieldMissingControlError,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormField,
  MatFormFieldAppearance,
  MatFormFieldModule,
  SubscriptSizing,
} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_INPUT_VALUE_ACCESSOR, MatInput, MatInputModule} from './index';
import {getSupportedInputTypes} from '@angular/cdk/platform';

describe('MatMdcInput without forms', () => {
  it('should default to floating labels', fakeAsync(() => {
    let fixture = createComponent(MatInputWithLabel);
    fixture.detectChanges();

    let formField = fixture.debugElement.query(By.directive(MatFormField))!
      .componentInstance as MatFormField;
    expect(formField.floatLabel)
      .withContext('Expected MatInput to set floatingLabel to auto by default.')
      .toBe('auto');
  }));

  it('should default to global floating label type', fakeAsync(() => {
    let fixture = createComponent(MatInputWithLabel, [
      {
        provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {floatLabel: 'always'},
      },
    ]);
    fixture.detectChanges();

    let formField = fixture.debugElement.query(By.directive(MatFormField))!
      .componentInstance as MatFormField;
    expect(formField.floatLabel)
      .withContext('Expected MatInput to set floatingLabel to always from global option.')
      .toBe('always');
  }));

  it('should not be treated as empty if type is date', fakeAsync(() => {
    const fixture = createComponent(MatInputDateTestController);
    fixture.detectChanges();

    if (getSupportedInputTypes().has('date')) {
      const formField = fixture.debugElement.query(By.directive(MatFormField))!
        .componentInstance as MatFormField;
      expect(formField).toBeTruthy();
      expect(formField!._control.empty).toBe(false);
    }
  }));

  it('should be treated as empty if type is date on unsupported browser', fakeAsync(() => {
    const fixture = createComponent(MatInputDateTestController);
    fixture.detectChanges();

    if (!getSupportedInputTypes().has('date')) {
      const formField = fixture.debugElement.query(By.directive(MatFormField))!
        .componentInstance as MatFormField;
      expect(formField).toBeTruthy();
      expect(formField!._control.empty).toBe(true);
    }
  }));

  it('should treat text input type as empty at init', fakeAsync(() => {
    let fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.directive(MatFormField))!
      .componentInstance as MatFormField;
    expect(formField).toBeTruthy();
    expect(formField!._control.empty).toBe(true);
  }));

  it('should treat password input type as empty at init', fakeAsync(() => {
    let fixture = createComponent(MatInputPasswordTestController);
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.directive(MatFormField))!
      .componentInstance as MatFormField;
    expect(formField).toBeTruthy();
    expect(formField!._control.empty).toBe(true);
  }));

  it('should treat number input type as empty at init', fakeAsync(() => {
    let fixture = createComponent(MatInputNumberTestController);
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.directive(MatFormField))!
      .componentInstance as MatFormField;
    expect(formField).toBeTruthy();
    expect(formField!._control.empty).toBe(true);
  }));

  it('should not be empty after input entered', fakeAsync(() => {
    let fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input'))!;
    const formField = fixture.debugElement.query(By.directive(MatFormField))!
      .componentInstance as MatFormField;
    expect(formField).toBeTruthy();
    expect(formField!._control.empty).toBe(true);

    inputEl.nativeElement.value = 'hello';
    // Simulate input event.
    inputEl.triggerEventHandler('input', {target: inputEl.nativeElement});
    fixture.detectChanges();
    expect(formField!._control.empty).toBe(false);
  }));

  it('should update the placeholder when input entered', fakeAsync(() => {
    let fixture = createComponent(MatInputWithStaticLabel);
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input'))!;
    const formField = fixture.debugElement.query(By.directive(MatFormField))!
      .componentInstance as MatFormField;

    expect(formField).toBeTruthy();
    expect(formField._control.empty).toBe(true);
    expect(formField._shouldLabelFloat()).toBe(false);

    // Update the value of the input.
    inputEl.nativeElement.value = 'Text';

    // Fake behavior of the `(input)` event which should trigger a change detection.
    fixture.detectChanges();

    expect(formField._control.empty).toBe(false);
    expect(formField._shouldLabelFloat()).toBe(true);
  }));

  it('should not be empty when the value set before view init', fakeAsync(() => {
    let fixture = createComponent(MatInputWithValueBinding);
    fixture.detectChanges();
    const formField = fixture.debugElement.query(By.directive(MatFormField))!
      .componentInstance as MatFormField;
    expect(formField._control.empty).toBe(false);

    fixture.componentInstance.value = '';
    fixture.detectChanges();

    expect(formField._control.empty).toBe(true);
  }));

  it('should add id', fakeAsync(() => {
    let fixture = createComponent(MatInputTextTestController);
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
    let fixture = createComponent(MatInputTextTestController);
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
    let fixture = createComponent(MatInputWithId);
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

  it("validates there's only one hint label per side", () => {
    let fixture = createComponent(MatInputInvalidHintTestController);
    expect(() => fixture.detectChanges()).toThrowError(
      wrappedErrorMessage(getMatFormFieldDuplicatedHintError('start')),
    );
  });

  it("validates there's only one hint label per side (attribute)", () => {
    let fixture = createComponent(MatInputInvalidHint2TestController);

    expect(() => fixture.detectChanges()).toThrowError(
      wrappedErrorMessage(getMatFormFieldDuplicatedHintError('start')),
    );
  });

  it('validates that matInput child is present', fakeAsync(() => {
    let fixture = createComponent(MatInputMissingMatInputTestController);

    expect(() => fixture.detectChanges()).toThrowError(
      wrappedErrorMessage(getMatFormFieldMissingControlError()),
    );
  }));

  it('validates that matInput child is present after initialization', fakeAsync(() => {
    let fixture = createComponent(MatInputWithNgIf);

    expect(() => fixture.detectChanges()).not.toThrowError(
      wrappedErrorMessage(getMatFormFieldMissingControlError()),
    );

    fixture.componentInstance.renderInput = false;

    expect(() => fixture.detectChanges()).toThrowError(
      wrappedErrorMessage(getMatFormFieldMissingControlError()),
    );
  }));

  it('validates the type', fakeAsync(() => {
    let fixture = createComponent(MatInputInvalidTypeTestController);

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
    let fixture = createComponent(MatInputHintLabelTestController);
    fixture.detectChanges();

    // If the hint label is empty, expect no label.
    expect(fixture.debugElement.query(By.css('.mat-mdc-form-field-hint'))).toBeNull();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.mat-mdc-form-field-hint'))).not.toBeNull();
  }));

  it('sets an id on hint labels', fakeAsync(() => {
    let fixture = createComponent(MatInputHintLabelTestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('.mat-mdc-form-field-hint'))!.nativeElement;

    expect(hint.getAttribute('id')).toBeTruthy();
  }));

  it('supports hint labels elements', fakeAsync(() => {
    let fixture = createComponent(MatInputHintLabel2TestController);
    fixture.detectChanges();

    // In this case, we should have an empty <mat-hint>.
    let el = fixture.debugElement.query(By.css('mat-hint'))!.nativeElement;
    expect(el.textContent).toBeFalsy();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('mat-hint'))!.nativeElement;
    expect(el.textContent).toBe('label');
  }));

  it('sets an id on the hint element', fakeAsync(() => {
    let fixture = createComponent(MatInputHintLabel2TestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('mat-hint'))!.nativeElement;

    expect(hint.getAttribute('id')).toBeTruthy();
  }));

  it('supports label required star', fakeAsync(() => {
    const fixture = createComponent(MatInputLabelRequiredTestComponent);
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('label'))!;
    expect(label).not.toBeNull();
    expect(label.nativeElement.textContent).toBe('hello');
    expect(label.nativeElement.querySelector('.mat-mdc-form-field-required-marker')).toBeTruthy();
  }));

  it('should show the required star when using a FormControl', fakeAsync(() => {
    const fixture = createComponent(MatInputWithRequiredFormControl);
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('label'))!;
    expect(label).not.toBeNull();
    expect(label.nativeElement.textContent).toBe('Hello');
    expect(label.nativeElement.querySelector('.mat-mdc-form-field-required-marker')).toBeTruthy();
  }));

  it('should not hide the required star if input is disabled', () => {
    const fixture = createComponent(MatInputLabelRequiredTestComponent);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('label'))!;
    expect(label).not.toBeNull();
    expect(label.nativeElement.textContent).toBe('hello');
    expect(label.nativeElement.querySelector('.mat-mdc-form-field-required-marker')).toBeTruthy();
  });

  it('hide label required star when set to hide the required marker', fakeAsync(() => {
    const fixture = createComponent(MatInputLabelRequiredTestComponent);
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('label'))!;
    expect(label).not.toBeNull();
    expect(label.nativeElement.querySelector('.mat-mdc-form-field-required-marker')).toBeTruthy();
    expect(label.nativeElement.textContent).toBe('hello');

    fixture.componentInstance.hideRequiredMarker = true;
    fixture.detectChanges();

    expect(label.nativeElement.querySelector('.mat-mdc-form-field-required-marker')).toBeFalsy();
    expect(label.nativeElement.textContent).toBe('hello');
  }));

  it('supports the disabled attribute as binding', fakeAsync(() => {
    const fixture = createComponent(MatInputWithDisabled);
    fixture.detectChanges();

    const wrapperEl = fixture.debugElement.query(
      By.css('.mat-mdc-text-field-wrapper'),
    )!.nativeElement;
    const inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(wrapperEl.classList.contains('mdc-text-field--disabled'))
      .withContext(`Expected form field not to start out disabled.`)
      .toBe(false);
    expect(inputEl.disabled).toBe(false);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    expect(wrapperEl.classList.contains('mdc-text-field--disabled'))
      .withContext(`Expected form field to look disabled after property is set.`)
      .toBe(true);
    expect(inputEl.disabled).toBe(true);
  }));

  it('supports the disabled attribute as binding for select', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const wrapperEl = fixture.debugElement.query(
      By.css('.mat-mdc-text-field-wrapper'),
    )!.nativeElement;
    const selectEl = fixture.debugElement.query(By.css('select'))!.nativeElement;

    expect(wrapperEl.classList.contains('mdc-text-field--disabled'))
      .withContext(`Expected form field not to start out disabled.`)
      .toBe(false);
    expect(selectEl.disabled).toBe(false);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    expect(wrapperEl.classList.contains('mdc-text-field--disabled'))
      .withContext(`Expected form field to look disabled after property is set.`)
      .toBe(true);
    expect(selectEl.disabled).toBe(true);
  }));

  it('should add a class to the form-field if animations are disabled', () => {
    configureTestingModule(MatInputWithId, {animations: false});
    const fixture = TestBed.createComponent(MatInputWithId);
    fixture.detectChanges();

    const formFieldEl = fixture.nativeElement.querySelector('.mat-mdc-form-field');
    expect(formFieldEl.classList).toContain('mat-form-field-no-animations');
  });

  it('should add a class to the form field if it has a native select', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.css('.mat-mdc-form-field'))!.nativeElement;

    expect(formField.classList).toContain('mat-mdc-form-field-type-mat-native-select');
  }));

  it('supports the required attribute as binding', fakeAsync(() => {
    let fixture = createComponent(MatInputWithRequired);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

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
    let fixture = createComponent(MatInputWithType);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(inputEl.type).toBe('text');

    fixture.componentInstance.type = 'password';
    fixture.detectChanges();

    expect(inputEl.type).toBe('password');
  }));

  it('supports textarea', fakeAsync(() => {
    let fixture = createComponent(MatInputTextareaWithBindings);
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
    let fixture = createComponent(MatInputHintLabelTestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    const hint = fixture.debugElement.query(By.css('.mat-mdc-form-field-hint'))!.nativeElement;
    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;
    const hintId = hint.getAttribute('id');

    expect(input.getAttribute('aria-describedby')).toBe(`initial ${hintId}`);
  }));

  it('supports user binding to aria-describedby', fakeAsync(() => {
    let fixture = createComponent(MatInputWithSubscriptAndAriaDescribedBy);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    const hint = fixture.debugElement.query(By.css('.mat-mdc-form-field-hint'))!.nativeElement;
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
    expect(input.getAttribute('aria-describedby')).toMatch(/^custom-error mat-mdc-error-\d+$/);

    fixture.componentInstance.label = '';
    fixture.componentInstance.userDescribedByValue = '';
    fixture.componentInstance.showError = false;
    fixture.detectChanges();
    expect(input.hasAttribute('aria-describedby')).toBe(false);
  }));

  it('sets the aria-describedby to the id of the mat-hint', fakeAsync(() => {
    let fixture = createComponent(MatInputHintLabel2TestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('.mat-mdc-form-field-hint'))!.nativeElement;
    let input = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
  }));

  it('sets the aria-describedby with multiple mat-hint instances', fakeAsync(() => {
    let fixture = createComponent(MatInputMultipleHintTestController);

    fixture.componentInstance.startId = 'start';
    fixture.componentInstance.endId = 'end';
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe('start end');
  }));

  it('should set a class on the hint element based on its alignment', fakeAsync(() => {
    const fixture = createComponent(MatInputMultipleHintTestController);

    fixture.componentInstance.startId = 'start';
    fixture.componentInstance.endId = 'end';
    fixture.detectChanges();

    const start = fixture.nativeElement.querySelector('#start');
    const end = fixture.nativeElement.querySelector('#end');

    expect(start.classList).not.toContain('mat-mdc-form-field-hint-end');
    expect(end.classList).toContain('mat-mdc-form-field-hint-end');
  }));

  it('sets the aria-describedby when a hintLabel is set, in addition to a mat-hint', fakeAsync(() => {
    let fixture = createComponent(MatInputMultipleHintMixedTestController);

    fixture.detectChanges();

    let hintLabel = fixture.debugElement.query(
      By.css('.mat-mdc-form-field-hint:not(.mat-mdc-form-field-hint-end)'),
    )!.nativeElement;
    let endLabel = fixture.debugElement.query(
      By.css('.mat-mdc-form-field-hint.mat-mdc-form-field-hint-end'),
    )!.nativeElement;
    let input = fixture.debugElement.query(By.css('input'))!.nativeElement;
    let ariaValue = input.getAttribute('aria-describedby');

    expect(ariaValue).toBe(`${hintLabel.getAttribute('id')} ${endLabel.getAttribute('id')}`);
  }));

  it('should float when floatLabel is set to default and text is entered', fakeAsync(() => {
    let fixture = createComponent(MatInputWithDynamicLabel);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
    let labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;

    expect(labelEl.classList).toContain('mdc-floating-label--float-above');

    fixture.componentInstance.shouldFloat = 'auto';
    fixture.detectChanges();

    expect(labelEl.classList).not.toContain('mdc-floating-label--float-above');

    // Update the value of the input.
    inputEl.value = 'Text';

    // Fake behavior of the `(input)` event which should trigger a change detection.
    fixture.detectChanges();

    expect(labelEl.classList).toContain('mdc-floating-label--float-above');
  }));

  it('should always float the label when floatLabel is set to always', fakeAsync(() => {
    let fixture = createComponent(MatInputWithDynamicLabel);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
    let labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;

    expect(labelEl.classList).toContain('mdc-floating-label--float-above');

    fixture.detectChanges();

    // Update the value of the input.
    inputEl.value = 'Text';

    // Fake behavior of the `(input)` event which should trigger a change detection.
    fixture.detectChanges();

    expect(labelEl.classList).toContain('mdc-floating-label--float-above');
  }));

  it('should float labels when select has value', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;
    expect(labelEl.classList).toContain('mdc-floating-label--float-above');
  }));

  it('should mark a multi-select as being inline', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');

    expect(select.classList).not.toContain('mat-mdc-native-select-inline');

    select.multiple = true;
    fixture.detectChanges();

    expect(select.classList).toContain('mat-mdc-native-select-inline');
  }));

  it('should mark a select with a size as being inline', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');

    expect(select.classList).not.toContain('mat-mdc-native-select-inline');

    select.size = 3;
    fixture.detectChanges();
    expect(select.classList).toContain('mat-mdc-native-select-inline');

    select.size = 1;
    fixture.detectChanges();
    expect(select.classList).not.toContain('mat-mdc-native-select-inline');
  }));

  it('should not float the label if the selectedIndex is negative', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;
    const selectEl: HTMLSelectElement = fixture.nativeElement.querySelector('select');

    expect(labelEl.classList).toContain('mdc-floating-label--float-above');

    selectEl.selectedIndex = -1;
    fixture.detectChanges();

    expect(labelEl.classList).not.toContain('mdc-floating-label--float-above');
  }));

  it(
    'should not float labels when select has no value, no option label, ' + 'no option innerHtml',
    fakeAsync(() => {
      const fixture = createComponent(MatInputSelectWithNoLabelNoValue);
      fixture.detectChanges();

      const labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;
      expect(labelEl.classList).not.toContain('mdc-floating-label--float-above');
    }),
  );

  it('should floating labels when select has no value but has option label', fakeAsync(() => {
    const fixture = createComponent(MatInputSelectWithLabel);
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;
    expect(labelEl.classList).toContain('mdc-floating-label--float-above');
  }));

  it('should floating labels when select has no value but has option innerHTML', fakeAsync(() => {
    const fixture = createComponent(MatInputSelectWithInnerHtml);
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;
    expect(labelEl.classList).toContain('mdc-floating-label--float-above');
  }));

  it('should not throw if a native select does not have options', fakeAsync(() => {
    const fixture = createComponent(MatInputSelectWithoutOptions);
    expect(() => fixture.detectChanges()).not.toThrow();
  }));

  it('should be able to toggle the floating label programmatically', fakeAsync(() => {
    const fixture = createComponent(MatInputWithId);

    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.directive(MatFormField))!;
    const containerInstance = formField.componentInstance as MatFormField;
    const label = formField.nativeElement.querySelector('label');

    expect(containerInstance.floatLabel).toBe('auto');
    expect(label.classList).not.toContain('mdc-floating-label--float-above');

    fixture.componentInstance.floatLabel = 'always';
    fixture.detectChanges();

    expect(containerInstance.floatLabel).toBe('always');
    expect(label.classList).toContain('mdc-floating-label--float-above');
  }));

  it('should not have prefix and suffix elements when none are specified', fakeAsync(() => {
    let fixture = createComponent(MatInputWithId);
    fixture.detectChanges();

    let prefixEl = fixture.debugElement.query(By.css('.mat-mdc-form-field-prefix'));
    let suffixEl = fixture.debugElement.query(By.css('.mat-mdc-form-field-suffix'));

    expect(prefixEl).toBeNull();
    expect(suffixEl).toBeNull();
  }));

  it('should add prefix and suffix elements when specified', fakeAsync(() => {
    const fixture = createComponent(MatInputWithPrefixAndSuffix);
    fixture.detectChanges();

    const textPrefixEl = fixture.debugElement.query(By.css('.mat-mdc-form-field-text-prefix'))!;
    const textSuffixEl = fixture.debugElement.query(By.css('.mat-mdc-form-field-text-suffix'))!;
    const iconPrefixEl = fixture.debugElement.query(By.css('.mat-mdc-form-field-icon-prefix'))!;
    const iconSuffixEl = fixture.debugElement.query(By.css('.mat-mdc-form-field-icon-suffix'))!;

    expect(textPrefixEl).not.toBeNull();
    expect(textSuffixEl).not.toBeNull();
    expect(iconPrefixEl).not.toBeNull();
    expect(iconSuffixEl).not.toBeNull();
    expect(textPrefixEl.nativeElement.innerText.trim()).toEqual('Prefix');
    expect(textSuffixEl.nativeElement.innerText.trim()).toEqual('Suffix');
    expect(iconPrefixEl.nativeElement.innerText.trim()).toEqual('favorite');
    expect(iconSuffixEl.nativeElement.innerText.trim()).toEqual('favorite');
  }));

  it('should update empty class when value changes programmatically and OnPush', fakeAsync(() => {
    let fixture = createComponent(MatInputOnPush);
    fixture.detectChanges();

    let component = fixture.componentInstance;
    let label = fixture.debugElement.query(By.css('label'))!.nativeElement;

    expect(label.classList).not.toContain('mdc-floating-label--float-above');

    component.formControl.setValue('something');
    fixture.detectChanges();

    expect(label.classList).toContain('mdc-floating-label--float-above');
  }));

  it('should set the focused class when the input is focused', fakeAsync(() => {
    let fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    let input = fixture.debugElement
      .query(By.directive(MatInput))!
      .injector.get<MatInput>(MatInput);
    let container = fixture.debugElement.query(By.css('.mat-mdc-form-field'))!.nativeElement;

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
      .query(By.directive(MatInput))!
      .injector.get<MatInput>(MatInput);
    const container = fixture.debugElement.query(By.css('.mat-mdc-form-field'))!.nativeElement;

    // Call the focus handler directly to avoid flakyness where
    // browsers don't focus elements if the window is minimized.
    input._focusChanged(true);
    fixture.detectChanges();

    expect(container.classList).toContain('mat-focused');

    input.disabled = true;
    fixture.detectChanges();

    expect(container.classList).not.toContain('mat-focused');
  }));

  it('should only show the native control placeholder, when there is a label, on focus', () => {
    const fixture = createComponent(MatInputWithLabelAndPlaceholder);
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;
    const label = fixture.debugElement.query(By.css('label'))!.nativeElement;
    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(container.classList).toContain('mat-form-field-hide-placeholder');
    expect(label.textContent.trim()).toBe('Label');

    input.value = 'Value';
    fixture.detectChanges();

    expect(container.classList).not.toContain('mat-form-field-hide-placeholder');
  });

  it('should always show the native control placeholder when floatLabel is set to "always"', () => {
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

  it('should not add the native select class if the control is not a native select', () => {
    const fixture = createComponent(MatInputWithId);
    fixture.detectChanges();
    const formField = fixture.debugElement.query(By.css('.mat-mdc-form-field'))!.nativeElement;

    expect(formField.classList).not.toContain('mat-mdc-form-field-type-mat-native-select');
  });

  it('should preserve the native placeholder on a non-legacy appearance', fakeAsync(() => {
    const fixture = createComponent(MatInputWithLabelAndPlaceholder);
    fixture.componentInstance.floatLabel = 'auto';
    fixture.componentInstance.appearance = 'outline';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input').getAttribute('placeholder')).toBe(
      'Placeholder',
    );
  }));

  it(
    'should use the native input value when determining whether ' +
      'the element is empty with a custom accessor',
    fakeAsync(() => {
      let fixture = createComponent(MatInputWithCustomAccessor, [], [], [CustomMatInputAccessor]);
      fixture.detectChanges();
      let formField = fixture.debugElement.query(By.directive(MatFormField))!
        .componentInstance as MatFormField;

      expect(formField._control.empty).toBe(true);

      fixture.nativeElement.querySelector('input').value = 'abc';
      fixture.detectChanges();

      expect(formField._control.empty).toBe(false);
    }),
  );

  it('should default the form field color to primary', fakeAsync(() => {
    const fixture = createComponent(MatInputWithColor);
    fixture.detectChanges();

    const formField = fixture.nativeElement.querySelector('.mat-mdc-form-field');
    expect(formField.classList).toContain('mat-primary');
  }));

  it('should be able to change the form field color', fakeAsync(() => {
    const fixture = createComponent(MatInputWithColor);
    fixture.componentInstance.color = 'accent';
    fixture.detectChanges();
    const formField = fixture.nativeElement.querySelector('.mat-mdc-form-field');

    expect(formField.classList).toContain('mat-accent');

    fixture.componentInstance.color = 'warn';
    fixture.detectChanges();
    expect(formField.classList).toContain('mat-warn');
  }));

  it('should set a class on the input depending on whether it is in a form field', fakeAsync(() => {
    const fixture = createComponent(MatInputInsideOutsideFormField);
    fixture.detectChanges();

    const inFormField = fixture.nativeElement.querySelector('.inside');
    const outsideFormField = fixture.nativeElement.querySelector('.outside');

    expect(inFormField.classList).toContain('mat-mdc-form-field-input-control');
    expect(outsideFormField.classList).not.toContain('mat-mdc-form-field-input-control');
  }));
});

describe('MatMdcInput with forms', () => {
  describe('error messages', () => {
    let fixture: ComponentFixture<MatInputWithFormErrorMessages>;
    let testComponent: MatInputWithFormErrorMessages;
    let containerEl: HTMLElement;
    let inputEl: HTMLInputElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(MatInputWithFormErrorMessages);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      containerEl = fixture.debugElement.query(By.css('.mat-mdc-form-field'))!.nativeElement;
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

    it('should not reset text-field validity if focus changes for an invalid input', fakeAsync(() => {
      // Mark the control as touched, so that the form-field displays as invalid.
      testComponent.formControl.markAsTouched();
      fixture.detectChanges();
      flush();

      const wrapperEl = containerEl.querySelector('.mdc-text-field')!;
      expect(wrapperEl.classList).toContain('mdc-text-field--invalid');

      dispatchFakeEvent(inputEl, 'focus');
      dispatchFakeEvent(inputEl, 'blur');
      expect(wrapperEl.classList).toContain('mdc-text-field--invalid');
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

      let groupFixture = createComponent(MatInputWithFormGroupErrorMessages);
      let component: MatInputWithFormGroupErrorMessages;

      groupFixture.detectChanges();
      component = groupFixture.componentInstance;
      containerEl = groupFixture.debugElement.query(By.css('.mat-mdc-form-field'))!.nativeElement;
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
      let hintId = fixture.debugElement
        .query(By.css('.mat-mdc-form-field-hint'))!
        .nativeElement.getAttribute('id');
      let describedBy = inputEl.getAttribute('aria-describedby');

      expect(hintId).withContext('hint should be shown').toBeTruthy();
      expect(describedBy).toBe(hintId);

      fixture.componentInstance.formControl.markAsTouched();
      fixture.detectChanges();

      let errorIds = fixture.debugElement
        .queryAll(By.css('.mat-mdc-form-field-error'))
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
        .withContext('Expected aria-invalid to be set to "true"')
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
      let fixture = createComponent(MatInputWithCustomErrorStateMatcher);
      fixture.detectChanges();

      let component = fixture.componentInstance;
      let containerEl = fixture.debugElement.query(By.css('.mat-mdc-form-field'))!.nativeElement;

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
      let fixture = createComponent(MatInputWithFormErrorMessages, [
        {
          provide: ErrorStateMatcher,
          useValue: {isErrorState: () => true},
        },
      ]);

      fixture.detectChanges();

      let containerEl = fixture.debugElement.query(By.css('.mat-mdc-form-field'))!.nativeElement;
      let testComponent = fixture.componentInstance;

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
      let fixture = createComponent(MatInputWithFormErrorMessages, [
        {
          provide: ErrorStateMatcher,
          useClass: ShowOnDirtyErrorStateMatcher,
        },
      ]);
      fixture.detectChanges();

      let containerEl = fixture.debugElement.query(By.css('.mat-mdc-form-field'))!.nativeElement;
      let testComponent = fixture.componentInstance;

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
    let fixture = createComponent(MatInputWithFormControl);
    fixture.detectChanges();

    let input = fixture.debugElement
      .query(By.directive(MatInput))!
      .injector.get<MatInput>(MatInput);

    expect(input.value).toBeFalsy();

    fixture.componentInstance.formControl.setValue('something');

    expect(input.value).toBe('something');
  }));

  it('should display disabled styles when using FormControl.disable()', fakeAsync(() => {
    const fixture = createComponent(MatInputWithFormControl);
    fixture.detectChanges();

    const formFieldEl = fixture.debugElement.query(By.css('.mat-mdc-form-field'))!.nativeElement;
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
    let fixture = createComponent(MatInputZeroTestController);
    fixture.detectChanges();
    flush();

    fixture.detectChanges();

    let formField = fixture.debugElement.query(By.directive(MatFormField))!
      .componentInstance as MatFormField;
    expect(formField).not.toBeNull();
    expect(formField._control.empty).toBe(false);
  }));

  it('should update when the form field value is patched without emitting', fakeAsync(() => {
    const fixture = createComponent(MatInputWithFormControl);
    fixture.detectChanges();

    let formField = fixture.debugElement.query(By.directive(MatFormField))!
      .componentInstance as MatFormField;

    expect(formField._control.empty).toBe(true);

    fixture.componentInstance.formControl.patchValue('value', {emitEvent: false});
    fixture.detectChanges();

    expect(formField._control.empty).toBe(false);
  }));

  it('should update notch size after changing appearance to outline', fakeAsync(() => {
    const fixture = createComponent(MatInputWithAppearance);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.mdc-notched-outline__notch')).toBe(null);

    fixture.componentInstance.appearance = 'outline';
    fixture.detectChanges();

    let notch = fixture.nativeElement.querySelector('.mdc-notched-outline__notch')! as HTMLElement;
    expect(notch.style.width).toBeFalsy();

    fixture.nativeElement.querySelector('input')!.focus();
    fixture.detectChanges();

    expect(notch.style.width).toBeTruthy();
  }));
});

describe('MatFormField default options', () => {
  it('should be fill appearance if no default options provided', () => {
    const fixture = createComponent(MatInputWithAppearance);
    fixture.detectChanges();
    expect(fixture.componentInstance.formField.appearance).toBe('fill');
  });

  it('should be fill appearance if empty default options provided', () => {
    const fixture = createComponent(MatInputWithAppearance, [
      {
        provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {},
      },
    ]);

    fixture.detectChanges();
    expect(fixture.componentInstance.formField.appearance).toBe('fill');
  });

  it('should be able to change the default appearance', () => {
    const fixture = createComponent(MatInputWithAppearance, [
      {
        provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {appearance: 'outline'},
      },
    ]);
    fixture.detectChanges();
    expect(fixture.componentInstance.formField.appearance).toBe('outline');
  });

  it('should default hideRequiredMarker to false', () => {
    const fixture = createComponent(MatInputWithAppearance, [
      {
        provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {},
      },
    ]);

    fixture.detectChanges();
    expect(fixture.componentInstance.formField.hideRequiredMarker).toBe(false);
  });

  it('should be able to change the default value of hideRequiredMarker and appearance', () => {
    const fixture = createComponent(MatInputWithAppearance, [
      {
        provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
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
    const fixture = createComponent(MatInputSimple, [
      {
        provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {color: 'accent'},
      },
    ]);
    fixture.detectChanges();
    const formField = fixture.nativeElement.querySelector('.mat-mdc-form-field');
    expect(formField.classList).toContain('mat-accent');
  });

  it('defaults subscriptSizing to false', () => {
    const fixture = createComponent(MatInputWithSubscriptSizing);
    fixture.detectChanges();

    const subscriptElement = fixture.nativeElement.querySelector(
      '.mat-mdc-form-field-subscript-wrapper',
    );

    expect(fixture.componentInstance.formField.subscriptSizing).toBe('fixed');
    expect(subscriptElement.classList.contains('mat-mdc-form-field-subscript-dynamic-size')).toBe(
      false,
    );

    fixture.componentInstance.sizing = 'dynamic';
    fixture.detectChanges();

    expect(fixture.componentInstance.formField.subscriptSizing).toBe('dynamic');
    expect(subscriptElement.classList.contains('mat-mdc-form-field-subscript-dynamic-size')).toBe(
      true,
    );
  });

  it('changes the default value of subscriptSizing (undefined input)', () => {
    const fixture = createComponent(MatInputWithSubscriptSizing, [
      {
        provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {
          subscriptSizing: 'dynamic',
        },
      },
    ]);

    fixture.detectChanges();
    expect(fixture.componentInstance.formField.subscriptSizing).toBe('dynamic');
    expect(
      fixture.nativeElement
        .querySelector('.mat-mdc-form-field-subscript-wrapper')
        .classList.contains('mat-mdc-form-field-subscript-dynamic-size'),
    ).toBe(true);
  });

  it('changes the default value of subscriptSizing (no input)', () => {
    const fixture = createComponent(MatInputWithAppearance, [
      {
        provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {
          subscriptSizing: 'dynamic',
        },
      },
    ]);

    fixture.detectChanges();
    expect(fixture.componentInstance.formField.subscriptSizing).toBe('dynamic');
    expect(
      fixture.nativeElement
        .querySelector('.mat-mdc-form-field-subscript-wrapper')
        .classList.contains('mat-mdc-form-field-subscript-dynamic-size'),
    ).toBe(true);
  });
});

function configureTestingModule(
  component: Type<any>,
  options: {
    providers?: Provider[];
    imports?: any[];
    declarations?: any[];
    animations?: boolean;
  } = {},
) {
  const {providers = [], imports = [], declarations = [], animations = true} = options;
  TestBed.configureTestingModule({
    imports: [
      FormsModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      animations ? BrowserAnimationsModule : NoopAnimationsModule,
      ReactiveFormsModule,
      ...imports,
    ],
    declarations: [component, ...declarations],
    providers: [
      // Custom error handler that re-throws the error. Errors happening within
      // change detection phase will be reported through the handler and thrown
      // in Ivy. Since we do not want to pollute the "console.error", but rather
      // just rely on the actual error interrupting the test, we re-throw here.
      {
        provide: ErrorHandler,
        useValue: {
          handleError: (err: any) => {
            throw err;
          },
        },
      },
      ...providers,
    ],
  }).compileComponents();
}

function createComponent<T>(
  component: Type<T>,
  providers: Provider[] = [],
  imports: any[] = [],
  declarations: any[] = [],
): ComponentFixture<T> {
  configureTestingModule(component, {providers, imports, declarations});
  return TestBed.createComponent<T>(component);
}

@Component({
  template: `
    <mat-form-field [floatLabel]="floatLabel">
      <mat-label>Label</mat-label>
      <input matNativeControl id="test-id" placeholder="test">
    </mat-form-field>`,
})
class MatInputWithId {
  floatLabel: 'always' | 'auto' = 'auto';
}

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
  template: `
    <mat-form-field [hideRequiredMarker]="hideRequiredMarker">
      <mat-label>hello</mat-label>
      <input matInput required [disabled]="disabled">
    </mat-form-field>`,
})
class MatInputLabelRequiredTestComponent {
  hideRequiredMarker: boolean = false;
  disabled: boolean = false;
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
      <mat-label>Label</mat-label>
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
    <mat-form-field>
      <input matInput placeholder="Label">
    </mat-form-field>
  `,
})
class MatInputWithStaticLabel {}

@Component({
  template: `
    <mat-form-field [floatLabel]="shouldFloat">
      <mat-label>Label</mat-label>
      <input matInput placeholder="Placeholder">
    </mat-form-field>`,
})
class MatInputWithDynamicLabel {
  shouldFloat: 'always' | 'auto' = 'always';
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
      <mat-icon matIconPrefix>favorite</mat-icon>
      <div matTextPrefix>Prefix</div>
      <input matInput>
      <div matTextSuffix>Suffix</div>
      <mat-icon matIconSuffix>favorite</mat-icon>
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
      <mat-label>Label</mat-label>
      <input matInput [formControl]="formControl">
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
  floatLabel: FloatLabelType;
  appearance: MatFormFieldAppearance;
}

@Component({
  template: `
    <mat-form-field [appearance]="appearance">
      <mat-label>My Label</mat-label>
      <input matInput placeholder="Placeholder">
    </mat-form-field>
  `,
})
class MatInputWithAppearance {
  @ViewChild(MatFormField) formField: MatFormField;
  appearance: MatFormFieldAppearance;
}

@Component({
  template: `
    <mat-form-field [subscriptSizing]="sizing">
      <mat-label>My Label</mat-label>
      <input matInput placeholder="Placeholder" required>
    </mat-form-field>
  `,
})
class MatInputWithSubscriptSizing {
  @ViewChild(MatFormField) formField: MatFormField;
  sizing: SubscriptSizing;
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
    <mat-form-field>
      <mat-label>Label</mat-label>
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
      <mat-label>Form-field label</mat-label>
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
      <mat-label>Label</mat-label>
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
      <mat-label>Label</mat-label>
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
    <mat-form-field>
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
      provide: MAT_INPUT_VALUE_ACCESSOR,
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
      <input class="inside" matNativeControl>
    </mat-form-field>

    <input class="outside" matNativeControl>
  `,
})
class MatInputInsideOutsideFormField {}

@Component({
  template: `
    <mat-form-field>
      <mat-label>Hello</mat-label>
      <input matInput [formControl]="formControl">
    </mat-form-field>`,
})
class MatInputWithRequiredFormControl {
  formControl = new FormControl('', [Validators.required]);
}

@Component({
  template: `
    <mat-form-field>
      <input matInput>
    </mat-form-field>
  `,
})
class MatInputSimple {}
