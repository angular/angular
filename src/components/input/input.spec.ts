import {
  describe,
  it,
  expect,
  beforeEach,
  fakeAsync,
  inject,
  tick,
} from '@angular/core/testing';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {
  MdInput,
  MD_INPUT_DIRECTIVES,
} from './input';


describe('MdInput', function () {
  var builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], function (tcb: TestComponentBuilder) {
    builder = tcb;
  }));

  it('creates a native <input> element', () => {
    return builder.createAsync(MdInputBaseTestController)
      .then(fixture => {
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('input'))).toBeTruthy();
      });
  });

  it('support ngModel', () => {
    return builder.createAsync(MdInputBaseTestController)
      .then(fixture => {
        fixture.detectChanges();
        fakeAsync(() => {
          let instance = fixture.componentInstance;
          let component = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          instance.model = 'hello';
          fixture.detectChanges();
          tick();
          expect(el.value).toEqual('hello');

          component.value = 'world';
          fixture.detectChanges();
          tick();
          expect(el.value).toEqual('world');
        })();
      });
  });

  it('should have a different ID for outer element and internal input', () => {
    return builder
        .overrideTemplate(MdInputBaseTestController, `
          <md-input id="test-id"></md-input>
        `)
        .createAsync(MdInputBaseTestController)
        .then(fixture => {
          fixture.detectChanges();
          fakeAsync(() => {
            const componentElement: HTMLElement = fixture.debugElement
                .query(By.directive(MdInput)).nativeElement;
            const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input'))
                .nativeElement;
            expect(componentElement.id).toBe('test-id');
            expect(inputElement.id).toBeTruthy();
            expect(inputElement.id).not.toBe(componentElement.id);
          })();
        });
  });

  it('counts characters', () => {
    return builder.createAsync(MdInputBaseTestController).then(fixture => {
      let instance = fixture.componentInstance;
      fixture.detectChanges();
      let inputInstance = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
      expect(inputInstance.characterCount).toEqual(0);

      instance.model = 'hello';
      fixture.detectChanges();
      expect(inputInstance.characterCount).toEqual(5);
    });
  });

  it('copies aria attributes to the inner input', () => {
    return builder.createAsync(MdInputAriaTestController)
      .then(fixture => {
        let instance = fixture.componentInstance;
        fixture.detectChanges();
        let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(el.getAttribute('aria-label')).toEqual('label');
        instance.ariaLabel = 'label 2';
        fixture.detectChanges();
        expect(el.getAttribute('aria-label')).toEqual('label 2');

        expect(el.getAttribute('aria-disabled')).toBeTruthy();
      });
  });

  it('validates there\'s only one hint label per side', () => {

    return builder.createAsync(MdInputInvalidHintTestController)
      .then(fixture => {
          expect(() => fixture.detectChanges())
            .toThrow();
            // TODO(jelbourn): .toThrow(new MdInputDuplicatedHintError('start'));
            // See https://github.com/angular/angular/issues/8348
      });
  });

  it(`validates there's only one hint label per side (attribute)`, () => {
    return builder.createAsync(MdInputInvalidHint2TestController)
      .then(fixture => {
        expect(() => fixture.detectChanges())
          .toThrow();
          // TODO(jelbourn): .toThrow(new MdInputDuplicatedHintError('start'));
          // See https://github.com/angular/angular/issues/8348
      });
  });

  it('validates there\'s only one placeholder', () => {
    return builder.createAsync(MdInputInvalidPlaceholderTestController)
      .then(fixture => {
        expect(() => fixture.detectChanges())
          .toThrow();
          // TODO(jelbourn): .toThrow(new MdInputPlaceholderConflictError());
          // See https://github.com/angular/angular/issues/8348
      });
  });

  it('validates the type', () => {
    return builder.createAsync(MdInputInvalidTypeTestController)
      .then(fixture => {
        fakeAsync(() => {
          // Technically this throws during the OnChanges detection phase,
          // so the error is really a ChangeDetectionError and it becomes
          // hard to build a full exception to compare with.
          // We just check for any exception in this case.
          expect(() => fixture.detectChanges())
            .toThrow(/* new MdInputUnsupportedTypeError('file') */);
        })();
      });
  });

  it('supports hint labels attribute', () => {
    return builder.createAsync(MdInputHintLabelTestController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          // If the hint label is empty, expect no label.
          expect(fixture.debugElement.query(By.css('.md-hint'))).toBeNull();

          fixture.componentInstance.label = 'label';
          fixture.detectChanges();
          expect(fixture.debugElement.query(By.css('.md-hint'))).not.toBeNull();
        })();
      });
  });

  it('supports hint labels elements', () => {
    return builder.createAsync(MdInputHintLabel2TestController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          // In this case, we should have an empty <md-hint>.
          let el = fixture.debugElement.query(By.css('md-hint')).nativeElement;
          expect(el.textContent).toBeFalsy();

          fixture.componentInstance.label = 'label';
          fixture.detectChanges();
          el = fixture.debugElement.query(By.css('md-hint')).nativeElement;
          expect(el.textContent).toBe('label');
        })();
      });
  });

  it('supports placeholder attribute', () => {
    return builder.createAsync(MdInputPlaceholderAttrTestComponent)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el = fixture.debugElement.query(By.css('label'));
          expect(el).toBeNull();

          fixture.componentInstance.placeholder = 'Other placeholder';
          fixture.detectChanges();
          el = fixture.debugElement.query(By.css('label'));
          expect(el).not.toBeNull();
          expect(el.nativeElement.textContent).toMatch('Other placeholder');
          expect(el.nativeElement.textContent).not.toMatch(/\*/g);
        })();
      });
  });

  it('supports placeholder element', () => {
    return builder.createAsync(MdInputPlaceholderElementTestComponent)
      .then(fixture => {
        fakeAsync(() => {
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
        })();
      });
  });

  it('supports placeholder required star', () => {
    return builder.createAsync(MdInputPlaceholderRequiredTestComponent)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el = fixture.debugElement.query(By.css('label'));
          expect(el).not.toBeNull();
          expect(el.nativeElement.textContent).toMatch(/hello\s+\*/g);
        })();
      });
  });

  it('supports number types and conserved its value type from Angular', () => {
    return builder.createAsync(MdInputNumberTypeConservedTestComponent)
      .then(fixture => {
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
        inputEl.value = '3';

        // Manually trigger an onchange event.
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent('change', true, true);
        inputEl.dispatchEvent(evt);

        fixture.detectChanges();

        // Something along the chain of events is asynchronous but does not use Zones, therefore
        // we need to wait for that something to propagate. Using fakeAsync fails, just returning
        // Promise.resolve(fixture) fails as well, but this passes.
        return new Promise(resolve => {
          setTimeout(() => resolve(fixture), 0);
        });
      }).then((fixture: any) => {
        expect(fixture.componentInstance.value).toBe(3);
        expect(typeof fixture.componentInstance.value).toBe('number');
      });
  });

  it('supports blur and focus events', () => {
    return builder.createAsync(MdInputWithBlurAndFocusEvents).then(fixture => {
      const testComponent = fixture.componentInstance;
      const inputComponent = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
      const fakeEvent = <FocusEvent>{};
      fakeAsync(() => {
        spyOn(testComponent, 'onFocus');
        spyOn(testComponent, 'onBlur');

        expect(testComponent.onFocus).not.toHaveBeenCalled();
        expect(testComponent.onBlur).not.toHaveBeenCalled();

        inputComponent.handleFocus(fakeEvent);
        tick();
        expect(testComponent.onFocus).toHaveBeenCalledWith(fakeEvent);


        inputComponent.handleBlur(fakeEvent);
        tick();
        expect(testComponent.onBlur).toHaveBeenCalledWith(fakeEvent);
      })();
    });
  });

  it('supports the autoComplete attribute', () => {
    var template = '<md-input [autoComplete]="autoComplete"></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('autocomplete')).toBeNull();

          fixture.componentInstance.autoComplete = 'on';
          fixture.detectChanges();
          expect(el.getAttribute('autocomplete')).toEqual('on');
        })();
      });
  });

  it('supports the autoComplete attribute as an unbound attribute', () => {
    var template = '<md-input autoComplete></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('autocomplete')).toEqual('');
        })();
      });
  });

  it('supports the autoComplete attribute as an unbound value attribute', () => {
    var template = '<md-input autoComplete="name"></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('autocomplete')).toEqual('name');
        })();
      });
  });

  it('supports the autoFocus attribute', () => {
    var template = '<md-input [autoFocus]="autoFocus"></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('autofocus')).toBeNull();

          fixture.componentInstance.autoFocus = true;
          fixture.detectChanges();
          expect(el.getAttribute('autofocus')).toEqual('');
        })();
      });
  });

  it('supports the autoFocus attribute as an unbound attribute', () => {
    var template = '<md-input autoFocus></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('autofocus')).toEqual('');
        })();
      });
  });

  it('supports the disabled attribute', () => {
    var template = '<md-input [disabled]="disabled"></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.componentInstance.disabled = false;
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('disabled')).toEqual(null);

          fixture.componentInstance.disabled = true;
          fixture.detectChanges();
          expect(el.getAttribute('disabled')).toEqual('');
        })();
      });
  });

  it('supports the disabled attribute as an unbound attribute', () => {
    var template = '<md-input disabled></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('disabled')).toEqual('');
        })();
      });
  });

  it('supports the list attribute', () => {
    var template = '<md-input [list]="list"></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.componentInstance.disabled = false;
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('list')).toEqual(null);

          fixture.componentInstance.list = 'datalist-id';
          fixture.detectChanges();
          expect(el.getAttribute('list')).toEqual('datalist-id');
        })();
      });
  });

  it('supports the max attribute', () => {
    var template = '<md-input [max]="max"></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.componentInstance.disabled = false;
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('max')).toEqual(null);

          fixture.componentInstance.max = 10;
          fixture.detectChanges();
          expect(el.getAttribute('max')).toEqual('10');

          fixture.componentInstance.max = '2000-01-02';
          fixture.detectChanges();
          expect(el.getAttribute('max')).toEqual('2000-01-02');
        })();
      });
  });

  it('supports the min attribute', () => {
    var template = '<md-input [min]="min"></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.componentInstance.disabled = false;
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('min')).toEqual(null);

          fixture.componentInstance.min = 10;
          fixture.detectChanges();
          expect(el.getAttribute('min')).toEqual('10');

          fixture.componentInstance.min = '2000-01-02';
          fixture.detectChanges();
          expect(el.getAttribute('min')).toEqual('2000-01-02');
        })();
      });
  });

  it('supports the readOnly attribute', () => {
    var template = '<md-input [readOnly]="readOnly"></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('readonly')).toBeNull();

          fixture.componentInstance.readOnly = true;
          fixture.detectChanges();
          expect(el.getAttribute('readonly')).toEqual('');
        })();
      });
  });

  it('supports the readOnly attribute as an unbound attribute', () => {
    var template = '<md-input readOnly></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('readonly')).toEqual('');
        })();
      });
  });

  it('supports the required attribute', () => {
    var template = '<md-input [required]="required"></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('required')).toBeNull();

          fixture.componentInstance.required = true;
          fixture.detectChanges();
          expect(el.getAttribute('required')).toEqual('');
        })();
      });
  });

  it('supports the required attribute as an unbound attribute', () => {
    var template = '<md-input required></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('required')).toEqual('');
        })();
      });
  });

  it('supports the spellCheck attribute', () => {
    var template = '<md-input [spellCheck]="spellCheck"></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('spellcheck')).toEqual('false');

          fixture.componentInstance.spellCheck = true;
          fixture.detectChanges();
          expect(el.getAttribute('spellcheck')).toEqual('true');
        })();
      });
  });

  it('supports the spellCheck attribute as an unbound attribute', () => {
    var template = '<md-input spellCheck></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('spellcheck')).toEqual('true');
        })();
      });
  });

  it('supports the step attribute', () => {
    var template = '<md-input [step]="step"></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('step')).toEqual(null);

          fixture.componentInstance.step = 0.5;
          fixture.detectChanges();
          expect(el.getAttribute('step')).toEqual('0.5');
        })();
      });
  });

  it('supports the tabIndex attribute', () => {
    var template = '<md-input [tabIndex]="tabIndex"></md-input>';

    return builder.overrideTemplate(MdInputOptionalAttributeController, template)
      .createAsync(MdInputOptionalAttributeController)
      .then(fixture => {
        fakeAsync(() => {
          fixture.detectChanges();

          let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(el).not.toBeNull();
          expect(el.getAttribute('tabindex')).toEqual(null);

          fixture.componentInstance.tabIndex = 1;
          fixture.detectChanges();
          expect(el.getAttribute('tabindex')).toEqual('1');
        })();
      });
  });

  it('supports a name attribute', () => {
    return builder.createAsync(MdInputWithNameTestController).then(fixture => {
      const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input'))
          .nativeElement;
      fixture.detectChanges();

      expect(inputElement.name).toBe('some-name');
    });
  });
});

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input type="number" [(ngModel)]="value">
    </md-input>
  `,
  directives: [MD_INPUT_DIRECTIVES]
})
class MdInputNumberTypeConservedTestComponent {
  value: number = 0;
}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input required placeholder="hello">
    </md-input>
  `,
  directives: [MD_INPUT_DIRECTIVES]
})
class MdInputPlaceholderRequiredTestComponent {
}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input>
      <md-placeholder>{{placeholder}}</md-placeholder>
    </md-input>
  `,
  directives: [MD_INPUT_DIRECTIVES]
})
class MdInputPlaceholderElementTestComponent {
  placeholder: string = 'Default Placeholder';
}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input [placeholder]="placeholder">
    </md-input>
  `,
  directives: [MD_INPUT_DIRECTIVES]
})
class MdInputPlaceholderAttrTestComponent {
  placeholder: string = '';
}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input>
      <md-hint>{{label}}</md-hint>
    </md-input>
  `,
  directives: [MD_INPUT_DIRECTIVES]
})
class MdInputHintLabel2TestController {
  label: string = '';
}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input [hintLabel]="label">
    </md-input>
  `,
  directives: [MD_INPUT_DIRECTIVES]
})
class MdInputHintLabelTestController {
  label: string = '';
}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input type="file">
    </md-input>
  `,
  directives: [MD_INPUT_DIRECTIVES]
})
class MdInputInvalidTypeTestController {
}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input placeholder="Hello">
      <md-placeholder>World</md-placeholder>
    </md-input>
  `,
  directives: [MD_INPUT_DIRECTIVES]
})
class MdInputInvalidPlaceholderTestController {
}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input hintLabel="Hello">
      <md-hint>World</md-hint>
    </md-input>
  `,
  directives: [MD_INPUT_DIRECTIVES]
})
class MdInputInvalidHint2TestController {
}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input>
      <md-hint>Hello</md-hint>
      <md-hint>World</md-hint>
    </md-input>
  `,
  directives: [MD_INPUT_DIRECTIVES]
})
class MdInputInvalidHintTestController {
}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input [(ngModel)]="model">
    </md-input>
  `,
  directives: [MdInput]
})
class MdInputBaseTestController {
  model: any = '';
}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input [aria-label]="ariaLabel" [aria-disabled]="ariaDisabled">
    </md-input>
  `,
  directives: [MdInput]
})
class MdInputAriaTestController {
  ariaLabel: string = 'label';
  ariaDisabled: boolean = true;
}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input (focus)="onFocus($event)" (blur)="onBlur($event)"></md-input>
  `,
  directives: [MdInput]
})
class MdInputWithBlurAndFocusEvents {
  onBlur(event: FocusEvent) {}
  onFocus(event: FocusEvent) {}
}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input></md-input>
  `,
  directives: [MdInput]
})
class MdInputOptionalAttributeController {}

@Component({
  selector: 'test-input-controller',
  template: `
    <md-input name="some-name"></md-input>
  `,
  directives: [MdInput]
})
class MdInputWithNameTestController {}
