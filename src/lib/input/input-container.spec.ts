import {async, TestBed, inject} from '@angular/core/testing';
import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule, FormControl} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {MdInputModule} from './input';
import {MdInputContainer, MdInputDirective} from './input-container';
import {Platform} from '../core/platform/platform';
import {PlatformModule} from '../core/platform/index';
import {
  MdInputContainerMissingMdInputError,
  MdInputContainerPlaceholderConflictError,
  MdInputContainerDuplicatedHintError
} from './input-container-errors';


describe('MdInputContainer', function () {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MdInputModule.forRoot(),
        PlatformModule.forRoot(),
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        MdInputContainerPlaceholderRequiredTestComponent,
        MdInputContainerPlaceholderElementTestComponent,
        MdInputContainerPlaceholderAttrTestComponent,
        MdInputContainerHintLabel2TestController,
        MdInputContainerHintLabelTestController,
        MdInputContainerInvalidTypeTestController,
        MdInputContainerInvalidPlaceholderTestController,
        MdInputContainerInvalidHint2TestController,
        MdInputContainerInvalidHintTestController,
        MdInputContainerBaseTestController,
        MdInputContainerWithId,
        MdInputContainerDateTestController,
        MdInputContainerTextTestController,
        MdInputContainerPasswordTestController,
        MdInputContainerNumberTestController,
        MdInputContainerZeroTestController,
        MdTextareaWithBindings,
        MdInputContainerWithDisabled,
        MdInputContainerWithRequired,
        MdInputContainerWithType,
        MdInputContainerWithValueBinding,
        MdInputContainerWithFormControl,
        MdInputContainerWithStaticPlaceholder,
        MdInputContainerMissingMdInputTestController
      ],
    });

    TestBed.compileComponents();
  }));

  it('should default to floating placeholders', () => {
    let fixture = TestBed.createComponent(MdInputContainerBaseTestController);
    fixture.detectChanges();

    let inputContainer = fixture.debugElement.query(By.directive(MdInputContainer))
        .componentInstance as MdInputContainer;
    expect(inputContainer.floatingPlaceholder).toBe(true,
        'Expected MdInputContainer to default to having floating placeholders turned on');
  });

  it('should not be treated as empty if type is date',
      inject([Platform], (platform: Platform) => {
        if (!(platform.TRIDENT || platform.FIREFOX)) {
          let fixture = TestBed.createComponent(MdInputContainerDateTestController);
          fixture.detectChanges();

          let el = fixture.debugElement.query(By.css('label')).nativeElement;
          expect(el).not.toBeNull();
          expect(el.classList.contains('md-empty')).toBe(false);
        }
      }));

  // Firefox and IE don't support type="date" and fallback to type="text".
  it('should be treated as empty if type is date on Firefox and IE',
      inject([Platform], (platform: Platform) => {
        if (platform.TRIDENT || platform.FIREFOX) {
          let fixture = TestBed.createComponent(MdInputContainerDateTestController);
          fixture.detectChanges();

          let el = fixture.debugElement.query(By.css('label')).nativeElement;
          expect(el).not.toBeNull();
          expect(el.classList.contains('md-empty')).toBe(true);
        }
      }));

  it('should treat text input type as empty at init', () => {
    let fixture = TestBed.createComponent(MdInputContainerTextTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('md-empty')).toBe(true);
  });

  it('should treat password input type as empty at init', () => {
    let fixture = TestBed.createComponent(MdInputContainerPasswordTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('md-empty')).toBe(true);
  });

  it('should treat number input type as empty at init', () => {
    let fixture = TestBed.createComponent(MdInputContainerNumberTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('md-empty')).toBe(true);
  });

  it('should not be empty after input entered', async(() => {
    let fixture = TestBed.createComponent(MdInputContainerTextTestController);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input'));
    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('md-empty')).toBe(true, 'should be empty');

    inputEl.nativeElement.value = 'hello';
    // Simulate input event.
    inputEl.triggerEventHandler('input', {target: inputEl.nativeElement});
    fixture.detectChanges();

    el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el.classList.contains('md-empty')).toBe(false, 'should not be empty');
  }));

  it('should update the placeholder when input entered', async(() => {
    let fixture = TestBed.createComponent(MdInputContainerWithStaticPlaceholder);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input'));
    let labelEl = fixture.debugElement.query(By.css('label')).nativeElement;

    expect(labelEl.classList).toContain('md-empty');
    expect(labelEl.classList).not.toContain('md-float');

    // Update the value of the input.
    inputEl.nativeElement.value = 'Text';

    // Fake behavior of the `(input)` event which should trigger a change detection.
    fixture.detectChanges();

    expect(labelEl.classList).not.toContain('md-empty');
    expect(labelEl.classList).not.toContain('md-float');
  }));

  it('should not be empty when the value set before view init', async(() => {
    let fixture = TestBed.createComponent(MdInputContainerWithValueBinding);
    fixture.detectChanges();

    let placeholderEl = fixture.debugElement.query(By.css('.md-input-placeholder')).nativeElement;

    expect(placeholderEl.classList).not.toContain('md-empty');

    fixture.componentInstance.value = '';
    fixture.detectChanges();

    expect(placeholderEl.classList).toContain('md-empty');
  }));

  it('should not treat the number 0 as empty', async(() => {
    let fixture = TestBed.createComponent(MdInputContainerZeroTestController);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();

      let el = fixture.debugElement.query(By.css('label')).nativeElement;
      expect(el).not.toBeNull();
      expect(el.classList.contains('md-empty')).toBe(false);
    });
  }));

  it('should update the value when using FormControl.setValue', () => {
    let fixture = TestBed.createComponent(MdInputContainerWithFormControl);
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.directive(MdInputDirective))
      .injector.get(MdInputDirective) as MdInputDirective;

    expect(input.value).toBeFalsy();

    fixture.componentInstance.formControl.setValue('something');

    expect(input.value).toBe('something');
  });

  it('should add id', () => {
    let fixture = TestBed.createComponent(MdInputContainerTextTestController);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
        fixture.debugElement.query(By.css('label')).nativeElement;

    expect(inputElement.id).toBeTruthy();
    expect(inputElement.id).toEqual(labelElement.getAttribute('for'));
  });

  it('should not overwrite existing id', () => {
    let fixture = TestBed.createComponent(MdInputContainerWithId);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
        fixture.debugElement.query(By.css('label')).nativeElement;

    expect(inputElement.id).toBe('test-id');
    expect(labelElement.getAttribute('for')).toBe('test-id');
  });

  it('validates there\'s only one hint label per side', () => {
    let fixture = TestBed.createComponent(MdInputContainerInvalidHintTestController);

    expect(() => fixture.detectChanges()).toThrowError(
        angularWrappedErrorMessage(new MdInputContainerDuplicatedHintError('start')));
  });

  it('validates there\'s only one hint label per side (attribute)', () => {
    let fixture = TestBed.createComponent(MdInputContainerInvalidHint2TestController);

    expect(() => fixture.detectChanges()).toThrowError(
        angularWrappedErrorMessage(new MdInputContainerDuplicatedHintError('start')));
  });

  it('validates there\'s only one placeholder', () => {
    let fixture = TestBed.createComponent(MdInputContainerInvalidPlaceholderTestController);

    expect(() => fixture.detectChanges()).toThrowError(
        angularWrappedErrorMessage(new MdInputContainerPlaceholderConflictError()));
  });

  it('validates that mdInput child is present', () => {
    let fixture = TestBed.createComponent(MdInputContainerMissingMdInputTestController);

    expect(() => fixture.detectChanges()).toThrowError(
        angularWrappedErrorMessage(new MdInputContainerMissingMdInputError()));
  });

  it('validates the type', () => {
    let fixture = TestBed.createComponent(MdInputContainerInvalidTypeTestController);

    // Technically this throws during the OnChanges detection phase,
    // so the error is really a ChangeDetectionError and it becomes
    // hard to build a full exception to compare with.
    // We just check for any exception in this case.
    expect(() => fixture.detectChanges()).toThrow(
        /* new MdInputContainerUnsupportedTypeError('file') */);
  });

  it('supports hint labels attribute', () => {
    let fixture = TestBed.createComponent(MdInputContainerHintLabelTestController);
    fixture.detectChanges();

    // If the hint label is empty, expect no label.
    expect(fixture.debugElement.query(By.css('.md-hint'))).toBeNull();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.md-hint'))).not.toBeNull();
  });

  it('supports hint labels elements', () => {
    let fixture = TestBed.createComponent(MdInputContainerHintLabel2TestController);
    fixture.detectChanges();

    // In this case, we should have an empty <md-hint>.
    let el = fixture.debugElement.query(By.css('md-hint')).nativeElement;
    expect(el.textContent).toBeFalsy();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('md-hint')).nativeElement;
    expect(el.textContent).toBe('label');
  });

  it('supports placeholder attribute', async(() => {
    let fixture = TestBed.createComponent(MdInputContainerPlaceholderAttrTestComponent);
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
    let fixture = TestBed.createComponent(MdInputContainerPlaceholderElementTestComponent);
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
    let fixture = TestBed.createComponent(MdInputContainerPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch(/hello\s+\*/g);
  });

  it('supports the disabled attribute as binding', async(() => {
    const fixture = TestBed.createComponent(MdInputContainerWithDisabled);
    fixture.detectChanges();

    const underlineEl = fixture.debugElement.query(By.css('.md-input-underline')).nativeElement;
    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(underlineEl.classList.contains('md-disabled'))
        .toBe(false, `Expected underline not to start out disabled.`);
    expect(inputEl.disabled).toBe(false);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    expect(underlineEl.classList.contains('md-disabled'))
        .toBe(true, `Expected underline to look disabled after property is set.`);
    expect(inputEl.disabled).toBe(true);
  }));

  it('should display disabled styles when using FormControl.disable()', () => {
    const fixture = TestBed.createComponent(MdInputContainerWithFormControl);
    fixture.detectChanges();

    const underlineEl = fixture.debugElement.query(By.css('.md-input-underline')).nativeElement;
    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(underlineEl.classList)
        .not.toContain('md-disabled', `Expected underline not to start out disabled.`);
    expect(inputEl.disabled).toBe(false);

    fixture.componentInstance.formControl.disable();
    fixture.detectChanges();

    expect(underlineEl.classList)
        .toContain('md-disabled', `Expected underline to look disabled after disable() is called.`);
    expect(inputEl.disabled).toBe(true);
  });

  it('supports the required attribute as binding', async(() => {
    let fixture = TestBed.createComponent(MdInputContainerWithRequired);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputEl.required).toBe(false);

    fixture.componentInstance.required = true;
    fixture.detectChanges();

    expect(inputEl.required).toBe(true);
  }));

  it('supports the type attribute as binding', async(() => {
    let fixture = TestBed.createComponent(MdInputContainerWithType);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputEl.type).toBe('text');

    fixture.componentInstance.type = 'password';
    fixture.detectChanges();

    expect(inputEl.type).toBe('password');
  }));

  it('supports textarea', () => {
    let fixture = TestBed.createComponent(MdTextareaWithBindings);
    fixture.detectChanges();

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea).not.toBeNull();
  });
});

@Component({
  template: `
    <md-input-container>
      <input mdInput id="test-id" placeholder="test">
    </md-input-container>`
})
class MdInputContainerWithId {}

@Component({
  template: `<md-input-container><input mdInput [disabled]="disabled"></md-input-container>`
})
class MdInputContainerWithDisabled {
  disabled: boolean;
}

@Component({
  template: `<md-input-container><input mdInput [required]="required"></md-input-container>`
})
class MdInputContainerWithRequired {
  required: boolean;
}

@Component({
  template: `<md-input-container><input mdInput [type]="type"></md-input-container>`
})
class MdInputContainerWithType {
  type: string;
}

@Component({
  template: `<md-input-container><input mdInput required placeholder="hello"></md-input-container>`
})
class MdInputContainerPlaceholderRequiredTestComponent {}

@Component({
  template: `
    <md-input-container>
      <input md-input>
      <md-placeholder>{{placeholder}}</md-placeholder>
    </md-input-container>`
})
class MdInputContainerPlaceholderElementTestComponent {
  placeholder: string = 'Default Placeholder';
}

@Component({
  template: `<md-input-container><input md-input [formControl]="formControl"></md-input-container>`
})
class MdInputContainerWithFormControl {
  formControl = new FormControl();
}

@Component({
  template: `<md-input-container><input mdInput [placeholder]="placeholder"></md-input-container>`
})
class MdInputContainerPlaceholderAttrTestComponent {
  placeholder: string = '';
}

@Component({
  template: `<md-input-container><input md-input><md-hint>{{label}}</md-hint></md-input-container>`
})
class MdInputContainerHintLabel2TestController {
  label: string = '';
}

@Component({
  template: `<md-input-container [hintLabel]="label"><input md-input></md-input-container>`
})
class MdInputContainerHintLabelTestController {
  label: string = '';
}

@Component({
  template: `<md-input-container><input mdInput type="file"></md-input-container>`
})
class MdInputContainerInvalidTypeTestController {}

@Component({
  template: `
    <md-input-container>
      <input mdInput placeholder="Hello">
      <md-placeholder>World</md-placeholder>
    </md-input-container>`
})
class MdInputContainerInvalidPlaceholderTestController {}

@Component({
  template: `
    <md-input-container hintLabel="Hello">
      <input md-input>
      <md-hint>World</md-hint>
    </md-input-container>`
})
class MdInputContainerInvalidHint2TestController {}

@Component({
  template: `
    <md-input-container>
      <input md-input>
      <md-hint>Hello</md-hint>
      <md-hint>World</md-hint>
    </md-input-container>`
})
class MdInputContainerInvalidHintTestController {}

@Component({
  template: `<md-input-container><input mdInput [(ngModel)]="model"></md-input-container>`
})
class MdInputContainerBaseTestController {
  model: any = '';
}

@Component({
  template: `
    <md-input-container>
      <input mdInput type="date" placeholder="Placeholder">
    </md-input-container>`
})
class MdInputContainerDateTestController {}

@Component({
  template: `
    <md-input-container>
      <input mdInput type="text" placeholder="Placeholder">
    </md-input-container>`
})
class MdInputContainerTextTestController {}

@Component({
  template: `
    <md-input-container>
      <input mdInput type="password" placeholder="Placeholder">
    </md-input-container>`
})
class MdInputContainerPasswordTestController {}

@Component({
  template: `
    <md-input-container>
      <input mdInput type="number" placeholder="Placeholder">
    </md-input-container>`
})
class MdInputContainerNumberTestController {}

@Component({
  template: `
    <md-input-container>
      <input mdInput type="number" placeholder="Placeholder" [(ngModel)]="value">
    </md-input-container>`
})
class MdInputContainerZeroTestController {
  value = 0;
}

@Component({
  template: `
    <md-input-container>
      <input mdInput placeholder="Label" [value]="value">
    </md-input-container>`
})
class MdInputContainerWithValueBinding {
  value: string = 'Initial';
}

@Component({
  template: `
    <md-input-container [floatingPlaceholder]="false">
      <input md-input placeholder="Label">
    </md-input-container>
  `
})
class MdInputContainerWithStaticPlaceholder {}

@Component({
  template: `
    <md-input-container>
      <textarea mdInput [rows]="rows" [cols]="cols" [wrap]="wrap" placeholder="Snacks"></textarea>
    </md-input-container>`
})
class MdTextareaWithBindings {
  rows: number = 4;
  cols: number = 8;
  wrap: string = 'hard';
}

@Component({
  template: `<md-input-container><input></md-input-container>`
})
class MdInputContainerMissingMdInputTestController {}

/**
 * Gets a RegExp used to detect an angular wrapped error message.
 * See https://github.com/angular/angular/issues/8348
 */
const angularWrappedErrorMessage = (e: Error) =>
    new RegExp(`.*caused by: ${regexpEscape(e.message)}$`);

/**
 * Escape a string for use inside a RegExp.
 * Based on https://github.com/sindresorhus/escape-string-regex
 */
const regexpEscape = (s: string) => s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
