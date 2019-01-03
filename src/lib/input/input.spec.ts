import {Platform, PlatformModule} from '@angular/cdk/platform';
import {
  createFakeEvent,
  dispatchFakeEvent,
  wrappedErrorMessage,
  MockNgZone,
} from '@angular/cdk/testing';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  Type,
  Provider,
  NgZone,
  Directive,
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
  FloatLabelType,
  MAT_LABEL_GLOBAL_OPTIONS,
  ShowOnDirtyErrorStateMatcher,
} from '@angular/material/core';
import {
  getMatFormFieldDuplicatedHintError,
  getMatFormFieldMissingControlError,
  getMatFormFieldPlaceholderConflictError,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormField,
  MatFormFieldAppearance,
  MatFormFieldModule,
} from '@angular/material/form-field';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatStepperModule} from '@angular/material/stepper';
import {MatTabsModule} from '@angular/material/tabs';
import {Directionality, Direction} from '@angular/cdk/bidi';
import {Subject} from 'rxjs';
import {MatInputModule, MatInput, MAT_INPUT_VALUE_ACCESSOR} from './index';
import {MatTextareaAutosize} from './autosize';

describe('MatInput without forms', () => {
  it('should default to floating labels', fakeAsync(() => {
    let fixture = createComponent(MatInputWithId);
    fixture.detectChanges();

    let formField = fixture.debugElement.query(By.directive(MatFormField))
        .componentInstance as MatFormField;
    expect(formField.floatLabel).toBe('auto',
        'Expected MatInput to set floatingLabel to auto by default.');
  }));

  it('should default to global floating label type', fakeAsync(() => {
    let fixture = createComponent(MatInputWithId, [{
      provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: {float: 'always'}
    }]);
    fixture.detectChanges();

    let formField = fixture.debugElement.query(By.directive(MatFormField))
        .componentInstance as MatFormField;
    expect(formField.floatLabel).toBe('always',
      'Expected MatInput to set floatingLabel to always from global option.');
  }));

  it('should not be treated as empty if type is date', fakeAsync(() => {
    const platform = new Platform();

    if (!(platform.TRIDENT || (platform.SAFARI && !platform.IOS))) {
      let fixture = createComponent(MatInputDateTestController);
      fixture.detectChanges();

      let el = fixture.debugElement.query(By.css('label')).nativeElement;
      expect(el).not.toBeNull();
      expect(el.classList.contains('mat-form-field-empty')).toBe(false);
    }
  }));

  // Safari Desktop and IE don't support type="date" and fallback to type="text".
  it('should be treated as empty if type is date in Safari Desktop or IE', fakeAsync(() => {
    const platform = new Platform();

    if (platform.TRIDENT || (platform.SAFARI && !platform.IOS)) {
      let fixture = createComponent(MatInputDateTestController);
      fixture.detectChanges();

      let el = fixture.debugElement.query(By.css('label')).nativeElement;
      expect(el).not.toBeNull();
      expect(el.classList.contains('mat-form-field-empty')).toBe(true);
    }
  }));

  it('should treat text input type as empty at init', fakeAsync(() => {
    let fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('mat-form-field-empty')).toBe(true);
  }));

  it('should treat password input type as empty at init', fakeAsync(() => {
    let fixture = createComponent(MatInputPasswordTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('mat-form-field-empty')).toBe(true);
  }));

  it('should treat number input type as empty at init', fakeAsync(() => {
    let fixture = createComponent(MatInputNumberTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('mat-form-field-empty')).toBe(true);
  }));

  it('should not be empty after input entered', fakeAsync(() => {
    let fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input'));
    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('mat-form-field-empty')).toBe(true, 'should be empty');

    inputEl.nativeElement.value = 'hello';
    // Simulate input event.
    inputEl.triggerEventHandler('input', {target: inputEl.nativeElement});
    fixture.detectChanges();

    el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el.classList.contains('mat-form-field-empty')).toBe(false, 'should not be empty');
  }));

  it('should update the placeholder when input entered', fakeAsync(() => {
    let fixture = createComponent(MatInputWithStaticLabel);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input'));
    let labelEl = fixture.debugElement.query(By.css('label')).nativeElement;

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
    let fixture = createComponent(MatInputWithValueBinding);
    fixture.detectChanges();
    let labelEl = fixture.debugElement.query(By.css('.mat-form-field-label')).nativeElement;

    expect(labelEl.classList).not.toContain('mat-form-field-empty');

    fixture.componentInstance.value = '';
    fixture.detectChanges();

    expect(labelEl.classList).toContain('mat-form-field-empty');
  }));

  it('should add id', fakeAsync(() => {
    let fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
        fixture.debugElement.query(By.css('label')).nativeElement;

    expect(inputElement.id).toBeTruthy();
    expect(inputElement.id).toEqual(labelElement.getAttribute('for')!);
  }));

  it('should add aria-owns to the label for the associated control', fakeAsync(() => {
    let fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
        fixture.debugElement.query(By.css('label')).nativeElement;

    expect(labelElement.getAttribute('aria-owns')).toBe(inputElement.id);
  }));

  it('should add aria-required reflecting the required state', fakeAsync(() => {
    const fixture = createComponent(MatInputWithRequired);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputElement.getAttribute('aria-required'))
        .toBe('false', 'Expected aria-required to reflect required state of false');

    fixture.componentInstance.required = true;
    fixture.detectChanges();

    expect(inputElement.getAttribute('aria-required'))
        .toBe('true', 'Expected aria-required to reflect required state of true');
  }));

  it('should not overwrite existing id', fakeAsync(() => {
    let fixture = createComponent(MatInputWithId);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
        fixture.debugElement.query(By.css('label')).nativeElement;

    expect(inputElement.id).toBe('test-id');
    expect(labelElement.getAttribute('for')).toBe('test-id');
  }));

  it('validates there\'s only one hint label per side', fakeAsync(() => {
    let fixture = createComponent(MatInputInvalidHintTestController);

    expect(() => {
      try {
        fixture.detectChanges();
        flush();
      } catch {
        flush();
      }
    }).toThrowError(
        wrappedErrorMessage(getMatFormFieldDuplicatedHintError('start')));
  }));

  it('validates there\'s only one hint label per side (attribute)', fakeAsync(() => {
    let fixture = createComponent(MatInputInvalidHint2TestController);

    expect(() => {
      try {
        fixture.detectChanges();
        flush();
      } catch {
        flush();
      }
    }).toThrowError(
        wrappedErrorMessage(getMatFormFieldDuplicatedHintError('start')));
  }));

  it('validates there\'s only one placeholder', fakeAsync(() => {
    let fixture = createComponent(MatInputInvalidPlaceholderTestController);

    expect(() => {
      try {
        fixture.detectChanges();
        flush();
      } catch {
        flush();
      }
    }).toThrowError(
        wrappedErrorMessage(getMatFormFieldPlaceholderConflictError()));
  }));

  it('validates that matInput child is present', fakeAsync(() => {
    let fixture = createComponent(MatInputMissingMatInputTestController);

    expect(() => fixture.detectChanges()).toThrowError(
        wrappedErrorMessage(getMatFormFieldMissingControlError()));
  }));

  it('validates that matInput child is present after initialization', fakeAsync(() => {
    let fixture = createComponent(MatInputWithNgIf);

    expect(() => fixture.detectChanges()).not.toThrowError(
        wrappedErrorMessage(getMatFormFieldMissingControlError()));

    fixture.componentInstance.renderInput = false;

    expect(() => fixture.detectChanges()).toThrowError(
        wrappedErrorMessage(getMatFormFieldMissingControlError()));
  }));

  it('validates the type', fakeAsync(() => {
    let fixture = createComponent(MatInputInvalidTypeTestController);

    // Technically this throws during the OnChanges detection phase,
    // so the error is really a ChangeDetectionError and it becomes
    // hard to build a full exception to compare with.
    // We just check for any exception in this case.
    expect(() => fixture.detectChanges()).toThrow(
        /* new MatInputUnsupportedTypeError('file') */);
  }));

  it('supports hint labels attribute', fakeAsync(() => {
    let fixture = createComponent(MatInputHintLabelTestController);
    fixture.detectChanges();

    // If the hint label is empty, expect no label.
    expect(fixture.debugElement.query(By.css('.mat-hint'))).toBeNull();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.mat-hint'))).not.toBeNull();
  }));

  it('sets an id on hint labels', fakeAsync(() => {
    let fixture = createComponent(MatInputHintLabelTestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('.mat-hint')).nativeElement;

    expect(hint.getAttribute('id')).toBeTruthy();
  }));

  it('supports hint labels elements', fakeAsync(() => {
    let fixture = createComponent(MatInputHintLabel2TestController);
    fixture.detectChanges();

    // In this case, we should have an empty <mat-hint>.
    let el = fixture.debugElement.query(By.css('mat-hint')).nativeElement;
    expect(el.textContent).toBeFalsy();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('mat-hint')).nativeElement;
    expect(el.textContent).toBe('label');
  }));

  it('sets an id on the hint element', fakeAsync(() => {
    let fixture = createComponent(MatInputHintLabel2TestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('mat-hint')).nativeElement;

    expect(hint.getAttribute('id')).toBeTruthy();
  }));

  it('supports placeholder attribute', fakeAsync(() => {
    let fixture = createComponent(MatInputPlaceholderAttrTestComponent);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(fixture.debugElement.query(By.css('label'))).toBeNull();
    expect(inputEl.placeholder).toBe('');

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();

    let labelEl = fixture.debugElement.query(By.css('label'));

    expect(inputEl.placeholder).toBe('Other placeholder');
    expect(labelEl).not.toBeNull();
    expect(labelEl.nativeElement.textContent).toMatch('Other placeholder');
    expect(labelEl.nativeElement.textContent).not.toMatch(/\*/g);
  }));

  it('supports placeholder element', fakeAsync(() => {
    let fixture = createComponent(MatInputPlaceholderElementTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Default Placeholder');

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();

    el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Other placeholder');
    expect(el.nativeElement.textContent).not.toMatch(/\*/g);
  }));

  it('supports placeholder required star', fakeAsync(() => {
    let fixture = createComponent(MatInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch(/hello\s+\*/g);
  }));

  it('should hide the required star if input is disabled', () => {
    const fixture = createComponent(MatInputPlaceholderRequiredTestComponent);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    const el = fixture.debugElement.query(By.css('label'));

    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent!.trim()).toMatch(/^hello$/);
  });

  it('should hide the required star from screen readers', fakeAsync(() => {
    let fixture = createComponent(MatInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('.mat-form-field-required-marker')).nativeElement;

    expect(el.getAttribute('aria-hidden')).toBe('true');
  }));

  it('hide placeholder required star when set to hide the required marker', fakeAsync(() => {
    let fixture = createComponent(MatInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch(/hello\s+\*/g);

    fixture.componentInstance.hideRequiredMarker = true;
    fixture.detectChanges();

    expect(el.nativeElement.textContent).toMatch(/hello/g);
  }));

  it('supports the disabled attribute as binding', fakeAsync(() => {
    const fixture = createComponent(MatInputWithDisabled);
    fixture.detectChanges();

    const formFieldEl =
        fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(formFieldEl.classList.contains('mat-form-field-disabled'))
        .toBe(false, `Expected form field not to start out disabled.`);
    expect(inputEl.disabled).toBe(false);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    expect(formFieldEl.classList.contains('mat-form-field-disabled'))
        .toBe(true, `Expected form field to look disabled after property is set.`);
    expect(inputEl.disabled).toBe(true);
  }));

  it('supports the disabled attribute as binding for select', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const formFieldEl =
        fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
    const selectEl = fixture.debugElement.query(By.css('select')).nativeElement;

    expect(formFieldEl.classList.contains('mat-form-field-disabled'))
        .toBe(false, `Expected form field not to start out disabled.`);
    expect(selectEl.disabled).toBe(false);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    expect(formFieldEl.classList.contains('mat-form-field-disabled'))
        .toBe(true, `Expected form field to look disabled after property is set.`);
    expect(selectEl.disabled).toBe(true);
  }));

  it('should add a class to the form field if it has a native select', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;

    expect(formField.classList).toContain('mat-form-field-type-mat-native-select');
  }));

  it('supports the required attribute as binding', fakeAsync(() => {
    let fixture = createComponent(MatInputWithRequired);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputEl.required).toBe(false);

    fixture.componentInstance.required = true;
    fixture.detectChanges();

    expect(inputEl.required).toBe(true);
  }));

  it('supports the required attribute as binding for select', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const selectEl = fixture.debugElement.query(By.css('select')).nativeElement;

    expect(selectEl.required).toBe(false);

    fixture.componentInstance.required = true;
    fixture.detectChanges();

    expect(selectEl.required).toBe(true);
  }));

  it('supports the type attribute as binding', fakeAsync(() => {
    let fixture = createComponent(MatInputWithType);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

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

    let hint = fixture.debugElement.query(By.css('.mat-hint')).nativeElement;
    let input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
  }));

  it('sets the aria-describedby to the id of the mat-hint', fakeAsync(() => {
    let fixture = createComponent(MatInputHintLabel2TestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('.mat-hint')).nativeElement;
    let input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
  }));

  it('sets the aria-describedby with multiple mat-hint instances', fakeAsync(() => {
    let fixture = createComponent(MatInputMultipleHintTestController);

    fixture.componentInstance.startId = 'start';
    fixture.componentInstance.endId = 'end';
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe('start end');
  }));

  it('sets the aria-describedby when a hintLabel is set, in addition to a mat-hint',
    fakeAsync(() => {
      let fixture = createComponent(MatInputMultipleHintMixedTestController);

      fixture.detectChanges();

      let hintLabel = fixture.debugElement.query(By.css('.mat-hint:not(.mat-right)')).nativeElement;
      let endLabel = fixture.debugElement.query(By.css('.mat-hint.mat-right')).nativeElement;
      let input = fixture.debugElement.query(By.css('input')).nativeElement;
      let ariaValue = input.getAttribute('aria-describedby');

      expect(ariaValue).toBe(`${hintLabel.getAttribute('id')} ${endLabel.getAttribute('id')}`);
    }));

  it('should float when floatLabel is set to default and text is entered', fakeAsync(() => {
    let fixture = createComponent(MatInputWithDynamicLabel);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    let formFieldEl = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;

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
    let fixture = createComponent(MatInputWithDynamicLabel);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    let formFieldEl = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;

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

    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
    expect(formFieldEl.classList).toContain('mat-form-field-should-float');
  }));

  it('should not float the label if the selectedIndex is negative', fakeAsync(() => {
    const fixture = createComponent(MatInputSelect);
    fixture.detectChanges();

    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
    const selectEl: HTMLSelectElement = formFieldEl.querySelector('select');

    expect(formFieldEl.classList).toContain('mat-form-field-should-float');

    selectEl.selectedIndex = -1;
    fixture.detectChanges();

    expect(formFieldEl.classList).not.toContain('mat-form-field-should-float');
  }));

  it('should not float labels when select has no value, no option label, ' +
      'no option innerHtml', fakeAsync(() => {
    const fixture = createComponent(MatInputSelectWithNoLabelNoValue);
    fixture.detectChanges();

    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
    expect(formFieldEl.classList).not.toContain('mat-form-field-should-float');
  }));

  it('should floating labels when select has no value but has option label',
      fakeAsync(() => {
    const fixture = createComponent(MatInputSelectWithLabel);
    fixture.detectChanges();

    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
    expect(formFieldEl.classList).toContain('mat-form-field-should-float');
  }));

  it('should floating labels when select has no value but has option innerHTML',
      fakeAsync(() => {
    const fixture = createComponent(MatInputSelectWithInnerHtml);
    fixture.detectChanges();

    const formFieldEl = fixture.debugElement.query(By.css('.mat-form-field'))
        .nativeElement;
    expect(formFieldEl.classList).toContain('mat-form-field-should-float');
  }));

  it('should not throw if a native select does not have options', fakeAsync(() => {
    const fixture = createComponent(MatInputSelectWithoutOptions);
    expect(() => fixture.detectChanges()).not.toThrow();
  }));

  it('should never float the label when floatLabel is set to false', fakeAsync(() => {
    let fixture = createComponent(MatInputWithDynamicLabel);

    fixture.componentInstance.shouldFloat = 'never';
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    let labelEl = fixture.debugElement.query(By.css('label')).nativeElement;

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

    const formField = fixture.debugElement.query(By.directive(MatFormField));
    const containerInstance = formField.componentInstance as MatFormField;
    const label = formField.nativeElement.querySelector('.mat-form-field-label');

    expect(containerInstance.floatLabel).toBe('auto');
    expect(label.classList)
        .toContain('mat-form-field-empty', 'Expected input to be considered empty.');

    containerInstance.floatLabel = 'always';
    fixture.detectChanges();

    expect(label.classList)
        .not.toContain('mat-form-field-empty', 'Expected input to be considered not empty.');
  }));

  it('should not have prefix and suffix elements when none are specified', fakeAsync(() => {
    let fixture = createComponent(MatInputWithId);
    fixture.detectChanges();

    let prefixEl = fixture.debugElement.query(By.css('.mat-form-field-prefix'));
    let suffixEl = fixture.debugElement.query(By.css('.mat-form-field-suffix'));

    expect(prefixEl).toBeNull();
    expect(suffixEl).toBeNull();
  }));

  it('should add prefix and suffix elements when specified', fakeAsync(() => {
    const fixture = createComponent(MatInputWithPrefixAndSuffix);
    fixture.detectChanges();

    const prefixEl = fixture.debugElement.query(By.css('.mat-form-field-prefix'));
    const suffixEl = fixture.debugElement.query(By.css('.mat-form-field-suffix'));

    expect(prefixEl).not.toBeNull();
    expect(suffixEl).not.toBeNull();
    expect(prefixEl.nativeElement.innerText.trim()).toEqual('Prefix');
    expect(suffixEl.nativeElement.innerText.trim()).toEqual('Suffix');
  }));

  it('should update empty class when value changes programmatically and OnPush', fakeAsync(() => {
    let fixture = createComponent(MatInputOnPush);
    fixture.detectChanges();

    let component = fixture.componentInstance;
    let label = fixture.debugElement.query(By.css('.mat-form-field-label')).nativeElement;

    expect(label.classList).toContain('mat-form-field-empty', 'Input initially empty');

    component.formControl.setValue('something');
    fixture.detectChanges();

    expect(label.classList).not.toContain('mat-form-field-empty', 'Input no longer empty');
  }));

  it('should set the focused class when the input is focused', fakeAsync(() => {
    let fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.directive(MatInput))
      .injector.get<MatInput>(MatInput);
    let container = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;

    // Call the focus handler directly to avoid flakyness where
    // browsers don't focus elements if the window is minimized.
    input._focusChanged(true);
    fixture.detectChanges();

    expect(container.classList).toContain('mat-focused');
  }));

  it('should remove the focused class if the input becomes disabled while focused',
    fakeAsync(() => {
      const fixture = createComponent(MatInputTextTestController);
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.directive(MatInput))
          .injector.get<MatInput>(MatInput);
      const container = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;

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
    let fixture = createComponent(MatInputTextTestController);
    fixture.detectChanges();

    let inputContainer = fixture.debugElement.query(By.directive(MatFormField))
        .componentInstance as MatFormField;
    let label = fixture.debugElement.query(By.css('.mat-form-field-label')).nativeElement;

    expect(inputContainer.floatLabel).toBe('auto');

    inputContainer._animateAndLockLabel();
    fixture.detectChanges();

    expect(inputContainer._shouldAlwaysFloat).toBe(false);
    expect(inputContainer.floatLabel).toBe('always');

    const fakeEvent = Object.assign(createFakeEvent('transitionend'), {propertyName: 'transform'});

    label.dispatchEvent(fakeEvent);
    fixture.detectChanges();

    expect(inputContainer._shouldAlwaysFloat).toBe(true);
    expect(inputContainer.floatLabel).toBe('always');
  }));

  it('should not highlight when focusing a readonly input', fakeAsync(() => {
    let fixture = createComponent(MatInputWithReadonlyInput);
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.directive(MatInput)).injector.get<MatInput>(MatInput);
    let container = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;

    // Call the focus handler directly to avoid flakyness where
    // browsers don't focus elements if the window is minimized.
    input._focusChanged(true);
    fixture.detectChanges();

    expect(input.focused).toBe(false);
    expect(container.classList).not.toContain('mat-focused');
  }));

  it('should reset the highlight when a readonly input is blurred', fakeAsync(() => {
    const fixture = createComponent(MatInputWithReadonlyInput);
    fixture.detectChanges();

    const inputDebugElement = fixture.debugElement.query(By.directive(MatInput));
    const input = inputDebugElement.injector.get<MatInput>(MatInput);
    const container = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;

    fixture.componentInstance.isReadonly = false;
    fixture.detectChanges();

    // Call the focus handler directly to avoid flakyness where
    // browsers don't focus elements if the window is minimized.
    input._focusChanged(true);
    fixture.detectChanges();

    expect(input.focused).toBe(true);
    expect(container.classList).toContain('mat-focused');

    fixture.componentInstance.isReadonly = true;
    fixture.detectChanges();

    input._focusChanged(false);
    fixture.detectChanges();

    expect(input.focused).toBe(false);
    expect(container.classList).not.toContain('mat-focused');
  }));

  it('should only show the native placeholder, when there is a label, on focus', () => {
    const fixture = createComponent(MatInputWithLabelAndPlaceholder);
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;
    const label = fixture.debugElement.query(By.css('.mat-form-field-label')).nativeElement;
    const input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(container.classList).toContain('mat-form-field-hide-placeholder');
    expect(container.classList).not.toContain('mat-form-field-should-float');
    expect(label.textContent.trim()).toBe('Label');
    expect(input.getAttribute('placeholder')).toBe('Placeholder');

    input.value = 'Value';
    fixture.detectChanges();

    expect(container.classList).not.toContain('mat-form-field-hide-placeholder');
    expect(container.classList).toContain('mat-form-field-should-float');
  });

  it('should always show the native placeholder when floatLabel is set to "always"', () => {
    const fixture = createComponent(MatInputWithLabelAndPlaceholder);

    fixture.componentInstance.floatLabel = 'always';
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;

    expect(container.classList).not.toContain('mat-form-field-hide-placeholder');
  });

  it('should not add the `placeholder` attribute if there is no placeholder', () => {
    const fixture = createComponent(MatInputWithoutPlaceholder);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.hasAttribute('placeholder')).toBe(false);
  });

  it('should not show the native placeholder when floatLabel is set to "never"', () => {
    const fixture = createComponent(MatInputWithLabelAndPlaceholder);

    fixture.componentInstance.floatLabel = 'never';
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;
    const input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(container.classList).toContain('mat-form-field-hide-placeholder');
    expect(container.classList).not.toContain('mat-form-field-should-float');

    input.value = 'Value';
    fixture.detectChanges();

    expect(container.classList).toContain('mat-form-field-hide-placeholder');
    expect(container.classList).not.toContain('mat-form-field-should-float');
  });

  it('should not add the native select class if the control is not a native select', () => {
    const fixture = createComponent(MatInputWithId);
    fixture.detectChanges();
    const formField = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;

    expect(formField.classList).not.toContain('mat-form-field-type-mat-native-select');
  });

  it('should use the native input value when determining whether ' +
    'the element is empty with a custom accessor', fakeAsync(() => {
      let fixture = createComponent(MatInputWithCustomAccessor, [], [], [CustomMatInputAccessor]);
      fixture.detectChanges();
      let label = fixture.debugElement.query(By.css('label')).nativeElement;

      expect(label.classList).toContain('mat-form-field-empty');

      fixture.nativeElement.querySelector('input').value = 'abc';
      fixture.detectChanges();

      expect(label.classList).not.toContain('mat-form-field-empty');
    }));

});

describe('MatInput with forms', () => {
  describe('error messages', () => {
    let fixture: ComponentFixture<MatInputWithFormErrorMessages>;
    let testComponent: MatInputWithFormErrorMessages;
    let containerEl: HTMLElement;
    let inputEl: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(MatInputWithFormErrorMessages);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      containerEl = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;
      inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    }));

    it('should not show any errors if the user has not interacted', fakeAsync(() => {
      expect(testComponent.formControl.untouched).toBe(true, 'Expected untouched form control');
      expect(containerEl.querySelectorAll('mat-error').length).toBe(0, 'Expected no error message');
      expect(inputEl.getAttribute('aria-invalid'))
        .toBe('false', 'Expected aria-invalid to be set to "false".');
    }));

    it('should display an error message when the input is touched and invalid', fakeAsync(() => {
      expect(testComponent.formControl.invalid).toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('mat-error').length).toBe(0, 'Expected no error message');

      testComponent.formControl.markAsTouched();
      fixture.detectChanges();
      flush();

      expect(containerEl.classList)
        .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
      expect(containerEl.querySelectorAll('mat-error').length)
        .toBe(1, 'Expected one error message to have been rendered.');
      expect(inputEl.getAttribute('aria-invalid'))
        .toBe('true', 'Expected aria-invalid to be set to "true".');
    }));

    it('should display an error message when the parent form is submitted', fakeAsync(() => {
      expect(testComponent.form.submitted).toBe(false, 'Expected form not to have been submitted');
      expect(testComponent.formControl.invalid).toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('mat-error').length).toBe(0, 'Expected no error message');

      dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
      fixture.detectChanges();
      flush();

      expect(testComponent.form.submitted).toBe(true, 'Expected form to have been submitted');
      expect(containerEl.classList)
        .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
      expect(containerEl.querySelectorAll('mat-error').length)
        .toBe(1, 'Expected one error message to have been rendered.');
      expect(inputEl.getAttribute('aria-invalid'))
        .toBe('true', 'Expected aria-invalid to be set to "true".');
    }));

    it('should display an error message when the parent form group is submitted', fakeAsync(() => {
      fixture.destroy();
      TestBed.resetTestingModule();

      let groupFixture = createComponent(MatInputWithFormGroupErrorMessages);
      let component: MatInputWithFormGroupErrorMessages;

      groupFixture.detectChanges();
      component = groupFixture.componentInstance;
      containerEl = groupFixture.debugElement.query(By.css('mat-form-field')).nativeElement;
      inputEl = groupFixture.debugElement.query(By.css('input')).nativeElement;

      expect(component.formGroup.invalid).toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('mat-error').length).toBe(0, 'Expected no error message');
      expect(inputEl.getAttribute('aria-invalid'))
        .toBe('false', 'Expected aria-invalid to be set to "false".');
      expect(component.formGroupDirective.submitted)
        .toBe(false, 'Expected form not to have been submitted');

      dispatchFakeEvent(groupFixture.debugElement.query(By.css('form')).nativeElement, 'submit');
      groupFixture.detectChanges();
      flush();

      expect(component.formGroupDirective.submitted)
        .toBe(true, 'Expected form to have been submitted');
      expect(containerEl.classList)
        .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
      expect(containerEl.querySelectorAll('mat-error').length)
        .toBe(1, 'Expected one error message to have been rendered.');
      expect(inputEl.getAttribute('aria-invalid'))
        .toBe('true', 'Expected aria-invalid to be set to "true".');
    }));

    it('should hide the errors and show the hints once the input becomes valid', fakeAsync(() => {
      testComponent.formControl.markAsTouched();
      fixture.detectChanges();
      flush();

      expect(containerEl.classList)
        .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
      expect(containerEl.querySelectorAll('mat-error').length)
        .toBe(1, 'Expected one error message to have been rendered.');
      expect(containerEl.querySelectorAll('mat-hint').length)
        .toBe(0, 'Expected no hints to be shown.');

      testComponent.formControl.setValue('something');
      fixture.detectChanges();
      flush();

      expect(containerEl.classList).not.toContain('mat-form-field-invalid',
        'Expected container not to have the invalid class when valid.');
      expect(containerEl.querySelectorAll('mat-error').length)
        .toBe(0, 'Expected no error messages when the input is valid.');
      expect(containerEl.querySelectorAll('mat-hint').length)
        .toBe(1, 'Expected one hint to be shown once the input is valid.');
    }));

    it('should not hide the hint if there are no error messages', fakeAsync(() => {
      testComponent.renderError = false;
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('mat-hint').length)
        .toBe(1, 'Expected one hint to be shown on load.');

      testComponent.formControl.markAsTouched();
      fixture.detectChanges();
      flush();

      expect(containerEl.querySelectorAll('mat-hint').length)
        .toBe(1, 'Expected one hint to still be shown.');
    }));

    it('should set the proper role on the error messages', fakeAsync(() => {
      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelector('mat-error')!.getAttribute('role')).toBe('alert');
    }));

    it('sets the aria-describedby to reference errors when in error state', fakeAsync(() => {
      let hintId = fixture.debugElement.query(By.css('.mat-hint')).nativeElement.getAttribute('id');
      let describedBy = inputEl.getAttribute('aria-describedby');

      expect(hintId).toBeTruthy('hint should be shown');
      expect(describedBy).toBe(hintId);

      fixture.componentInstance.formControl.markAsTouched();
      fixture.detectChanges();

      let errorIds = fixture.debugElement.queryAll(By.css('.mat-error'))
          .map(el => el.nativeElement.getAttribute('id')).join(' ');
      describedBy = inputEl.getAttribute('aria-describedby');

      expect(errorIds).toBeTruthy('errors should be shown');
      expect(describedBy).toBe(errorIds);
    }));
  });

  describe('custom error behavior', () => {

    it('should display an error message when a custom error matcher returns true', fakeAsync(() => {
      let fixture = createComponent(MatInputWithCustomErrorStateMatcher);
      fixture.detectChanges();

      let component = fixture.componentInstance;
      let containerEl = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;

      const control = component.formGroup.get('name')!;

      expect(control.invalid).toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('mat-error').length)
        .toBe(0, 'Expected no error messages');

      control.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('mat-error').length)
        .toBe(0, 'Expected no error messages after being touched.');

      component.errorState = true;
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('mat-error').length)
        .toBe(1, 'Expected one error messages to have been rendered.');
    }));

    it('should display an error message when global error matcher returns true', fakeAsync(() => {
      let fixture = createComponent(MatInputWithFormErrorMessages, [{
        provide: ErrorStateMatcher, useValue: {isErrorState: () => true}}
      ]);

      fixture.detectChanges();

      let containerEl = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;
      let testComponent = fixture.componentInstance;

      // Expect the control to still be untouched but the error to show due to the global setting
      expect(testComponent.formControl.untouched).toBe(true, 'Expected untouched form control');
      expect(containerEl.querySelectorAll('mat-error').length).toBe(1, 'Expected an error message');
    }));

    it('should display an error message when using ShowOnDirtyErrorStateMatcher', fakeAsync(() => {
      let fixture = createComponent(MatInputWithFormErrorMessages, [{
        provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher
      }]);
      fixture.detectChanges();

      let containerEl = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;
      let testComponent = fixture.componentInstance;

      expect(testComponent.formControl.invalid).toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('mat-error').length).toBe(0, 'Expected no error message');

      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('mat-error').length)
        .toBe(0, 'Expected no error messages when touched');

      testComponent.formControl.markAsDirty();
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('mat-error').length)
        .toBe(1, 'Expected one error message when dirty');
    }));
  });

  it('should update the value when using FormControl.setValue', fakeAsync(() => {
    let fixture = createComponent(MatInputWithFormControl);
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.directive(MatInput))
      .injector.get<MatInput>(MatInput);

    expect(input.value).toBeFalsy();

    fixture.componentInstance.formControl.setValue('something');

    expect(input.value).toBe('something');
  }));

  it('should display disabled styles when using FormControl.disable()', fakeAsync(() => {
    const fixture = createComponent(MatInputWithFormControl);
    fixture.detectChanges();

    const formFieldEl =
        fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(formFieldEl.classList)
      .not.toContain('mat-form-field-disabled', `Expected form field not to start out disabled.`);
    expect(inputEl.disabled).toBe(false);

    fixture.componentInstance.formControl.disable();
    fixture.detectChanges();

    expect(formFieldEl.classList).toContain('mat-form-field-disabled',
      `Expected form field to look disabled after disable() is called.`);
    expect(inputEl.disabled).toBe(true);
  }));

  it('should not treat the number 0 as empty', fakeAsync(() => {
    let fixture = createComponent(MatInputZeroTestController);
    fixture.detectChanges();
    flush();

    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('mat-form-field-empty')).toBe(false);
  }));

  it('should update when the form field value is patched without emitting', fakeAsync(() => {
    const fixture = createComponent(MatInputWithFormControl);
    fixture.detectChanges();

    const el = fixture.debugElement.query(By.css('label')).nativeElement;

    expect(el.classList).toContain('mat-form-field-empty');

    fixture.componentInstance.formControl.patchValue('value', {emitEvent: false});
    fixture.detectChanges();

    expect(el.classList).not.toContain('mat-form-field-empty');
  }));

});

describe('MatInput with appearance', () => {
  const nonLegacyAppearances: MatFormFieldAppearance[] = ['standard', 'fill'];
  let fixture: ComponentFixture<MatInputWithAppearance>;
  let testComponent: MatInputWithAppearance;
  let containerEl: HTMLElement;

  beforeEach(fakeAsync(() => {
    fixture = createComponent(MatInputWithAppearance);
    fixture.detectChanges();
    testComponent = fixture.componentInstance;
    containerEl = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;
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
        provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: {appearance: 'outline'}
      },
      {
        provide: NgZone,
        useFactory: () => zone = new MockNgZone()
      }
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
    const invisibleFixture = createComponent(MatInputWithOutlineInsideInvisibleElement, [{
      provide: NgZone,
      useFactory: () => zone = new MockNgZone()
    }]);

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
    const outlineFixture = createComponent(MatInputWithAppearanceAndLabel, [{
      provide: Directionality,
      useValue: fakeDirectionality
    }]);

    outlineFixture.componentInstance.appearance = 'outline';
    outlineFixture.detectChanges();
    flush();
    outlineFixture.detectChanges();

    spyOn(outlineFixture.componentInstance.formField, 'updateOutlineGap');

    fakeDirectionality.value = 'rtl';
    fakeDirectionality.change.next('rtl');
    outlineFixture.detectChanges();
    flush();
    outlineFixture.detectChanges();

    expect(outlineFixture.componentInstance.formField.updateOutlineGap).toHaveBeenCalled();
  }));



});

describe('MatFormField default options', () => {
  it('should be legacy appearance if no default options provided', fakeAsync(() => {
    const fixture = createComponent(MatInputWithAppearance);
    fixture.detectChanges();
    flush();
    expect(fixture.componentInstance.formField.appearance).toBe('legacy');
  }));

  it('should be legacy appearance if empty default options provided', fakeAsync(() => {
    const fixture = createComponent(MatInputWithAppearance, [{
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {}}
    ]);

    fixture.detectChanges();
    flush();
    expect(fixture.componentInstance.formField.appearance).toBe('legacy');
  }));

  it('should be custom default appearance if custom appearance specified in default options',
      fakeAsync(() => {
        const fixture = createComponent(MatInputWithAppearance, [{
          provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'fill'}}
        ]);
        fixture.detectChanges();
        flush();
        expect(fixture.componentInstance.formField.appearance).toBe('fill');
      }));
});

describe('MatInput with textarea autosize', () => {
  it('should not calculate wrong content height due to long placeholders', () => {
    const fixture = createComponent(AutosizeTextareaWithLongPlaceholder);
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea');
    const autosize = fixture.componentInstance.autosize;

    autosize.resizeToFitContent(true);

    const heightWithLongPlaceholder = textarea.clientHeight;

    fixture.componentInstance.placeholder = 'Short';
    fixture.detectChanges();

    autosize.resizeToFitContent(true);

    expect(textarea.clientHeight).toBe(heightWithLongPlaceholder,
        'Expected the textarea height to be the same with a long placeholder.');
  });

  it('should work in a tab', () => {
    const fixture = createComponent(AutosizeTextareaInATab, [], [MatTabsModule]);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.getBoundingClientRect().height).toBeGreaterThan(1);
  });

  it('should work in a step', () => {
    const fixture = createComponent(AutosizeTextareaInAStep, [], [MatStepperModule]);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.getBoundingClientRect().height).toBeGreaterThan(1);
  });
});


function createComponent<T>(component: Type<T>,
                            providers: Provider[] = [],
                            imports: any[] = [],
                            declarations: any[] = []): ComponentFixture<T> {
  TestBed.configureTestingModule({
    imports: [
      FormsModule,
      MatFormFieldModule,
      MatInputModule,
      BrowserAnimationsModule,
      PlatformModule,
      ReactiveFormsModule,
      ...imports
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
    </mat-form-field>`
})
class MatInputWithId {}

@Component({
  template: `<mat-form-field><input matInput [disabled]="disabled"></mat-form-field>`
})
class MatInputWithDisabled {
  disabled: boolean;
}

@Component({
  template: `<mat-form-field><input matInput [required]="required"></mat-form-field>`
})
class MatInputWithRequired {
  required: boolean;
}

@Component({
  template: `<mat-form-field><input matInput [type]="type"></mat-form-field>`
})
class MatInputWithType {
  type: string;
}

@Component({
  template: `<mat-form-field [hideRequiredMarker]="hideRequiredMarker">
                <input matInput required [disabled]="disabled" placeholder="hello">
             </mat-form-field>`
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
    </mat-form-field>`
})
class MatInputPlaceholderElementTestComponent {
  placeholder: string = 'Default Placeholder';
}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="Hello" [formControl]="formControl">
    </mat-form-field>`
})
class MatInputWithFormControl {
  formControl = new FormControl();
}

@Component({
  template: `<mat-form-field><input matInput [placeholder]="placeholder"></mat-form-field>`
})
class MatInputPlaceholderAttrTestComponent {
  placeholder: string = '';
}

@Component({
  template: `<mat-form-field><input matInput><mat-hint>{{label}}</mat-hint></mat-form-field>`
})
class MatInputHintLabel2TestController {
  label: string = '';
}

@Component({
  template: `<mat-form-field [hintLabel]="label"><input matInput></mat-form-field>`
})
class MatInputHintLabelTestController {
  label: string = '';
}

@Component({
  template: `<mat-form-field><input matInput type="file"></mat-form-field>`
})
class MatInputInvalidTypeTestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="Hello">
      <mat-placeholder>World</mat-placeholder>
    </mat-form-field>`
})
class MatInputInvalidPlaceholderTestController {}

@Component({
  template: `
    <mat-form-field hintLabel="Hello">
      <input matInput>
      <mat-hint>World</mat-hint>
    </mat-form-field>`
})
class MatInputInvalidHint2TestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput>
      <mat-hint>Hello</mat-hint>
      <mat-hint>World</mat-hint>
    </mat-form-field>`
})
class MatInputInvalidHintTestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput>
      <mat-hint align="start" [id]="startId">Hello</mat-hint>
      <mat-hint align="end" [id]="endId">World</mat-hint>
    </mat-form-field>`
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
    </mat-form-field>`
})
class MatInputMultipleHintMixedTestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput type="date" placeholder="Placeholder">
    </mat-form-field>`
})
class MatInputDateTestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput type="text" placeholder="Placeholder">
    </mat-form-field>`
})
class MatInputTextTestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput type="password" placeholder="Placeholder">
    </mat-form-field>`
})
class MatInputPasswordTestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput type="number" placeholder="Placeholder">
    </mat-form-field>`
})
class MatInputNumberTestController {}

@Component({
  template: `
    <mat-form-field>
      <input matInput type="number" placeholder="Placeholder" [(ngModel)]="value">
    </mat-form-field>`
})
class MatInputZeroTestController {
  value = 0;
}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="Label" [value]="value">
    </mat-form-field>`
})
class MatInputWithValueBinding {
  value: string = 'Initial';
}

@Component({
  template: `
    <mat-form-field floatLabel="never">
      <input matInput placeholder="Label">
    </mat-form-field>
  `
})
class MatInputWithStaticLabel {}

@Component({
  template: `
    <mat-form-field [floatLabel]="shouldFloat">
      <input matInput placeholder="Label">
    </mat-form-field>`
})
class MatInputWithDynamicLabel {
  shouldFloat: string = 'always';
}

@Component({
  template: `
    <mat-form-field>
      <textarea matNativeControl [rows]="rows" [cols]="cols" [wrap]="wrap" placeholder="Snacks">
      </textarea>
    </mat-form-field>`
})
class MatInputTextareaWithBindings {
  rows: number = 4;
  cols: number = 8;
  wrap: string = 'hard';
}

@Component({
  template: `<mat-form-field><input></mat-form-field>`
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
  `
})
class MatInputWithFormErrorMessages {
  @ViewChild('form') form: NgForm;
  formControl = new FormControl('', Validators.required);
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
  `
})
class MatInputWithCustomErrorStateMatcher {
  formGroup = new FormGroup({
    name: new FormControl('', Validators.required)
  });

  errorState = false;

  customErrorStateMatcher = {
    isErrorState: () => this.errorState
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
  `
})
class MatInputWithFormGroupErrorMessages {
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;
  formGroup = new FormGroup({
    name: new FormControl('', Validators.required)
  });
}

@Component({
  template: `
    <mat-form-field>
      <div matPrefix>Prefix</div>
      <input matInput>
      <div matSuffix>Suffix</div>
    </mat-form-field>
  `
})
class MatInputWithPrefixAndSuffix {}

@Component({
  template: `
    <mat-form-field>
      <input matInput *ngIf="renderInput">
    </mat-form-field>
  `
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
  `
})
class MatInputOnPush {
  formControl = new FormControl('');
}

@Component({
  template: `
    <mat-form-field>
      <input matInput [readonly]="isReadonly" value="Only for reading">
    </mat-form-field>
  `
})
class MatInputWithReadonlyInput {
  isReadonly = true;
}

@Component({
  template: `
    <mat-form-field>
      <mat-label>Label</mat-label>
      <input matInput>
    </mat-form-field>
  `
})
class MatInputWithLabel {}

@Component({
  template: `
    <mat-form-field [floatLabel]="floatLabel">
      <mat-label>Label</mat-label>
      <input matInput placeholder="Placeholder">
    </mat-form-field>
  `
})
class MatInputWithLabelAndPlaceholder {
  floatLabel: FloatLabelType;
}

@Component({
  template: `
    <mat-form-field [appearance]="appearance" floatLabel="never">
      <input matInput placeholder="Placeholder">
    </mat-form-field>
  `
})
class MatInputWithAppearance {
  @ViewChild(MatFormField) formField: MatFormField;
  appearance: MatFormFieldAppearance;
}

@Component({
  template: `
    <mat-form-field [appearance]="appearance">
      <span matPrefix *ngIf="showPrefix">Somewhat long prefix</span>
      <mat-label>{{labelContent}}</mat-label>
      <input matInput>
    </mat-form-field>
  `
})
class MatInputWithAppearanceAndLabel {
  @ViewChild(MatFormField) formField: MatFormField;
  appearance: MatFormFieldAppearance;
  showPrefix: boolean;
  labelContent = 'Label';
}

@Component({
  template: `
    <mat-form-field>
      <input matInput>
    </mat-form-field>
  `
})
class MatInputWithoutPlaceholder {
}

@Component({
  template: `
    <mat-form-field appearance="outline" style="display: none;">
      <mat-label>Label</mat-label>
      <input matInput>
    </mat-form-field>
  `
})
class MatInputWithOutlineInsideInvisibleElement {}


// Styles to reset padding and border to make measurement comparisons easier.
const textareaStyleReset = `
    textarea {
      padding: 0;
      border: none;
      overflow: auto;
    }`;

@Component({
  template: `
    <mat-form-field style="width: 100px">
      <textarea matInput matTextareaAutosize [placeholder]="placeholder"></textarea>
    </mat-form-field>`,
  styles: [textareaStyleReset],
})
class AutosizeTextareaWithLongPlaceholder {
  placeholder = 'Long Long Long Long Long Long Long Long Placeholder';
  @ViewChild(MatTextareaAutosize) autosize: MatTextareaAutosize;
}

@Component({
  template: `
    <mat-tab-group>
      <mat-tab label="Tab 1">
        <mat-form-field>
          <textarea matInput matTextareaAutosize>
            Blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah
          </textarea>
        </mat-form-field>
      </mat-tab>
    </mat-tab-group>
  `
})
class AutosizeTextareaInATab {}

@Component({
  template: `
    <mat-horizontal-stepper>
      <mat-step label="Step 1">
        <mat-form-field>
          <textarea matInput matTextareaAautosize>
            Blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah
          </textarea>
        </mat-form-field>
      </mat-step>
    </mat-horizontal-stepper>
  `
})
class AutosizeTextareaInAStep {}

@Component({
  template: `
    <mat-form-field>
      <select matNativeControl id="test-id" [disabled]="disabled" [required]="required">
        <option value="volvo">Volvo</option>
        <option value="saab">Saab</option>
        <option value="mercedes">Mercedes</option>
        <option value="audi">Audi</option>
      </select>
    </mat-form-field>`
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
    </mat-form-field>`
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
    </mat-form-field>`
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
    </mat-form-field>`
})
class MatInputSelectWithInnerHtml {}

@Component({
  template: `
    <mat-form-field floatLabel="never">
      <input matInput customInputAccessor placeholder="Placeholder">
    </mat-form-field>`
})
class MatInputWithCustomAccessor {}

@Component({
  template: `
    <mat-form-field>
      <select matNativeControl>
      </select>
    </mat-form-field>`
})
class MatInputSelectWithoutOptions {}


/** Custom component that never has a value. Used for testing the `MAT_INPUT_VALUE_ACCESSOR`. */
@Directive({
  selector: 'input[customInputAccessor]',
  providers: [{
    provide: MAT_INPUT_VALUE_ACCESSOR,
    useExisting: CustomMatInputAccessor
  }]
})
class CustomMatInputAccessor {
  get value() { return this._value; }
  set value(_value: any) {}
  private _value = null;
}
