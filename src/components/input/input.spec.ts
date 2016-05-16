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


export function main() {
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
  });
}

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
