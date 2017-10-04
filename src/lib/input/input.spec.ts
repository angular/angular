import {Platform, PlatformModule} from '@angular/cdk/platform';
import {createFakeEvent, dispatchFakeEvent, wrappedErrorMessage} from '@angular/cdk/testing';
import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
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
  MAT_PLACEHOLDER_GLOBAL_OPTIONS,
  ShowOnDirtyErrorStateMatcher,
  ErrorStateMatcher,
} from '@angular/material/core';
import {
  getMatFormFieldDuplicatedHintError,
  getMatFormFieldMissingControlError,
  getMatFormFieldPlaceholderConflictError,
  MatFormField,
  MatFormFieldModule,
} from '@angular/material/form-field';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatInputModule} from './index';
import {MatInput} from './input';

describe('MatInput without forms', function () {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        PlatformModule,
        ReactiveFormsModule,
      ],
      declarations: [
        MatInputDateTestController,
        MatInputHintLabel2TestController,
        MatInputHintLabelTestController,
        MatInputInvalidHint2TestController,
        MatInputInvalidHintTestController,
        MatInputInvalidPlaceholderTestController,
        MatInputInvalidTypeTestController,
        MatInputMissingMatInputTestController,
        MatInputMultipleHintMixedTestController,
        MatInputMultipleHintTestController,
        MatInputNumberTestController,
        MatInputPasswordTestController,
        MatInputPlaceholderAttrTestComponent,
        MatInputPlaceholderElementTestComponent,
        MatInputPlaceholderRequiredTestComponent,
        MatInputTextTestController,
        MatInputWithDisabled,
        MatInputWithDynamicPlaceholder,
        MatInputWithId,
        MatInputWithPrefixAndSuffix,
        MatInputWithRequired,
        MatInputWithStaticPlaceholder,
        MatInputWithType,
        MatInputWithValueBinding,
        MatInputTextareaWithBindings,
        MatInputWithNgIf,
        MatInputOnPush,
        MatInputWithReadonlyInput,
      ],
    });

    TestBed.compileComponents();
  }));

  it('should default to floating placeholders', () => {
    let fixture = TestBed.createComponent(MatInputWithId);
    fixture.detectChanges();

    let formField = fixture.debugElement.query(By.directive(MatFormField))
        .componentInstance as MatFormField;
    expect(formField.floatPlaceholder).toBe('auto',
        'Expected MatInput to set floatingLabel to auto by default.');
  });

  it('should default to global floating placeholder type', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule
      ],
      declarations: [
        MatInputWithId
      ],
      providers: [{ provide: MAT_PLACEHOLDER_GLOBAL_OPTIONS, useValue: { float: 'always' } }]
    });

    let fixture = TestBed.createComponent(MatInputWithId);
    fixture.detectChanges();

    let formField = fixture.debugElement.query(By.directive(MatFormField))
        .componentInstance as MatFormField;
    expect(formField.floatPlaceholder).toBe('always',
        'Expected MatInput to set floatingLabel to always from global option.');
  });

  it('should not be treated as empty if type is date',
      inject([Platform], (platform: Platform) => {
        if (!(platform.TRIDENT || platform.FIREFOX || (platform.SAFARI && !platform.IOS))) {
          let fixture = TestBed.createComponent(MatInputDateTestController);
          fixture.detectChanges();

          let el = fixture.debugElement.query(By.css('label')).nativeElement;
          expect(el).not.toBeNull();
          expect(el.classList.contains('mat-form-field-empty')).toBe(false);
        }
      }));

  // Firefox, Safari Desktop and IE don't support type="date" and fallback to type="text".
  it('should be treated as empty if type is date on Firefox and IE',
      inject([Platform], (platform: Platform) => {
        if (platform.TRIDENT || platform.FIREFOX || (platform.SAFARI && !platform.IOS)) {
          let fixture = TestBed.createComponent(MatInputDateTestController);
          fixture.detectChanges();

          let el = fixture.debugElement.query(By.css('label')).nativeElement;
          expect(el).not.toBeNull();
          expect(el.classList.contains('mat-form-field-empty')).toBe(true);
        }
      }));

  it('should treat text input type as empty at init', () => {
    let fixture = TestBed.createComponent(MatInputTextTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('mat-form-field-empty')).toBe(true);
  });

  it('should treat password input type as empty at init', () => {
    let fixture = TestBed.createComponent(MatInputPasswordTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('mat-form-field-empty')).toBe(true);
  });

  it('should treat number input type as empty at init', () => {
    let fixture = TestBed.createComponent(MatInputNumberTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('mat-form-field-empty')).toBe(true);
  });

  it('should not be empty after input entered', async(() => {
    let fixture = TestBed.createComponent(MatInputTextTestController);
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

  it('should update the placeholder when input entered', async(() => {
    let fixture = TestBed.createComponent(MatInputWithStaticPlaceholder);
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

  it('should not be empty when the value set before view init', async(() => {
    let fixture = TestBed.createComponent(MatInputWithValueBinding);
    fixture.detectChanges();

    let placeholderEl =
        fixture.debugElement.query(By.css('.mat-form-field-placeholder')).nativeElement;

    expect(placeholderEl.classList).not.toContain('mat-form-field-empty');

    fixture.componentInstance.value = '';
    fixture.detectChanges();

    expect(placeholderEl.classList).toContain('mat-form-field-empty');
  }));

  it('should add id', () => {
    let fixture = TestBed.createComponent(MatInputTextTestController);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
        fixture.debugElement.query(By.css('label')).nativeElement;

    expect(inputElement.id).toBeTruthy();
    expect(inputElement.id).toEqual(labelElement.getAttribute('for'));
  });

  it('should add aria-owns to the label for the associated control', () => {
    let fixture = TestBed.createComponent(MatInputTextTestController);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
        fixture.debugElement.query(By.css('label')).nativeElement;

    expect(labelElement.getAttribute('aria-owns')).toBe(inputElement.id);
  });

  it('should not overwrite existing id', () => {
    let fixture = TestBed.createComponent(MatInputWithId);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
        fixture.debugElement.query(By.css('label')).nativeElement;

    expect(inputElement.id).toBe('test-id');
    expect(labelElement.getAttribute('for')).toBe('test-id');
  });

  it('validates there\'s only one hint label per side', () => {
    let fixture = TestBed.createComponent(MatInputInvalidHintTestController);

    expect(() => fixture.detectChanges()).toThrowError(
        wrappedErrorMessage(getMatFormFieldDuplicatedHintError('start')));
  });

  it('validates there\'s only one hint label per side (attribute)', () => {
    let fixture = TestBed.createComponent(MatInputInvalidHint2TestController);

    expect(() => fixture.detectChanges()).toThrowError(
        wrappedErrorMessage(getMatFormFieldDuplicatedHintError('start')));
  });

  it('validates there\'s only one placeholder', () => {
    let fixture = TestBed.createComponent(MatInputInvalidPlaceholderTestController);

    expect(() => fixture.detectChanges()).toThrowError(
        wrappedErrorMessage(getMatFormFieldPlaceholderConflictError()));
  });

  it('validates that matInput child is present', () => {
    let fixture = TestBed.createComponent(MatInputMissingMatInputTestController);

    expect(() => fixture.detectChanges()).toThrowError(
        wrappedErrorMessage(getMatFormFieldMissingControlError()));
  });

  it('validates that matInput child is present after initialization', async(() => {
    let fixture = TestBed.createComponent(MatInputWithNgIf);

    expect(() => fixture.detectChanges()).not.toThrowError(
        wrappedErrorMessage(getMatFormFieldMissingControlError()));

    fixture.componentInstance.renderInput = false;

    expect(() => fixture.detectChanges()).toThrowError(
        wrappedErrorMessage(getMatFormFieldMissingControlError()));
  }));

  it('validates the type', () => {
    let fixture = TestBed.createComponent(MatInputInvalidTypeTestController);

    // Technically this throws during the OnChanges detection phase,
    // so the error is really a ChangeDetectionError and it becomes
    // hard to build a full exception to compare with.
    // We just check for any exception in this case.
    expect(() => fixture.detectChanges()).toThrow(
        /* new MatInputUnsupportedTypeError('file') */);
  });

  it('supports hint labels attribute', () => {
    let fixture = TestBed.createComponent(MatInputHintLabelTestController);
    fixture.detectChanges();

    // If the hint label is empty, expect no label.
    expect(fixture.debugElement.query(By.css('.mat-hint'))).toBeNull();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.mat-hint'))).not.toBeNull();
  });

  it('sets an id on hint labels', () => {
    let fixture = TestBed.createComponent(MatInputHintLabelTestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('.mat-hint')).nativeElement;

    expect(hint.getAttribute('id')).toBeTruthy();
  });

  it('supports hint labels elements', () => {
    let fixture = TestBed.createComponent(MatInputHintLabel2TestController);
    fixture.detectChanges();

    // In this case, we should have an empty <mat-hint>.
    let el = fixture.debugElement.query(By.css('mat-hint')).nativeElement;
    expect(el.textContent).toBeFalsy();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('mat-hint')).nativeElement;
    expect(el.textContent).toBe('label');
  });

  it('sets an id on the hint element', () => {
    let fixture = TestBed.createComponent(MatInputHintLabel2TestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('mat-hint')).nativeElement;

    expect(hint.getAttribute('id')).toBeTruthy();
  });

  it('supports placeholder attribute', async(() => {
    let fixture = TestBed.createComponent(MatInputPlaceholderAttrTestComponent);
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

  it('supports placeholder element', async(() => {
    let fixture = TestBed.createComponent(MatInputPlaceholderElementTestComponent);
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

  it('supports placeholder required star', () => {
    let fixture = TestBed.createComponent(MatInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch(/hello\s+\*/g);
  });

  it('should hide the required star from screen readers', () => {
    let fixture = TestBed.createComponent(MatInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('.mat-form-field-required-marker')).nativeElement;

    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('hide placeholder required star when set to hide the required marker', () => {
    let fixture = TestBed.createComponent(MatInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch(/hello\s+\*/g);

    fixture.componentInstance.hideRequiredMarker = true;
    fixture.detectChanges();

    expect(el.nativeElement.textContent).toMatch(/hello/g);
  });

  it('supports the disabled attribute as binding', async(() => {
    const fixture = TestBed.createComponent(MatInputWithDisabled);
    fixture.detectChanges();

    const underlineEl =
        fixture.debugElement.query(By.css('.mat-form-field-underline')).nativeElement;
    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(underlineEl.classList.contains('mat-disabled'))
        .toBe(false, `Expected underline not to start out disabled.`);
    expect(inputEl.disabled).toBe(false);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    expect(underlineEl.classList.contains('mat-disabled'))
        .toBe(true, `Expected underline to look disabled after property is set.`);
    expect(inputEl.disabled).toBe(true);
  }));

  it('supports the required attribute as binding', async(() => {
    let fixture = TestBed.createComponent(MatInputWithRequired);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputEl.required).toBe(false);

    fixture.componentInstance.required = true;
    fixture.detectChanges();

    expect(inputEl.required).toBe(true);
  }));

  it('supports the type attribute as binding', async(() => {
    let fixture = TestBed.createComponent(MatInputWithType);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputEl.type).toBe('text');

    fixture.componentInstance.type = 'password';
    fixture.detectChanges();

    expect(inputEl.type).toBe('password');
  }));

  it('supports textarea', () => {
    let fixture = TestBed.createComponent(MatInputTextareaWithBindings);
    fixture.detectChanges();

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea).not.toBeNull();
  });

  it('sets the aria-describedby when a hintLabel is set', () => {
    let fixture = TestBed.createComponent(MatInputHintLabelTestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('.mat-hint')).nativeElement;
    let input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
  });

  it('sets the aria-describedby to the id of the mat-hint', () => {
    let fixture = TestBed.createComponent(MatInputHintLabel2TestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('.mat-hint')).nativeElement;
    let input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
  });

  it('sets the aria-describedby with multiple mat-hint instances', () => {
    let fixture = TestBed.createComponent(MatInputMultipleHintTestController);

    fixture.componentInstance.startId = 'start';
    fixture.componentInstance.endId = 'end';
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe('start end');
  });

  it('sets the aria-describedby when a hintLabel is set, in addition to a mat-hint', () => {
    let fixture = TestBed.createComponent(MatInputMultipleHintMixedTestController);

    fixture.detectChanges();

    let hintLabel = fixture.debugElement.query(By.css('.mat-hint:not(.mat-right)')).nativeElement;
    let endLabel = fixture.debugElement.query(By.css('.mat-hint.mat-right')).nativeElement;
    let input = fixture.debugElement.query(By.css('input')).nativeElement;
    let ariaValue = input.getAttribute('aria-describedby');

    expect(ariaValue).toBe(`${hintLabel.getAttribute('id')} ${endLabel.getAttribute('id')}`);
  });

  it('should float when floatPlaceholder is set to default and text is entered', () => {
    let fixture = TestBed.createComponent(MatInputWithDynamicPlaceholder);
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
  });

  it('should always float the placeholder when floatPlaceholder is set to true', () => {
    let fixture = TestBed.createComponent(MatInputWithDynamicPlaceholder);
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
  });


  it('should never float the placeholder when floatPlaceholder is set to false', () => {
    let fixture = TestBed.createComponent(MatInputWithDynamicPlaceholder);

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
  });

  it('should be able to toggle the floating placeholder programmatically', () => {
    const fixture = TestBed.createComponent(MatInputWithId);

    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.directive(MatFormField));
    const containerInstance = formField.componentInstance as MatFormField;
    const placeholder = formField.nativeElement.querySelector('.mat-form-field-placeholder');

    expect(containerInstance.floatPlaceholder).toBe('auto');
    expect(placeholder.classList)
        .toContain('mat-form-field-empty', 'Expected input to be considered empty.');

    containerInstance.floatPlaceholder = 'always';
    fixture.detectChanges();

    expect(placeholder.classList)
        .not.toContain('mat-form-field-empty', 'Expected input to be considered not empty.');
  });

  it('should not have prefix and suffix elements when none are specified', () => {
    let fixture = TestBed.createComponent(MatInputWithId);
    fixture.detectChanges();

    let prefixEl = fixture.debugElement.query(By.css('.mat-form-field-prefix'));
    let suffixEl = fixture.debugElement.query(By.css('.mat-form-field-suffix'));

    expect(prefixEl).toBeNull();
    expect(suffixEl).toBeNull();
  });

  it('should add prefix and suffix elements when specified', () => {
    let fixture = TestBed.createComponent(MatInputWithPrefixAndSuffix);
    fixture.detectChanges();

    let prefixEl = fixture.debugElement.query(By.css('.mat-form-field-prefix'));
    let suffixEl = fixture.debugElement.query(By.css('.mat-form-field-suffix'));

    expect(prefixEl).not.toBeNull();
    expect(suffixEl).not.toBeNull();
    expect(prefixEl.nativeElement.innerText.trim()).toEqual('Prefix');
    expect(suffixEl.nativeElement.innerText.trim()).toEqual('Suffix');
  });

  it('should update empty class when value changes programmatically and OnPush', () => {
    let fixture = TestBed.createComponent(MatInputOnPush);
    fixture.detectChanges();

    let component = fixture.componentInstance;
    let placeholder =
        fixture.debugElement.query(By.css('.mat-form-field-placeholder')).nativeElement;

    expect(placeholder.classList).toContain('mat-form-field-empty', 'Input initially empty');

    component.formControl.setValue('something');
    fixture.detectChanges();

    expect(placeholder.classList).not.toContain('mat-form-field-empty', 'Input no longer empty');
  });

  it('should set the focused class when the input is focused', () => {
    let fixture = TestBed.createComponent(MatInputTextTestController);
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.directive(MatInput))
      .injector.get<MatInput>(MatInput);
    let container = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;

    // Call the focus handler directly to avoid flakyness where
    // browsers don't focus elements if the window is minimized.
    input._focusChanged(true);
    fixture.detectChanges();

    expect(container.classList).toContain('mat-focused');
  });

  it('should be able to animate the placeholder up and lock it in position', () => {
    let fixture = TestBed.createComponent(MatInputTextTestController);
    fixture.detectChanges();

    let inputContainer = fixture.debugElement.query(By.directive(MatFormField))
        .componentInstance as MatFormField;
    let placeholder = fixture.debugElement.query(By.css('.mat-input-placeholder')).nativeElement;

    expect(inputContainer.floatPlaceholder).toBe('auto');

    inputContainer._animateAndLockPlaceholder();
    fixture.detectChanges();

    expect(inputContainer._shouldAlwaysFloat).toBe(false);
    expect(inputContainer.floatPlaceholder).toBe('always');

    const fakeEvent = Object.assign(createFakeEvent('transitionend'), {
      propertyName: 'transform'
    });

    placeholder.dispatchEvent(fakeEvent);
    fixture.detectChanges();

    expect(inputContainer._shouldAlwaysFloat).toBe(true);
    expect(inputContainer.floatPlaceholder).toBe('always');
  });

  it('should not highlight when focusing a readonly input', () => {
    let fixture = TestBed.createComponent(MatInputWithReadonlyInput);
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.directive(MatInput)).injector.get<MatInput>(MatInput);
    let container = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;

    // Call the focus handler directly to avoid flakyness where
    // browsers don't focus elements if the window is minimized.
    input._focusChanged(true);
    fixture.detectChanges();

    expect(input.focused).toBe(false);
    expect(container.classList).not.toContain('mat-focused');
  });
});

describe('MatInput with forms', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        PlatformModule,
        ReactiveFormsModule,
      ],
      declarations: [
        MatInputWithFormControl,
        MatInputWithFormErrorMessages,
        MatInputWithCustomErrorStateMatcher,
        MatInputWithFormGroupErrorMessages,
        MatInputZeroTestController,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('error messages', () => {
    let fixture: ComponentFixture<MatInputWithFormErrorMessages>;
    let testComponent: MatInputWithFormErrorMessages;
    let containerEl: HTMLElement;
    let inputEl: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(MatInputWithFormErrorMessages);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      containerEl = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;
      inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    it('should not show any errors if the user has not interacted', () => {
      expect(testComponent.formControl.untouched).toBe(true, 'Expected untouched form control');
      expect(containerEl.querySelectorAll('mat-error').length).toBe(0, 'Expected no error message');
      expect(inputEl.getAttribute('aria-invalid'))
        .toBe('false', 'Expected aria-invalid to be set to "false".');
    });

    it('should display an error message when the input is touched and invalid', async(() => {
      expect(testComponent.formControl.invalid).toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('mat-error').length).toBe(0, 'Expected no error message');

      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(containerEl.classList)
          .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
        expect(containerEl.querySelectorAll('mat-error').length)
          .toBe(1, 'Expected one error message to have been rendered.');
        expect(inputEl.getAttribute('aria-invalid'))
          .toBe('true', 'Expected aria-invalid to be set to "true".');
      });
    }));

    it('should display an error message when the parent form is submitted', async(() => {
      expect(testComponent.form.submitted).toBe(false, 'Expected form not to have been submitted');
      expect(testComponent.formControl.invalid).toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('mat-error').length).toBe(0, 'Expected no error message');

      dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(testComponent.form.submitted).toBe(true, 'Expected form to have been submitted');
        expect(containerEl.classList)
          .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
        expect(containerEl.querySelectorAll('mat-error').length)
          .toBe(1, 'Expected one error message to have been rendered.');
        expect(inputEl.getAttribute('aria-invalid'))
          .toBe('true', 'Expected aria-invalid to be set to "true".');
      });
    }));

    it('should display an error message when the parent form group is submitted', async(() => {
      fixture.destroy();

      let groupFixture = TestBed.createComponent(MatInputWithFormGroupErrorMessages);
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

      groupFixture.whenStable().then(() => {
        expect(component.formGroupDirective.submitted)
          .toBe(true, 'Expected form to have been submitted');
        expect(containerEl.classList)
          .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
        expect(containerEl.querySelectorAll('mat-error').length)
          .toBe(1, 'Expected one error message to have been rendered.');
        expect(inputEl.getAttribute('aria-invalid'))
          .toBe('true', 'Expected aria-invalid to be set to "true".');
      });
    }));

    it('should hide the errors and show the hints once the input becomes valid', async(() => {
      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(containerEl.classList)
          .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
        expect(containerEl.querySelectorAll('mat-error').length)
          .toBe(1, 'Expected one error message to have been rendered.');
        expect(containerEl.querySelectorAll('mat-hint').length)
          .toBe(0, 'Expected no hints to be shown.');

        testComponent.formControl.setValue('something');
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(containerEl.classList).not.toContain('mat-form-field-invalid',
            'Expected container not to have the invalid class when valid.');
          expect(containerEl.querySelectorAll('mat-error').length)
            .toBe(0, 'Expected no error messages when the input is valid.');
          expect(containerEl.querySelectorAll('mat-hint').length)
            .toBe(1, 'Expected one hint to be shown once the input is valid.');
        });
      });
    }));

    it('should not hide the hint if there are no error messages', async(() => {
      testComponent.renderError = false;
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('mat-hint').length)
        .toBe(1, 'Expected one hint to be shown on load.');

      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(containerEl.querySelectorAll('mat-hint').length)
          .toBe(1, 'Expected one hint to still be shown.');
      });
    }));

    it('should set the proper role on the error messages', () => {
      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelector('mat-error')!.getAttribute('role')).toBe('alert');
    });

    it('sets the aria-describedby to reference errors when in error state', () => {
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
    });
  });

  describe('custom error behavior', () => {

    it('should display an error message when a custom error matcher returns true', () => {
      let fixture = TestBed.createComponent(MatInputWithCustomErrorStateMatcher);
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
    });

    it('should display an error message when global error matcher returns true', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          FormsModule,
          MatFormFieldModule,
          MatInputModule,
          NoopAnimationsModule,
          ReactiveFormsModule,
        ],
        declarations: [
          MatInputWithFormErrorMessages
        ],
        providers: [{provide: ErrorStateMatcher, useValue: {isErrorState: () => true}}]
      });

      let fixture = TestBed.createComponent(MatInputWithFormErrorMessages);

      fixture.detectChanges();

      let containerEl = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;
      let testComponent = fixture.componentInstance;

      // Expect the control to still be untouched but the error to show due to the global setting
      expect(testComponent.formControl.untouched).toBe(true, 'Expected untouched form control');
      expect(containerEl.querySelectorAll('mat-error').length).toBe(1, 'Expected an error message');
    });

    it('should display an error message when using ShowOnDirtyErrorStateMatcher', async(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          FormsModule,
          MatFormFieldModule,
          MatInputModule,
          NoopAnimationsModule,
          ReactiveFormsModule,
        ],
        declarations: [
          MatInputWithFormErrorMessages
        ],
        providers: [{provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}]
      });

      let fixture = TestBed.createComponent(MatInputWithFormErrorMessages);
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

  it('should update the value when using FormControl.setValue', () => {
    let fixture = TestBed.createComponent(MatInputWithFormControl);
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.directive(MatInput))
      .injector.get<MatInput>(MatInput);

    expect(input.value).toBeFalsy();

    fixture.componentInstance.formControl.setValue('something');

    expect(input.value).toBe('something');
  });

  it('should display disabled styles when using FormControl.disable()', () => {
    const fixture = TestBed.createComponent(MatInputWithFormControl);
    fixture.detectChanges();

    const underlineEl =
        fixture.debugElement.query(By.css('.mat-form-field-underline')).nativeElement;
    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(underlineEl.classList)
      .not.toContain('mat-disabled', `Expected underline not to start out disabled.`);
    expect(inputEl.disabled).toBe(false);

    fixture.componentInstance.formControl.disable();
    fixture.detectChanges();

    expect(underlineEl.classList).toContain('mat-disabled',
      `Expected underline to look disabled after disable() is called.`);
    expect(inputEl.disabled).toBe(true);
  });

  it('should not treat the number 0 as empty', async(() => {
    let fixture = TestBed.createComponent(MatInputZeroTestController);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();

      let el = fixture.debugElement.query(By.css('label')).nativeElement;
      expect(el).not.toBeNull();
      expect(el.classList.contains('mat-form-field-empty')).toBe(false);
    });
  }));
});

@Component({
  template: `
    <mat-form-field>
      <input matInput id="test-id" placeholder="test">
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
                <input matInput required placeholder="hello">
             </mat-form-field>`
})
class MatInputPlaceholderRequiredTestComponent {
  hideRequiredMarker: boolean;
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
  template: `<mat-form-field><input matInput [formControl]="formControl"></mat-form-field>`
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
    <mat-form-field floatPlaceholder="never">
      <input matInput placeholder="Label">
    </mat-form-field>
  `
})
class MatInputWithStaticPlaceholder {}

@Component({
  template: `
    <mat-form-field [floatPlaceholder]="shouldFloat">
      <input matInput placeholder="Label">
    </mat-form-field>`
})
class MatInputWithDynamicPlaceholder {
  shouldFloat: string = 'always';
}

@Component({
  template: `
    <mat-form-field>
      <textarea matInput [rows]="rows" [cols]="cols" [wrap]="wrap" placeholder="Snacks"></textarea>
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
      <input matInput readonly value="Only for reading">
    </mat-form-field>
  `
})
class MatInputWithReadonlyInput {}
