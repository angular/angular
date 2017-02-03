import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {Component, OnDestroy, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdAutocompleteModule, MdAutocompleteTrigger} from './index';
import {OverlayContainer} from '../core/overlay/overlay-container';
import {MdInputModule} from '../input/index';
import {Dir, LayoutDirection} from '../core/rtl/dir';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {ENTER, DOWN_ARROW, SPACE, UP_ARROW} from '../core/keyboard/keycodes';
import {MdOption} from '../core/option/option';
import {ViewportRuler} from '../core/overlay/position/viewport-ruler';
import {FakeViewportRuler} from '../core/overlay/position/fake-viewport-ruler';
import {MdAutocomplete} from './autocomplete';
import {MdInputContainer} from '../input/input-container';

describe('MdAutocomplete', () => {
  let overlayContainerElement: HTMLElement;
  let dir: LayoutDirection;

  beforeEach(async(() => {
    dir = 'ltr';
    TestBed.configureTestingModule({
      imports: [
          MdAutocompleteModule.forRoot(), MdInputModule.forRoot(), ReactiveFormsModule
      ],
      declarations: [SimpleAutocomplete],
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

    it('should open the panel when the input is focused', () => {
      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(false, `Expected panel state to start out closed.`);

      dispatchEvent('focus', input);
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(true, `Expected panel state to read open when input is focused.`);
      expect(overlayContainerElement.textContent)
          .toContain('Alabama', `Expected panel to display when input is focused.`);
      expect(overlayContainerElement.textContent)
          .toContain('California', `Expected panel to display when input is focused.`);
    });

    it('should open the panel programmatically', () => {
      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(false, `Expected panel state to start out closed.`);

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(true, `Expected panel state to read open when opened programmatically.`);
      expect(overlayContainerElement.textContent)
          .toContain('Alabama', `Expected panel to display when opened programmatically.`);
      expect(overlayContainerElement.textContent)
          .toContain('California', `Expected panel to display when opened programmatically.`);
    });

    it('should close the panel when blurred', async(() => {
      dispatchEvent('focus', input);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        dispatchEvent('blur', input);
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen)
            .toBe(false, `Expected clicking outside the panel to set its state to closed.`);
        expect(overlayContainerElement.textContent)
            .toEqual('', `Expected clicking outside the panel to close the panel.`);
      });
    }));

    it('should close the panel when an option is clicked', async(() => {
      dispatchEvent('focus', input);
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
      dispatchEvent('focus', input);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        // Filter down the option list to a subset of original options ('Alabama', 'California')
        input.value = 'al';
        dispatchEvent('input', input);
        fixture.detectChanges();

        let options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
        options[0].click();

        // Changing value from 'Alabama' to 'al' to re-populate the option list,
        // ensuring that 'California' is created new.
        input.value = 'al';
        dispatchEvent('input', input);
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

    it('should close the panel when the options list is empty', async(() => {
      dispatchEvent('focus', input);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        // Filter down the option list such that no options match the value
        input.value = 'af';
        dispatchEvent('input', input);
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen)
            .toBe(false, `Expected panel to close when options list is empty.`);
        expect(overlayContainerElement.textContent)
            .toEqual('', `Expected panel to close when options list is empty.`);
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

      input.value = 'a';
      dispatchEvent('input', input);
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.value)
          .toEqual('a', 'Expected control value to be updated as user types.');

      input.value = 'al';
      dispatchEvent('input', input);
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

        input.value = 'Californi';
        dispatchEvent('input', input);
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
      input.value = 'Alabama';
      dispatchEvent('input', input);
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
          fixture.debugElement.query(By.css('.md-input-underline')).nativeElement;

      expect(input.disabled)
          .toBe(false, `Expected input to start out enabled in view.`);
      expect(inputUnderline.classList.contains('md-disabled'))
          .toBe(false, `Expected input underline to start out with normal styles.`);

      fixture.componentInstance.stateCtrl.disable();
      fixture.detectChanges();

      expect(input.disabled)
          .toBe(true, `Expected input to be disabled in view when disabled programmatically.`);
      expect(inputUnderline.classList.contains('md-disabled'))
          .toBe(true, `Expected input underline to display disabled styles.`);
    });


    it('should mark the autocomplete control as dirty as user types', () => {
      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(false, `Expected control to start out pristine.`);

      input.value = 'a';
      dispatchEvent('input', input);
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

      dispatchEvent('blur', input);
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
      DOWN_ARROW_EVENT = new FakeKeyboardEvent(DOWN_ARROW) as KeyboardEvent;
      ENTER_EVENT = new FakeKeyboardEvent(ENTER) as KeyboardEvent;

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

    it('should set the active item to the first option when DOWN key is pressed', async(() => {
      fixture.whenStable().then(() => {
        const optionEls =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;

        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);

        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(fixture.componentInstance.trigger.activeOption)
              .toBe(fixture.componentInstance.options.first, 'Expected first option to be active.');
          expect(optionEls[0].classList).toContain('md-active');
          expect(optionEls[1].classList).not.toContain('md-active');

          fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);

          fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(fixture.componentInstance.trigger.activeOption)
                .toBe(fixture.componentInstance.options.toArray()[1],
                    'Expected second option to be active.');
            expect(optionEls[0].classList).not.toContain('md-active');
            expect(optionEls[1].classList).toContain('md-active');
          });
        });
      });
    }));

    it('should set the active item to the last option when UP key is pressed', async(() => {
      fixture.whenStable().then(() => {
        const optionEls =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;

        const UP_ARROW_EVENT = new FakeKeyboardEvent(UP_ARROW) as KeyboardEvent;
        fixture.componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);

        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(fixture.componentInstance.trigger.activeOption)
              .toBe(fixture.componentInstance.options.last, 'Expected last option to be active.');
          expect(optionEls[10].classList).toContain('md-active');
          expect(optionEls[0].classList).not.toContain('md-active');

          fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);

          fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(fixture.componentInstance.trigger.activeOption)
                .toBe(fixture.componentInstance.options.first,
                    'Expected first option to be active.');
            expect(optionEls[0].classList).toContain('md-active');
            expect(optionEls[10].classList).not.toContain('md-active');
          });
        });
      });
    }));

    it('should set the active item properly after filtering', async(() => {
      fixture.whenStable().then(() => {
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          input.value = 'o';
          dispatchEvent('input', input);
          fixture.detectChanges();

          fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);

          fixture.whenStable().then(() => {
            fixture.detectChanges();
            const optionEls =
                overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;

            expect(fixture.componentInstance.trigger.activeOption)
                .toBe(fixture.componentInstance.options.first,
                    'Expected first option to be active.');
            expect(optionEls[0].classList).toContain('md-active');
            expect(optionEls[1].classList).not.toContain('md-active');
          });
        });
      });
    }));

    it('should fill the text field when an option is selected with ENTER', async(() => {
      fixture.whenStable().then(() => {
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);

        fixture.detectChanges();
        expect(input.value)
            .toContain('Alabama', `Expected text field to fill with selected value on ENTER.`);
      });
    }));

    it('should fill the text field, not select an option, when SPACE is entered', async(() => {
      fixture.whenStable().then(() => {
        input.value = 'New';
        dispatchEvent('input', input);
        fixture.detectChanges();

        const SPACE_EVENT = new FakeKeyboardEvent(SPACE) as KeyboardEvent;
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        fixture.componentInstance.trigger._handleKeydown(SPACE_EVENT);
        fixture.detectChanges();

        expect(input.value)
            .not.toContain('New York', `Expected option not to be selected on SPACE.`);
      });
    }));

    it('should mark the control dirty when selecting an option from the keyboard', async(() => {
      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.stateCtrl.dirty)
            .toBe(false, `Expected control to start out pristine.`);

        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);
        fixture.detectChanges();

        expect(fixture.componentInstance.stateCtrl.dirty)
            .toBe(true, `Expected control to become dirty when option was selected by ENTER.`);
      });
    }));

    it('should open the panel again when typing after making a selection', async(() => {
      fixture.whenStable().then(() => {
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen)
            .toBe(false, `Expected panel state to read closed after ENTER key.`);
        expect(overlayContainerElement.textContent)
            .toEqual('', `Expected panel to close after ENTER key.`);

        input.value = 'Alabam';
        dispatchEvent('input', input);
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen)
            .toBe(true, `Expected panel state to read open when typing in input.`);
        expect(overlayContainerElement.textContent)
            .toContain('Alabama', `Expected panel to display when typing in input.`);
        });
    }));

    it('should scroll to active options below the fold', async(() => {
      fixture.whenStable().then(() => {
        const scrollContainer = document.querySelector('.cdk-overlay-pane .md-autocomplete-panel');

        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        fixture.detectChanges();
        expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to scroll.`);

        // These down arrows will set the 6th option active, below the fold.
        [1, 2, 3, 4, 5].forEach(() => {
          fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        });
        fixture.detectChanges();

        // Expect option bottom minus the panel height (288 - 256 = 32)
        expect(scrollContainer.scrollTop).toEqual(32, `Expected panel to reveal the sixth option.`);
      });

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

      const panel = fixture.debugElement.query(By.css('.md-autocomplete-panel')).nativeElement;

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

        const DOWN_ARROW_EVENT = new FakeKeyboardEvent(DOWN_ARROW) as KeyboardEvent;
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        fixture.detectChanges();

        expect(input.getAttribute('aria-activedescendant'))
            .toEqual(fixture.componentInstance.options.first.id,
                'Expected aria-activedescendant to match the active item after 1 down arrow.');

        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        fixture.detectChanges();

        expect(input.getAttribute('aria-activedescendant'))
            .toEqual(fixture.componentInstance.options.toArray()[1].id,
                'Expected aria-activedescendant to match the active item after 2 down arrows.');
      });
    }));

    it('should set aria-expanded based on whether the panel is open', async(() => {
      expect(input.getAttribute('aria-expanded'))
          .toBe('false', 'Expected aria-expanded to be false while panel is closed.');

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      expect(input.getAttribute('aria-expanded'))
          .toBe('true', 'Expected aria-expanded to be true while panel is open.');

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(input.getAttribute('aria-expanded'))
            .toBe('false', 'Expected aria-expanded to be false when panel closes again.');
      });
    }));

    it('should set aria-owns based on the attached autocomplete', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panel = fixture.debugElement.query(By.css('.md-autocomplete-panel')).nativeElement;

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
      const panel = overlayContainerElement.querySelector('.md-autocomplete-panel');
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
      const panel = overlayContainerElement.querySelector('.md-autocomplete-panel');
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
        input.value = 'f';
        dispatchEvent('input', input);
        fixture.detectChanges();

        const inputTop = input.getBoundingClientRect().top;
        const panel = overlayContainerElement.querySelector('.md-autocomplete-panel');
        const panelBottom = panel.getBoundingClientRect().bottom;

        // Panel is offset by 24px in styles so that the label has room to display.
        expect((inputTop - 24).toFixed(1))
            .toEqual(panelBottom.toFixed(1), `Expected panel to stay aligned after filtering.`);
        expect(fixture.componentInstance.trigger.autocomplete.positionY)
            .toEqual('above', `Expected autocomplete positionY to be "above" if panel won't fit.`);
      });
    }));

  });

});

@Component({
  template: `
    <md-input-container>
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



/**
 * TODO: Move this to core testing utility until Angular has event faking
 * support.
 *
 * Dispatches an event from an element.
 * @param eventName Name of the event
 * @param element The element from which the event will be dispatched.
 */
function dispatchEvent(eventName: string, element: HTMLElement): void {
  let event  = document.createEvent('Event');
  event.initEvent(eventName, true, true);
  element.dispatchEvent(event);
}

/** This is a mock keyboard event to test keyboard events in the autocomplete. */
class FakeKeyboardEvent {
  constructor(public keyCode: number) {}
  preventDefault() {}
}
