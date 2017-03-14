import {TestBed, async, fakeAsync, tick, ComponentFixture} from '@angular/core/testing';
import {Component, OnDestroy, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdAutocompleteModule, MdAutocompleteTrigger} from './index';
import {OverlayContainer} from '../core/overlay/overlay-container';
import {MdInputModule} from '../input/index';
import {Dir, LayoutDirection} from '../core/rtl/dir';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {ENTER, DOWN_ARROW, SPACE, UP_ARROW} from '../core/keyboard/keycodes';
import {MdOption} from '../core/option/option';
import {ViewportRuler} from '../core/overlay/position/viewport-ruler';
import {FakeViewportRuler} from '../core/overlay/position/fake-viewport-ruler';
import {MdAutocomplete} from './autocomplete';
import {MdInputContainer} from '../input/input-container';
import {Observable} from 'rxjs/Observable';
import {dispatchFakeEvent} from '../core/testing/dispatch-events';
import {typeInElement} from '../core/testing/type-in-element';

import 'rxjs/add/operator/map';

describe('MdAutocomplete', () => {
  let overlayContainerElement: HTMLElement;
  let dir: LayoutDirection;

  beforeEach(async(() => {
    dir = 'ltr';
    TestBed.configureTestingModule({
      imports: [
          MdAutocompleteModule.forRoot(), MdInputModule.forRoot(), FormsModule, ReactiveFormsModule
      ],
      declarations: [
        SimpleAutocomplete,
        AutocompleteWithoutForms,
        NgIfAutocomplete,
        AutocompleteWithNgModel
      ],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          document.body.appendChild(overlayContainerElement);

          // remove body padding to keep consistent cross-browser
          document.body.style.padding = '0';
          document.body.style.margin = '0';

          return {getContainerElement: () => overlayContainerElement};
        }},
        {provide: Dir, useFactory: () => {
          return {value: dir};
        }},
        {provide: ViewportRuler, useClass: FakeViewportRuler}
      ]
    });

    TestBed.compileComponents();
  }));

  describe('panel toggling', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    it('should open the panel when the input is focused', async(() => {
      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(false, `Expected panel state to start out closed.`);

      dispatchFakeEvent(input, 'focus');
      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen)
            .toBe(true, `Expected panel state to read open when input is focused.`);
        expect(overlayContainerElement.textContent)
            .toContain('Alabama', `Expected panel to display when input is focused.`);
        expect(overlayContainerElement.textContent)
            .toContain('California', `Expected panel to display when input is focused.`);
      });
    }));

    it('should open the panel programmatically', async(() => {
      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(false, `Expected panel state to start out closed.`);

      fixture.componentInstance.trigger.openPanel();
      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen)
            .toBe(true, `Expected panel state to read open when opened programmatically.`);
        expect(overlayContainerElement.textContent)
            .toContain('Alabama', `Expected panel to display when opened programmatically.`);
        expect(overlayContainerElement.textContent)
            .toContain('California', `Expected panel to display when opened programmatically.`);
      });
    }));

    it('should close the panel when blurred', async(() => {
      dispatchFakeEvent(input, 'focus');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        dispatchFakeEvent(input, 'blur');
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen)
            .toBe(false, `Expected clicking outside the panel to set its state to closed.`);
        expect(overlayContainerElement.textContent)
            .toEqual('', `Expected clicking outside the panel to close the panel.`);
      });
    }));

    it('should close the panel when an option is clicked', async(() => {
      dispatchFakeEvent(input, 'focus');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const option = overlayContainerElement.querySelector('md-option') as HTMLElement;
        option.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen)
            .toBe(false, `Expected clicking an option to set the panel state to closed.`);
        expect(overlayContainerElement.textContent)
            .toEqual('', `Expected clicking an option to close the panel.`);
      });
    }));

    it('should close the panel when a newly created option is clicked', async(() => {
      dispatchFakeEvent(input, 'focus');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        // Filter down the option list to a subset of original options ('Alabama', 'California')
        typeInElement('al', input);
        fixture.detectChanges();

        let options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
        options[0].click();

        // Changing value from 'Alabama' to 'al' to re-populate the option list,
        // ensuring that 'California' is created new.
        typeInElement('al', input);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          options =
              overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
          options[1].click();
          fixture.detectChanges();

          expect(fixture.componentInstance.trigger.panelOpen)
              .toBe(false, `Expected clicking a new option to set the panel state to closed.`);
          expect(overlayContainerElement.textContent)
              .toEqual('', `Expected clicking a new option to close the panel.`);
        });
      });
    }));

    it('should close the panel programmatically', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(false, `Expected closing programmatically to set the panel state to closed.`);
      expect(overlayContainerElement.textContent)
          .toEqual('', `Expected closing programmatically to close the panel.`);
    });

    it('should hide the panel when the options list is empty', async(() => {
      dispatchFakeEvent(input, 'focus');

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        const panel =
            overlayContainerElement.querySelector('.mat-autocomplete-panel') as HTMLElement;
        expect(panel.classList)
            .toContain('mat-autocomplete-visible', `Expected panel to start out visible.`);

        // Filter down the option list such that no options match the value
        typeInElement('af', input);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(panel.classList)
              .toContain('mat-autocomplete-hidden', `Expected panel to hide itself when empty.`);
        });
      });
    }));

    it('should keep the label floating until the panel closes', async(() => {
      fixture.componentInstance.trigger.openPanel();
      expect(fixture.componentInstance.inputContainer.floatPlaceholder)
          .toEqual('always', 'Expected placeholder to float as soon as panel opens.');

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        const options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
        options[1].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.inputContainer.floatPlaceholder)
            .toEqual('auto', 'Expected placeholder to return to auto state after panel closes.');
      });
    }));

    it('should not open the panel when the `input` event is invoked on a non-focused input', () => {
      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(false, `Expected panel state to start out closed.`);

      input.value = 'Alabama';
      dispatchFakeEvent(input, 'input');
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(false, `Expected panel state to stay closed.`);
    });

   it('should not mess with placeholder placement if set to never', async(() => {
      fixture.componentInstance.placeholder = 'never';
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      expect(fixture.componentInstance.inputContainer.floatPlaceholder)
          .toEqual('never', 'Expected placeholder to stay static.');

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        const options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
        options[1].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.inputContainer.floatPlaceholder)
            .toEqual('never', 'Expected placeholder to stay in static state after close.');
      });
    }));

    it('should not mess with placeholder placement if set to always', async(() => {
      fixture.componentInstance.placeholder = 'always';
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      expect(fixture.componentInstance.inputContainer.floatPlaceholder)
          .toEqual('always', 'Expected placeholder to stay elevated on open.');

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        const options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
        options[1].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.inputContainer.floatPlaceholder)
            .toEqual('always', 'Expected placeholder to stay elevated after close.');
      });
    }));

  });

  it('should have the correct text direction in RTL', () => {
    dir = 'rtl';

    const rtlFixture = TestBed.createComponent(SimpleAutocomplete);
    rtlFixture.detectChanges();

    rtlFixture.componentInstance.trigger.openPanel();
    rtlFixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane');
    expect(overlayPane.getAttribute('dir')).toEqual('rtl');

  });

  describe('forms integration', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    it('should update control value as user types with input value', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      typeInElement('a', input);
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.value)
          .toEqual('a', 'Expected control value to be updated as user types.');

      typeInElement('al', input);
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.value)
          .toEqual('al', 'Expected control value to be updated as user types.');
    });

    it('should update control value when option is selected with option value', async(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
        options[1].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.stateCtrl.value)
            .toEqual({code: 'CA', name: 'California'},
                'Expected control value to equal the selected option value.');
      });
    }));

    it('should update control back to string if user types after option is selected', async(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
        options[1].click();
        fixture.detectChanges();

        typeInElement('Californi', input);
        fixture.detectChanges();

        expect(fixture.componentInstance.stateCtrl.value)
            .toEqual('Californi', 'Expected control value to revert back to string.');
      });
    }));

    it('should fill the text field with display value when an option is selected', async(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
        options[1].click();
        fixture.detectChanges();

        expect(input.value)
            .toContain('California', `Expected text field to fill with selected value.`);
      });
    }));

    it('should fill the text field with value if displayWith is not set', async(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.componentInstance.panel.displayWith = null;
        fixture.componentInstance.options.toArray()[1].value = 'test value';
        fixture.detectChanges();

        const options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
        options[1].click();

        fixture.detectChanges();
        expect(input.value)
            .toContain('test value', `Expected input to fall back to selected option's value.`);
        });
    }));

    it('should fill the text field correctly if value is set to obj programmatically', async(() => {
      fixture.whenStable().then(() => {
        fixture.componentInstance.stateCtrl.setValue({code: 'AL', name: 'Alabama'});
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(input.value)
              .toContain('Alabama', `Expected input to fill with matching option's viewValue.`);
        });
      });
    }));

    it('should clear the text field if value is reset programmatically', async(() => {
      typeInElement('Alabama', input);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.componentInstance.stateCtrl.reset();

        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(input.value).toEqual('', `Expected input value to be empty after reset.`);
        });
      });
    }));

    it('should disable input in view when disabled programmatically', () => {
      const inputUnderline =
          fixture.debugElement.query(By.css('.mat-input-underline')).nativeElement;

      expect(input.disabled)
          .toBe(false, `Expected input to start out enabled in view.`);
      expect(inputUnderline.classList.contains('mat-disabled'))
          .toBe(false, `Expected input underline to start out with normal styles.`);

      fixture.componentInstance.stateCtrl.disable();
      fixture.detectChanges();

      expect(input.disabled)
          .toBe(true, `Expected input to be disabled in view when disabled programmatically.`);
      expect(inputUnderline.classList.contains('mat-disabled'))
          .toBe(true, `Expected input underline to display disabled styles.`);
    });


    it('should mark the autocomplete control as dirty as user types', () => {
      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(false, `Expected control to start out pristine.`);

      typeInElement('a', input);
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(true, `Expected control to become dirty when the user types into the input.`);
    });

    it('should mark the autocomplete control as dirty when an option is selected', async(() => {
      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(false, `Expected control to start out pristine.`);

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
        options[1].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.stateCtrl.dirty)
            .toBe(true, `Expected control to become dirty when an option was selected.`);
      });
    }));

    it('should not mark the control dirty when the value is set programmatically', () => {
      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(false, `Expected control to start out pristine.`);

      fixture.componentInstance.stateCtrl.setValue('AL');
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(false, `Expected control to stay pristine if value is set programmatically.`);
    });

    it('should mark the autocomplete control as touched on blur', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      expect(fixture.componentInstance.stateCtrl.touched)
          .toBe(false, `Expected control to start out untouched.`);

      dispatchFakeEvent(input, 'blur');
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.touched)
          .toBe(true, `Expected control to become touched on blur.`);
    });

  });

  describe('keyboard events', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;
    let DOWN_ARROW_EVENT: KeyboardEvent;
    let ENTER_EVENT: KeyboardEvent;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input')).nativeElement;
      DOWN_ARROW_EVENT = new MockKeyboardEvent(DOWN_ARROW) as KeyboardEvent;
      ENTER_EVENT = new MockKeyboardEvent(ENTER) as KeyboardEvent;

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
    });

    it('should not focus the option when DOWN key is pressed', async(() => {
      fixture.whenStable().then(() => {
        spyOn(fixture.componentInstance.options.first, 'focus');

        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        expect(fixture.componentInstance.options.first.focus).not.toHaveBeenCalled();
      });
    }));

    it('should not close the panel when DOWN key is pressed', async(() => {
      fixture.whenStable().then(() => {
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(true, `Expected panel state to stay open when DOWN key is pressed.`);
      expect(overlayContainerElement.textContent)
          .toContain('Alabama', `Expected panel to keep displaying when DOWN key is pressed.`);
      expect(overlayContainerElement.textContent)
          .toContain('California', `Expected panel to keep displaying when DOWN key is pressed.`);
      });
    }));

    it('should set the active item to the first option when DOWN key is pressed', fakeAsync(() => {
      tick();
      const optionEls =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.activeOption)
          .toBe(fixture.componentInstance.options.first, 'Expected first option to be active.');
      expect(optionEls[0].classList).toContain('mat-active');
      expect(optionEls[1].classList).not.toContain('mat-active');

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.activeOption)
          .toBe(fixture.componentInstance.options.toArray()[1],
              'Expected second option to be active.');
      expect(optionEls[0].classList).not.toContain('mat-active');
      expect(optionEls[1].classList).toContain('mat-active');
    }));

    it('should set the active item to the last option when UP key is pressed', fakeAsync(() => {
      tick();
      const optionEls =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;

      const UP_ARROW_EVENT = new MockKeyboardEvent(UP_ARROW) as KeyboardEvent;
      fixture.componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);
      tick();
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.activeOption)
          .toBe(fixture.componentInstance.options.last, 'Expected last option to be active.');
      expect(optionEls[10].classList).toContain('mat-active');
      expect(optionEls[0].classList).not.toContain('mat-active');

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.activeOption)
          .toBe(fixture.componentInstance.options.first,
              'Expected first option to be active.');
      expect(optionEls[0].classList).toContain('mat-active');
    }));

    it('should set the active item properly after filtering', fakeAsync(() => {
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();

      typeInElement('o', input);
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();

      const optionEls =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;

      expect(fixture.componentInstance.trigger.activeOption)
          .toBe(fixture.componentInstance.options.first,
              'Expected first option to be active.');
      expect(optionEls[0].classList).toContain('mat-active');
      expect(optionEls[1].classList).not.toContain('mat-active');
    }));

    it('should fill the text field when an option is selected with ENTER', async(() => {
      fixture.whenStable().then(() => {
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);
          fixture.detectChanges();
          expect(input.value)
              .toContain('Alabama', `Expected text field to fill with selected value on ENTER.`);
        });
      });
    }));

    it('should fill the text field, not select an option, when SPACE is entered', async(() => {
      fixture.whenStable().then(() => {
        typeInElement('New', input);
        fixture.detectChanges();

        const SPACE_EVENT = new MockKeyboardEvent(SPACE) as KeyboardEvent;
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          fixture.componentInstance.trigger._handleKeydown(SPACE_EVENT);
          fixture.detectChanges();

          expect(input.value)
              .not.toContain('New York', `Expected option not to be selected on SPACE.`);
        });
      });
    }));

    it('should mark the control dirty when selecting an option from the keyboard', async(() => {
      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.stateCtrl.dirty)
            .toBe(false, `Expected control to start out pristine.`);

        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        fixture.whenStable().then(() => {
          fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);
          fixture.detectChanges();

          expect(fixture.componentInstance.stateCtrl.dirty)
              .toBe(true, `Expected control to become dirty when option was selected by ENTER.`);
        });
      });
    }));

    it('should open the panel again when typing after making a selection', async(() => {
      fixture.whenStable().then(() => {
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        fixture.whenStable().then(() => {
          fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);
          fixture.detectChanges();

          expect(fixture.componentInstance.trigger.panelOpen)
              .toBe(false, `Expected panel state to read closed after ENTER key.`);
          expect(overlayContainerElement.textContent)
              .toEqual('', `Expected panel to close after ENTER key.`);

          typeInElement('Alabama', input);
          fixture.detectChanges();

          expect(fixture.componentInstance.trigger.panelOpen)
              .toBe(true, `Expected panel state to read open when typing in input.`);
          expect(overlayContainerElement.textContent)
              .toContain('Alabama', `Expected panel to display when typing in input.`);
          });
        });
    }));

    it('should scroll to active options below the fold', fakeAsync(() => {
      tick();
      const scrollContainer =
          document.querySelector('.cdk-overlay-pane .mat-autocomplete-panel');

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();
      expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to scroll.`);

      // These down arrows will set the 6th option active, below the fold.
      [1, 2, 3, 4, 5].forEach(() => {
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        tick();
      });

      // Expect option bottom minus the panel height (288 - 256 = 32)
      expect(scrollContainer.scrollTop)
          .toEqual(32, `Expected panel to reveal the sixth option.`);
    }));

    it('should scroll to active options on UP arrow', fakeAsync(() => {
      tick();
      const scrollContainer =
          document.querySelector('.cdk-overlay-pane .mat-autocomplete-panel');

      const UP_ARROW_EVENT = new MockKeyboardEvent(UP_ARROW) as KeyboardEvent;
      fixture.componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);
      tick();
      fixture.detectChanges();

      // Expect option bottom minus the panel height (528 - 256 = 272)
      expect(scrollContainer.scrollTop).toEqual(272, `Expected panel to reveal last option.`);
    }));

  });

  describe('aria', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    it('should set role of input to combobox', () => {
      expect(input.getAttribute('role'))
          .toEqual('combobox', 'Expected role of input to be combobox.');
    });

    it('should set role of autocomplete panel to listbox', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panel = fixture.debugElement.query(By.css('.mat-autocomplete-panel')).nativeElement;

      expect(panel.getAttribute('role'))
          .toEqual('listbox', 'Expected role of the panel to be listbox.');
    });

    it('should set aria-autocomplete to list', () => {
      expect(input.getAttribute('aria-autocomplete'))
          .toEqual('list', 'Expected aria-autocomplete attribute to equal list.');
    });

    it('should set aria-multiline to false', () => {
      expect(input.getAttribute('aria-multiline'))
          .toEqual('false', 'Expected aria-multiline attribute to equal false.');
    });

    it('should set aria-activedescendant based on the active option', async(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(input.hasAttribute('aria-activedescendant'))
            .toBe(false, 'Expected aria-activedescendant to be absent if no active item.');

        const DOWN_ARROW_EVENT = new MockKeyboardEvent(DOWN_ARROW) as KeyboardEvent;
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);

        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(input.getAttribute('aria-activedescendant'))
              .toEqual(fixture.componentInstance.options.first.id,
                  'Expected aria-activedescendant to match the active item after 1 down arrow.');

          fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
          fixture.whenStable().then(() => {
            fixture.detectChanges();

            expect(input.getAttribute('aria-activedescendant'))
                .toEqual(fixture.componentInstance.options.toArray()[1].id,
                    'Expected aria-activedescendant to match the active item after 2 down arrows.');
          });
        });

      });
    }));

    it('should set aria-expanded based on whether the panel is open', async(() => {
      expect(input.getAttribute('aria-expanded'))
          .toBe('false', 'Expected aria-expanded to be false while panel is closed.');

      fixture.componentInstance.trigger.openPanel();
      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(input.getAttribute('aria-expanded'))
            .toBe('true', 'Expected aria-expanded to be true while panel is open.');

        fixture.componentInstance.trigger.closePanel();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(input.getAttribute('aria-expanded'))
              .toBe('false', 'Expected aria-expanded to be false when panel closes again.');
        });
      });
    }));

    it('should set aria-expanded properly when the panel is hidden', async(() => {
        fixture.componentInstance.trigger.openPanel();

        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(input.getAttribute('aria-expanded'))
              .toBe('true', 'Expected aria-expanded to be true while panel is open.');

          typeInElement('zz', input);
          fixture.whenStable().then(() => {
            fixture.detectChanges();

            fixture.whenStable().then(() => {
              fixture.detectChanges();
              expect(input.getAttribute('aria-expanded'))
                  .toBe('false', 'Expected aria-expanded to be false when panel hides itself.');
            });
          });
        });
    }));

    it('should set aria-owns based on the attached autocomplete', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panel = fixture.debugElement.query(By.css('.mat-autocomplete-panel')).nativeElement;

      expect(input.getAttribute('aria-owns'))
          .toEqual(panel.getAttribute('id'), 'Expected aria-owns to match attached autocomplete.');

    });

  });

  describe('Fallback positions', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    it('should use below positioning by default', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const inputBottom = input.getBoundingClientRect().bottom;
      const panel = overlayContainerElement.querySelector('.mat-autocomplete-panel');
      const panelTop = panel.getBoundingClientRect().top;

      // Panel is offset by 6px in styles so that the underline has room to display.
      expect((inputBottom + 6).toFixed(1))
          .toEqual(panelTop.toFixed(1), `Expected panel top to match input bottom by default.`);
      expect(fixture.componentInstance.trigger.autocomplete.positionY)
          .toEqual('below', `Expected autocomplete positionY to default to below.`);
    });

    it('should fall back to above position if panel cannot fit below', () => {
      // Push the autocomplete trigger down so it won't have room to open "below"
      input.style.top = '600px';
      input.style.position = 'relative';

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const inputTop = input.getBoundingClientRect().top;
      const panel = overlayContainerElement.querySelector('.mat-autocomplete-panel');
      const panelBottom = panel.getBoundingClientRect().bottom;

      // Panel is offset by 24px in styles so that the label has room to display.
      expect((inputTop - 24).toFixed(1))
          .toEqual(panelBottom.toFixed(1), `Expected panel to fall back to above position.`);
      expect(fixture.componentInstance.trigger.autocomplete.positionY)
          .toEqual('above', `Expected autocomplete positionY to be "above" if panel won't fit.`);
    });

    it('should align panel properly when filtering in "above" position', async(() => {
      // Push the autocomplete trigger down so it won't have room to open "below"
      input.style.top = '600px';
      input.style.position = 'relative';

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        typeInElement('f', input);
        fixture.detectChanges();

        const inputTop = input.getBoundingClientRect().top;
        const panel = overlayContainerElement.querySelector('.mat-autocomplete-panel');
        const panelBottom = panel.getBoundingClientRect().bottom;

        // Panel is offset by 24px in styles so that the label has room to display.
        expect((inputTop - 24).toFixed(1))
            .toEqual(panelBottom.toFixed(1), `Expected panel to stay aligned after filtering.`);
        expect(fixture.componentInstance.trigger.autocomplete.positionY)
            .toEqual('above', `Expected autocomplete positionY to be "above" if panel won't fit.`);
      });
    }));

  });

  describe('misc', () => {

    it('should allow basic use without any forms directives', () => {
      expect(() => {
        const fixture = TestBed.createComponent(AutocompleteWithoutForms);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        typeInElement('d', input);
        fixture.detectChanges();

        const options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
        expect(options.length).toBe(1);
      }).not.toThrowError();
    });

    it('should display an empty input when the value is undefined with ngModel', async(() => {
      const fixture = TestBed.createComponent(AutocompleteWithNgModel);

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const input = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(input.value).toBe('');
      });
    }));

    it('should work when input is wrapped in ngIf', async(() => {
      const fixture = TestBed.createComponent(NgIfAutocomplete);
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input')).nativeElement;
      dispatchFakeEvent(input, 'focus');

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen)
            .toBe(true, `Expected panel state to read open when input is focused.`);
        expect(overlayContainerElement.textContent)
            .toContain('One', `Expected panel to display when input is focused.`);
        expect(overlayContainerElement.textContent)
            .toContain('Two', `Expected panel to display when input is focused.`);
      });
    }));

    it('should filter properly with ngIf after setting the active item', fakeAsync(() => {
      const fixture = TestBed.createComponent(NgIfAutocomplete);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      tick();
      fixture.detectChanges();

      const DOWN_ARROW_EVENT = new MockKeyboardEvent(DOWN_ARROW) as KeyboardEvent;
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input')).nativeElement;
      typeInElement('o', input);
      fixture.detectChanges();

      expect(fixture.componentInstance.mdOptions.length).toBe(2);
    }));

  });

  it('should have correct width when opened', () => {
    const widthFixture = TestBed.createComponent(SimpleAutocomplete);
    widthFixture.componentInstance.width = 300;
    widthFixture.detectChanges();

    widthFixture.componentInstance.trigger.openPanel();
    widthFixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
    // Firefox, edge return a decimal value for width, so we need to parse and round it to verify
    expect(Math.ceil(parseFloat(overlayPane.style.width))).toEqual(300);

    widthFixture.componentInstance.trigger.closePanel();
    widthFixture.detectChanges();

    widthFixture.componentInstance.width = 500;
    widthFixture.detectChanges();

    widthFixture.componentInstance.trigger.openPanel();
    widthFixture.detectChanges();

    // Firefox, edge return a decimal value for width, so we need to parse and round it to verify
    expect(Math.ceil(parseFloat(overlayPane.style.width))).toEqual(500);

  });
});

@Component({
  template: `
    <md-input-container [floatPlaceholder]="placeholder" [style.width.px]="width">
      <input mdInput placeholder="State" [mdAutocomplete]="auto" [formControl]="stateCtrl">
    </md-input-container>

    <md-autocomplete #auto="mdAutocomplete" [displayWith]="displayFn">
      <md-option *ngFor="let state of filteredStates" [value]="state">
        <span> {{ state.code }}: {{ state.name }}  </span>
      </md-option>
    </md-autocomplete>
  `
})
class SimpleAutocomplete implements OnDestroy {
  stateCtrl = new FormControl();
  filteredStates: any[];
  valueSub: Subscription;
  placeholder = 'auto';
  width: number;

  @ViewChild(MdAutocompleteTrigger) trigger: MdAutocompleteTrigger;
  @ViewChild(MdAutocomplete) panel: MdAutocomplete;
  @ViewChild(MdInputContainer) inputContainer: MdInputContainer;
  @ViewChildren(MdOption) options: QueryList<MdOption>;

  states = [
    {code: 'AL', name: 'Alabama'},
    {code: 'CA', name: 'California'},
    {code: 'FL', name: 'Florida'},
    {code: 'KS', name: 'Kansas'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'NY', name: 'New York'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WY', name: 'Wyoming'},
  ];


  constructor() {
    this.filteredStates = this.states;
    this.valueSub = this.stateCtrl.valueChanges.subscribe(val => {
      this.filteredStates = val ? this.states.filter((s) => s.name.match(new RegExp(val, 'gi')))
                                : this.states;
    });
  }

  displayFn(value: any): string {
    return value ? value.name : value;
  }

  ngOnDestroy() {
    this.valueSub.unsubscribe();
  }

}

@Component({
  template: `
    <md-input-container *ngIf="isVisible">
      <input mdInput placeholder="Choose" [mdAutocomplete]="auto" [formControl]="optionCtrl">
    </md-input-container>

    <md-autocomplete #auto="mdAutocomplete">
      <md-option *ngFor="let option of filteredOptions | async" [value]="option">
         {{option}}
      </md-option>
    </md-autocomplete>
  `
})
class NgIfAutocomplete {
  optionCtrl = new FormControl();
  filteredOptions: Observable<any>;
  isVisible = true;
  options = ['One', 'Two', 'Three'];

  @ViewChild(MdAutocompleteTrigger) trigger: MdAutocompleteTrigger;
  @ViewChildren(MdOption) mdOptions: QueryList<MdOption>;

  constructor() {
    this.filteredOptions = this.optionCtrl.valueChanges.startWith(null).map((val) => {
      return val ? this.options.filter(option => new RegExp(val, 'gi').test(option))
                 : this.options.slice();
    });
  }
}


@Component({
  template: `
    <md-input-container>
      <input mdInput placeholder="State" [mdAutocomplete]="auto"
      (input)="onInput($event.target?.value)">
    </md-input-container>

    <md-autocomplete #auto="mdAutocomplete">
      <md-option *ngFor="let state of filteredStates" [value]="state">
        <span> {{ state }}  </span>
      </md-option>
    </md-autocomplete>
  `
})
class AutocompleteWithoutForms {
  filteredStates: any[];
  states = ['Alabama', 'California', 'Florida'];

  constructor() {
    this.filteredStates = this.states.slice();
  }

  onInput(value: any) {
    this.filteredStates = this.states.filter(s => new RegExp(value, 'gi').test(s));
  }

}


@Component({
  template: `
    <md-input-container>
      <input mdInput placeholder="State" [mdAutocomplete]="auto" [(ngModel)]="selectedState"
      (ngModelChange)="onInput($event)">
    </md-input-container>

    <md-autocomplete #auto="mdAutocomplete">
      <md-option *ngFor="let state of filteredStates" [value]="state">
        <span>{{ state }}</span>
      </md-option>
    </md-autocomplete>
  `
})
class AutocompleteWithNgModel {
  filteredStates: any[];
  selectedState: string;
  states = ['New York', 'Washington', 'Oregon'];

  constructor() {
    this.filteredStates = this.states.slice();
  }

  onInput(value: any) {
    this.filteredStates = this.states.filter(s => new RegExp(value, 'gi').test(s));
  }

}

/** This is a mock keyboard event to test keyboard events in the autocomplete. */
class MockKeyboardEvent {
  constructor(public keyCode: number) {}
  preventDefault() {}
}
