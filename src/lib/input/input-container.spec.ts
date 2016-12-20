import {async, TestBed, inject} from '@angular/core/testing';
import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {MdInputModule} from './input';
import {MdInputContainer} from './input-container';
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

  it('validates that md-input child is present', () => {
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

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).toBeNull();

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();

    el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Other placeholder');
    expect(el.nativeElement.textContent).not.toMatch(/\*/g);
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

  it('supports the disabled attribute', async(() => {
    let fixture = TestBed.createComponent(MdInputContainerWithDisabled);
    fixture.detectChanges();

    let underlineEl = fixture.debugElement.query(By.css('.md-input-underline')).nativeElement;
    expect(underlineEl.classList.contains('md-disabled')).toBe(false, 'should not be disabled');

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    expect(underlineEl.classList.contains('md-disabled')).toBe(true, 'should be disabled');
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
      <input md-input id="test-id" placeholder="test">
    </md-input-container>`
})
class MdInputContainerWithId {}

@Component({
  template: `<md-input-container><input md-input [disabled]="disabled"></md-input-container>`
})
class MdInputContainerWithDisabled {
  disabled: boolean;
}

@Component({
  template: `<md-input-container><input md-input required placeholder="hello"></md-input-container>`
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
  template: `<md-input-container><input md-input [placeholder]="placeholder"></md-input-container>`
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
  template: `<md-input-container><input md-input type="file"></md-input-container>`
})
class MdInputContainerInvalidTypeTestController {}

@Component({
  template: `
    <md-input-container>
      <input md-input placeholder="Hello">
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
  template: `<md-input-container><input md-input [(ngModel)]="model"></md-input-container>`
})
class MdInputContainerBaseTestController {
  model: any = '';
}

@Component({
  template: `
    <md-input-container>
      <input md-input type="date" placeholder="Placeholder">
    </md-input-container>`
})
class MdInputContainerDateTestController {}

@Component({
  template: `
    <md-input-container>
      <input md-input type="text" placeholder="Placeholder">
    </md-input-container>`
})
class MdInputContainerTextTestController {}

@Component({
  template: `
    <md-input-container>
      <input md-input type="password" placeholder="Placeholder">
    </md-input-container>`
})
class MdInputContainerPasswordTestController {}

@Component({
  template: `
    <md-input-container>
      <input md-input type="number" placeholder="Placeholder">
    </md-input-container>`
})
class MdInputContainerNumberTestController {}

@Component({
  template: `
    <md-input-container>
      <input md-input type="number" placeholder="Placeholder" [(ngModel)]="value">
    </md-input-container>`
})
class MdInputContainerZeroTestController {
  value = 0;
}

@Component({
  template: `
    <md-input-container>
      <textarea md-input [rows]="rows" [cols]="cols" [wrap]="wrap" placeholder="Snacks"></textarea>
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
