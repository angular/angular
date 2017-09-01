import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {Component, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MdInputModule} from './index';
import {MdInput} from './input';
import {Platform} from '../core/platform/platform';
import {PlatformModule} from '../core/platform/index';
import {wrappedErrorMessage, dispatchFakeEvent, createFakeEvent} from '@angular/cdk/testing';
import {
  MdFormField,
  MdFormFieldModule,
  getMdFormFieldDuplicatedHintError,
  getMdFormFieldMissingControlError,
  getMdFormFieldPlaceholderConflictError,
} from '../form-field/index';
import {MD_PLACEHOLDER_GLOBAL_OPTIONS} from '../core/placeholder/placeholder-options';
import {MD_ERROR_GLOBAL_OPTIONS, showOnDirtyErrorStateMatcher} from '../core/error/error-options';

describe('MdInput without forms', function () {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MdFormFieldModule,
        MdInputModule,
        NoopAnimationsModule,
        PlatformModule,
        ReactiveFormsModule,
      ],
      declarations: [
        MdInputDateTestController,
        MdInputHintLabel2TestController,
        MdInputHintLabelTestController,
        MdInputInvalidHint2TestController,
        MdInputInvalidHintTestController,
        MdInputInvalidPlaceholderTestController,
        MdInputInvalidTypeTestController,
        MdInputMissingMdInputTestController,
        MdInputMultipleHintMixedTestController,
        MdInputMultipleHintTestController,
        MdInputNumberTestController,
        MdInputPasswordTestController,
        MdInputPlaceholderAttrTestComponent,
        MdInputPlaceholderElementTestComponent,
        MdInputPlaceholderRequiredTestComponent,
        MdInputTextTestController,
        MdInputWithDisabled,
        MdInputWithDynamicPlaceholder,
        MdInputWithId,
        MdInputWithPrefixAndSuffix,
        MdInputWithRequired,
        MdInputWithStaticPlaceholder,
        MdInputWithType,
        MdInputWithValueBinding,
        MdInputTextareaWithBindings,
        MdInputWithNgIf,
        MdInputOnPush,
        MdInputWithReadonlyInput,
      ],
    });

    TestBed.compileComponents();
  }));

  it('should default to floating placeholders', () => {
    let fixture = TestBed.createComponent(MdInputWithId);
    fixture.detectChanges();

    let formField = fixture.debugElement.query(By.directive(MdFormField))
        .componentInstance as MdFormField;
    expect(formField.floatPlaceholder).toBe('auto',
        'Expected MdInput to set floatingLabel to auto by default.');
  });

  it('should default to global floating placeholder type', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MdFormFieldModule,
        MdInputModule,
        NoopAnimationsModule
      ],
      declarations: [
        MdInputWithId
      ],
      providers: [{ provide: MD_PLACEHOLDER_GLOBAL_OPTIONS, useValue: { float: 'always' } }]
    });

    let fixture = TestBed.createComponent(MdInputWithId);
    fixture.detectChanges();

    let formField = fixture.debugElement.query(By.directive(MdFormField))
        .componentInstance as MdFormField;
    expect(formField.floatPlaceholder).toBe('always',
        'Expected MdInput to set floatingLabel to always from global option.');
  });

  it('should not be treated as empty if type is date',
      inject([Platform], (platform: Platform) => {
        if (!(platform.TRIDENT || platform.FIREFOX || (platform.SAFARI && !platform.IOS))) {
          let fixture = TestBed.createComponent(MdInputDateTestController);
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
          let fixture = TestBed.createComponent(MdInputDateTestController);
          fixture.detectChanges();

          let el = fixture.debugElement.query(By.css('label')).nativeElement;
          expect(el).not.toBeNull();
          expect(el.classList.contains('mat-form-field-empty')).toBe(true);
        }
      }));

  it('should treat text input type as empty at init', () => {
    let fixture = TestBed.createComponent(MdInputTextTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('mat-form-field-empty')).toBe(true);
  });

  it('should treat password input type as empty at init', () => {
    let fixture = TestBed.createComponent(MdInputPasswordTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('mat-form-field-empty')).toBe(true);
  });

  it('should treat number input type as empty at init', () => {
    let fixture = TestBed.createComponent(MdInputNumberTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('mat-form-field-empty')).toBe(true);
  });

  it('should not be empty after input entered', async(() => {
    let fixture = TestBed.createComponent(MdInputTextTestController);
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
    let fixture = TestBed.createComponent(MdInputWithStaticPlaceholder);
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
    let fixture = TestBed.createComponent(MdInputWithValueBinding);
    fixture.detectChanges();

    let placeholderEl =
        fixture.debugElement.query(By.css('.mat-form-field-placeholder')).nativeElement;

    expect(placeholderEl.classList).not.toContain('mat-form-field-empty');

    fixture.componentInstance.value = '';
    fixture.detectChanges();

    expect(placeholderEl.classList).toContain('mat-form-field-empty');
  }));

  it('should add id', () => {
    let fixture = TestBed.createComponent(MdInputTextTestController);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
        fixture.debugElement.query(By.css('label')).nativeElement;

    expect(inputElement.id).toBeTruthy();
    expect(inputElement.id).toEqual(labelElement.getAttribute('for'));
  });

  it('should add aria-owns to the label for the associated control', () => {
    let fixture = TestBed.createComponent(MdInputTextTestController);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
        fixture.debugElement.query(By.css('label')).nativeElement;

    expect(labelElement.getAttribute('aria-owns')).toBe(inputElement.id);
  });

  it('should not overwrite existing id', () => {
    let fixture = TestBed.createComponent(MdInputWithId);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
        fixture.debugElement.query(By.css('label')).nativeElement;

    expect(inputElement.id).toBe('test-id');
    expect(labelElement.getAttribute('for')).toBe('test-id');
  });

  it('validates there\'s only one hint label per side', () => {
    let fixture = TestBed.createComponent(MdInputInvalidHintTestController);

    expect(() => fixture.detectChanges()).toThrowError(
        wrappedErrorMessage(getMdFormFieldDuplicatedHintError('start')));
  });

  it('validates there\'s only one hint label per side (attribute)', () => {
    let fixture = TestBed.createComponent(MdInputInvalidHint2TestController);

    expect(() => fixture.detectChanges()).toThrowError(
        wrappedErrorMessage(getMdFormFieldDuplicatedHintError('start')));
  });

  it('validates there\'s only one placeholder', () => {
    let fixture = TestBed.createComponent(MdInputInvalidPlaceholderTestController);

    expect(() => fixture.detectChanges()).toThrowError(
        wrappedErrorMessage(getMdFormFieldPlaceholderConflictError()));
  });

  it('validates that mdInput child is present', () => {
    let fixture = TestBed.createComponent(MdInputMissingMdInputTestController);

    expect(() => fixture.detectChanges()).toThrowError(
        wrappedErrorMessage(getMdFormFieldMissingControlError()));
  });

  it('validates that mdInput child is present after initialization', async(() => {
    let fixture = TestBed.createComponent(MdInputWithNgIf);

    expect(() => fixture.detectChanges()).not.toThrowError(
        wrappedErrorMessage(getMdFormFieldMissingControlError()));

    fixture.componentInstance.renderInput = false;

    expect(() => fixture.detectChanges()).toThrowError(
        wrappedErrorMessage(getMdFormFieldMissingControlError()));
  }));

  it('validates the type', () => {
    let fixture = TestBed.createComponent(MdInputInvalidTypeTestController);

    // Technically this throws during the OnChanges detection phase,
    // so the error is really a ChangeDetectionError and it becomes
    // hard to build a full exception to compare with.
    // We just check for any exception in this case.
    expect(() => fixture.detectChanges()).toThrow(
        /* new MdInputUnsupportedTypeError('file') */);
  });

  it('supports hint labels attribute', () => {
    let fixture = TestBed.createComponent(MdInputHintLabelTestController);
    fixture.detectChanges();

    // If the hint label is empty, expect no label.
    expect(fixture.debugElement.query(By.css('.mat-hint'))).toBeNull();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.mat-hint'))).not.toBeNull();
  });

  it('sets an id on hint labels', () => {
    let fixture = TestBed.createComponent(MdInputHintLabelTestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('.mat-hint')).nativeElement;

    expect(hint.getAttribute('id')).toBeTruthy();
  });

  it('supports hint labels elements', () => {
    let fixture = TestBed.createComponent(MdInputHintLabel2TestController);
    fixture.detectChanges();

    // In this case, we should have an empty <md-hint>.
    let el = fixture.debugElement.query(By.css('md-hint')).nativeElement;
    expect(el.textContent).toBeFalsy();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('md-hint')).nativeElement;
    expect(el.textContent).toBe('label');
  });

  it('sets an id on the hint element', () => {
    let fixture = TestBed.createComponent(MdInputHintLabel2TestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('md-hint')).nativeElement;

    expect(hint.getAttribute('id')).toBeTruthy();
  });

  it('supports placeholder attribute', async(() => {
    let fixture = TestBed.createComponent(MdInputPlaceholderAttrTestComponent);
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
    let fixture = TestBed.createComponent(MdInputPlaceholderElementTestComponent);
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
    let fixture = TestBed.createComponent(MdInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch(/hello\s+\*/g);
  });

  it('should hide the required star from screen readers', () => {
    let fixture = TestBed.createComponent(MdInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('.mat-form-field-required-marker')).nativeElement;

    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('hide placeholder required star when set to hide the required marker', () => {
    let fixture = TestBed.createComponent(MdInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch(/hello\s+\*/g);

    fixture.componentInstance.hideRequiredMarker = true;
    fixture.detectChanges();

    expect(el.nativeElement.textContent).toMatch(/hello/g);
  });

  it('supports the disabled attribute as binding', async(() => {
    const fixture = TestBed.createComponent(MdInputWithDisabled);
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
    let fixture = TestBed.createComponent(MdInputWithRequired);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputEl.required).toBe(false);

    fixture.componentInstance.required = true;
    fixture.detectChanges();

    expect(inputEl.required).toBe(true);
  }));

  it('supports the type attribute as binding', async(() => {
    let fixture = TestBed.createComponent(MdInputWithType);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputEl.type).toBe('text');

    fixture.componentInstance.type = 'password';
    fixture.detectChanges();

    expect(inputEl.type).toBe('password');
  }));

  it('supports textarea', () => {
    let fixture = TestBed.createComponent(MdInputTextareaWithBindings);
    fixture.detectChanges();

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea).not.toBeNull();
  });

  it('sets the aria-describedby when a hintLabel is set', () => {
    let fixture = TestBed.createComponent(MdInputHintLabelTestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('.mat-hint')).nativeElement;
    let input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
  });

  it('sets the aria-describedby to the id of the md-hint', () => {
    let fixture = TestBed.createComponent(MdInputHintLabel2TestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('.mat-hint')).nativeElement;
    let input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
  });

  it('sets the aria-describedby with multiple md-hint instances', () => {
    let fixture = TestBed.createComponent(MdInputMultipleHintTestController);

    fixture.componentInstance.startId = 'start';
    fixture.componentInstance.endId = 'end';
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe('start end');
  });

  it('sets the aria-describedby when a hintLabel is set, in addition to a md-hint', () => {
    let fixture = TestBed.createComponent(MdInputMultipleHintMixedTestController);

    fixture.detectChanges();

    let hintLabel = fixture.debugElement.query(By.css('.mat-hint:not(.mat-right)')).nativeElement;
    let endLabel = fixture.debugElement.query(By.css('.mat-hint.mat-right')).nativeElement;
    let input = fixture.debugElement.query(By.css('input')).nativeElement;
    let ariaValue = input.getAttribute('aria-describedby');

    expect(ariaValue).toBe(`${hintLabel.getAttribute('id')} ${endLabel.getAttribute('id')}`);
  });

  it('should float when floatPlaceholder is set to default and text is entered', () => {
    let fixture = TestBed.createComponent(MdInputWithDynamicPlaceholder);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    let labelEl = fixture.debugElement.query(By.css('label')).nativeElement;

    expect(labelEl.classList).not.toContain('mat-form-field-empty');
    expect(labelEl.classList).toContain('mat-form-field-float');

    fixture.componentInstance.shouldFloat = 'auto';
    fixture.detectChanges();

    expect(labelEl.classList).toContain('mat-form-field-empty');
    expect(labelEl.classList).toContain('mat-form-field-float');

    // Update the value of the input.
    inputEl.value = 'Text';

    // Fake behavior of the `(input)` event which should trigger a change detection.
    fixture.detectChanges();

    expect(labelEl.classList).not.toContain('mat-form-field-empty');
    expect(labelEl.classList).toContain('mat-form-field-float');
  });

  it('should always float the placeholder when floatPlaceholder is set to true', () => {
    let fixture = TestBed.createComponent(MdInputWithDynamicPlaceholder);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    let labelEl = fixture.debugElement.query(By.css('label')).nativeElement;

    expect(labelEl.classList).not.toContain('mat-form-field-empty');
    expect(labelEl.classList).toContain('mat-form-field-float');

    fixture.detectChanges();

    // Update the value of the input.
    inputEl.value = 'Text';

    // Fake behavior of the `(input)` event which should trigger a change detection.
    fixture.detectChanges();

    expect(labelEl.classList).not.toContain('mat-form-field-empty');
    expect(labelEl.classList).toContain('mat-form-field-float');
  });


  it('should never float the placeholder when floatPlaceholder is set to false', () => {
    let fixture = TestBed.createComponent(MdInputWithDynamicPlaceholder);

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
    const fixture = TestBed.createComponent(MdInputWithId);

    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.directive(MdFormField));
    const containerInstance = formField.componentInstance as MdFormField;
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
    let fixture = TestBed.createComponent(MdInputWithId);
    fixture.detectChanges();

    let prefixEl = fixture.debugElement.query(By.css('.mat-form-field-prefix'));
    let suffixEl = fixture.debugElement.query(By.css('.mat-form-field-suffix'));

    expect(prefixEl).toBeNull();
    expect(suffixEl).toBeNull();
  });

  it('should add prefix and suffix elements when specified', () => {
    let fixture = TestBed.createComponent(MdInputWithPrefixAndSuffix);
    fixture.detectChanges();

    let prefixEl = fixture.debugElement.query(By.css('.mat-form-field-prefix'));
    let suffixEl = fixture.debugElement.query(By.css('.mat-form-field-suffix'));

    expect(prefixEl).not.toBeNull();
    expect(suffixEl).not.toBeNull();
    expect(prefixEl.nativeElement.innerText.trim()).toEqual('Prefix');
    expect(suffixEl.nativeElement.innerText.trim()).toEqual('Suffix');
  });

  it('should update empty class when value changes programmatically and OnPush', () => {
    let fixture = TestBed.createComponent(MdInputOnPush);
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
    let fixture = TestBed.createComponent(MdInputTextTestController);
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.directive(MdInput))
      .injector.get<MdInput>(MdInput);
    let container = fixture.debugElement.query(By.css('md-form-field')).nativeElement;

    // Call the focus handler directly to avoid flakyness where
    // browsers don't focus elements if the window is minimized.
    input._focusChanged(true);
    fixture.detectChanges();

    expect(container.classList).toContain('mat-focused');
  });

  it('should be able to animate the placeholder up and lock it in position', () => {
    let fixture = TestBed.createComponent(MdInputTextTestController);
    fixture.detectChanges();

    let inputContainer = fixture.debugElement.query(By.directive(MdFormField))
        .componentInstance as MdFormField;
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
});

describe('MdInput with forms', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MdFormFieldModule,
        MdInputModule,
        NoopAnimationsModule,
        PlatformModule,
        ReactiveFormsModule,
      ],
      declarations: [
        MdInputWithFormControl,
        MdInputWithFormErrorMessages,
        MdInputWithCustomErrorStateMatcher,
        MdInputWithFormGroupErrorMessages,
        MdInputZeroTestController,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('error messages', () => {
    let fixture: ComponentFixture<MdInputWithFormErrorMessages>;
    let testComponent: MdInputWithFormErrorMessages;
    let containerEl: HTMLElement;
    let inputEl: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(MdInputWithFormErrorMessages);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      containerEl = fixture.debugElement.query(By.css('md-form-field')).nativeElement;
      inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    it('should not show any errors if the user has not interacted', () => {
      expect(testComponent.formControl.untouched).toBe(true, 'Expected untouched form control');
      expect(containerEl.querySelectorAll('md-error').length).toBe(0, 'Expected no error messages');
      expect(inputEl.getAttribute('aria-invalid'))
        .toBe('false', 'Expected aria-invalid to be set to "false".');
    });

    it('should display an error message when the input is touched and invalid', async(() => {
      expect(testComponent.formControl.invalid).toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('md-error').length).toBe(0, 'Expected no error messages');

      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(containerEl.classList)
          .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
        expect(containerEl.querySelectorAll('md-error').length)
          .toBe(1, 'Expected one error message to have been rendered.');
        expect(inputEl.getAttribute('aria-invalid'))
          .toBe('true', 'Expected aria-invalid to be set to "true".');
      });
    }));

    it('should display an error message when the parent form is submitted', async(() => {
      expect(testComponent.form.submitted).toBe(false, 'Expected form not to have been submitted');
      expect(testComponent.formControl.invalid).toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('md-error').length).toBe(0, 'Expected no error messages');

      dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(testComponent.form.submitted).toBe(true, 'Expected form to have been submitted');
        expect(containerEl.classList)
          .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
        expect(containerEl.querySelectorAll('md-error').length)
          .toBe(1, 'Expected one error message to have been rendered.');
        expect(inputEl.getAttribute('aria-invalid'))
          .toBe('true', 'Expected aria-invalid to be set to "true".');
      });
    }));

    it('should display an error message when the parent form group is submitted', async(() => {
      fixture.destroy();

      let groupFixture = TestBed.createComponent(MdInputWithFormGroupErrorMessages);
      let component: MdInputWithFormGroupErrorMessages;

      groupFixture.detectChanges();
      component = groupFixture.componentInstance;
      containerEl = groupFixture.debugElement.query(By.css('md-form-field')).nativeElement;
      inputEl = groupFixture.debugElement.query(By.css('input')).nativeElement;

      expect(component.formGroup.invalid).toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('md-error').length).toBe(0, 'Expected no error messages');
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
        expect(containerEl.querySelectorAll('md-error').length)
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
        expect(containerEl.querySelectorAll('md-error').length)
          .toBe(1, 'Expected one error message to have been rendered.');
        expect(containerEl.querySelectorAll('md-hint').length)
          .toBe(0, 'Expected no hints to be shown.');

        testComponent.formControl.setValue('something');
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(containerEl.classList).not.toContain('mat-form-field-invalid',
            'Expected container not to have the invalid class when valid.');
          expect(containerEl.querySelectorAll('md-error').length)
            .toBe(0, 'Expected no error messages when the input is valid.');
          expect(containerEl.querySelectorAll('md-hint').length)
            .toBe(1, 'Expected one hint to be shown once the input is valid.');
        });
      });
    }));

    it('should not hide the hint if there are no error messages', async(() => {
      testComponent.renderError = false;
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('md-hint').length)
        .toBe(1, 'Expected one hint to be shown on load.');

      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(containerEl.querySelectorAll('md-hint').length)
          .toBe(1, 'Expected one hint to still be shown.');
      });
    }));

    it('should set the proper role on the error messages', () => {
      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelector('md-error')!.getAttribute('role')).toBe('alert');
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
      let fixture = TestBed.createComponent(MdInputWithCustomErrorStateMatcher);
      fixture.detectChanges();

      let component = fixture.componentInstance;
      let containerEl = fixture.debugElement.query(By.css('md-form-field')).nativeElement;

      const control = component.formGroup.get('name')!;

      expect(control.invalid).toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('md-error').length)
        .toBe(0, 'Expected no error messages');

      control.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('md-error').length)
        .toBe(0, 'Expected no error messages after being touched.');

      component.errorState = true;
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('md-error').length)
        .toBe(1, 'Expected one error messages to have been rendered.');
    });

    it('should display an error message when global error matcher returns true', () => {

      // Global error state matcher that will always cause errors to show
      function globalErrorStateMatcher() {
        return true;
      }

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          FormsModule,
          MdFormFieldModule,
          MdInputModule,
          NoopAnimationsModule,
          ReactiveFormsModule,
        ],
        declarations: [
          MdInputWithFormErrorMessages
        ],
        providers: [
          {
            provide: MD_ERROR_GLOBAL_OPTIONS,
            useValue: { errorStateMatcher: globalErrorStateMatcher } }
        ]
      });

      let fixture = TestBed.createComponent(MdInputWithFormErrorMessages);

      fixture.detectChanges();

      let containerEl = fixture.debugElement.query(By.css('md-form-field')).nativeElement;
      let testComponent = fixture.componentInstance;

      // Expect the control to still be untouched but the error to show due to the global setting
      expect(testComponent.formControl.untouched).toBe(true, 'Expected untouched form control');
      expect(containerEl.querySelectorAll('md-error').length).toBe(1, 'Expected an error message');
    });

    it('should display an error message when using showOnDirtyErrorStateMatcher', async(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          FormsModule,
          MdFormFieldModule,
          MdInputModule,
          NoopAnimationsModule,
          ReactiveFormsModule,
        ],
        declarations: [
          MdInputWithFormErrorMessages
        ],
        providers: [
          {
            provide: MD_ERROR_GLOBAL_OPTIONS,
            useValue: { errorStateMatcher: showOnDirtyErrorStateMatcher }
          }
        ]
      });

      let fixture = TestBed.createComponent(MdInputWithFormErrorMessages);
      fixture.detectChanges();

      let containerEl = fixture.debugElement.query(By.css('md-form-field')).nativeElement;
      let testComponent = fixture.componentInstance;

      expect(testComponent.formControl.invalid).toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('md-error').length).toBe(0, 'Expected no error messages');

      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('md-error').length)
        .toBe(0, 'Expected no error messages when touched');

      testComponent.formControl.markAsDirty();
      fixture.detectChanges();

      expect(containerEl.querySelectorAll('md-error').length)
        .toBe(1, 'Expected one error message when dirty');
    }));
  });

  it('should update the value when using FormControl.setValue', () => {
    let fixture = TestBed.createComponent(MdInputWithFormControl);
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.directive(MdInput))
      .injector.get<MdInput>(MdInput);

    expect(input.value).toBeFalsy();

    fixture.componentInstance.formControl.setValue('something');

    expect(input.value).toBe('something');
  });

  it('should display disabled styles when using FormControl.disable()', () => {
    const fixture = TestBed.createComponent(MdInputWithFormControl);
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
    let fixture = TestBed.createComponent(MdInputZeroTestController);
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
    <md-form-field>
      <input mdInput id="test-id" placeholder="test">
    </md-form-field>`
})
class MdInputWithId {}

@Component({
  template: `<md-form-field><input mdInput [disabled]="disabled"></md-form-field>`
})
class MdInputWithDisabled {
  disabled: boolean;
}

@Component({
  template: `<md-form-field><input mdInput [required]="required"></md-form-field>`
})
class MdInputWithRequired {
  required: boolean;
}

@Component({
  template: `<md-form-field><input mdInput [type]="type"></md-form-field>`
})
class MdInputWithType {
  type: string;
}

@Component({
  template: `<md-form-field [hideRequiredMarker]="hideRequiredMarker">
                <input mdInput required placeholder="hello">
             </md-form-field>`
})
class MdInputPlaceholderRequiredTestComponent {
  hideRequiredMarker: boolean;
}

@Component({
  template: `
    <md-form-field>
      <input mdInput>
      <md-placeholder>{{placeholder}}</md-placeholder>
    </md-form-field>`
})
class MdInputPlaceholderElementTestComponent {
  placeholder: string = 'Default Placeholder';
}

@Component({
  template: `<md-form-field><input mdInput [formControl]="formControl"></md-form-field>`
})
class MdInputWithFormControl {
  formControl = new FormControl();
}

@Component({
  template: `<md-form-field><input mdInput [placeholder]="placeholder"></md-form-field>`
})
class MdInputPlaceholderAttrTestComponent {
  placeholder: string = '';
}

@Component({
  template: `<md-form-field><input mdInput><md-hint>{{label}}</md-hint></md-form-field>`
})
class MdInputHintLabel2TestController {
  label: string = '';
}

@Component({
  template: `<md-form-field [hintLabel]="label"><input mdInput></md-form-field>`
})
class MdInputHintLabelTestController {
  label: string = '';
}

@Component({
  template: `<md-form-field><input mdInput type="file"></md-form-field>`
})
class MdInputInvalidTypeTestController {}

@Component({
  template: `
    <md-form-field>
      <input mdInput placeholder="Hello">
      <md-placeholder>World</md-placeholder>
    </md-form-field>`
})
class MdInputInvalidPlaceholderTestController {}

@Component({
  template: `
    <md-form-field hintLabel="Hello">
      <input mdInput>
      <md-hint>World</md-hint>
    </md-form-field>`
})
class MdInputInvalidHint2TestController {}

@Component({
  template: `
    <md-form-field>
      <input mdInput>
      <md-hint>Hello</md-hint>
      <md-hint>World</md-hint>
    </md-form-field>`
})
class MdInputInvalidHintTestController {}

@Component({
  template: `
    <md-form-field>
      <input mdInput>
      <md-hint align="start" [id]="startId">Hello</md-hint>
      <md-hint align="end" [id]="endId">World</md-hint>
    </md-form-field>`
})
class MdInputMultipleHintTestController {
  startId: string;
  endId: string;
}

@Component({
  template: `
    <md-form-field hintLabel="Hello">
      <input mdInput>
      <md-hint align="end">World</md-hint>
    </md-form-field>`
})
class MdInputMultipleHintMixedTestController {}

@Component({
  template: `
    <md-form-field>
      <input mdInput type="date" placeholder="Placeholder">
    </md-form-field>`
})
class MdInputDateTestController {}

@Component({
  template: `
    <md-form-field>
      <input mdInput type="text" placeholder="Placeholder">
    </md-form-field>`
})
class MdInputTextTestController {}

@Component({
  template: `
    <md-form-field>
      <input mdInput type="password" placeholder="Placeholder">
    </md-form-field>`
})
class MdInputPasswordTestController {}

@Component({
  template: `
    <md-form-field>
      <input mdInput type="number" placeholder="Placeholder">
    </md-form-field>`
})
class MdInputNumberTestController {}

@Component({
  template: `
    <md-form-field>
      <input mdInput type="number" placeholder="Placeholder" [(ngModel)]="value">
    </md-form-field>`
})
class MdInputZeroTestController {
  value = 0;
}

@Component({
  template: `
    <md-form-field>
      <input mdInput placeholder="Label" [value]="value">
    </md-form-field>`
})
class MdInputWithValueBinding {
  value: string = 'Initial';
}

@Component({
  template: `
    <md-form-field floatPlaceholder="never">
      <input mdInput placeholder="Label">
    </md-form-field>
  `
})
class MdInputWithStaticPlaceholder {}

@Component({
  template: `
    <md-form-field [floatPlaceholder]="shouldFloat">
      <input mdInput placeholder="Label">
    </md-form-field>`
})
class MdInputWithDynamicPlaceholder {
  shouldFloat: string = 'always';
}

@Component({
  template: `
    <md-form-field>
      <textarea mdInput [rows]="rows" [cols]="cols" [wrap]="wrap" placeholder="Snacks"></textarea>
    </md-form-field>`
})
class MdInputTextareaWithBindings {
  rows: number = 4;
  cols: number = 8;
  wrap: string = 'hard';
}

@Component({
  template: `<md-form-field><input></md-form-field>`
})
class MdInputMissingMdInputTestController {}

@Component({
  template: `
    <form #form="ngForm" novalidate>
      <md-form-field>
        <input mdInput [formControl]="formControl">
        <md-hint>Please type something</md-hint>
        <md-error *ngIf="renderError">This field is required</md-error>
      </md-form-field>
    </form>
  `
})
class MdInputWithFormErrorMessages {
  @ViewChild('form') form: NgForm;
  formControl = new FormControl('', Validators.required);
  renderError = true;
}

@Component({
  template: `
    <form [formGroup]="formGroup">
      <md-form-field>
        <input mdInput
            formControlName="name"
            [errorStateMatcher]="customErrorStateMatcher.bind(this)">
        <md-hint>Please type something</md-hint>
        <md-error>This field is required</md-error>
      </md-form-field>
    </form>
  `
})
class MdInputWithCustomErrorStateMatcher {
  formGroup = new FormGroup({
    name: new FormControl('', Validators.required)
  });

  errorState = false;

  customErrorStateMatcher(): boolean {
    return this.errorState;
  }
}

@Component({
  template: `
    <form [formGroup]="formGroup" novalidate>
      <md-form-field>
        <input mdInput formControlName="name">
        <md-hint>Please type something</md-hint>
        <md-error>This field is required</md-error>
      </md-form-field>
    </form>
  `
})
class MdInputWithFormGroupErrorMessages {
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;
  formGroup = new FormGroup({
    name: new FormControl('', Validators.required)
  });
}

@Component({
  template: `
    <md-form-field>
      <div mdPrefix>Prefix</div>
      <input mdInput>
      <div mdSuffix>Suffix</div>
    </md-form-field>
  `
})
class MdInputWithPrefixAndSuffix {}

@Component({
  template: `
    <md-form-field>
      <input mdInput *ngIf="renderInput">
    </md-form-field>
  `
})
class MdInputWithNgIf {
  renderInput = true;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-form-field>
      <input mdInput placeholder="Label" [formControl]="formControl">
    </md-form-field>
  `
})
class MdInputOnPush {
  formControl = new FormControl('');
}

@Component({
  template: `
    <md-form-field>
      <input mdInput readonly value="Only for reading">
    </md-form-field>
  `
})
class MdInputWithReadonlyInput {}
