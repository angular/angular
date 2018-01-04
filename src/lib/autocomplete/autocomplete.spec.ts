import {Direction, Directionality} from '@angular/cdk/bidi';
import {DOWN_ARROW, ENTER, ESCAPE, SPACE, UP_ARROW, TAB} from '@angular/cdk/keycodes';
import {OverlayContainer, Overlay} from '@angular/cdk/overlay';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {ScrollDispatcher} from '@angular/cdk/scrolling';
import {
  createKeyboardEvent,
  dispatchKeyboardEvent,
  dispatchFakeEvent,
  typeInElement,
  MockNgZone,
} from '@angular/cdk/testing';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  NgZone,
} from '@angular/core';
import {
  async,
  ComponentFixture,
  fakeAsync,
  inject,
  TestBed,
  tick,
  flush,
} from '@angular/core/testing';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatOption} from '@angular/material/core';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {MatInputModule} from '../input/index';
import {
  getMatAutocompleteMissingPanelError,
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
} from './index';


describe('MatAutocomplete', () => {
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let scrolledSubject = new Subject();
  let zone: MockNgZone;

  // Creates a test component fixture.
  function createComponent(component: any, dir: Direction = 'ltr'): ComponentFixture<any> {
    TestBed.configureTestingModule({
      imports: [
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      declarations: [component],
      providers: [
        {provide: Directionality, useFactory: () => ({value: dir})},
        {provide: ScrollDispatcher, useFactory: () => ({
          scrolled: () => scrolledSubject.asObservable()
        })},
        {provide: NgZone, useFactory: () => {
          zone = new MockNgZone();
          return zone;
        }}
      ]
    });

    TestBed.compileComponents();

    inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    })();

    return TestBed.createComponent(component);
  }

  afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
    // Since we're resetting the testing module in some of the tests,
    // we can potentially have multiple overlay containers.
    currentOverlayContainer.ngOnDestroy();
    overlayContainer.ngOnDestroy();
  }));

  describe('panel toggling', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;

    beforeEach(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();
      input = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    it('should open the panel when the input is focused', () => {
      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(false, `Expected panel state to start out closed.`);

      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(true, `Expected panel state to read open when input is focused.`);
      expect(overlayContainerElement.textContent)
          .toContain('Alabama', `Expected panel to display when input is focused.`);
      expect(overlayContainerElement.textContent)
          .toContain('California', `Expected panel to display when input is focused.`);
    });

    it('should not open the panel on focus if the input is readonly', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;
      input.readOnly = true;
      fixture.detectChanges();

      expect(trigger.panelOpen).toBe(false, 'Expected panel state to start out closed.');
      dispatchFakeEvent(input, 'focusin');
      flush();

      fixture.detectChanges();
      expect(trigger.panelOpen).toBe(false, 'Expected panel to stay closed.');
    }));

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

    it('should show the panel when the first open is after the initial zone stabilization',
      async(() => {
        // Note that we're running outside the Angular zone, in order to be able
        // to test properly without the subscription from `_subscribeToClosingActions`
        // giving us a false positive.
        fixture.ngZone!.runOutsideAngular(() => {
          fixture.componentInstance.trigger.openPanel();

          Promise.resolve().then(() => {
            expect(fixture.componentInstance.panel.showPanel)
                .toBe(true, `Expected panel to be visible.`);
          });
        });
      }));

    it('should close the panel when the user clicks away', fakeAsync(() => {
      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();
      zone.simulateZoneExit();
      dispatchFakeEvent(document, 'click');

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(false, `Expected clicking outside the panel to set its state to closed.`);
      expect(overlayContainerElement.textContent)
          .toEqual('', `Expected clicking outside the panel to close the panel.`);
    }));

    it('should close the panel when the user taps away on a touch device', fakeAsync(() => {
      dispatchFakeEvent(input, 'focus');
      fixture.detectChanges();
      flush();
      dispatchFakeEvent(document, 'touchend');

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(false, `Expected tapping outside the panel to set its state to closed.`);
      expect(overlayContainerElement.textContent)
          .toEqual('', `Expected tapping outside the panel to close the panel.`);
    }));

    it('should close the panel when an option is clicked', fakeAsync(() => {
      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();
      zone.simulateZoneExit();

      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;
      option.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(false, `Expected clicking an option to set the panel state to closed.`);
      expect(overlayContainerElement.textContent)
          .toEqual('', `Expected clicking an option to close the panel.`);
    }));

    it('should close the panel when a newly created option is clicked', fakeAsync(() => {
      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();
      zone.simulateZoneExit();

      // Filter down the option list to a subset of original options ('Alabama', 'California')
      typeInElement('al', input);
      fixture.detectChanges();
      tick();

      let options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[0].click();

      // Changing value from 'Alabama' to 'al' to re-populate the option list,
      // ensuring that 'California' is created new.
      typeInElement('al', input);
      fixture.detectChanges();
      tick();

      options = overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(false, `Expected clicking a new option to set the panel state to closed.`);
      expect(overlayContainerElement.textContent)
          .toEqual('', `Expected clicking a new option to close the panel.`);
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

    it('should not throw when attempting to close the panel of a destroyed autocomplete', () => {
      const trigger = fixture.componentInstance.trigger;

      trigger.openPanel();
      fixture.detectChanges();
      fixture.destroy();

      expect(() => trigger.closePanel()).not.toThrow();
    });

    it('should hide the panel when the options list is empty', fakeAsync(() => {
      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();

      const panel = overlayContainerElement.querySelector('.mat-autocomplete-panel') as HTMLElement;

      expect(panel.classList)
          .toContain('mat-autocomplete-visible', `Expected panel to start out visible.`);

      // Filter down the option list such that no options match the value
      typeInElement('af', input);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(panel.classList)
          .toContain('mat-autocomplete-hidden', `Expected panel to hide itself when empty.`);
    }));

    it('should keep the label floating until the panel closes', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      expect(fixture.componentInstance.formField.floatLabel)
          .toEqual('always', 'Expected label to float as soon as panel opens.');

      zone.simulateZoneExit();
      fixture.detectChanges();

      const options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.formField.floatLabel)
          .toEqual('auto', 'Expected label to return to auto state after panel closes.');
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

   it('should not mess with label placement if set to never', fakeAsync(() => {
      fixture.componentInstance.floatLabel = 'never';
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      expect(fixture.componentInstance.formField.floatLabel)
          .toEqual('never', 'Expected label to stay static.');
      flush();
      fixture.detectChanges();

      const options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.formField.floatLabel)
          .toEqual('never', 'Expected label to stay in static state after close.');
    }));

    it('should not mess with label placement if set to always', fakeAsync(() => {
      fixture.componentInstance.floatLabel = 'always';
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      expect(fixture.componentInstance.formField.floatLabel)
          .toEqual('always', 'Expected label to stay elevated on open.');
      flush();
      fixture.detectChanges();

      const options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.formField.floatLabel)
          .toEqual('always', 'Expected label to stay elevated after close.');
    }));

    it('should toggle the visibility when typing and closing the panel', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.mat-autocomplete-panel')!.classList)
          .toContain('mat-autocomplete-visible', 'Expected panel to be visible.');

      typeInElement('x', input);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.mat-autocomplete-panel')!.classList)
          .toContain('mat-autocomplete-hidden', 'Expected panel to be hidden.');

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      typeInElement('al', input);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.mat-autocomplete-panel')!.classList)
          .toContain('mat-autocomplete-visible', 'Expected panel to be visible.');
    }));

    it('should animate the label when the input is focused', () => {
      const inputContainer = fixture.componentInstance.formField;

      spyOn(inputContainer, '_animateAndLockLabel');
      expect(inputContainer._animateAndLockLabel).not.toHaveBeenCalled();

      dispatchFakeEvent(fixture.debugElement.query(By.css('input')).nativeElement, 'focusin');
      expect(inputContainer._animateAndLockLabel).toHaveBeenCalled();
    });

    it('should provide the open state of the panel', fakeAsync(() => {
      expect(fixture.componentInstance.panel.isOpen).toBeFalsy(
        `Expected the panel to be unopened initially.`);

      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();
      flush();

      expect(fixture.componentInstance.panel.isOpen).toBeTruthy(
        `Expected the panel to be opened on focus.`);
    }));
  });

  it('should have the correct text direction in RTL', () => {
    const rtlFixture = createComponent(SimpleAutocomplete, 'rtl');
    rtlFixture.detectChanges();

    rtlFixture.componentInstance.trigger.openPanel();
    rtlFixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
    expect(overlayPane.getAttribute('dir')).toEqual('rtl');

  });

  describe('forms integration', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;

    beforeEach(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    it('should update control value as user types with input value', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      zone.simulateZoneExit();

      typeInElement('a', input);
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.value)
          .toEqual('a', 'Expected control value to be updated as user types.');

      typeInElement('al', input);
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.value)
          .toEqual('al', 'Expected control value to be updated as user types.');
    });

    it('should update control value when option is selected with option value', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      zone.simulateZoneExit();

      const options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.value)
          .toEqual({code: 'CA', name: 'California'},
              'Expected control value to equal the selected option value.');
    }));

    it('should update the control back to a string if user types after an option is selected',
      fakeAsync(() => {
        fixture.componentInstance.trigger.openPanel();
        fixture.detectChanges();
        zone.simulateZoneExit();

        const options =
            overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
        options[1].click();
        fixture.detectChanges();

        typeInElement('Californi', input);
        fixture.detectChanges();
        tick();

        expect(fixture.componentInstance.stateCtrl.value)
            .toEqual('Californi', 'Expected control value to revert back to string.');
      }));

    it('should fill the text field with display value when an option is selected', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      zone.simulateZoneExit();

      const options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(input.value)
          .toContain('California', `Expected text field to fill with selected value.`);
    }));

    it('should fill the text field with value if displayWith is not set', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      zone.simulateZoneExit();

      fixture.componentInstance.panel.displayWith = null;
      fixture.componentInstance.options.toArray()[1].value = 'test value';
      fixture.detectChanges();

      const options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[1].click();

      fixture.detectChanges();
      expect(input.value)
          .toContain('test value', `Expected input to fall back to selected option's value.`);
    }));

    it('should fill the text field correctly if value is set to obj programmatically',
      fakeAsync(() => {
        fixture.componentInstance.stateCtrl.setValue({code: 'AL', name: 'Alabama'});
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(input.value)
            .toContain('Alabama', `Expected input to fill with matching option's viewValue.`);
      }));

    it('should clear the text field if value is reset programmatically', fakeAsync(() => {
      typeInElement('Alabama', input);
      fixture.detectChanges();
      tick();

      fixture.componentInstance.stateCtrl.reset();
      tick();

      fixture.detectChanges();
      tick();

      expect(input.value).toEqual('', `Expected input value to be empty after reset.`);
    }));

    it('should disable input in view when disabled programmatically', () => {
      const formFieldElement =
          fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;

      expect(input.disabled)
          .toBe(false, `Expected input to start out enabled in view.`);
      expect(formFieldElement.classList.contains('mat-form-field-disabled'))
          .toBe(false, `Expected input underline to start out with normal styles.`);

      fixture.componentInstance.stateCtrl.disable();
      fixture.detectChanges();

      expect(input.disabled)
          .toBe(true, `Expected input to be disabled in view when disabled programmatically.`);
      expect(formFieldElement.classList.contains('mat-form-field-disabled'))
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

    it('should mark the autocomplete control as dirty when an option is selected', fakeAsync(() => {
      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(false, `Expected control to start out pristine.`);

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      zone.simulateZoneExit();

      const options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(true, `Expected control to become dirty when an option was selected.`);
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

    it('should disable the input when used with a value accessor and without `matInput`', () => {
      overlayContainer.ngOnDestroy();
      fixture.destroy();
      TestBed.resetTestingModule();

      const plainFixture = createComponent(PlainAutocompleteInputWithFormControl);
      plainFixture.detectChanges();
      input = plainFixture.nativeElement.querySelector('input');

      expect(input.disabled).toBe(false);

      plainFixture.componentInstance.formControl.disable();
      plainFixture.detectChanges();

      expect(input.disabled).toBe(true);
    });

  });

  describe('keyboard events', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;
    let DOWN_ARROW_EVENT: KeyboardEvent;
    let UP_ARROW_EVENT: KeyboardEvent;
    let ENTER_EVENT: KeyboardEvent;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input')).nativeElement;
      DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
      UP_ARROW_EVENT = createKeyboardEvent('keydown', UP_ARROW);
      ENTER_EVENT = createKeyboardEvent('keydown', ENTER);

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      zone.simulateZoneExit();
    }));

    it('should not focus the option when DOWN key is pressed', () => {
      spyOn(fixture.componentInstance.options.first, 'focus');

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      expect(fixture.componentInstance.options.first.focus).not.toHaveBeenCalled();
    });

    it('should not close the panel when DOWN key is pressed', () => {
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(true, `Expected panel state to stay open when DOWN key is pressed.`);
      expect(overlayContainerElement.textContent)
          .toContain('Alabama', `Expected panel to keep displaying when DOWN key is pressed.`);
      expect(overlayContainerElement.textContent)
          .toContain('California', `Expected panel to keep displaying when DOWN key is pressed.`);
    });

    it('should set the active item to the first option when DOWN key is pressed', () => {
      const componentInstance = fixture.componentInstance;
      const optionEls =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;

      expect(componentInstance.trigger.panelOpen)
          .toBe(true, 'Expected first down press to open the pane.');

      componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      expect(componentInstance.trigger.activeOption === componentInstance.options.first)
          .toBe(true, 'Expected first option to be active.');
      expect(optionEls[0].classList).toContain('mat-active');
      expect(optionEls[1].classList).not.toContain('mat-active');

      componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      expect(componentInstance.trigger.activeOption === componentInstance.options.toArray()[1])
          .toBe(true, 'Expected second option to be active.');
      expect(optionEls[0].classList).not.toContain('mat-active');
      expect(optionEls[1].classList).toContain('mat-active');
    });

    it('should set the active item to the last option when UP key is pressed', () => {
      const componentInstance = fixture.componentInstance;
      const optionEls =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;

      expect(componentInstance.trigger.panelOpen)
          .toBe(true, 'Expected first up press to open the pane.');

      componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);
      fixture.detectChanges();

      expect(componentInstance.trigger.activeOption === componentInstance.options.last)
          .toBe(true, 'Expected last option to be active.');
      expect(optionEls[10].classList).toContain('mat-active');
      expect(optionEls[0].classList).not.toContain('mat-active');

      componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      expect(componentInstance.trigger.activeOption === componentInstance.options.first)
          .toBe(true, 'Expected first option to be active.');
      expect(optionEls[0].classList).toContain('mat-active');
    });

    it('should set the active item properly after filtering', fakeAsync(() => {
      const componentInstance = fixture.componentInstance;

      componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();
    }));

    it('should set the active item properly after filtering', () => {
      const componentInstance = fixture.componentInstance;

      typeInElement('o', input);
      fixture.detectChanges();

      componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      const optionEls =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;

      expect(componentInstance.trigger.activeOption === componentInstance.options.first)
          .toBe(true, 'Expected first option to be active.');
      expect(optionEls[0].classList).toContain('mat-active');
      expect(optionEls[1].classList).not.toContain('mat-active');
    });

    it('should fill the text field when an option is selected with ENTER', fakeAsync(() => {
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      flush();
      fixture.detectChanges();

      fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);
      fixture.detectChanges();
      expect(input.value)
          .toContain('Alabama', `Expected text field to fill with selected value on ENTER.`);
    }));

    it('should prevent the default enter key action', fakeAsync(() => {
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      flush();

      fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);

      expect(ENTER_EVENT.defaultPrevented)
          .toBe(true, 'Expected the default action to have been prevented.');
    }));

    it('should not prevent the default enter action for a closed panel after a user action', () => {
      fixture.componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);
      fixture.detectChanges();

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();
      fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);

      expect(ENTER_EVENT.defaultPrevented).toBe(false, 'Default action should not be prevented.');
    });

    it('should fill the text field, not select an option, when SPACE is entered', () => {
      typeInElement('New', input);
      fixture.detectChanges();

      const SPACE_EVENT = createKeyboardEvent('keydown', SPACE);
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      fixture.componentInstance.trigger._handleKeydown(SPACE_EVENT);
      fixture.detectChanges();

      expect(input.value).not.toContain('New York', `Expected option not to be selected on SPACE.`);
    });

    it('should mark the control dirty when selecting an option from the keyboard', fakeAsync(() => {
      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(false, `Expected control to start out pristine.`);

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      flush();
      fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(true, `Expected control to become dirty when option was selected by ENTER.`);
    }));

    it('should open the panel again when typing after making a selection', fakeAsync(() => {
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      flush();
      fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(false, `Expected panel state to read closed after ENTER key.`);
      expect(overlayContainerElement.textContent)
          .toEqual('', `Expected panel to close after ENTER key.`);

      typeInElement('Alabama', input);
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(true, `Expected panel state to read open when typing in input.`);
      expect(overlayContainerElement.textContent)
          .toContain('Alabama', `Expected panel to display when typing in input.`);
    }));

    it('should scroll to active options below the fold', () => {
      const trigger = fixture.componentInstance.trigger;
      const scrollContainer =
          document.querySelector('.cdk-overlay-pane .mat-autocomplete-panel')!;

      trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();
      expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to scroll.`);

      // These down arrows will set the 6th option active, below the fold.
      [1, 2, 3, 4, 5].forEach(() => trigger._handleKeydown(DOWN_ARROW_EVENT));

      // Expect option bottom minus the panel height (288 - 256 = 32)
      expect(scrollContainer.scrollTop)
          .toEqual(32, `Expected panel to reveal the sixth option.`);
    });

    it('should scroll to active options on UP arrow', () => {
      const scrollContainer = document.querySelector('.cdk-overlay-pane .mat-autocomplete-panel')!;

      fixture.componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);
      fixture.detectChanges();

      // Expect option bottom minus the panel height (528 - 256 = 272)
      expect(scrollContainer.scrollTop).toEqual(272, `Expected panel to reveal last option.`);
    });

    it('should not scroll to active options that are fully in the panel', () => {
      const trigger = fixture.componentInstance.trigger;
      const scrollContainer = document.querySelector('.cdk-overlay-pane .mat-autocomplete-panel')!;

      trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to scroll.`);

      // These down arrows will set the 6th option active, below the fold.
      [1, 2, 3, 4, 5].forEach(() => trigger._handleKeydown(DOWN_ARROW_EVENT));

      // Expect option bottom minus the panel height (288 - 256 = 32)
      expect(scrollContainer.scrollTop)
          .toEqual(32, `Expected panel to reveal the sixth option.`);

      // These up arrows will set the 2nd option active
      [4, 3, 2, 1].forEach(() => trigger._handleKeydown(UP_ARROW_EVENT));

      // Expect no scrolling to have occurred. Still showing bottom of 6th option.
      expect(scrollContainer.scrollTop)
          .toEqual(32, `Expected panel not to scroll up since sixth option still fully visible.`);
    });

    it('should scroll to active options that are above the panel', () => {
      const trigger = fixture.componentInstance.trigger;
      const scrollContainer = document.querySelector('.cdk-overlay-pane .mat-autocomplete-panel')!;

      trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to scroll.`);

      // These down arrows will set the 7th option active, below the fold.
      [1, 2, 3, 4, 5, 6].forEach(() => trigger._handleKeydown(DOWN_ARROW_EVENT));

      // These up arrows will set the 2nd option active
      [5, 4, 3, 2, 1].forEach(() => trigger._handleKeydown(UP_ARROW_EVENT));

      // Expect to show the top of the 2nd option at the top of the panel
      expect(scrollContainer.scrollTop)
          .toEqual(48, `Expected panel to scroll up when option is above panel.`);
    });

    it('should close the panel when pressing escape', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;
      const escapeEvent = createKeyboardEvent('keydown', ESCAPE);
      const stopPropagationSpy = spyOn(escapeEvent, 'stopPropagation').and.callThrough();

      input.focus();
      flush();
      fixture.detectChanges();

      expect(document.activeElement).toBe(input, 'Expected input to be focused.');
      expect(trigger.panelOpen).toBe(true, 'Expected panel to be open.');

      trigger._handleKeydown(escapeEvent);
      fixture.detectChanges();

      expect(document.activeElement).toBe(input, 'Expected input to continue to be focused.');
      expect(trigger.panelOpen).toBe(false, 'Expected panel to be closed.');
      expect(stopPropagationSpy).toHaveBeenCalled();
    }));

    it('should close the panel when tabbing away from a trigger without results', fakeAsync(() => {
      fixture.componentInstance.states = [];
      fixture.componentInstance.filteredStates = [];
      fixture.detectChanges();
      input.focus();
      flush();

      expect(overlayContainerElement.querySelector('.mat-autocomplete-panel'))
          .toBeTruthy('Expected panel to be rendered.');

      dispatchKeyboardEvent(input, 'keydown', TAB);
      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.mat-autocomplete-panel'))
          .toBeFalsy('Expected panel to be removed.');
    }));

    it('should reset the active option when closing with the escape key', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;

      trigger.openPanel();
      fixture.detectChanges();
      tick();

      expect(trigger.panelOpen).toBe(true, 'Expected panel to be open.');
      expect(!!trigger.activeOption).toBe(false, 'Expected no active option.');

      // Press the down arrow a few times.
      [1, 2, 3].forEach(() => {
        trigger._handleKeydown(DOWN_ARROW_EVENT);
        tick();
        fixture.detectChanges();
      });

      // Note that this casts to a boolean, in order to prevent Jasmine
      // from crashing when trying to stringify the option if the test fails.
      expect(!!trigger.activeOption).toBe(true, 'Expected to find an active option.');

      trigger._handleKeydown(createKeyboardEvent('keydown', ESCAPE));
      tick();

      expect(!!trigger.activeOption).toBe(false, 'Expected no active options.');
    }));

    it('should reset the active option when closing by selecting with enter', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;

      trigger.openPanel();
      fixture.detectChanges();
      tick();

      expect(trigger.panelOpen).toBe(true, 'Expected panel to be open.');
      expect(!!trigger.activeOption).toBe(false, 'Expected no active option.');

      // Press the down arrow a few times.
      [1, 2, 3].forEach(() => {
        trigger._handleKeydown(DOWN_ARROW_EVENT);
        tick();
        fixture.detectChanges();
      });

      // Note that this casts to a boolean, in order to prevent Jasmine
      // from crashing when trying to stringify the option if the test fails.
      expect(!!trigger.activeOption).toBe(true, 'Expected to find an active option.');

      trigger._handleKeydown(ENTER_EVENT);
      tick();

      expect(!!trigger.activeOption).toBe(false, 'Expected no active options.');
    }));

  });

  describe('option groups', () => {
    let fixture: ComponentFixture<AutocompleteWithGroups>;
    let DOWN_ARROW_EVENT: KeyboardEvent;
    let UP_ARROW_EVENT: KeyboardEvent;
    let container: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(AutocompleteWithGroups);
      fixture.detectChanges();

      DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
      UP_ARROW_EVENT = createKeyboardEvent('keydown', UP_ARROW);

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      container = document.querySelector('.mat-autocomplete-panel') as HTMLElement;
    }));

    it('should scroll to active options below the fold', fakeAsync(() => {
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();
      expect(container.scrollTop).toBe(0, 'Expected the panel not to scroll.');

      // Press the down arrow five times.
      [1, 2, 3, 4, 5].forEach(() => {
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        tick();
      });

      // <option bottom> - <panel height> + <2x group labels> = 128
      // 288 - 256 + 96 = 128
      expect(container.scrollTop)
          .toBe(128, 'Expected panel to reveal the sixth option.');
    }));

    it('should scroll to active options on UP arrow', fakeAsync(() => {
      fixture.componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);
      tick();
      fixture.detectChanges();

      // <option bottom> - <panel height> + <3x group label> = 464
      // 576 - 256 + 144 = 464
      expect(container.scrollTop).toBe(464, 'Expected panel to reveal last option.');
    }));

    it('should scroll to active options that are above the panel', fakeAsync(() => {
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();
      expect(container.scrollTop).toBe(0, 'Expected panel not to scroll.');

      // These down arrows will set the 7th option active, below the fold.
      [1, 2, 3, 4, 5, 6].forEach(() => {
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        tick();
      });

      // These up arrows will set the 2nd option active
      [5, 4, 3, 2, 1].forEach(() => {
        fixture.componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);
        tick();
      });

      // Expect to show the top of the 2nd option at the top of the panel.
      // It is offset by 48, because there's a group label above it.
      expect(container.scrollTop)
          .toBe(96, 'Expected panel to scroll up when option is above panel.');
    }));
  });

  describe('aria', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;

    beforeEach(() => {
      fixture = createComponent(SimpleAutocomplete);
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

    it('should set aria-activedescendant based on the active option', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      expect(input.hasAttribute('aria-activedescendant'))
          .toBe(false, 'Expected aria-activedescendant to be absent if no active item.');

      const DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();

      expect(input.getAttribute('aria-activedescendant'))
          .toEqual(fixture.componentInstance.options.first.id,
              'Expected aria-activedescendant to match the active item after 1 down arrow.');

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();

      expect(input.getAttribute('aria-activedescendant'))
          .toEqual(fixture.componentInstance.options.toArray()[1].id,
              'Expected aria-activedescendant to match the active item after 2 down arrows.');
    }));

    it('should set aria-expanded based on whether the panel is open', () => {
      expect(input.getAttribute('aria-expanded'))
          .toBe('false', 'Expected aria-expanded to be false while panel is closed.');

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      expect(input.getAttribute('aria-expanded'))
          .toBe('true', 'Expected aria-expanded to be true while panel is open.');

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();

      expect(input.getAttribute('aria-expanded'))
          .toBe('false', 'Expected aria-expanded to be false when panel closes again.');
    });

    it('should set aria-expanded properly when the panel is hidden', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      expect(input.getAttribute('aria-expanded'))
          .toBe('true', 'Expected aria-expanded to be true while panel is open.');

      typeInElement('zz', input);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(input.getAttribute('aria-expanded'))
          .toBe('false', 'Expected aria-expanded to be false when panel hides itself.');
    }));

    it('should set aria-owns based on the attached autocomplete', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panel = fixture.debugElement.query(By.css('.mat-autocomplete-panel')).nativeElement;

      expect(input.getAttribute('aria-owns'))
          .toEqual(panel.getAttribute('id'), 'Expected aria-owns to match attached autocomplete.');
    });

    it('should restore focus to the input when clicking to select a value', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      zone.simulateZoneExit();

      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;

      // Focus the option manually since the synthetic click may not do it.
      option.focus();
      option.click();
      fixture.detectChanges();

      expect(document.activeElement).toBe(input, 'Expected focus to be restored to the input.');
    }));

  });

  describe('Fallback positions', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;
    let inputReference: HTMLInputElement;

    beforeEach(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input')).nativeElement;
      inputReference = fixture.debugElement.query(By.css('.mat-input-flex')).nativeElement;
    });

    it('should use below positioning by default', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      zone.simulateZoneExit();

      const inputBottom = inputReference.getBoundingClientRect().bottom;
      const panel = overlayContainerElement.querySelector('.mat-autocomplete-panel')!;
      const panelTop = panel.getBoundingClientRect().top;

      expect(Math.floor(inputBottom))
          .toEqual(Math.floor(panelTop), `Expected panel top to match input bottom by default.`);
    }));

    it('should reposition the panel on scroll', () => {
      const spacer = document.createElement('div');

      spacer.style.height = '1000px';
      document.body.appendChild(spacer);

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      window.scroll(0, 100);
      scrolledSubject.next();
      fixture.detectChanges();

      const inputBottom = inputReference.getBoundingClientRect().bottom;
      const panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
      const panelTop = panel.getBoundingClientRect().top;

      expect(Math.floor(inputBottom)).toEqual(Math.floor(panelTop),
          'Expected panel top to match input bottom after scrolling.');

      document.body.removeChild(spacer);
    });

    it('should fall back to above position if panel cannot fit below', fakeAsync(() => {
      // Push the autocomplete trigger down so it won't have room to open "below"
      inputReference.style.bottom = '0';
      inputReference.style.position = 'fixed';

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      zone.simulateZoneExit();

      const inputTop = inputReference.getBoundingClientRect().top;
      const panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
      const panelBottom = panel.getBoundingClientRect().bottom;

      expect(Math.floor(inputTop))
          .toEqual(Math.floor(panelBottom), `Expected panel to fall back to above position.`);
    }));

    it('should align panel properly when filtering in "above" position', fakeAsync(() => {
      // Push the autocomplete trigger down so it won't have room to open "below"
      inputReference.style.bottom = '0';
      inputReference.style.position = 'fixed';

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      zone.simulateZoneExit();

      typeInElement('f', input);
      fixture.detectChanges();
      tick();

      const inputTop = inputReference.getBoundingClientRect().top;
      const panel = overlayContainerElement.querySelector('.mat-autocomplete-panel')!;
      const panelBottom = panel.getBoundingClientRect().bottom;

      expect(Math.floor(inputTop))
          .toEqual(Math.floor(panelBottom), `Expected panel to stay aligned after filtering.`);
    }));

  });

  describe('Option selection', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;

    beforeEach(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
    });

    it('should deselect any other selected option', fakeAsync(() => {
      let options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[0].click();
      fixture.detectChanges();
      zone.simulateZoneExit();
      fixture.detectChanges();

      let componentOptions = fixture.componentInstance.options.toArray();
      expect(componentOptions[0].selected)
          .toBe(true, `Clicked option should be selected.`);

      options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(componentOptions[0].selected)
          .toBe(false, `Previous option should not be selected.`);
      expect(componentOptions[1].selected)
          .toBe(true, `New Clicked option should be selected.`);
    }));

    it('should call deselect only on the previous selected option', fakeAsync(() => {
      let options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[0].click();
      fixture.detectChanges();
      zone.simulateZoneExit();
      fixture.detectChanges();

      let componentOptions = fixture.componentInstance.options.toArray();
      componentOptions.forEach(option => spyOn(option, 'deselect'));

      expect(componentOptions[0].selected)
          .toBe(true, `Clicked option should be selected.`);

      options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(componentOptions[0].deselect).toHaveBeenCalled();
      componentOptions.slice(1).forEach(option => expect(option.deselect).not.toHaveBeenCalled());
    }));
  });

  describe('panel closing', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;
    let trigger: MatAutocompleteTrigger;
    let closingActionSpy: jasmine.Spy;
    let closingActionsSub: Subscription;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input')).nativeElement;

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      flush();

      trigger = fixture.componentInstance.trigger;
      closingActionSpy = jasmine.createSpy('closing action listener');
      closingActionsSub = trigger.panelClosingActions.subscribe(closingActionSpy);
    }));

    afterEach(() => {
      closingActionsSub.unsubscribe();
    });

    it('should emit panel close event when clicking away', () => {
      expect(closingActionSpy).not.toHaveBeenCalled();
      dispatchFakeEvent(document, 'click');
      expect(closingActionSpy).toHaveBeenCalled();
    });

    it('should emit panel close event when tabbing out', () => {
      const tabEvent = createKeyboardEvent('keydown', TAB);
      input.focus();

      expect(closingActionSpy).not.toHaveBeenCalled();
      trigger._handleKeydown(tabEvent);
      expect(closingActionSpy).toHaveBeenCalled();
    });

    it('should not emit when tabbing away from a closed panel', () => {
      const tabEvent = createKeyboardEvent('keydown', TAB);

      input.focus();
      zone.simulateZoneExit();

      trigger._handleKeydown(tabEvent);

      // Ensure that it emitted once while the panel was open.
      expect(closingActionSpy).toHaveBeenCalledTimes(1);

      trigger._handleKeydown(tabEvent);

      // Ensure that it didn't emit again when tabbing out again.
      expect(closingActionSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit panel close event when selecting an option', () => {
      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;

      expect(closingActionSpy).not.toHaveBeenCalled();
      option.click();
      expect(closingActionSpy).toHaveBeenCalled();
    });

    it('should close the panel when pressing escape', () => {
      const escapeEvent = createKeyboardEvent('keydown', ESCAPE);

      expect(closingActionSpy).not.toHaveBeenCalled();
      trigger._handleKeydown(escapeEvent);
      expect(closingActionSpy).toHaveBeenCalled();
    });
  });

  describe('without matInput', () => {
    let fixture: ComponentFixture<AutocompleteWithNativeInput>;

    beforeEach(() => {
      fixture = createComponent(AutocompleteWithNativeInput);
      fixture.detectChanges();
    });

    it('should not throw when clicking outside', fakeAsync(() => {
      dispatchFakeEvent(fixture.debugElement.query(By.css('input')).nativeElement, 'focus');
      fixture.detectChanges();
      flush();

      expect(() => dispatchFakeEvent(document, 'click')).not.toThrow();
    }));
  });

  describe('misc', () => {

    it('should allow basic use without any forms directives', () => {
      expect(() => {
        const fixture = createComponent(AutocompleteWithoutForms);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        typeInElement('d', input);
        fixture.detectChanges();

        const options =
            overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
        expect(options.length).toBe(1);
      }).not.toThrowError();
    });

    it('should display an empty input when the value is undefined with ngModel', () => {
      const fixture = createComponent(AutocompleteWithNgModel);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('input')).nativeElement.value).toBe('');
    });

    it('should display the number when the selected option is the number zero', fakeAsync(() => {
      const fixture = createComponent(AutocompleteWithNumbers);

      fixture.componentInstance.selectedNumber = 0;
      fixture.detectChanges();
      tick();

      expect(fixture.debugElement.query(By.css('input')).nativeElement.value).toBe('0');
    }));

    it('should work when input is wrapped in ngIf', () => {
      const fixture = createComponent(NgIfAutocomplete);
      fixture.detectChanges();

      dispatchFakeEvent(fixture.debugElement.query(By.css('input')).nativeElement, 'focusin');
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(true, `Expected panel state to read open when input is focused.`);
      expect(overlayContainerElement.textContent)
          .toContain('One', `Expected panel to display when input is focused.`);
      expect(overlayContainerElement.textContent)
          .toContain('Two', `Expected panel to display when input is focused.`);
    });

    it('should filter properly with ngIf after setting the active item', () => {
      const fixture = createComponent(NgIfAutocomplete);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input')).nativeElement;
      typeInElement('o', input);
      fixture.detectChanges();

      expect(fixture.componentInstance.matOptions.length).toBe(2);
    });

    it('should throw if the user attempts to open the panel too early', () => {
      const fixture = createComponent(AutocompleteWithoutPanel);
      fixture.detectChanges();

      expect(() => {
        fixture.componentInstance.trigger.openPanel();
      }).toThrow(getMatAutocompleteMissingPanelError());
    });

    it('should not throw on init, even if the panel is not defined', fakeAsync(() => {
      expect(() => {
        const fixture = createComponent(AutocompleteWithoutPanel);
        fixture.componentInstance.control.setValue('Something');
        fixture.detectChanges();
        tick();
      }).not.toThrow();
    }));

    it('should hide the label with a preselected form control value ' +
      'and a disabled floating label', fakeAsync(() => {
        const fixture = createComponent(AutocompleteWithFormsAndNonfloatingLabel);

        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const input = fixture.nativeElement.querySelector('input');
        const label = fixture.nativeElement.querySelector('.mat-form-field-label');

        expect(input.value).toBe('California');
        expect(label.classList).not.toContain('mat-form-field-empty');
      }));

    it('should transfer the mat-autocomplete classes to the panel element', fakeAsync(() => {
      const fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      tick();
      fixture.detectChanges();

      const autocomplete = fixture.debugElement.nativeElement.querySelector('mat-autocomplete');
      const panel = overlayContainerElement.querySelector('.mat-autocomplete-panel')!;

      expect(autocomplete.classList).not.toContain('class-one');
      expect(autocomplete.classList).not.toContain('class-two');

      expect(panel.classList).toContain('class-one');
      expect(panel.classList).toContain('class-two');
    }));

    it('should reset correctly when closed programmatically', fakeAsync(() => {
      TestBed.overrideProvider(MAT_AUTOCOMPLETE_SCROLL_STRATEGY, {
        useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close(),
        deps: [Overlay]
      });

      const fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.trigger;

      trigger.openPanel();
      fixture.detectChanges();
      zone.simulateZoneExit();

      expect(trigger.panelOpen).toBe(true, 'Expected panel to be open.');

      scrolledSubject.next();
      fixture.detectChanges();

      expect(trigger.panelOpen).toBe(false, 'Expected panel to be closed.');
    }));

  });

  it('should have correct width when opened', () => {
    const widthFixture = createComponent(SimpleAutocomplete);
    widthFixture.componentInstance.width = 300;
    widthFixture.detectChanges();

    widthFixture.componentInstance.trigger.openPanel();
    widthFixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
    // Firefox, edge return a decimal value for width, so we need to parse and round it to verify
    expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(300);

    widthFixture.componentInstance.trigger.closePanel();
    widthFixture.detectChanges();

    widthFixture.componentInstance.width = 500;
    widthFixture.detectChanges();

    widthFixture.componentInstance.trigger.openPanel();
    widthFixture.detectChanges();

    // Firefox, edge return a decimal value for width, so we need to parse and round it to verify
    expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(500);
  });

  it('should update the width while the panel is open', () => {
    const widthFixture = createComponent(SimpleAutocomplete);

    widthFixture.componentInstance.width = 300;
    widthFixture.detectChanges();

    widthFixture.componentInstance.trigger.openPanel();
    widthFixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
    const input = widthFixture.debugElement.query(By.css('input')).nativeElement;

    expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(300);

    widthFixture.componentInstance.width = 500;
    widthFixture.detectChanges();

    input.focus();
    dispatchFakeEvent(input, 'input');
    widthFixture.detectChanges();

    expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(500);
  });

  it('should show the panel when the options are initialized later within a component with ' +
    'OnPush change detection', fakeAsync(() => {
      let fixture = createComponent(AutocompleteWithOnPushDelay);

      fixture.detectChanges();
      dispatchFakeEvent(fixture.debugElement.query(By.css('input')).nativeElement, 'focusin');
      tick(1000);

      fixture.detectChanges();
      tick();

      Promise.resolve().then(() => {
        let panel = overlayContainerElement.querySelector('.mat-autocomplete-panel') as HTMLElement;
        let visibleClass = 'mat-autocomplete-visible';

        fixture.detectChanges();
        expect(panel.classList).toContain(visibleClass, `Expected panel to be visible.`);
      });
    }));

  it('should emit an event when an option is selected', fakeAsync(() => {
    let fixture = createComponent(AutocompleteWithSelectEvent);

    fixture.detectChanges();
    fixture.componentInstance.trigger.openPanel();
    zone.simulateZoneExit();
    fixture.detectChanges();

    let options = overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
    let spy = fixture.componentInstance.optionSelected;

    options[1].click();
    tick();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);

    let event = spy.calls.mostRecent().args[0] as MatAutocompleteSelectedEvent;

    expect(event.source).toBe(fixture.componentInstance.autocomplete);
    expect(event.option.value).toBe('Washington');
  }));

  it('should emit an event when a newly-added option is selected', fakeAsync(() => {
    let fixture = createComponent(AutocompleteWithSelectEvent);

    fixture.detectChanges();
    fixture.componentInstance.trigger.openPanel();
    tick();
    fixture.detectChanges();

    fixture.componentInstance.states.push('Puerto Rico');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    let options = overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
    let spy = fixture.componentInstance.optionSelected;

    options[3].click();
    tick();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);

    let event = spy.calls.mostRecent().args[0] as MatAutocompleteSelectedEvent;

    expect(event.source).toBe(fixture.componentInstance.autocomplete);
    expect(event.option.value).toBe('Puerto Rico');
  }));
});

@Component({
  template: `
    <mat-form-field [floatLabel]="floatLabel" [style.width.px]="width">
      <input matInput placeholder="State" [matAutocomplete]="auto" [formControl]="stateCtrl">
    </mat-form-field>

    <mat-autocomplete class="class-one class-two" #auto="matAutocomplete"
      [displayWith]="displayFn" [disableRipple]="disableRipple">
      <mat-option *ngFor="let state of filteredStates" [value]="state">
        <span> {{ state.code }}: {{ state.name }}  </span>
      </mat-option>
    </mat-autocomplete>
  `
})
class SimpleAutocomplete implements OnDestroy {
  stateCtrl = new FormControl();
  filteredStates: any[];
  valueSub: Subscription;
  floatLabel = 'auto';
  width: number;
  disableRipple = false;

  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  @ViewChild(MatAutocomplete) panel: MatAutocomplete;
  @ViewChild(MatFormField) formField: MatFormField;
  @ViewChildren(MatOption) options: QueryList<MatOption>;

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
    <mat-form-field *ngIf="isVisible">
      <input matInput placeholder="Choose" [matAutocomplete]="auto" [formControl]="optionCtrl">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      <mat-option *ngFor="let option of filteredOptions | async" [value]="option">
         {{option}}
      </mat-option>
    </mat-autocomplete>
  `
})
class NgIfAutocomplete {
  optionCtrl = new FormControl();
  filteredOptions: Observable<any>;
  isVisible = true;
  options = ['One', 'Two', 'Three'];

  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  @ViewChildren(MatOption) matOptions: QueryList<MatOption>;

  constructor() {
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(null),
      map((val: string) => {
        return val ? this.options.filter(option => new RegExp(val, 'gi').test(option))
                    : this.options.slice();
      }));
  }
}


@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="State" [matAutocomplete]="auto"
      (input)="onInput($event.target?.value)">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      <mat-option *ngFor="let state of filteredStates" [value]="state">
        <span> {{ state }}  </span>
      </mat-option>
    </mat-autocomplete>
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
    <mat-form-field>
      <input matInput placeholder="State" [matAutocomplete]="auto" [(ngModel)]="selectedState"
      (ngModelChange)="onInput($event)">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      <mat-option *ngFor="let state of filteredStates" [value]="state">
        <span>{{ state }}</span>
      </mat-option>
    </mat-autocomplete>
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

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="Number" [matAutocomplete]="auto" [(ngModel)]="selectedNumber">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      <mat-option *ngFor="let number of numbers" [value]="number">
        <span>{{ number }}</span>
      </mat-option>
    </mat-autocomplete>
  `
})
class AutocompleteWithNumbers {
  selectedNumber: number;
  numbers = [0, 1, 2];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field>
      <input type="text" matInput [matAutocomplete]="auto">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      <mat-option *ngFor="let option of options" [value]="option">{{ option }}</mat-option>
    </mat-autocomplete>
  `
})
class AutocompleteWithOnPushDelay implements OnInit {
  options: string[];

  ngOnInit() {
    setTimeout(() => {
      this.options = ['One'];
    }, 1000);
  }
}

@Component({
  template: `
    <input placeholder="Choose" [matAutocomplete]="auto" [formControl]="optionCtrl">

    <mat-autocomplete #auto="matAutocomplete">
      <mat-option *ngFor="let option of filteredOptions | async" [value]="option">
         {{option}}
      </mat-option>
    </mat-autocomplete>
  `
})
class AutocompleteWithNativeInput {
  optionCtrl = new FormControl();
  filteredOptions: Observable<any>;
  options = ['En', 'To', 'Tre', 'Fire', 'Fem'];

  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  @ViewChildren(MatOption) matOptions: QueryList<MatOption>;

  constructor() {
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(null),
      map((val: string) => {
        return val ? this.options.filter(option => new RegExp(val, 'gi').test(option))
                    : this.options.slice();
      }));
  }
}


@Component({
  template: `<input placeholder="Choose" [matAutocomplete]="auto" [formControl]="control">`
})
class AutocompleteWithoutPanel {
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  control = new FormControl();
}


@Component({
  template: `
    <mat-form-field floatLabel="never">
      <input placeholder="State" matInput [matAutocomplete]="auto" [formControl]="formControl">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      <mat-option value="California">California</mat-option>
    </mat-autocomplete>
  `
})
class AutocompleteWithFormsAndNonfloatingLabel {
  formControl = new FormControl('California');
}


@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="State" [matAutocomplete]="auto" [(ngModel)]="selectedState">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      <mat-optgroup *ngFor="let group of stateGroups" [label]="group.label">
        <mat-option *ngFor="let state of group.states" [value]="state">
          <span>{{ state }}</span>
        </mat-option>
      </mat-optgroup>
    </mat-autocomplete>
  `
})
class AutocompleteWithGroups {
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  selectedState: string;
  stateGroups = [
    {
      title: 'One',
      states: ['Alabama', 'California', 'Florida', 'Oregon']
    },
    {
      title: 'Two',
      states: ['Kansas', 'Massachusetts', 'New York', 'Pennsylvania']
    },
    {
      title: 'Three',
      states: ['Tennessee', 'Virginia', 'Wyoming', 'Alaska']
    }
  ];
}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="State" [matAutocomplete]="auto" [(ngModel)]="selectedState">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete" (optionSelected)="optionSelected($event)">
      <mat-option *ngFor="let state of states" [value]="state">
        <span>{{ state }}</span>
      </mat-option>
    </mat-autocomplete>
  `
})
class AutocompleteWithSelectEvent {
  selectedState: string;
  states = ['New York', 'Washington', 'Oregon'];
  optionSelected = jasmine.createSpy('optionSelected callback');

  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  @ViewChild(MatAutocomplete) autocomplete: MatAutocomplete;
}


@Component({
  template: `
    <input [formControl]="formControl" [matAutocomplete]="auto"/>
    <mat-autocomplete #auto="matAutocomplete"></mat-autocomplete>
  `
})
class PlainAutocompleteInputWithFormControl {
  formControl = new FormControl();
}
