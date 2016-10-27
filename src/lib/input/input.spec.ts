import {
  async,
  TestBed,
} from '@angular/core/testing';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {MdInput, MdInputModule} from './input';

function isInternetExplorer11() {
    return 'ActiveXObject' in window;
}

describe('MdInput', function () {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdInputModule.forRoot(), FormsModule],
      declarations: [
        MdInputNumberTypeConservedTestComponent,
        MdInputPlaceholderRequiredTestComponent,
        MdInputPlaceholderElementTestComponent,
        MdInputPlaceholderAttrTestComponent,
        MdInputHintLabel2TestController,
        MdInputHintLabelTestController,
        MdInputInvalidTypeTestController,
        MdInputInvalidPlaceholderTestController,
        MdInputInvalidHint2TestController,
        MdInputInvalidHintTestController,
        MdInputBaseTestController,
        MdInputAriaTestController,
        MdInputWithBlurAndFocusEvents,
        MdInputWithNameTestController,
        MdInputWithId,
        MdInputWithAutocomplete,
        MdInputWithUnboundAutocomplete,
        MdInputWithUnboundAutocompleteWithValue,
        MdInputWithAutocorrect,
        MdInputWithUnboundAutocorrect,
        MdInputWithAutocapitalize,
        MdInputWithUnboundAutocapitalize,
        MdInputWithAutofocus,
        MdInputWithUnboundAutofocus,
        MdInputWithReadonly,
        MdInputWithUnboundReadonly,
        MdInputWithSpellcheck,
        MdInputWithUnboundSpellcheck,
        MdInputWithDisabled,
        MdInputWithUnboundDisabled,
        MdInputWithRequired,
        MdInputWithUnboundRequired,
        MdInputWithList,
        MdInputWithMax,
        MdInputWithMin,
        MdInputWithStep,
        MdInputWithTabindex,
        MdInputDateTestController,
        MdInputTextTestController,
        MdInputPasswordTestController,
        MdInputNumberTestController,
        MdTextareaWithBindings,
      ],
    });

    TestBed.compileComponents();
  }));

  it('creates a native <input> element', () => {
    let fixture = TestBed.createComponent(MdInputBaseTestController);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('input'))).toBeTruthy();
  });

  it('should default to flating placeholders', () => {
    let fixture = TestBed.createComponent(MdInputBaseTestController);
    fixture.detectChanges();

    let mdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance as MdInput;
    expect(mdInput.floatingPlaceholder)
        .toBe(true, 'Expected MdInput to default to having floating placeholders turned on');
  });

  it('should not be treated as empty if type is date', () => {
    if (isInternetExplorer11()) {
      return;
    }
    let fixture = TestBed.createComponent(MdInputDateTestController);
    fixture.componentInstance.placeholder = 'Placeholder';
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.className.includes('md-empty')).toBe(false);
  });

  it('should treat text input type as empty at init', () => {
    if (isInternetExplorer11()) {
      return;
    }
    let fixture = TestBed.createComponent(MdInputTextTestController);
    fixture.componentInstance.placeholder = 'Placeholder';
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.className.includes('md-empty')).toBe(true);
  });

  it('should treat password input type as empty at init', () => {
    if (isInternetExplorer11()) {
      return;
    }
    let fixture = TestBed.createComponent(MdInputPasswordTestController);
    fixture.componentInstance.placeholder = 'Placeholder';
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.className.includes('md-empty')).toBe(true);
  });

  it('should treat number input type as empty at init', () => {
    if (isInternetExplorer11()) {
      return;
    }
    let fixture = TestBed.createComponent(MdInputNumberTestController);
    fixture.componentInstance.placeholder = 'Placeholder';
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.className.includes('md-empty')).toBe(true);
  });

  // TODO(kara): update when core/testing adds fix
  it('support ngModel', async(() => {
    let fixture = TestBed.createComponent(MdInputBaseTestController);

    fixture.detectChanges();
    let instance = fixture.componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    instance.model = 'hello';
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      // Temporary workaround, see https://github.com/angular/angular/issues/10148
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(el.value).toBe('hello');
      });
    });
  }));

  it('should have a different ID for outer element and internal input', () => {
    let fixture = TestBed.createComponent(MdInputWithId);
    fixture.detectChanges();

    const componentElement: HTMLElement =
        fixture.debugElement.query(By.directive(MdInput)).nativeElement;
    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;

    expect(componentElement.id).toBe('test-id');
    expect(inputElement.id).toBeTruthy();
    expect(inputElement.id).not.toBe(componentElement.id);
  });

  it('counts characters', async(() => {
    let fixture = TestBed.createComponent(MdInputBaseTestController);
    let instance = fixture.componentInstance;
    fixture.detectChanges();
    let inputInstance = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    expect(inputInstance.characterCount).toEqual(0);

    instance.model = 'hello';
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(inputInstance.characterCount).toEqual(5);
    });
  }));

  it('copies aria attributes to the inner input', () => {
    let fixture = TestBed.createComponent(MdInputAriaTestController);
    let instance = fixture.componentInstance;
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(el.getAttribute('aria-label')).toEqual('label');
    instance.ariaLabel = 'label 2';
    fixture.detectChanges();
    expect(el.getAttribute('aria-label')).toEqual('label 2');

    expect(el.getAttribute('aria-disabled')).toBeTruthy();
  });

  it(`validates there's only one hint label per side`, () => {
    let fixture = TestBed.createComponent(MdInputInvalidHintTestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MdInputDuplicatedHintError('start'));
    // See https://github.com/angular/angular/issues/8348
  });

  it(`validates there's only one hint label per side (attribute)`, () => {
    let fixture = TestBed.createComponent(MdInputInvalidHint2TestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MdInputDuplicatedHintError('start'));
    // See https://github.com/angular/angular/issues/8348
  });

  it('validates there\'s only one placeholder', () => {
    let fixture = TestBed.createComponent(MdInputInvalidPlaceholderTestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MdInputPlaceholderConflictError());
    // See https://github.com/angular/angular/issues/8348
  });

  it('validates the type', () => {
    let fixture = TestBed.createComponent(MdInputInvalidTypeTestController);

    // Technically this throws during the OnChanges detection phase,
    // so the error is really a ChangeDetectionError and it becomes
    // hard to build a full exception to compare with.
    // We just check for any exception in this case.
    expect(() => fixture.detectChanges()).toThrow(/* new MdInputUnsupportedTypeError('file') */);
  });

  it('supports hint labels attribute', () => {
    let fixture = TestBed.createComponent(MdInputHintLabelTestController);
    fixture.detectChanges();

    // If the hint label is empty, expect no label.
    expect(fixture.debugElement.query(By.css('.md-hint'))).toBeNull();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.md-hint'))).not.toBeNull();
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

  it('supports placeholder attribute', () => {
    let fixture = TestBed.createComponent(MdInputPlaceholderAttrTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).toBeNull();

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Other placeholder');
    expect(el.nativeElement.textContent).not.toMatch(/\*/g);
  });

  it('supports placeholder element', () => {
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
  });

  it('supports placeholder required star', () => {
    let fixture = TestBed.createComponent(MdInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch(/hello\s+\*/g);
  });

  it('supports number types and conserved its value type from Angular', () => {
    let fixture = TestBed.createComponent(MdInputNumberTypeConservedTestComponent);
    fixture.detectChanges();

    const input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    // Fake a `change` event being triggered.
    inputElement.value = '3';
    input._handleChange(<any> {target: inputElement});

    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(3);
    expect(typeof fixture.componentInstance.value).toBe('number');
  });

  it('supports blur and focus events', () => {
    let fixture = TestBed.createComponent(MdInputWithBlurAndFocusEvents);
    const testComponent = fixture.componentInstance;
    const inputComponent = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    const fakeEvent = <FocusEvent>{};

    spyOn(testComponent, 'onFocus');
    spyOn(testComponent, 'onBlur');

    expect(testComponent.onFocus).not.toHaveBeenCalled();
    expect(testComponent.onBlur).not.toHaveBeenCalled();

    inputComponent._handleFocus(fakeEvent);
    expect(testComponent.onFocus).toHaveBeenCalledWith(fakeEvent);

    inputComponent._handleBlur(fakeEvent);
    expect(testComponent.onBlur).toHaveBeenCalledWith(fakeEvent);
  });

  it('supports the autoComplete attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithAutocomplete);
    fixture.detectChanges();

    let input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocomplete')).toBeNull();

    input.autocomplete = 'on';
    fixture.detectChanges();
    expect(el.getAttribute('autocomplete')).toEqual('on');
  });

  it('supports the autoCorrect attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithAutocorrect);
    fixture.detectChanges();

    let input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocorrect')).toBeNull();

    input.autocorrect = 'on';
    fixture.detectChanges();
    expect(el.getAttribute('autocorrect')).toEqual('on');
  });

  it('supports the autoCapitalize attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithAutocapitalize);
    fixture.detectChanges();

    let input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocapitalize')).toBeNull();

    input.autocapitalize = 'on';
    fixture.detectChanges();
    expect(el.getAttribute('autocapitalize')).toEqual('on');
  });

  it('supports the autoComplete attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithUnboundAutocomplete);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocomplete')).toEqual('');
  });

  it('supports the autoComplete attribute as an unbound value attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithUnboundAutocompleteWithValue);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocomplete')).toEqual('name');
  });

  it('supports the autoFocus attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithAutofocus);
    fixture.detectChanges();

    let input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autofocus')).toBeNull();

    input.autofocus = true;
    fixture.detectChanges();
    expect(el.getAttribute('autofocus')).toEqual('');
  });

  it('supports the autoFocus attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithUnboundAutofocus);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autofocus')).toEqual('');
  });

  it('supports the disabled attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithDisabled);
    let input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    input.disabled = false;
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(el).not.toBeNull();

    fixture.detectChanges();
    expect(el.getAttribute('disabled')).toEqual(null);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(el.getAttribute('disabled')).toEqual('');
    });
  });

  it('supports the disabled attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithUnboundDisabled);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    fixture.whenStable().then(() => {
      expect(el.getAttribute('disabled')).toEqual('');
    });
  });

  it('supports the list attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithList);
    let input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    input.disabled = false;
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    fixture.detectChanges();
    expect(el.getAttribute('list')).toEqual(null);

    input.list = 'datalist-id';
    fixture.detectChanges();
    expect(el.getAttribute('list')).toEqual('datalist-id');
  });

  it('supports the max attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithMax);
    let input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    input.disabled = false;
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(el).not.toBeNull();

    fixture.detectChanges();
    expect(el.getAttribute('max')).toEqual(null);

    input.max = 10;
    fixture.detectChanges();
    expect(el.getAttribute('max')).toEqual('10');

    input.max = '2000-01-02';
    fixture.detectChanges();
    expect(el.getAttribute('max')).toEqual('2000-01-02');
  });

  it('supports the min attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithMin);
    let input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    input.disabled = false;
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(el).not.toBeNull();
    fixture.detectChanges();
    expect(el.getAttribute('min')).toEqual(null);

    input.min = 10;
    fixture.detectChanges();
    expect(el.getAttribute('min')).toEqual('10');

    input.min = '2000-01-02';
    fixture.detectChanges();
    expect(el.getAttribute('min')).toEqual('2000-01-02');
  });

  it('supports the readOnly attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithReadonly);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    let input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;

    expect(el).not.toBeNull();
    expect(el.getAttribute('readonly')).toBeNull();

    input.readonly = true;
    fixture.detectChanges();
    expect(el.getAttribute('readonly')).toEqual('');
  });

  it('supports the readOnly attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithUnboundReadonly);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('readonly')).toEqual('');
  });

  it('supports the required attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithRequired);
    fixture.detectChanges();

    let input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('required')).toBeNull();

    input.required = true;
    fixture.detectChanges();
    expect(el.getAttribute('required')).toEqual('');
  });

  it('supports the required attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithUnboundRequired);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('required')).toEqual('');
  });

  it('supports the spellCheck attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithSpellcheck);
    fixture.detectChanges();

    let input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('spellcheck')).toEqual('false');

    input.spellcheck = true;
    fixture.detectChanges();
    expect(el.getAttribute('spellcheck')).toEqual('true');
  });

  it('supports the spellCheck attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithUnboundSpellcheck);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('spellcheck')).toEqual('true');
  });

  it('supports the step attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithStep);
    fixture.detectChanges();

    let input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('step')).toEqual(null);

    input.step = 0.5;
    fixture.detectChanges();
    expect(el.getAttribute('step')).toEqual('0.5');
  });

  it('supports the tabIndex attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithTabindex);
    fixture.detectChanges();

    let input: MdInput = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('tabindex')).toEqual(null);

    input.tabindex = 1;
    fixture.detectChanges();
    expect(el.getAttribute('tabindex')).toEqual('1');
  });

  it('supports a name attribute', () => {
    let fixture = TestBed.createComponent(MdInputWithNameTestController);

    fixture.detectChanges();

    const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input'))
        .nativeElement;

    expect(inputElement.name).toBe('some-name');
  });

  describe('md-textarea', () => {
    it('supports the rows, cols, and wrap attributes', () => {
      let fixture = TestBed.createComponent(MdTextareaWithBindings);

      fixture.detectChanges();

      const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textarea.rows).toBe(4);
      expect(textarea.cols).toBe(8);
      expect(textarea.wrap).toBe('hard');
    });
  });

});

@Component({template: `<md-input id="test-id"></md-input>`})
class MdInputWithId {
  value: number = 0;
}

@Component({template: `<md-input type="number" [(ngModel)]="value"></md-input>`})
class MdInputNumberTypeConservedTestComponent {
  value: number = 0;
}

@Component({template: `<md-input required placeholder="hello"></md-input>`})
class MdInputPlaceholderRequiredTestComponent {
}

@Component({template: `<md-input> <md-placeholder>{{placeholder}}</md-placeholder> </md-input>`})
class MdInputPlaceholderElementTestComponent {
  placeholder: string = 'Default Placeholder';
}

@Component({template: `<md-input [placeholder]="placeholder"></md-input>`})
class MdInputPlaceholderAttrTestComponent {
  placeholder: string = '';
}

@Component({template: `<md-input> <md-hint>{{label}}</md-hint> </md-input>`})
class MdInputHintLabel2TestController {
  label: string = '';
}

@Component({template: `<md-input [hintLabel]="label"></md-input>`})
class MdInputHintLabelTestController {
  label: string = '';
}

@Component({template: `<md-input type="file"></md-input>`})
class MdInputInvalidTypeTestController { }

@Component({
  template: `
    <md-input placeholder="Hello">
      <md-placeholder>World</md-placeholder>
    </md-input>`
})
class MdInputInvalidPlaceholderTestController { }

@Component({
  template: `
    <md-input hintLabel="Hello">
      <md-hint>World</md-hint>
    </md-input>`
})
class MdInputInvalidHint2TestController { }

@Component({
  template: `
    <md-input>
      <md-hint>Hello</md-hint>
      <md-hint>World</md-hint>
    </md-input>`
})
class MdInputInvalidHintTestController { }

@Component({template: `<md-input [(ngModel)]="model"></md-input>`})
class MdInputBaseTestController {
  model: any = '';
}

@Component({template:
    `<md-input [aria-label]="ariaLabel" [aria-disabled]="ariaDisabled"></md-input>`})
class MdInputAriaTestController {
  ariaLabel: string = 'label';
  ariaDisabled: boolean = true;
}

@Component({template: `<md-input (focus)="onFocus($event)" (blur)="onBlur($event)"></md-input>`})
class MdInputWithBlurAndFocusEvents {
  onBlur(event: FocusEvent) {}
  onFocus(event: FocusEvent) {}
}

@Component({template: `<md-input name="some-name"></md-input>`})
class MdInputWithNameTestController { }

@Component({template: `<md-input [autocomplete]="autoComplete"></md-input>`})
class MdInputWithAutocomplete { }

@Component({template: `<md-input autocomplete></md-input>`})
class MdInputWithUnboundAutocomplete { }

@Component({template: `<md-input autocomplete="name"></md-input>`})
class MdInputWithUnboundAutocompleteWithValue { }

@Component({template: `<md-input [autocorrect]="autoCorrect"></md-input>`})
class MdInputWithAutocorrect { }

@Component({template: `<md-input autocorrect></md-input>`})
class MdInputWithUnboundAutocorrect { }

@Component({template: `<md-input [autocapitalize]="autoCapitalize"></md-input>`})
class MdInputWithAutocapitalize { }

@Component({template: `<md-input autocapitalize></md-input>`})
class MdInputWithUnboundAutocapitalize { }

@Component({template: `<md-input [autofocus]="autoFocus"></md-input>`})
class MdInputWithAutofocus { }

@Component({template: `<md-input autofocus></md-input>`})
class MdInputWithUnboundAutofocus { }

@Component({template: `<md-input [readonly]="readOnly"></md-input>`})
class MdInputWithReadonly { }

@Component({template: `<md-input readonly></md-input>`})
class MdInputWithUnboundReadonly { }

@Component({template: `<md-input [spellcheck]="spellcheck"></md-input>`})
class MdInputWithSpellcheck { }

@Component({template: `<md-input spellcheck></md-input>`})
class MdInputWithUnboundSpellcheck { }

@Component({template: `<md-input [disabled]="disabled"></md-input>`})
class MdInputWithDisabled {
  disabled: boolean;
}

@Component({template: `<md-input disabled></md-input>`})
class MdInputWithUnboundDisabled { }

@Component({template: `<md-input [required]="required"></md-input>`})
class MdInputWithRequired { }

@Component({template: `<md-input required></md-input>`})
class MdInputWithUnboundRequired { }

@Component({template: `<md-input [list]="list"></md-input>`})
class MdInputWithList { }

@Component({template: `<md-input [max]="max"></md-input>`})
class MdInputWithMax { }

@Component({template: `<md-input [min]="min"></md-input>`})
class MdInputWithMin { }

@Component({template: `<md-input [step]="step"></md-input>`})
class MdInputWithStep { }

@Component({template: `<md-input [tabindex]="tabIndex"></md-input>`})
class MdInputWithTabindex { }

@Component({template: `<md-input type="date" [placeholder]="placeholder"></md-input>`})
class MdInputDateTestController {
  placeholder: string = '';
}

@Component({template: `<md-input type="text" [placeholder]="placeholder"></md-input>`})
class MdInputTextTestController {
  placeholder: string = '';
}

@Component({template: `<md-input type="password" [placeholder]="placeholder"></md-input>`})
class MdInputPasswordTestController {
  placeholder: string = '';
}

@Component({template: `<md-input type="number" [placeholder]="placeholder"></md-input>`})
class MdInputNumberTestController {
  placeholder: string = '';
}

@Component({template:
    `<md-textarea [rows]="rows" [cols]="cols" [wrap]="wrap" placeholder="Snacks"></md-textarea>`})
class MdTextareaWithBindings {
  rows: number = 4;
  cols: number = 8;
  wrap: string = 'hard';
}
