import {
  ChangeDetectionStrategy,
  Component,
  DebugElement,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {async, ComponentFixture, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {Directionality} from '@angular/cdk/bidi';
import {DOWN_ARROW, END, ENTER, HOME, SPACE, TAB, UP_ARROW} from '@angular/cdk/keycodes';
import {ScrollDispatcher, ViewportRuler} from '@angular/cdk/scrolling';
import {OverlayContainer} from '@angular/cdk/overlay';
import {dispatchFakeEvent, dispatchKeyboardEvent, wrappedErrorMessage} from '@angular/cdk/testing';
import {Subject} from 'rxjs/Subject';
import {map} from 'rxjs/operator/map';
import {MdSelectModule} from './index';
import {MdSelect} from './select';
import {
  getMdSelectDynamicMultipleError,
  getMdSelectNonArrayValueError,
  getMdSelectNonFunctionValueError
} from './select-errors';
import {MdOption} from '../core/option/option';
import {
  FloatPlaceholderType,
  MD_PLACEHOLDER_GLOBAL_OPTIONS
} from '../core/placeholder/placeholder-options';
import {extendObject} from '../core/util/object-extend';


describe('MdSelect', () => {
  let overlayContainerElement: HTMLElement;
  let dir: {value: 'ltr'|'rtl'};
  let scrolledSubject = new Subject();
  let viewportRuler: ViewportRuler;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdSelectModule, ReactiveFormsModule, FormsModule, NoopAnimationsModule],
      declarations: [
        BasicSelect,
        NgModelSelect,
        ManySelects,
        NgIfSelect,
        SelectInitWithoutOptions,
        SelectWithChangeEvent,
        CustomSelectAccessor,
        CompWithCustomSelect,
        MultiSelect,
        FloatPlaceholderSelect,
        SelectWithErrorSibling,
        ThrowsErrorOnInit,
        BasicSelectOnPush,
        BasicSelectOnPushPreselected,
        SelectWithPlainTabindex,
        SelectEarlyAccessSibling,
        BasicSelectInitiallyHidden,
        BasicSelectNoPlaceholder,
        BasicSelectWithTheming,
        ResetValuesSelect,
        FalsyValueSelect,
        SelectWithGroups,
        InvalidSelectInForm,
        BasicSelectWithoutForms,
        BasicSelectWithoutFormsPreselected,
        BasicSelectWithoutFormsMultiple,
        SelectInsideFormGroup,
        SelectWithCustomTrigger,
        FalsyValueSelect,
        SelectInsideFormGroup,
        NgModelCompareWithSelect,
      ],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div') as HTMLElement;
          overlayContainerElement.classList.add('cdk-overlay-container');

          document.body.appendChild(overlayContainerElement);

          // remove body padding to keep consistent cross-browser
          document.body.style.padding = '0';
          document.body.style.margin = '0';

          return {getContainerElement: () => overlayContainerElement};
        }},
        {provide: Directionality, useFactory: () => dir = { value: 'ltr' }},
        {provide: ScrollDispatcher, useFactory: () => {
          return {scrolled: (_delay: number, callback: () => any) => {
            return scrolledSubject.asObservable().subscribe(callback);
          }};
        }}
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([ViewportRuler], (_ruler: ViewportRuler) => {
    viewportRuler = _ruler;
  }));

  afterEach(() => {
    document.body.removeChild(overlayContainerElement);
  });

  it('should select the proper option when the list of options is initialized at a later point',
    async(() => {
      let fixture = TestBed.createComponent(SelectInitWithoutOptions);
      let instance = fixture.componentInstance;

      fixture.detectChanges();

      // Wait for the initial writeValue promise.
      fixture.whenStable().then(() => {
        expect(instance.select.selected).toBeFalsy();

        instance.addOptions();
        fixture.detectChanges();

        // Wait for the next writeValue promise.
        fixture.whenStable().then(() => {
          expect(instance.select.selected).toBe(instance.options.toArray()[1]);
        });
      });
    }));

  describe('overlay panel', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let trigger: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();

      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
    });

    it('should open the panel when trigger is clicked', () => {
      trigger.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.select.panelOpen).toBe(true);
      expect(overlayContainerElement.textContent).toContain('Steak');
      expect(overlayContainerElement.textContent).toContain('Pizza');
      expect(overlayContainerElement.textContent).toContain('Tacos');
    });

    it('should close the panel when an item is clicked', async(() => {
      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('md-option') as HTMLElement;
      option.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(overlayContainerElement.textContent).toEqual('');
        expect(fixture.componentInstance.select.panelOpen).toBe(false);
      });
    }));

    it('should close the panel when a click occurs outside the panel', async(() => {
      trigger.click();
      fixture.detectChanges();

      const backdrop =
          overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

      backdrop.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(overlayContainerElement.textContent).toEqual('');
        expect(fixture.componentInstance.select.panelOpen).toBe(false);
      });
    }));

    it('should set the width of the overlay based on the trigger', async(() => {
      trigger.style.width = '200px';

      fixture.whenStable().then(() => {
        trigger.click();
        fixture.detectChanges();
        const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        expect(pane.style.minWidth).toBe('200px');
      });
    }));

    it('should set the width of the overlay if the element was hidden initially', async(() => {
      let initiallyHidden = TestBed.createComponent(BasicSelectInitiallyHidden);

      initiallyHidden.detectChanges();
      trigger = initiallyHidden.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
      trigger.style.width = '200px';

      initiallyHidden.componentInstance.isVisible = true;
      initiallyHidden.detectChanges();

      initiallyHidden.whenStable().then(() => {
        trigger.click();
        initiallyHidden.detectChanges();

        const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        expect(pane.style.minWidth).toBe('200px');
      });
    }));

    it('should not attempt to open a select that does not have any options', () => {
      fixture.componentInstance.foods = [];
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.select.panelOpen).toBe(false);
    });

    it('should set the width of the overlay if there is no placeholder', async(() => {
      let noPlaceholder = TestBed.createComponent(BasicSelectNoPlaceholder);

      noPlaceholder.detectChanges();
      trigger = noPlaceholder.debugElement.query(By.css('.mat-select-trigger')).nativeElement;

      noPlaceholder.whenStable().then(() => {
        trigger.click();
        noPlaceholder.detectChanges();

        const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        expect(parseInt(pane.style.minWidth as string)).toBeGreaterThan(0);
      });
    }));

    it('should close the panel when tabbing out', async(() => {
      trigger.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.select.panelOpen).toBe(true);

      const panel = overlayContainerElement.querySelector('.mat-select-panel')!;
      dispatchKeyboardEvent(panel, 'keydown', TAB);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.select.panelOpen).toBe(false);
      });
    }));

    it('should focus the first option when pressing HOME', () => {
      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();

      const panel = overlayContainerElement.querySelector('.mat-select-panel')!;
      const event = dispatchKeyboardEvent(panel, 'keydown', HOME);

      expect(fixture.componentInstance.select._keyManager.activeItemIndex).toBe(0);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should focus the last option when pressing END', () => {
      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();

      const panel = overlayContainerElement.querySelector('.mat-select-panel')!;
      const event = dispatchKeyboardEvent(panel, 'keydown', END);

      expect(fixture.componentInstance.select._keyManager.activeItemIndex).toBe(7);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should be able to set extra classes on the panel', () => {
      trigger.click();
      fixture.detectChanges();

      const panel = overlayContainerElement.querySelector('.mat-select-panel') as HTMLElement;

      expect(panel.classList).toContain('custom-one');
      expect(panel.classList).toContain('custom-two');
    });

    it('should prevent the default action when pressing SPACE on an option', () => {
      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('md-option')!;
      const event = dispatchKeyboardEvent(option, 'keydown', SPACE);

      expect(event.defaultPrevented).toBe(true);
    });

    it('should prevent the default action when pressing ENTER on an option', () => {
      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('md-option')!;
      const event = dispatchKeyboardEvent(option, 'keydown', ENTER);

      expect(event.defaultPrevented).toBe(true);
    });

    it('should update disableRipple properly on each option', () => {
      const options = fixture.componentInstance.options.toArray();

      expect(options.every(option => option.disableRipple === false))
        .toBeTruthy('Expected all options to have disableRipple set to false initially.');

      fixture.componentInstance.disableRipple = true;
      fixture.detectChanges();

      expect(options.every(option => option.disableRipple === true))
        .toBeTruthy('Expected all options to have disableRipple set to true.');
    });
  });

  describe('selection logic', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let trigger: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();

      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
    });

    it('should display placeholder if no option is selected', () => {
      expect(trigger.textContent!.trim()).toEqual('Food');
    });

    it('should focus the first option if no option is selected', async(() => {
      trigger.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.select._keyManager.activeItemIndex).toEqual(0);
      });
    }));

    it('should select an option when it is clicked', () => {
      trigger.click();
      fixture.detectChanges();

      let option = overlayContainerElement.querySelector('md-option') as HTMLElement;
      option.click();
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();

      option = overlayContainerElement.querySelector('md-option') as HTMLElement;

      expect(option.classList).toContain('mat-selected');
      expect(fixture.componentInstance.options.first.selected).toBe(true);
      expect(fixture.componentInstance.select.selected)
        .toBe(fixture.componentInstance.options.first);
    });

    it('should deselect other options when one is selected', () => {
      trigger.click();
      fixture.detectChanges();

      let options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;

      options[0].click();
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();

      options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList).not.toContain('mat-selected');
      expect(options[2].classList).not.toContain('mat-selected');

      const optionInstances = fixture.componentInstance.options.toArray();
      expect(optionInstances[1].selected).toBe(false);
      expect(optionInstances[2].selected).toBe(false);
    });

    it('should deselect other options when one is programmatically selected', () => {
      let control = fixture.componentInstance.control;
      let foods = fixture.componentInstance.foods;

      trigger.click();
      fixture.detectChanges();

      let options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;

      options[0].click();
      fixture.detectChanges();

      control.setValue(foods[1].value);
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();

      options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;

      expect(options[0].classList)
        .not.toContain('mat-selected', 'Expected first option to no longer be selected');
      expect(options[1].classList)
        .toContain('mat-selected', 'Expected second option to be selected');

      const optionInstances = fixture.componentInstance.options.toArray();

      expect(optionInstances[0].selected)
        .toBe(false, 'Expected first option to no longer be selected');
      expect(optionInstances[1].selected)
        .toBe(true, 'Expected second option to be selected');
    });

    it('should remove selection if option has been removed', async(() => {
      let select = fixture.componentInstance.select;

      trigger.click();
      fixture.detectChanges();

      let firstOption = overlayContainerElement.querySelectorAll('md-option')[0] as HTMLElement;

      firstOption.click();
      fixture.detectChanges();

      expect(select.selected).toBe(select.options.first, 'Expected first option to be selected.');

      fixture.componentInstance.foods = [];
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(select.selected)
          .toBeUndefined('Expected selection to be removed when option no longer exists.');
      });
    }));

    it('should display the selected option in the trigger', () => {
      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('md-option') as HTMLElement;
      option.click();
      fixture.detectChanges();

      const value = fixture.debugElement.query(By.css('.mat-select-value')).nativeElement;
      const placeholder =
        fixture.debugElement.query(By.css('.mat-select-placeholder')).nativeElement;

      expect(placeholder.textContent).toContain('Food');
      expect(value.textContent).toContain('Steak');
      expect(trigger.textContent).toContain('Food');
      expect(trigger.textContent).toContain('Steak');
    });

    it('should focus the selected option if an option is selected', async(() => {
      // must wait for initial writeValue promise to finish
      fixture.whenStable().then(() => {
        fixture.componentInstance.control.setValue('pizza-1');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        // must wait for animation to finish
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(fixture.componentInstance.select._keyManager.activeItemIndex).toEqual(1);
        });
      });
    }));

    it('should select an option that was added after initialization', () => {
      fixture.componentInstance.foods.push({viewValue: 'Potatoes', value: 'potatoes-8'});
      trigger.click();
      fixture.detectChanges();

      const options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      options[8].click();
      fixture.detectChanges();

      expect(trigger.textContent).toContain('Potatoes');
      expect(fixture.componentInstance.select.selected)
        .toBe(fixture.componentInstance.options.last);
    });

    it('should not select disabled options', () => {
      trigger.click();
      fixture.detectChanges();

      const options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      options[2].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.select.panelOpen).toBe(true);
      expect(options[2].classList).not.toContain('mat-selected');
      expect(fixture.componentInstance.select.selected).toBeUndefined();
    });

    it('should not select options inside a disabled group', async(() => {
      fixture.destroy();

      const groupFixture = TestBed.createComponent(SelectWithGroups);
      groupFixture.detectChanges();
      groupFixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement.click();
      groupFixture.detectChanges();

      const disabledGroup = overlayContainerElement.querySelectorAll('md-optgroup')[1];
      const options = disabledGroup.querySelectorAll('md-option');

      (options[0] as HTMLElement).click();
      groupFixture.detectChanges();

      expect(groupFixture.componentInstance.select.panelOpen).toBe(true);
      expect(options[0].classList).not.toContain('mat-selected');
      expect(groupFixture.componentInstance.select.selected).toBeUndefined();
    }));

  });

  describe('forms integration', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let trigger: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
    });

    it('should take an initial view value with reactive forms', () => {
      fixture.componentInstance.control = new FormControl('pizza-1');
      fixture.detectChanges();

      const value = fixture.debugElement.query(By.css('.mat-select-value'));
      expect(value.nativeElement.textContent)
          .toContain('Pizza', `Expected trigger to be populated by the control's initial value.`);

      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
      trigger.click();
      fixture.detectChanges();

      const options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList)
          .toContain('mat-selected',
              `Expected option with the control's initial value to be selected.`);
    });

    beforeEach(() => {
      fixture.detectChanges();
      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
    });

    it('should set the view value from the form', () => {
      let value = fixture.debugElement.query(By.css('.mat-select-value'));
      expect(value).toBeNull('Expected trigger to start with empty value.');

      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      value = fixture.debugElement.query(By.css('.mat-select-value'));
      expect(value.nativeElement.textContent)
        .toContain('Pizza', `Expected trigger to be populated by the control's new value.`);

      trigger.click();
      fixture.detectChanges();

      const options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList)
        .toContain('mat-selected', `Expected option with the control's new value to be selected.`);
    });

    it('should update the form value when the view changes', () => {
      expect(fixture.componentInstance.control.value)
        .toEqual(null, `Expected the control's value to be null initially.`);

      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('md-option') as HTMLElement;
      option.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.control.value)
        .toEqual('steak-0', `Expected control's value to be set to the new option.`);
    });

    it('should clear the selection when a nonexistent option value is selected', () => {
      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      fixture.componentInstance.control.setValue('gibberish');
      fixture.detectChanges();

      const value = fixture.debugElement.query(By.css('.mat-select-value'));
      expect(value).toBe(null, `Expected trigger to be cleared when option value is not found.`);
      expect(trigger.textContent)
          .not.toContain('Pizza', `Expected trigger to be cleared when option value is not found.`);

      trigger.click();
      fixture.detectChanges();

      const options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList)
          .not.toContain('mat-selected', `Expected option with the old value not to be selected.`);
    });


    it('should clear the selection when the control is reset', () => {
      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      fixture.componentInstance.control.reset();
      fixture.detectChanges();

      const value = fixture.debugElement.query(By.css('.mat-select-value'));
      expect(value).toBe(null, `Expected trigger to be cleared when option value is not found.`);
      expect(trigger.textContent)
          .not.toContain('Pizza', `Expected trigger to be cleared when option value is not found.`);

      trigger.click();
      fixture.detectChanges();

      const options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList)
          .not.toContain('mat-selected', `Expected option with the old value not to be selected.`);
    });

    it('should set the control to touched when the select is touched', () => {
      expect(fixture.componentInstance.control.touched)
        .toEqual(false, `Expected the control to start off as untouched.`);

      trigger.click();
      dispatchFakeEvent(trigger, 'blur');
      fixture.detectChanges();
      expect(fixture.componentInstance.control.touched)
        .toEqual(false, `Expected the control to stay untouched when menu opened.`);

      const backdrop =
        overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();
      dispatchFakeEvent(trigger, 'blur');
      fixture.detectChanges();
      expect(fixture.componentInstance.control.touched)
        .toEqual(true, `Expected the control to be touched as soon as focus left the select.`);
    });

    it('should not set touched when a disabled select is touched', () => {
      expect(fixture.componentInstance.control.touched)
        .toBe(false, 'Expected the control to start off as untouched.');

      fixture.componentInstance.control.disable();
      dispatchFakeEvent(trigger, 'blur');

      expect(fixture.componentInstance.control.touched)
        .toBe(false, 'Expected the control to stay untouched.');
    });

    it('should set the control to dirty when the select\'s value changes in the DOM', () => {
      expect(fixture.componentInstance.control.dirty)
        .toEqual(false, `Expected control to start out pristine.`);

      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('md-option') as HTMLElement;
      option.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.control.dirty)
        .toEqual(true, `Expected control to be dirty after value was changed by user.`);
    });

    it('should not set the control to dirty when the value changes programmatically', () => {
      expect(fixture.componentInstance.control.dirty)
        .toEqual(false, `Expected control to start out pristine.`);

      fixture.componentInstance.control.setValue('pizza-1');

      expect(fixture.componentInstance.control.dirty)
        .toEqual(false, `Expected control to stay pristine after programmatic change.`);
    });


    it('should set an asterisk after the placeholder if the control is required', () => {
      const placeholder =
        fixture.debugElement.query(By.css('.mat-select-placeholder')).nativeElement;
      const initialContent =  getComputedStyle(placeholder, '::after').getPropertyValue('content');

      // must support both default cases to work in all browsers in Saucelabs
      expect(initialContent === 'none' || initialContent === '')
        .toBe(true, `Expected placeholder not to have an asterisk, as control was not required.`);

      fixture.componentInstance.isRequired = true;
      fixture.detectChanges();
      expect(getComputedStyle(placeholder, '::after').getPropertyValue('content'))
        .toContain('*', `Expected placeholder to have an asterisk, as control was required.`);
    });

    it('should be able to programmatically select a falsy option', () => {
      fixture.destroy();

      const falsyFixture = TestBed.createComponent(FalsyValueSelect);

      falsyFixture.detectChanges();
      falsyFixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement.click();
      falsyFixture.componentInstance.control.setValue(0);
      falsyFixture.detectChanges();

      expect(falsyFixture.componentInstance.options.first.selected)
        .toBe(true, 'Expected first option to be selected');
      expect(overlayContainerElement.querySelectorAll('md-option')[0].classList)
        .toContain('mat-selected', 'Expected first option to be selected');
    });

  });

  describe('selection without Angular forms', () => {
    it('should set the value when options are clicked', () => {
      const fixture = TestBed.createComponent(BasicSelectWithoutForms);

      fixture.detectChanges();
      expect(fixture.componentInstance.selectedFood).toBeFalsy();

      const trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;

      trigger.click();
      fixture.detectChanges();

      (overlayContainerElement.querySelector('md-option') as HTMLElement).click();
      fixture.detectChanges();

      expect(fixture.componentInstance.selectedFood).toBe('steak-0');
      expect(fixture.componentInstance.select.value).toBe('steak-0');
      expect(trigger.textContent).toContain('Steak');

      trigger.click();
      fixture.detectChanges();

      (overlayContainerElement.querySelectorAll('md-option')[2] as HTMLElement).click();
      fixture.detectChanges();

      expect(fixture.componentInstance.selectedFood).toBe('sandwich-2');
      expect(fixture.componentInstance.select.value).toBe('sandwich-2');
      expect(trigger.textContent).toContain('Sandwich');
    });

    it('should mark options as selected when the value is set', () => {
      const fixture = TestBed.createComponent(BasicSelectWithoutForms);

      fixture.detectChanges();
      fixture.componentInstance.selectedFood = 'sandwich-2';
      fixture.detectChanges();

      const trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
      expect(trigger.textContent).toContain('Sandwich');

      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelectorAll('md-option')[2];

      expect(option.classList).toContain('mat-selected');
      expect(fixture.componentInstance.select.value).toBe('sandwich-2');
    });

    it('should reset the placeholder when a null value is set', () => {
      const fixture = TestBed.createComponent(BasicSelectWithoutForms);

      fixture.detectChanges();
      expect(fixture.componentInstance.selectedFood).toBeFalsy();

      const trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;

      trigger.click();
      fixture.detectChanges();

      (overlayContainerElement.querySelector('md-option') as HTMLElement).click();
      fixture.detectChanges();

      expect(fixture.componentInstance.selectedFood).toBe('steak-0');
      expect(fixture.componentInstance.select.value).toBe('steak-0');
      expect(trigger.textContent).toContain('Steak');

      fixture.componentInstance.selectedFood = null;
      fixture.detectChanges();

      expect(fixture.componentInstance.select.value).toBeNull();
      expect(trigger.textContent).not.toContain('Steak');
    });

    it('should reflect the preselected value', async(() => {
      const fixture = TestBed.createComponent(BasicSelectWithoutFormsPreselected);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;

        fixture.detectChanges();
        expect(trigger.textContent).toContain('Pizza');

        trigger.click();
        fixture.detectChanges();

        const option = overlayContainerElement.querySelectorAll('md-option')[1];

        expect(option.classList).toContain('mat-selected');
        expect(fixture.componentInstance.select.value).toBe('pizza-1');
      });
    }));

    it('should be able to select multiple values', () => {
      const fixture = TestBed.createComponent(BasicSelectWithoutFormsMultiple);

      fixture.detectChanges();
      expect(fixture.componentInstance.selectedFoods).toBeFalsy();

      const trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;

      trigger.click();
      fixture.detectChanges();

      const options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;

      options[0].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.selectedFoods).toEqual(['steak-0']);
      expect(fixture.componentInstance.select.value).toEqual(['steak-0']);
      expect(trigger.textContent).toContain('Steak');

      options[2].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.selectedFoods).toEqual(['steak-0', 'sandwich-2']);
      expect(fixture.componentInstance.select.value).toEqual(['steak-0', 'sandwich-2']);
      expect(trigger.textContent).toContain('Steak, Sandwich');

      options[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.selectedFoods).toEqual(['steak-0', 'pizza-1', 'sandwich-2']);
      expect(fixture.componentInstance.select.value).toEqual(['steak-0', 'pizza-1', 'sandwich-2']);
      expect(trigger.textContent).toContain('Steak, Pizza, Sandwich');
    });

  });

  describe('disabled behavior', () => {

    it('should disable itself when control is disabled programmatically', () => {
      const fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();

      fixture.componentInstance.control.disable();
      fixture.detectChanges();
      let trigger =
        fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
      expect(getComputedStyle(trigger).getPropertyValue('cursor'))
        .toEqual('default', `Expected cursor to be default arrow on disabled control.`);

      trigger.click();
      fixture.detectChanges();

      expect(overlayContainerElement.textContent)
        .toEqual('', `Expected select panel to stay closed.`);
      expect(fixture.componentInstance.select.panelOpen)
        .toBe(false, `Expected select panelOpen property to stay false.`);

      fixture.componentInstance.control.enable();
      fixture.detectChanges();
      expect(getComputedStyle(trigger).getPropertyValue('cursor'))
        .toEqual('pointer', `Expected cursor to be a pointer on enabled control.`);

      trigger.click();
      fixture.detectChanges();

      expect(overlayContainerElement.textContent)
        .toContain('Steak', `Expected select panel to open normally on re-enabled control`);
      expect(fixture.componentInstance.select.panelOpen)
        .toBe(true, `Expected select panelOpen property to become true.`);
    });

    it('should disable itself when control is disabled using the property', async(() => {
      const fixture = TestBed.createComponent(NgModelSelect);
      fixture.detectChanges();

      fixture.componentInstance.isDisabled = true;
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        let trigger =
          fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
        expect(getComputedStyle(trigger).getPropertyValue('cursor'))
          .toEqual('default', `Expected cursor to be default arrow on disabled control.`);

        trigger.click();
        fixture.detectChanges();

        expect(overlayContainerElement.textContent)
          .toEqual('', `Expected select panel to stay closed.`);
        expect(fixture.componentInstance.select.panelOpen)
          .toBe(false, `Expected select panelOpen property to stay false.`);

        fixture.componentInstance.isDisabled = false;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(getComputedStyle(trigger).getPropertyValue('cursor'))
            .toEqual('pointer', `Expected cursor to be a pointer on enabled control.`);

          trigger.click();
          fixture.detectChanges();

          expect(overlayContainerElement.textContent)
            .toContain('Steak', `Expected select panel to open normally on re-enabled control`);
          expect(fixture.componentInstance.select.panelOpen)
            .toBe(true, `Expected select panelOpen property to become true.`);
        });
      });
    }));
  });

  describe('misc forms', () => {
    it('should support use inside a custom value accessor', () => {
      const fixture = TestBed.createComponent(CompWithCustomSelect);
      spyOn(fixture.componentInstance.customAccessor, 'writeValue');
      fixture.detectChanges();

      expect(fixture.componentInstance.customAccessor.select._control)
          .toBe(null, 'Expected md-select NOT to inherit control from parent value accessor.');
      expect(fixture.componentInstance.customAccessor.writeValue).toHaveBeenCalled();
    });

  });

  describe('animations', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let trigger: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();

      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
    }));

    it('should float the placeholder when the panel is open and unselected', () => {
      expect(fixture.componentInstance.select._getPlaceholderAnimationState())
          .toEqual('', 'Expected placeholder to initially have a normal position.');

      trigger.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.select._getPlaceholderAnimationState())
          .toEqual('floating-ltr', 'Expected placeholder to animate up to floating position.');

      const backdrop =
        overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.select._getPlaceholderAnimationState())
          .toEqual('', 'Expected placeholder to animate back down to normal position.');
    });

    it('should float the placeholder without animation when value is set', () => {
      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      const placeholderEl =
          fixture.debugElement.query(By.css('.mat-select-placeholder')).nativeElement;

      expect(placeholderEl.classList)
          .toContain('mat-floating-placeholder', 'Expected placeholder to display as floating.');
      expect(fixture.componentInstance.select._getPlaceholderAnimationState())
          .toEqual('', 'Expected animation state to be empty to avoid animation.');
    });

    it('should use the floating-rtl state when the dir is rtl', () => {
      dir.value = 'rtl';

      trigger.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.select._getPlaceholderAnimationState())
          .toEqual('floating-rtl');
    });

    it('should add a class to the panel when the menu is done animating', fakeAsync(() => {
      trigger.click();
      fixture.detectChanges();

      const panel = overlayContainerElement.querySelector('.mat-select-panel')!;

      expect(panel.classList).not.toContain('mat-select-panel-done-animating');

      tick(250);
      fixture.detectChanges();

      expect(panel.classList).toContain('mat-select-panel-done-animating');
    }));

  });

  describe('positioning', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let trigger: HTMLElement;
    let select: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();
      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
      select = fixture.debugElement.query(By.css('md-select')).nativeElement;
    });

    /**
     * Asserts that the given option is aligned with the trigger.
     * @param index The index of the option.
     * @param selectInstance Instance of the `md-select` component to check against.
     */
    function checkTriggerAlignedWithOption(index: number, selectInstance =
      fixture.componentInstance.select): void {

      const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
      const triggerTop = trigger.getBoundingClientRect().top;
      const overlayTop = overlayPane.getBoundingClientRect().top;
      const options = overlayPane.querySelectorAll('md-option');
      const optionTop = options[index].getBoundingClientRect().top;

      // The option text should align with the trigger text. Because each option is 18px
      // larger in height than the trigger, the option needs to be adjusted up 9 pixels.
      expect(Math.floor(optionTop))
          .toEqual(Math.floor(triggerTop - 9), `Expected trigger to align with option ${index}.`);

      // For the animation to start at the option's center, its origin must be the distance
      // from the top of the overlay to the option top + half the option height (48/2 = 24).
      const expectedOrigin = Math.floor(optionTop - overlayTop + 24);
      const rawYOrigin = selectInstance._transformOrigin.split(' ')[1].trim();
      const origin = Math.floor(parseInt(rawYOrigin));

      expect(origin).toBe(expectedOrigin,
          `Expected panel animation to originate in the center of option ${index}.`);
    }

    describe('ample space to open', () => {

      beforeEach(() => {
        // these styles are necessary because we are first testing the overlay's position
        // if there is room for it to open to its full extent in either direction.
        select.style.position = 'fixed';
        select.style.top = '285px';
        select.style.left = '20px';
      });


      it('should align the first option with the trigger text if no option is selected', () => {
        trigger.click();
        fixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .mat-select-panel')!;

        // The panel should be scrolled to 0 because centering the option is not possible.
        expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to be scrolled.`);

        checkTriggerAlignedWithOption(0);
      });

      it('should align a selected option too high to be centered with the trigger text', () => {
        // Select the second option, because it can't be scrolled any further downward
        fixture.componentInstance.control.setValue('pizza-1');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .mat-select-panel')!;

        // The panel should be scrolled to 0 because centering the option is not possible.
        expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to be scrolled.`);

        checkTriggerAlignedWithOption(1);
      });

      it('should align a selected option in the middle with the trigger text', () => {
        // Select the fifth option, which has enough space to scroll to the center
        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .mat-select-panel')!;

        // The selected option should be scrolled to the center of the panel.
        // This will be its original offset from the scrollTop - half the panel height + half the
        // option height. 4 (index) * 48 (option height) = 192px offset from scrollTop
        // 192 - 256/2 + 48/2 = 88px
        expect(scrollContainer.scrollTop)
            .toEqual(88, `Expected overlay panel to be scrolled to center the selected option.`);

        checkTriggerAlignedWithOption(4);
      });

      it('should align a selected option at the scroll max with the trigger text', () => {
        // Select the last option in the list
        fixture.componentInstance.control.setValue('sushi-7');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .mat-select-panel')!;

        // The selected option should be scrolled to the max scroll position.
        // This will be the height of the scrollContainer - the panel height.
        // 8 options * 48px = 384 scrollContainer height, 384 - 256 = 128px max scroll
        expect(scrollContainer.scrollTop)
            .toEqual(128, `Expected overlay panel to be scrolled to its maximum position.`);

        checkTriggerAlignedWithOption(7);
      });

      it('should account for preceding label groups when aligning the option', () => {
        fixture.destroy();

        let groupFixture = TestBed.createComponent(SelectWithGroups);
        groupFixture.detectChanges();
        trigger = groupFixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
        select = groupFixture.debugElement.query(By.css('md-select')).nativeElement;

        select.style.position = 'fixed';
        select.style.top = '200px';
        select.style.left = '100px';

        // Select an option in the third group, which has a couple of group labels before it.
        groupFixture.componentInstance.control.setValue('vulpix-7');
        groupFixture.detectChanges();

        trigger.click();
        groupFixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .mat-select-panel')!;

        // The selected option should be scrolled to the center of the panel.
        // This will be its original offset from the scrollTop - half the panel height + half the
        // option height. 10 (option index + 3 group labels before it) * 48 (option height) = 480px.
        // 480 (offset from scrollTop) - 256/2 + 48/2 = 376px
        expect(Math.floor(scrollContainer.scrollTop))
            .toBe(376, `Expected overlay panel to be scrolled to center the selected option.`);

        checkTriggerAlignedWithOption(7, groupFixture.componentInstance.select);
      });

    });

    describe('limited space to open vertically', () => {

      beforeEach(() => {
        select.style.position = 'fixed';
        select.style.left = '20px';
      });

      it('should adjust position of centered option if there is little space above', () => {
        // Push the select to a position with not quite enough space on the top to open
        // with the option completely centered (needs 113px at least: 256/2 - 48/2 + 9)
        select.style.top = '85px';

        // Select an option in the middle of the list
        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .mat-select-panel')!;

        // Scroll should adjust by the difference between the top space available (85px + 8px
        // viewport padding = 77px) and the height of the panel above the option (113px).
        // 113px - 93px = 20px difference + original scrollTop 88px = 108px
        expect(scrollContainer.scrollTop)
            .toEqual(108, `Expected panel to adjust scroll position to fit in viewport.`);

        checkTriggerAlignedWithOption(4);
      });

      it('should adjust position of centered option if there is little space below', () => {
        // Push the select to a position with not quite enough space on the bottom to open
        // with the option completely centered (needs 113px at least: 256/2 - 48/2 + 9)
        select.style.bottom = '56px';

        // Select an option in the middle of the list
        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .mat-select-panel')!;

        // Scroll should adjust by the difference between the bottom space available
        // (56px from the bottom of the screen - 8px padding = 48px)
        // and the height of the panel below the option (113px).
        // 113px - 48px = 75px difference. Original scrollTop 88px - 75px = 23px
        expect(Math.ceil(scrollContainer.scrollTop))
            .toEqual(23, `Expected panel to adjust scroll position to fit in viewport.`);

        checkTriggerAlignedWithOption(4);
      });

      it('should fall back to "above" positioning if scroll adjustment will not help', () => {
        // Push the select to a position with not enough space on the bottom to open
        select.style.bottom = '56px';
        fixture.detectChanges();

        // Select an option that cannot be scrolled any farther upward
        fixture.componentInstance.control.setValue('coke-0');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const overlayPane = document.querySelector('.cdk-overlay-pane')!;
        const triggerBottom = trigger.getBoundingClientRect().bottom;
        const overlayBottom = overlayPane.getBoundingClientRect().bottom;
        const scrollContainer = overlayPane.querySelector('.mat-select-panel')!;

        // Expect no scroll to be attempted
        expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to be scrolled.`);

        expect(Math.floor(overlayBottom))
            .toEqual(Math.floor(triggerBottom),
                `Expected trigger bottom to align with overlay bottom.`);

        expect(fixture.componentInstance.select._transformOrigin)
            .toContain(`bottom`, `Expected panel animation to originate at the bottom.`);
      });

      it('should fall back to "below" positioning if scroll adjustment will not help', () => {
        // Push the select to a position with not enough space on the top to open
        select.style.top = '85px';

        // Select an option that cannot be scrolled any farther downward
        fixture.componentInstance.control.setValue('sushi-7');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const overlayPane = document.querySelector('.cdk-overlay-pane')!;
        const triggerTop = trigger.getBoundingClientRect().top;
        const overlayTop = overlayPane.getBoundingClientRect().top;
        const scrollContainer = overlayPane.querySelector('.mat-select-panel')!;

        // Expect scroll to remain at the max scroll position
        expect(scrollContainer.scrollTop).toEqual(128, `Expected panel to be at max scroll.`);

        expect(Math.floor(overlayTop))
            .toEqual(Math.floor(triggerTop), `Expected trigger top to align with overlay top.`);

        expect(fixture.componentInstance.select._transformOrigin)
            .toContain(`top`, `Expected panel animation to originate at the top.`);
      });

    });

    describe('limited space to open horizontally', () => {
      beforeEach(() => {
        select.style.position = 'absolute';
        select.style.top = '200px';
      });

      it('should stay within the viewport when overflowing on the left in ltr', fakeAsync(() => {
        select.style.left = '-100px';
        trigger.click();
        tick(400);
        fixture.detectChanges();

        const panelLeft = document.querySelector('.mat-select-panel')!.getBoundingClientRect().left;

        expect(panelLeft).toBeGreaterThan(0,
            `Expected select panel to be inside the viewport in ltr.`);
      }));

      it('should stay within the viewport when overflowing on the left in rtl', fakeAsync(() => {
        dir.value = 'rtl';
        select.style.left = '-100px';
        trigger.click();
        tick(400);
        fixture.detectChanges();

        const panelLeft = document.querySelector('.mat-select-panel')!.getBoundingClientRect().left;

        expect(panelLeft).toBeGreaterThan(0,
            `Expected select panel to be inside the viewport in rtl.`);
      }));

      it('should stay within the viewport when overflowing on the right in ltr', fakeAsync(() => {
        select.style.right = '-100px';
        trigger.click();
        tick(400);
        fixture.detectChanges();

        const viewportRect = viewportRuler.getViewportRect().right;
        const panelRight = document.querySelector('.mat-select-panel')!
            .getBoundingClientRect().right;

        expect(viewportRect - panelRight).toBeGreaterThan(0,
            `Expected select panel to be inside the viewport in ltr.`);
      }));

      it('should stay within the viewport when overflowing on the right in rtl', fakeAsync(() => {
        dir.value = 'rtl';
        select.style.right = '-100px';
        trigger.click();
        tick(400);
        fixture.detectChanges();

        const viewportRect = viewportRuler.getViewportRect().right;
        const panelRight = document.querySelector('.mat-select-panel')!
            .getBoundingClientRect().right;

        expect(viewportRect - panelRight).toBeGreaterThan(0,
            `Expected select panel to be inside the viewport in rtl.`);
      }));

      it('should keep the position within the viewport on repeat openings', async(() => {
        select.style.left = '-100px';
        trigger.click();
        fixture.detectChanges();

        let panelLeft = document.querySelector('.mat-select-panel')!.getBoundingClientRect().left;

        expect(panelLeft).toBeGreaterThan(0, `Expected select panel to be inside the viewport.`);

        fixture.componentInstance.select.close();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          trigger.click();
          fixture.detectChanges();
          panelLeft = document.querySelector('.mat-select-panel')!.getBoundingClientRect().left;

          expect(panelLeft).toBeGreaterThan(0,
              `Expected select panel continue being inside the viewport.`);
        });
      }));

    });

    describe('when scrolled', () => {
      const startingWindowHeight = window.innerHeight;

      // Need to set the scrollTop two different ways to support
      // both Chrome and Firefox.
      function setScrollTop(num: number) {
        document.body.scrollTop = num;
        document.documentElement.scrollTop = num;
      }

      beforeEach(() => {
        // Make the div above the select very tall, so the page will scroll
        fixture.componentInstance.heightAbove = 2000;
        fixture.detectChanges();
        setScrollTop(0);

        // Give the select enough horizontal space to open
        select.style.marginLeft = '20px';
        select.style.marginRight = '20px';
      });

      it('should align the first option properly when scrolled', () => {
        // Give the select enough space to open
        fixture.componentInstance.heightBelow = 400;
        fixture.detectChanges();

        // Scroll the select into view
        setScrollTop(1700);

        trigger.click();
        fixture.detectChanges();

        checkTriggerAlignedWithOption(0);
      });

      it('should align a centered option properly when scrolled', () => {
        // Give the select enough space to open
        fixture.componentInstance.heightBelow = 400;
        fixture.detectChanges();

        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        // Scroll the select into view
        setScrollTop(1700);

        trigger.click();
        fixture.detectChanges();

        checkTriggerAlignedWithOption(4);
      });

      it('should align a centered option properly when scrolling while the panel is open', () => {
        fixture.componentInstance.heightBelow = 400;
        fixture.componentInstance.heightAbove = 400;
        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        setScrollTop(100);
        scrolledSubject.next();
        fixture.detectChanges();

        checkTriggerAlignedWithOption(4);
      });

      it('should fall back to "above" positioning properly when scrolled', () => {
        // Give the select insufficient space to open below the trigger
        fixture.componentInstance.heightAbove = 0;
        fixture.componentInstance.heightBelow = 100;
        trigger.style.marginTop = '2000px';
        fixture.detectChanges();

        // Scroll the select into view
        setScrollTop(1400);

        // In the iOS simulator (BrowserStack & SauceLabs), adding the content to the
        // body causes karma's iframe for the test to stretch to fit that content once we attempt to
        // scroll the page. Setting width / height / maxWidth / maxHeight on the iframe does not
        // successfully constrain its size. As such, skip assertions in environments where the
        // window size has changed since the start of the test.
        if (window.innerHeight > startingWindowHeight) {
          return;
        }

        trigger.click();
        fixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
        const triggerBottom = trigger.getBoundingClientRect().bottom;
        const overlayBottom = overlayPane.getBoundingClientRect().bottom;

        expect(Math.floor(overlayBottom))
            .toEqual(Math.floor(triggerBottom),
                `Expected trigger bottom to align with overlay bottom.`);
      });

      it('should fall back to "below" positioning properly when scrolled', () => {
        // Give plenty of space for the select to open below the trigger
        fixture.componentInstance.heightBelow = 650;
        fixture.detectChanges();

        // Select an option too low in the list to fit in limited space above
        fixture.componentInstance.control.setValue('sushi-7');
        fixture.detectChanges();

        // Scroll the select so that it has insufficient space to open above the trigger
        setScrollTop(1950);

        trigger.click();
        fixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
        const triggerTop = trigger.getBoundingClientRect().top;
        const overlayTop = overlayPane.getBoundingClientRect().top;

        expect(Math.floor(overlayTop))
            .toEqual(Math.floor(triggerTop), `Expected trigger top to align with overlay top.`);
      });

    });

    describe('x-axis positioning', () => {

      beforeEach(() => {
        select.style.position = 'fixed';
        select.style.left = '30px';
      });

      it('should align the trigger and the selected option on the x-axis in ltr', fakeAsync(() => {
        trigger.click();
        tick(400);
        fixture.detectChanges();

        const triggerLeft = trigger.getBoundingClientRect().left;
        const firstOptionLeft = document.querySelector('.cdk-overlay-pane md-option')!
            .getBoundingClientRect().left;

        // Each option is 32px wider than the trigger, so it must be adjusted 16px
        // to ensure the text overlaps correctly.
        expect(Math.floor(firstOptionLeft)).toEqual(Math.floor(triggerLeft - 16),
            `Expected trigger to align with the selected option on the x-axis in LTR.`);
      }));

      it('should align the trigger and the selected option on the x-axis in rtl', fakeAsync(() => {
        dir.value = 'rtl';
        fixture.detectChanges();

        trigger.click();
        tick(400);
        fixture.detectChanges();

        const triggerRight = trigger.getBoundingClientRect().right;
        const firstOptionRight =
            document.querySelector('.cdk-overlay-pane md-option')!.getBoundingClientRect().right;

        // Each option is 32px wider than the trigger, so it must be adjusted 16px
        // to ensure the text overlaps correctly.
        expect(Math.floor(firstOptionRight))
            .toEqual(Math.floor(triggerRight + 16),
                `Expected trigger to align with the selected option on the x-axis in RTL.`);
      }));
    });

    describe('x-axis positioning in multi select mode', () => {
      let multiFixture: ComponentFixture<MultiSelect>;

      beforeEach(() => {
        multiFixture = TestBed.createComponent(MultiSelect);
        multiFixture.detectChanges();
        trigger = multiFixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
        select = multiFixture.debugElement.query(By.css('md-select')).nativeElement;

        select.style.position = 'fixed';
        select.style.left = '60px';
      });

      it('should adjust for the checkbox in ltr', async(() => {
        trigger.click();
        multiFixture.detectChanges();

        multiFixture.whenStable().then(() => {
          const triggerLeft = trigger.getBoundingClientRect().left;
          const firstOptionLeft =
              document.querySelector('.cdk-overlay-pane md-option')!.getBoundingClientRect().left;

          // 48px accounts for the checkbox size, margin and the panel's padding.
          expect(Math.floor(firstOptionLeft))
              .toEqual(Math.floor(triggerLeft - 48),
                  `Expected trigger label to align along x-axis, accounting for the checkbox.`);
        });
      }));

      it('should adjust for the checkbox in rtl', fakeAsync(() => {
        dir.value = 'rtl';
        trigger.click();
        tick(400);
        multiFixture.detectChanges();

        const triggerRight = trigger.getBoundingClientRect().right;
        const firstOptionRight =
            document.querySelector('.cdk-overlay-pane md-option')!.getBoundingClientRect().right;

        // 48px accounts for the checkbox size, margin and the panel's padding.
        expect(Math.floor(firstOptionRight))
            .toEqual(Math.floor(triggerRight + 48),
                `Expected trigger label to align along x-axis, accounting for the checkbox.`);
      }));
    });

    describe('x-axis positioning with groups', () => {
      let groupFixture: ComponentFixture<SelectWithGroups>;

      beforeEach(() => {
        groupFixture = TestBed.createComponent(SelectWithGroups);
        groupFixture.detectChanges();
        trigger = groupFixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
        select = groupFixture.debugElement.query(By.css('md-select')).nativeElement;

        select.style.position = 'fixed';
        select.style.left = '60px';
      });

      it('should adjust for the group padding in ltr', fakeAsync(() => {
        groupFixture.componentInstance.control.setValue('oddish-1');
        groupFixture.detectChanges();

        trigger.click();
        groupFixture.detectChanges();

        const group = document.querySelector('.cdk-overlay-pane md-optgroup')!;
        const triggerLeft = trigger.getBoundingClientRect().left;
        const selectedOptionLeft = group.querySelector('md-option.mat-selected')!
            .getBoundingClientRect().left;

        // 32px is the 16px default padding plus 16px of padding when an option is in a group.
        expect(Math.floor(selectedOptionLeft)).toEqual(Math.floor(triggerLeft - 32),
            `Expected trigger label to align along x-axis, accounting for the padding in ltr.`);
      }));

      it('should adjust for the group padding in rtl', fakeAsync(() => {
        dir.value = 'rtl';
        groupFixture.componentInstance.control.setValue('oddish-1');
        groupFixture.detectChanges();

        trigger.click();
        groupFixture.detectChanges();

        const group = document.querySelector('.cdk-overlay-pane md-optgroup')!;
        const triggerRight = trigger.getBoundingClientRect().right;
        const selectedOptionRight = group.querySelector('md-option.mat-selected')!
            .getBoundingClientRect().right;

        // 32px is the 16px default padding plus 16px of padding when an option is in a group.
        expect(Math.floor(selectedOptionRight)).toEqual(Math.floor(triggerRight + 32),
            `Expected trigger label to align along x-axis, accounting for the padding in rtl.`);
      }));

      it('should not adjust if all options are within a group, except the selected one',
        fakeAsync(() => {
          groupFixture.componentInstance.control.setValue('mime-11');
          groupFixture.detectChanges();

          trigger.click();
          groupFixture.detectChanges();

          const selected = document.querySelector('.cdk-overlay-pane md-option.mat-selected')!;
          const selectedOptionLeft = selected.getBoundingClientRect().left;
          const triggerLeft = trigger.getBoundingClientRect().left;

          // 16px is the default option padding
          expect(Math.floor(selectedOptionLeft)).toEqual(Math.floor(triggerLeft - 16));
        }));

      it('should align the first option to the trigger, if nothing is selected', fakeAsync(() => {
        trigger.click();
        groupFixture.detectChanges();

        const triggerTop = trigger.getBoundingClientRect().top;

        const option = overlayContainerElement.querySelector('.cdk-overlay-pane md-option');
        const optionTop = option ? option.getBoundingClientRect().top : 0;

        // Since the option is 18px higher than the trigger, it needs to be adjusted by 9px.
        expect(Math.floor(optionTop))
            .toBe(Math.floor(triggerTop - 9), 'Expected trigger to align with the first option.');
      }));

    });

  });

  describe('accessibility', () => {

    describe('for select', () => {
      let fixture: ComponentFixture<BasicSelect>;
      let select: HTMLElement;

      beforeEach(() => {
        fixture = TestBed.createComponent(BasicSelect);
        fixture.detectChanges();
        select = fixture.debugElement.query(By.css('md-select')).nativeElement;
      });

      it('should set the role of the select to listbox', () => {
        expect(select.getAttribute('role')).toEqual('listbox');
      });

      it('should set the aria label of the select to the placeholder', () => {
        expect(select.getAttribute('aria-label')).toEqual('Food');
      });

      it('should support setting a custom aria-label', () => {
        fixture.componentInstance.ariaLabel = 'Custom Label';
        fixture.detectChanges();

        expect(select.getAttribute('aria-label')).toEqual('Custom Label');
      });

      it('should not set an aria-label if aria-labelledby is specified', () => {
        fixture.componentInstance.ariaLabelledby = 'myLabelId';
        fixture.detectChanges();

        expect(select.getAttribute('aria-label')).toBeFalsy('Expected no aria-label to be set.');
        expect(select.getAttribute('aria-labelledby')).toBe('myLabelId');
      });

      it('should set the tabindex of the select to 0 by default', () => {
        expect(select.getAttribute('tabindex')).toEqual('0');
      });

      it('should be able to override the tabindex', () => {
        fixture.componentInstance.tabIndexOverride = 3;
        fixture.detectChanges();

        expect(select.getAttribute('tabindex')).toBe('3');
      });

      it('should be able to set the tabindex via the native attribute', () => {
        fixture.destroy();

        const plainTabindexFixture = TestBed.createComponent(SelectWithPlainTabindex);

        plainTabindexFixture.detectChanges();
        select = plainTabindexFixture.debugElement.query(By.css('md-select')).nativeElement;

        expect(select.getAttribute('tabindex')).toBe('5');
      });

      it('should set aria-required for required selects', () => {
        expect(select.getAttribute('aria-required'))
          .toEqual('false', `Expected aria-required attr to be false for normal selects.`);

        fixture.componentInstance.isRequired = true;
        fixture.detectChanges();

        expect(select.getAttribute('aria-required'))
          .toEqual('true', `Expected aria-required attr to be true for required selects.`);
      });

      it('should set the mat-select-required class for required selects', () => {
        expect(select.classList).not.toContain(
            'mat-select-required', `Expected the mat-select-required class not to be set.`);

        fixture.componentInstance.isRequired = true;
        fixture.detectChanges();

        expect(select.classList).toContain(
          'mat-select-required', `Expected the mat-select-required class to be set.`);
      });

      it('should set aria-invalid for selects that are invalid and touched', () => {
        expect(select.getAttribute('aria-invalid'))
          .toEqual('false', `Expected aria-invalid attr to be false for valid selects.`);

        fixture.componentInstance.isRequired = true;
        fixture.componentInstance.control.markAsTouched();
        fixture.detectChanges();

        expect(select.getAttribute('aria-invalid'))
          .toEqual('true', `Expected aria-invalid attr to be true for invalid selects.`);
      });

      it('should set aria-disabled for disabled selects', () => {
        expect(select.getAttribute('aria-disabled')).toEqual('false');

        fixture.componentInstance.control.disable();
        fixture.detectChanges();

        expect(select.getAttribute('aria-disabled')).toEqual('true');
      });

      it('should set the tabindex of the select to -1 if disabled', () => {
        fixture.componentInstance.control.disable();
        fixture.detectChanges();
        expect(select.getAttribute('tabindex')).toEqual('-1');

        fixture.componentInstance.control.enable();
        fixture.detectChanges();
        expect(select.getAttribute('tabindex')).toEqual('0');
      });

      it('should be able to select options via the arrow keys on a closed select', () => {
        const formControl = fixture.componentInstance.control;
        const options = fixture.componentInstance.options.toArray();

        expect(formControl.value).toBeFalsy('Expected no initial value.');

        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

        expect(options[0].selected).toBe(true, 'Expected first option to be selected.');
        expect(formControl.value).toBe(options[0].value,
          'Expected value from first option to have been set on the model.');

        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

        // Note that the third option is skipped, because it is disabled.
        expect(options[3].selected).toBe(true, 'Expected fourth option to be selected.');
        expect(formControl.value).toBe(options[3].value,
          'Expected value from fourth option to have been set on the model.');

        dispatchKeyboardEvent(select, 'keydown', UP_ARROW);

        expect(options[1].selected).toBe(true, 'Expected second option to be selected.');
        expect(formControl.value).toBe(options[1].value,
          'Expected value from second option to have been set on the model.');
      });

      it('should open the panel when pressing the arrow keys on a closed multiple select', () => {
        fixture.destroy();

        const multiFixture = TestBed.createComponent(MultiSelect);
        const instance = multiFixture.componentInstance;

        multiFixture.detectChanges();
        select = multiFixture.debugElement.query(By.css('md-select')).nativeElement;

        const initialValue = instance.control.value;

        expect(instance.select.panelOpen).toBe(false, 'Expected panel to be closed.');

        const event = dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

        expect(instance.select.panelOpen).toBe(true, 'Expected panel to be open.');
        expect(instance.control.value).toBe(initialValue, 'Expected value to stay the same.');
        expect(event.defaultPrevented).toBe(true, 'Expected default to be prevented.');
      });

      it('should do nothing if the key manager did not change the active item', () => {
        const formControl = fixture.componentInstance.control;

        expect(formControl.value).toBeNull('Expected form control value to be empty.');
        expect(formControl.pristine).toBe(true, 'Expected form control to be clean.');

        dispatchKeyboardEvent(select, 'keydown', 16); // Press a random key.

        expect(formControl.value).toBeNull('Expected form control value to stay empty.');
        expect(formControl.pristine).toBe(true, 'Expected form control to stay clean.');
      });

      it('should continue from the selected option when the value is set programmatically', () => {
        const formControl = fixture.componentInstance.control;

        formControl.setValue('eggs-5');
        fixture.detectChanges();

        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

        expect(formControl.value).toBe('pasta-6');
        expect(fixture.componentInstance.options.toArray()[6].selected).toBe(true);
      });

      it('should not shift focus when the selected options are updated programmatically ' +
        'in a multi select', () => {
          fixture.destroy();

          const multiFixture = TestBed.createComponent(MultiSelect);

          multiFixture.detectChanges();
          select = multiFixture.debugElement.query(By.css('md-select')).nativeElement;
          multiFixture.componentInstance.select.open();
          multiFixture.detectChanges();

          const options =
              overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;

          options[3].focus();
          expect(document.activeElement).toBe(options[3], 'Expected fourth option to be focused.');

          multiFixture.componentInstance.control.setValue(['steak-0', 'sushi-7']);
          multiFixture.detectChanges();

          expect(document.activeElement)
              .toBe(options[3], 'Expected fourth option to remain focused.');
        });

      it('should not cycle through the options if the control is disabled', () => {
        const formControl = fixture.componentInstance.control;

        formControl.setValue('eggs-5');
        formControl.disable();
        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

        expect(formControl.value).toBe('eggs-5', 'Expected value to remain unchaged.');
      });

      it('should not wrap selection around after reaching the end of the options', () => {
        const lastOption = fixture.componentInstance.options.last;

        fixture.componentInstance.options.forEach(() => {
          dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
        });

        expect(lastOption.selected).toBe(true, 'Expected last option to be selected.');

        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

        expect(lastOption.selected).toBe(true, 'Expected last option to stay selected.');
      });

      it('should not open a multiple select when tabbing through', () => {
        fixture.destroy();

        const multiFixture = TestBed.createComponent(MultiSelect);

        multiFixture.detectChanges();
        select = multiFixture.debugElement.query(By.css('md-select')).nativeElement;

        expect(multiFixture.componentInstance.select.panelOpen)
            .toBe(false, 'Expected panel to be closed initially.');

        dispatchKeyboardEvent(select, 'keydown', TAB);

        expect(multiFixture.componentInstance.select.panelOpen)
            .toBe(false, 'Expected panel to stay closed.');
      });

      it('should prevent the default action when pressing space', () => {
        let event = dispatchKeyboardEvent(select, 'keydown', SPACE);

        expect(event.defaultPrevented).toBe(true);
      });

      it('should consider the selection as a result of a user action when closed', () => {
        const option = fixture.componentInstance.options.first;
        const spy = jasmine.createSpy('option selection spy');
        const subscription = map.call(option.onSelectionChange, e => e.isUserInput).subscribe(spy);

        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
        expect(spy).toHaveBeenCalledWith(true);

        subscription.unsubscribe();
      });

      it('should be able to focus the select trigger', () => {
        document.body.focus(); // ensure that focus isn't on the trigger already

        fixture.componentInstance.select.focus();

        expect(document.activeElement).toBe(select, 'Expected select element to be focused.');
      });

      // Having `aria-hidden` on the trigger avoids issues where
      // screen readers read out the wrong amount of options.
      it('should set aria-hidden on the trigger element', () => {
        const trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;

        expect(trigger.getAttribute('aria-hidden'))
            .toBe('true', 'Expected aria-hidden to be true when the select is open.');
      });

      it('should set `aria-multiselectable` to true on multi-select instances', () => {
        fixture.destroy();

        const multiFixture = TestBed.createComponent(MultiSelect);

        multiFixture.detectChanges();
        select = multiFixture.debugElement.query(By.css('md-select')).nativeElement;

        expect(select.getAttribute('aria-multiselectable')).toBe('true');
      });

      it('should set `aria-multiselectable` false on single-selection instances', () => {
        expect(select.getAttribute('aria-multiselectable')).toBe('false');
      });

    });

    describe('for options', () => {
      let fixture: ComponentFixture<BasicSelect>;
      let trigger: HTMLElement;
      let options: NodeListOf<HTMLElement>;

      beforeEach(() => {
        fixture = TestBed.createComponent(BasicSelect);
        fixture.detectChanges();
        trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
        trigger.click();
        fixture.detectChanges();

        options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      });

      it('should set the role of md-option to option', () => {
        expect(options[0].getAttribute('role')).toEqual('option');
        expect(options[1].getAttribute('role')).toEqual('option');
        expect(options[2].getAttribute('role')).toEqual('option');
      });

      it('should set aria-selected on each option', () => {
        expect(options[0].getAttribute('aria-selected')).toEqual('false');
        expect(options[1].getAttribute('aria-selected')).toEqual('false');
        expect(options[2].getAttribute('aria-selected')).toEqual('false');

        options[1].click();
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        expect(options[0].getAttribute('aria-selected')).toEqual('false');
        expect(options[1].getAttribute('aria-selected')).toEqual('true');
        expect(options[2].getAttribute('aria-selected')).toEqual('false');
      });

      it('should set the tabindex of each option according to disabled state', () => {
        expect(options[0].getAttribute('tabindex')).toEqual('0');
        expect(options[1].getAttribute('tabindex')).toEqual('0');
        expect(options[2].getAttribute('tabindex')).toEqual('-1');
      });

      it('should set aria-disabled for disabled options', () => {
        expect(options[0].getAttribute('aria-disabled')).toEqual('false');
        expect(options[1].getAttribute('aria-disabled')).toEqual('false');
        expect(options[2].getAttribute('aria-disabled')).toEqual('true');

        fixture.componentInstance.foods[2]['disabled'] = false;
        fixture.detectChanges();

        expect(options[0].getAttribute('aria-disabled')).toEqual('false');
        expect(options[1].getAttribute('aria-disabled')).toEqual('false');
        expect(options[2].getAttribute('aria-disabled')).toEqual('false');
      });

    });

    describe('for option groups', () => {
      let fixture: ComponentFixture<SelectWithGroups>;
      let trigger: HTMLElement;
      let groups: NodeListOf<HTMLElement>;

      beforeEach(() => {
        fixture = TestBed.createComponent(SelectWithGroups);
        fixture.detectChanges();
        trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
        trigger.click();
        fixture.detectChanges();
        groups = overlayContainerElement.querySelectorAll('md-optgroup') as NodeListOf<HTMLElement>;
      });

      it('should set the appropriate role', () => {
        expect(groups[0].getAttribute('role')).toBe('group');
      });

      it('should set the `aria-labelledby` attribute', () => {
        let group = groups[0];
        let label = group.querySelector('label')!;

        expect(label.getAttribute('id')).toBeTruthy('Expected label to have an id.');
        expect(group.getAttribute('aria-labelledby'))
            .toBe(label.getAttribute('id'), 'Expected `aria-labelledby` to match the label id.');
      });

      it('should set the `aria-disabled` attribute if the group is disabled', () => {
        expect(groups[1].getAttribute('aria-disabled')).toBe('true');
      });

    });

    describe('aria-owns', () => {
      let fixture: ComponentFixture<ManySelects>;
      let triggers: DebugElement[];
      let options: NodeListOf<HTMLElement>;

      beforeEach(() => {
        fixture = TestBed.createComponent(ManySelects);
        fixture.detectChanges();
        triggers = fixture.debugElement.queryAll(By.css('.mat-select-trigger'));

        triggers[0].nativeElement.click();
        fixture.detectChanges();

        options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      });

      it('should set aria-owns properly', async(() => {
        const selects = fixture.debugElement.queryAll(By.css('md-select'));

        expect(selects[0].nativeElement.getAttribute('aria-owns'))
            .toContain(options[0].id, `Expected aria-owns to contain IDs of its child options.`);
        expect(selects[0].nativeElement.getAttribute('aria-owns'))
            .toContain(options[1].id, `Expected aria-owns to contain IDs of its child options.`);

        const backdrop =
            overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
        backdrop.click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          triggers[1].nativeElement.click();

          fixture.detectChanges();
          options =
              overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
          expect(selects[1].nativeElement.getAttribute('aria-owns'))
              .toContain(options[0].id, `Expected aria-owns to contain IDs of its child options.`);
          expect(selects[1].nativeElement.getAttribute('aria-owns'))
              .toContain(options[1].id, `Expected aria-owns to contain IDs of its child options.`);
        });

      }));

      it('should set the option id properly', async(() => {
        let firstOptionID = options[0].id;

        expect(options[0].id)
            .toContain('md-option', `Expected option ID to have the correct prefix.`);
        expect(options[0].id).not.toEqual(options[1].id, `Expected option IDs to be unique.`);

        const backdrop =
            overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
        backdrop.click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          triggers[1].nativeElement.click();

          fixture.detectChanges();
          options =
              overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
          expect(options[0].id)
              .toContain('md-option', `Expected option ID to have the correct prefix.`);
          expect(options[0].id).not.toEqual(firstOptionID, `Expected option IDs to be unique.`);
          expect(options[0].id).not.toEqual(options[1].id, `Expected option IDs to be unique.`);
        });

      }));

    });

  });

  describe('special cases', () => {

    it('should handle nesting in an ngIf', async(() => {
      const fixture = TestBed.createComponent(NgIfSelect);
      fixture.detectChanges();

      fixture.componentInstance.isShowing = true;
      fixture.detectChanges();

      const trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
      trigger.style.width = '300px';

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const value = fixture.debugElement.query(By.css('.mat-select-value'));
        expect(value.nativeElement.textContent)
            .toContain('Pizza', `Expected trigger to be populated by the control's initial value.`);

        trigger.click();
        fixture.detectChanges();

        const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        expect(pane.style.minWidth).toEqual('300px');

        expect(fixture.componentInstance.select.panelOpen).toBe(true);
        expect(overlayContainerElement.textContent).toContain('Steak');
        expect(overlayContainerElement.textContent).toContain('Pizza');
        expect(overlayContainerElement.textContent).toContain('Tacos');
      });
    }));

    it('should not crash the browser when a sibling throws an error on init', async(() => {
      // Note that this test can be considered successful if the error being thrown didn't
      // end up crashing the testing setup altogether.
      expect(() => {
        TestBed.createComponent(SelectWithErrorSibling).detectChanges();
      }).toThrowError(new RegExp('Oh no!', 'g'));
    }));

    it('should not throw when trying to access the selected value on init', async(() => {
      expect(() => {
        TestBed.createComponent(SelectEarlyAccessSibling).detectChanges();
      }).not.toThrow();
    }));

    it('should not throw selection model-related errors in addition to the errors from ngModel',
      async(() => {
        const fixture = TestBed.createComponent(InvalidSelectInForm);

        // The first change detection run will throw the "ngModel is missing a name" error.
        expect(() => fixture.detectChanges()).toThrowError(/the name attribute must be set/g);

        // The second run shouldn't throw selection-model related errors.
        expect(() => fixture.detectChanges()).not.toThrow();
      }));


    it('should not throw when the triggerValue is accessed when there is no selected value', () => {
      const fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();

      expect(() => fixture.componentInstance.select.triggerValue).not.toThrow();
    });
  });

  describe('change event', () => {
    let fixture: ComponentFixture<SelectWithChangeEvent>;
    let trigger: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SelectWithChangeEvent);
      fixture.detectChanges();

      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
    });

    it('should emit an event when the selected option has changed', () => {
      trigger.click();
      fixture.detectChanges();

      (overlayContainerElement.querySelector('md-option') as HTMLElement).click();

      expect(fixture.componentInstance.changeListener).toHaveBeenCalled();
    });

    it('should not emit multiple change events for the same option', () => {
      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('md-option') as HTMLElement;

      option.click();
      option.click();

      expect(fixture.componentInstance.changeListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('floatPlaceholder option', () => {
    let fixture: ComponentFixture<FloatPlaceholderSelect>;

    beforeEach(() => {
      fixture = TestBed.createComponent(FloatPlaceholderSelect);
    });

    it('should be able to disable the floating placeholder', () => {
      let placeholder = fixture.debugElement.query(By.css('.mat-select-placeholder')).nativeElement;

      fixture.componentInstance.floatPlaceholder = 'never';
      fixture.detectChanges();

      expect(placeholder.style.opacity).toBe('1');
      expect(fixture.componentInstance.select._getPlaceholderAnimationState()).toBeFalsy();

      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      expect(placeholder.style.opacity).toBe('0');
      expect(fixture.componentInstance.select._getPlaceholderAnimationState()).toBeFalsy();
    });

    it('should be able to always float the placeholder', () => {
      expect(fixture.componentInstance.control.value).toBeFalsy();

      fixture.componentInstance.floatPlaceholder = 'always';
      fixture.detectChanges();

      expect(fixture.componentInstance.select._getPlaceholderAnimationState()).toBe('floating-ltr');
    });

    it ('should default to global floating placeholder type', () => {
      fixture.destroy();

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          MdSelectModule,
          ReactiveFormsModule,
          FormsModule,
          NoopAnimationsModule
        ],
        declarations: [
          FloatPlaceholderSelect
        ],
        providers: [{ provide: MD_PLACEHOLDER_GLOBAL_OPTIONS, useValue: { float: 'always' } }]
      });

      fixture = TestBed.createComponent(FloatPlaceholderSelect);
      fixture.componentInstance.floatPlaceholder = null;
      fixture.detectChanges();

      expect(fixture.componentInstance.select.floatPlaceholder).toBe('always');
    });
  });

  describe('with OnPush change detection', () => {
    it('should set the trigger text based on the value when initialized', async(() => {
      let fixture = TestBed.createComponent(BasicSelectOnPushPreselected);

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        let trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;

        fixture.detectChanges();

        expect(trigger.textContent).toContain('Pizza');
      });
    }));

    it('should update the trigger based on the value', () => {
      let fixture = TestBed.createComponent(BasicSelectOnPush);
      fixture.detectChanges();
      let trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;

      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      expect(trigger.textContent).toContain('Pizza');

      fixture.componentInstance.control.reset();
      fixture.detectChanges();

      expect(trigger.textContent).not.toContain('Pizza');
    });

  });

  describe('multiple selection', () => {
    let fixture: ComponentFixture<MultiSelect>;
    let testInstance: MultiSelect;
    let trigger: HTMLElement;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(MultiSelect);
      testInstance = fixture.componentInstance;
      fixture.detectChanges();

      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
    }));

    it('should be able to select multiple values', () => {
      trigger.click();
      fixture.detectChanges();

      const options = overlayContainerElement.querySelectorAll('md-option') as
          NodeListOf<HTMLElement>;

      options[0].click();
      options[2].click();
      options[5].click();
      fixture.detectChanges();

      expect(testInstance.control.value).toEqual(['steak-0', 'tacos-2', 'eggs-5']);
    });

    it('should be able to toggle an option on and off', () => {
      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('md-option') as HTMLElement;

      option.click();
      fixture.detectChanges();

      expect(testInstance.control.value).toEqual(['steak-0']);

      option.click();
      fixture.detectChanges();

      expect(testInstance.control.value).toEqual([]);
    });

    it('should update the label', () => {
      trigger.click();
      fixture.detectChanges();

      const options = overlayContainerElement.querySelectorAll('md-option') as
          NodeListOf<HTMLElement>;

      options[0].click();
      options[2].click();
      options[5].click();
      fixture.detectChanges();

      expect(trigger.textContent).toContain('Steak, Tacos, Eggs');

      options[2].click();
      fixture.detectChanges();

      expect(trigger.textContent).toContain('Steak, Eggs');
    });

    it('should be able to set the selected value by taking an array', () => {
      trigger.click();
      testInstance.control.setValue(['steak-0', 'eggs-5']);
      fixture.detectChanges();

      const optionNodes = overlayContainerElement.querySelectorAll('md-option') as
          NodeListOf<HTMLElement>;

      const optionInstances = testInstance.options.toArray();

      expect(optionNodes[0].classList).toContain('mat-selected');
      expect(optionNodes[5].classList).toContain('mat-selected');

      expect(optionInstances[0].selected).toBe(true);
      expect(optionInstances[5].selected).toBe(true);
    });

    it('should override the previously-selected value when setting an array', () => {
      trigger.click();
      fixture.detectChanges();

      const options = overlayContainerElement.querySelectorAll('md-option') as
          NodeListOf<HTMLElement>;

      options[0].click();
      fixture.detectChanges();

      expect(options[0].classList).toContain('mat-selected');

      testInstance.control.setValue(['eggs-5']);
      fixture.detectChanges();

      expect(options[0].classList).not.toContain('mat-selected');
      expect(options[5].classList).toContain('mat-selected');
    });

    it('should not close the panel when clicking on options', () => {
      trigger.click();
      fixture.detectChanges();

      expect(testInstance.select.panelOpen).toBe(true);

      const options = overlayContainerElement.querySelectorAll('md-option') as
          NodeListOf<HTMLElement>;

      options[0].click();
      options[1].click();
      fixture.detectChanges();

      expect(testInstance.select.panelOpen).toBe(true);
    });

    it('should sort the selected options based on their order in the panel', () => {
      trigger.click();
      fixture.detectChanges();

      const options = overlayContainerElement.querySelectorAll('md-option') as
          NodeListOf<HTMLElement>;

      options[2].click();
      options[0].click();
      options[1].click();
      fixture.detectChanges();

      expect(trigger.textContent).toContain('Steak, Pizza, Tacos');
      expect(fixture.componentInstance.control.value).toEqual(['steak-0', 'pizza-1', 'tacos-2']);
    });

    it('should sort the selected options in reverse in rtl', () => {
      dir.value = 'rtl';
      trigger.click();
      fixture.detectChanges();

      const options = overlayContainerElement.querySelectorAll('md-option') as
          NodeListOf<HTMLElement>;

      options[2].click();
      options[0].click();
      options[1].click();
      fixture.detectChanges();

      expect(trigger.textContent).toContain('Tacos, Pizza, Steak');
      expect(fixture.componentInstance.control.value).toEqual(['steak-0', 'pizza-1', 'tacos-2']);
    });

    it('should sort the values, that get set via the model, based on the panel order', () => {
      trigger.click();
      fixture.detectChanges();

      testInstance.control.setValue(['tacos-2', 'steak-0', 'pizza-1']);
      fixture.detectChanges();

      expect(trigger.textContent).toContain('Steak, Pizza, Tacos');
    });

    it('should reverse sort the values, that get set via the model in rtl', () => {
      dir.value = 'rtl';
      trigger.click();
      fixture.detectChanges();

      testInstance.control.setValue(['tacos-2', 'steak-0', 'pizza-1']);
      fixture.detectChanges();

      expect(trigger.textContent).toContain('Tacos, Pizza, Steak');
    });

    it('should throw an exception when trying to set a non-array value', async(() => {
      expect(() => {
        testInstance.control.setValue('not-an-array');
      }).toThrowError(wrappedErrorMessage(getMdSelectNonArrayValueError()));
    }));

    it('should throw an exception when trying to change multiple mode after init', async(() => {
      expect(() => {
        testInstance.select.multiple = false;
      }).toThrowError(wrappedErrorMessage(getMdSelectDynamicMultipleError()));
    }));

    it('should pass the `multiple` value to all of the option instances', async(() => {
      trigger.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(testInstance.options.toArray().every(option => option.multiple)).toBe(true,
            'Expected `multiple` to have been added to initial set of options.');

        testInstance.foods.push({ value: 'cake-8', viewValue: 'Cake' });
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(testInstance.options.toArray().every(option => option.multiple)).toBe(true,
              'Expected `multiple` to have been set on dynamically-added option.');
        });
      });
    }));

  });

  describe('theming', () => {
    let fixture: ComponentFixture<BasicSelectWithTheming>;
    let testInstance: BasicSelectWithTheming;
    let selectElement: HTMLElement;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(BasicSelectWithTheming);
      testInstance = fixture.componentInstance;
      fixture.detectChanges();

      selectElement = fixture.debugElement.query(By.css('.mat-select')).nativeElement;
    }));

    it('should default to the primary theme', () => {
      expect(fixture.componentInstance.select.color).toBe('primary');
      expect(selectElement.classList).toContain('mat-primary');
    });

    it('should be able to override the theme', () => {
      fixture.componentInstance.theme = 'accent';
      fixture.detectChanges();

      expect(fixture.componentInstance.select.color).toBe('accent');
      expect(selectElement.classList).toContain('mat-accent');
      expect(selectElement.classList).not.toContain('mat-primary');
    });

    it('should not be able to set a blank theme', () => {
      fixture.componentInstance.theme = '';
      fixture.detectChanges();

      expect(fixture.componentInstance.select.color).toBe('primary');
      expect(selectElement.classList).toContain('mat-primary');
    });

    it('should pass the theme to the panel', () => {
      fixture.componentInstance.theme = 'warn';
      fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement.click();
      fixture.detectChanges();

      const panel = overlayContainerElement.querySelector('.mat-select-panel')!;

      expect(fixture.componentInstance.select.color).toBe('warn');
      expect(selectElement.classList).toContain('mat-warn');
      expect(panel.classList).toContain('mat-warn');
    });

    it('should allow the user to customize the label', () => {
      fixture.destroy();

      const labelFixture = TestBed.createComponent(SelectWithCustomTrigger);
      labelFixture.detectChanges();

      labelFixture.componentInstance.control.setValue('pizza-1');
      labelFixture.detectChanges();

      const label = labelFixture.debugElement.query(By.css('.mat-select-value')).nativeElement;

      expect(label.textContent).toContain('azziP',
          'Expected the displayed text to be "Pizza" in reverse.');
    });

  });

  describe('reset values', () => {
    let fixture: ComponentFixture<ResetValuesSelect>;
    let trigger: HTMLElement;
    let placeholder: HTMLElement;
    let options: NodeListOf<HTMLElement>;

    beforeEach(() => {
      fixture = TestBed.createComponent(ResetValuesSelect);
      fixture.detectChanges();
      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
      placeholder = fixture.debugElement.query(By.css('.mat-select-placeholder')).nativeElement;

      trigger.click();
      fixture.detectChanges();
      options = overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;

      options[0].click();
      fixture.detectChanges();
    });

    it('should reset when an option with an undefined value is selected', () => {
      options[4].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.control.value).toBeUndefined();
      expect(fixture.componentInstance.select.selected).toBeFalsy();
      expect(placeholder.classList).not.toContain('mat-floating-placeholder');
      expect(trigger.textContent).not.toContain('Undefined');
    });

    it('should reset when an option with a null value is selected', () => {
      options[5].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.control.value).toBeNull();
      expect(fixture.componentInstance.select.selected).toBeFalsy();
      expect(placeholder.classList).not.toContain('mat-floating-placeholder');
      expect(trigger.textContent).not.toContain('Null');
    });

    it('should reset when a blank option is selected', () => {
      options[6].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.control.value).toBeUndefined();
      expect(fixture.componentInstance.select.selected).toBeFalsy();
      expect(placeholder.classList).not.toContain('mat-floating-placeholder');
      expect(trigger.textContent).not.toContain('None');
    });

    it('should not reset when any other falsy option is selected', () => {
      options[3].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.control.value).toBe(false);
      expect(fixture.componentInstance.select.selected).toBeTruthy();
      expect(placeholder.classList).toContain('mat-floating-placeholder');
      expect(trigger.textContent).toContain('Falsy');
    });

    it('should not consider the reset values as selected when resetting the form control', () => {
      expect(placeholder.classList).toContain('mat-floating-placeholder');

      fixture.componentInstance.control.reset();
      fixture.detectChanges();

      expect(fixture.componentInstance.control.value).toBeNull();
      expect(fixture.componentInstance.select.selected).toBeFalsy();
      expect(placeholder.classList).not.toContain('mat-floating-placeholder');
      expect(trigger.textContent).not.toContain('Null');
      expect(trigger.textContent).not.toContain('Undefined');
    });

  });

  describe('error state', () => {
    let fixture: ComponentFixture<SelectInsideFormGroup>;
    let testComponent: SelectInsideFormGroup;
    let select: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SelectInsideFormGroup);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      select = fixture.debugElement.query(By.css('md-select')).nativeElement;
    });

    it('should not set the invalid class on a clean select', () => {
      expect(testComponent.formGroup.untouched).toBe(true, 'Expected the form to be untouched.');
      expect(testComponent.formControl.invalid).toBe(true, 'Expected form control to be invalid.');
      expect(select.classList)
          .not.toContain('mat-select-invalid', 'Expected select not to appear invalid.');
      expect(select.getAttribute('aria-invalid'))
          .toBe('false', 'Expected aria-invalid to be set to false.');
    });

    it('should appear as invalid if it becomes touched', () => {
      expect(select.classList)
          .not.toContain('mat-select-invalid', 'Expected select not to appear invalid.');
      expect(select.getAttribute('aria-invalid'))
          .toBe('false', 'Expected aria-invalid to be set to false.');

      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      expect(select.classList)
          .toContain('mat-select-invalid', 'Expected select to appear invalid.');
      expect(select.getAttribute('aria-invalid'))
          .toBe('true', 'Expected aria-invalid to be set to true.');
    });

    it('should not have the invalid class when the select becomes valid', () => {
      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      expect(select.classList)
          .toContain('mat-select-invalid', 'Expected select to appear invalid.');
      expect(select.getAttribute('aria-invalid'))
          .toBe('true', 'Expected aria-invalid to be set to true.');

      testComponent.formControl.setValue('pizza-1');
      fixture.detectChanges();

      expect(select.classList)
          .not.toContain('mat-select-invalid', 'Expected select not to appear invalid.');
      expect(select.getAttribute('aria-invalid'))
          .toBe('false', 'Expected aria-invalid to be set to false.');
    });

    it('should appear as invalid when the parent form group is submitted', () => {
      expect(select.classList)
          .not.toContain('mat-select-invalid', 'Expected select not to appear invalid.');
      expect(select.getAttribute('aria-invalid'))
          .toBe('false', 'Expected aria-invalid to be set to false.');

      dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
      fixture.detectChanges();

      expect(select.classList)
          .toContain('mat-select-invalid', 'Expected select to appear invalid.');
      expect(select.getAttribute('aria-invalid'))
          .toBe('true', 'Expected aria-invalid to be set to true.');
    });

  });

  describe('compareWith behavior', () => {
    let fixture: ComponentFixture<NgModelCompareWithSelect>;
    let instance: NgModelCompareWithSelect;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(NgModelCompareWithSelect);
      instance = fixture.componentInstance;
      fixture.detectChanges();
    }));

    describe('when comparing by value', () => {

      it('should have a selection', () => {
        const selectedOption = instance.select.selected as MdOption;
        expect(selectedOption.value.value).toEqual('pizza-1');
      });

      it('should update when making a new selection', async(() => {
        instance.options.last._selectViaInteraction();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const selectedOption = instance.select.selected as MdOption;
          expect(instance.selectedFood.value).toEqual('tacos-2');
          expect(selectedOption.value.value).toEqual('tacos-2');
        });
      }));

    });

    describe('when comparing by reference', () => {
      beforeEach(async(() => {
        spyOn(instance, 'compareByReference').and.callThrough();
        instance.useCompareByReference();
        fixture.detectChanges();
      }));

      it('should use the comparator', () => {
        expect(instance.compareByReference).toHaveBeenCalled();
      });

      it('should initialize with no selection despite having a value', () => {
        expect(instance.selectedFood.value).toBe('pizza-1');
        expect(instance.select.selected).toBeUndefined();
      });

      it('should not update the selection if value is copied on change', async(() => {
        instance.options.first._selectViaInteraction();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(instance.selectedFood.value).toEqual('steak-0');
          expect(instance.select.selected).toBeUndefined();
        });
      }));

    });

    describe('when using a non-function comparator', () => {
      beforeEach(() => {
        instance.useNullComparator();
      });

      it('should throw an error', () => {
        expect(() => {
          fixture.detectChanges();
        }).toThrowError(wrappedErrorMessage(getMdSelectNonFunctionValueError()));
      });

    });

  });

});

@Component({
  selector: 'basic-select',
  template: `
    <div [style.height.px]="heightAbove"></div>
    <md-select placeholder="Food" [formControl]="control" [required]="isRequired"
      [tabIndex]="tabIndexOverride" [aria-label]="ariaLabel" [aria-labelledby]="ariaLabelledby"
      [panelClass]="panelClass" [disableRipple]="disableRipple">
      <md-option *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
        {{ food.viewValue }}
      </md-option>
    </md-select>
    <div [style.height.px]="heightBelow"></div>
  `
})
class BasicSelect {
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos', disabled: true },
    { value: 'sandwich-3', viewValue: 'Sandwich' },
    { value: 'chips-4', viewValue: 'Chips' },
    { value: 'eggs-5', viewValue: 'Eggs' },
    { value: 'pasta-6', viewValue: 'Pasta' },
    { value: 'sushi-7', viewValue: 'Sushi' },
  ];
  control = new FormControl();
  isRequired: boolean;
  heightAbove = 0;
  heightBelow = 0;
  tabIndexOverride: number;
  ariaLabel: string;
  ariaLabelledby: string;
  panelClass = ['custom-one', 'custom-two'];
  disableRipple: boolean;

  @ViewChild(MdSelect) select: MdSelect;
  @ViewChildren(MdOption) options: QueryList<MdOption>;
}

@Component({
  selector: 'ng-model-select',
  template: `
    <md-select placeholder="Food" ngModel [disabled]="isDisabled">
      <md-option *ngFor="let food of foods" [value]="food.value">{{ food.viewValue }}</md-option>
    </md-select>
  `
})
class NgModelSelect {
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];
  isDisabled: boolean;

  @ViewChild(MdSelect) select: MdSelect;
  @ViewChildren(MdOption) options: QueryList<MdOption>;
}

@Component({
  selector: 'many-selects',
  template: `
    <md-select placeholder="First">
      <md-option value="one">one</md-option>
      <md-option value="two">two</md-option>
    </md-select>
    <md-select placeholder="Second">
      <md-option value="three">three</md-option>
      <md-option value="four">four</md-option>
    </md-select>
  `
})
class ManySelects {}

@Component({
  selector: 'ng-if-select',
  template: `
    <div *ngIf="isShowing">
      <md-select placeholder="Food I want to eat right now" [formControl]="control">
        <md-option *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </md-option>
      </md-select>
    </div>
  `,
})
class NgIfSelect {
  isShowing = false;
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos'}
  ];
  control = new FormControl('pizza-1');

  @ViewChild(MdSelect) select: MdSelect;
}

@Component({
  selector: 'select-with-change-event',
  template: `
    <md-select (change)="changeListener($event)">
      <md-option *ngFor="let food of foods" [value]="food">{{ food }}</md-option>
    </md-select>
  `
})
class SelectWithChangeEvent {
  foods: string[] = [
    'steak-0',
    'pizza-1',
    'tacos-2',
    'sandwich-3',
    'chips-4',
    'eggs-5',
    'pasta-6',
    'sushi-7'
  ];

  changeListener = jasmine.createSpy('MdSelect change listener');
}

@Component({
  selector: 'select-init-without-options',
  template: `
    <md-select placeholder="Food I want to eat right now" [formControl]="control">
      <md-option *ngFor="let food of foods" [value]="food.value">
        {{ food.viewValue }}
      </md-option>
    </md-select>
  `
})
class SelectInitWithoutOptions {
  foods: any[];
  control = new FormControl('pizza-1');

  @ViewChild(MdSelect) select: MdSelect;
  @ViewChildren(MdOption) options: QueryList<MdOption>;

  addOptions() {
    this.foods = [
      { value: 'steak-0', viewValue: 'Steak' },
      { value: 'pizza-1', viewValue: 'Pizza' },
      { value: 'tacos-2', viewValue: 'Tacos'}
    ];
  }
}

@Component({
  selector: 'custom-select-accessor',
  template: `
    <md-select></md-select>
  `,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: CustomSelectAccessor,
    multi: true
  }]
})
class CustomSelectAccessor implements ControlValueAccessor {
  @ViewChild(MdSelect) select: MdSelect;

  writeValue: (value?: any) => void = () => {};
  registerOnChange: (changeFn?: (value: any) => void) => void = () => {};
  registerOnTouched: (touchedFn?: () => void) => void = () => {};
}

@Component({
  selector: 'comp-with-custom-select',
  template: `
    <custom-select-accessor [formControl]="ctrl">
    </custom-select-accessor>
  `,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: CustomSelectAccessor,
    multi: true
  }]
})
class CompWithCustomSelect {
  ctrl = new FormControl('initial value');
  @ViewChild(CustomSelectAccessor) customAccessor: CustomSelectAccessor;
}

@Component({
  selector: 'select-infinite-loop',
  template: `
    <md-select [(ngModel)]="value"></md-select>
    <throws-error-on-init></throws-error-on-init>
  `
})
class SelectWithErrorSibling {
  value: string;
}

@Component({
  selector: 'throws-error-on-init',
  template: ''
})
export class ThrowsErrorOnInit implements OnInit {
  ngOnInit() {
    throw Error('Oh no!');
  }
}

@Component({
  selector: 'basic-select-on-push',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-select placeholder="Food" [formControl]="control">
      <md-option *ngFor="let food of foods" [value]="food.value">
        {{ food.viewValue }}
      </md-option>
    </md-select>
  `
})
class BasicSelectOnPush {
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];
  control = new FormControl();
}

@Component({
  selector: 'basic-select-on-push-preselected',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-select placeholder="Food" [formControl]="control">
      <md-option *ngFor="let food of foods" [value]="food.value">
        {{ food.viewValue }}
      </md-option>
    </md-select>
  `
})
class BasicSelectOnPushPreselected {
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];
  control = new FormControl('pizza-1');
}

@Component({
  selector: 'floating-placeholder-select',
  template: `
    <md-select placeholder="Food I want to eat right now" [formControl]="control"
      [floatPlaceholder]="floatPlaceholder">
        <md-option *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </md-option>
      </md-select>
    `,
})
class FloatPlaceholderSelect {
  floatPlaceholder: FloatPlaceholderType | null = 'auto';
  control = new FormControl();
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos'}
  ];

  @ViewChild(MdSelect) select: MdSelect;
}

@Component({
  selector: 'multi-select',
  template: `
    <md-select multiple placeholder="Food" [formControl]="control">
      <md-option *ngFor="let food of foods" [value]="food.value">{{ food.viewValue }}</md-option>
    </md-select>
  `
})
class MultiSelect {
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
    { value: 'sandwich-3', viewValue: 'Sandwich' },
    { value: 'chips-4', viewValue: 'Chips' },
    { value: 'eggs-5', viewValue: 'Eggs' },
    { value: 'pasta-6', viewValue: 'Pasta' },
    { value: 'sushi-7', viewValue: 'Sushi' },
  ];
  control = new FormControl();

  @ViewChild(MdSelect) select: MdSelect;
  @ViewChildren(MdOption) options: QueryList<MdOption>;
}

@Component({
  selector: 'select-with-plain-tabindex',
  template: `
    <md-select tabindex="5"></md-select>
  `
})
class SelectWithPlainTabindex { }

@Component({
  selector: 'select-early-sibling-access',
  template: `
    <md-select #select="mdSelect"></md-select>
    <div *ngIf="select.selected"></div>
  `
})
class SelectEarlyAccessSibling { }

@Component({
  selector: 'basic-select-initially-hidden',
  template: `
    <md-select [style.display]="isVisible ? 'block' : 'none'">
      <md-option value="value">There are no other options</md-option>
    </md-select>
  `
})
class BasicSelectInitiallyHidden {
  isVisible = false;
}

@Component({
  selector: 'basic-select-no-placeholder',
  template: `
    <md-select>
      <md-option value="value">There are no other options</md-option>
    </md-select>
  `
})
class BasicSelectNoPlaceholder { }

@Component({
  selector: 'basic-select-with-theming',
  template: `
    <md-select placeholder="Food" [color]="theme">
      <md-option value="steak-0">Steak</md-option>
      <md-option value="pizza-1">Pizza</md-option>
    </md-select>
  `
})
class BasicSelectWithTheming {
  @ViewChild(MdSelect) select: MdSelect;
  theme: string;
}


@Component({
  selector: 'reset-values-select',
  template: `
    <md-select placeholder="Food" [formControl]="control">
      <md-option *ngFor="let food of foods" [value]="food.value">
        {{ food.viewValue }}
      </md-option>

      <md-option>None</md-option>
    </md-select>
  `
})
class ResetValuesSelect {
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
    { value: false, viewValue: 'Falsy' },
    { viewValue: 'Undefined' },
    { value: null, viewValue: 'Null' },
  ];
  control = new FormControl();

  @ViewChild(MdSelect) select: MdSelect;
}

@Component({
  template: `
    <md-select [formControl]="control">
      <md-option *ngFor="let food of foods" [value]="food.value">{{ food.viewValue }}</md-option>
    </md-select>
  `
})
class FalsyValueSelect {
  foods: any[] = [
    { value: 0, viewValue: 'Steak' },
    { value: 1, viewValue: 'Pizza' },
  ];
  control = new FormControl();
  @ViewChildren(MdOption) options: QueryList<MdOption>;
}


@Component({
  selector: 'select-with-groups',
  template: `
    <md-select placeholder="Pokemon" [formControl]="control">
      <md-optgroup *ngFor="let group of pokemonTypes" [label]="group.name"
        [disabled]="group.disabled">

        <md-option *ngFor="let pokemon of group.pokemon" [value]="pokemon.value">
          {{ pokemon.viewValue }}
        </md-option>
      </md-optgroup>

      <md-option value="mime-11">Mr. Mime</md-option>
    </md-select>
  `
})
class SelectWithGroups {
  control = new FormControl();
  pokemonTypes = [
    {
      name: 'Grass',
      pokemon: [
        { value: 'bulbasaur-0', viewValue: 'Bulbasaur' },
        { value: 'oddish-1', viewValue: 'Oddish' },
        { value: 'bellsprout-2', viewValue: 'Bellsprout' }
      ]
    },
    {
      name: 'Water',
      disabled: true,
      pokemon: [
        { value: 'squirtle-3', viewValue: 'Squirtle' },
        { value: 'psyduck-4', viewValue: 'Psyduck' },
        { value: 'horsea-5', viewValue: 'Horsea' }
      ]
    },
    {
      name: 'Fire',
      pokemon: [
        { value: 'charmander-6', viewValue: 'Charmander' },
        { value: 'vulpix-7', viewValue: 'Vulpix' },
        { value: 'flareon-8', viewValue: 'Flareon' }
      ]
    },
    {
      name: 'Psychic',
      pokemon: [
        { value: 'mew-9', viewValue: 'Mew' },
        { value: 'mewtwo-10', viewValue: 'Mewtwo' },
      ]
    }
  ];

  @ViewChild(MdSelect) select: MdSelect;
  @ViewChildren(MdOption) options: QueryList<MdOption>;
}


@Component({
  template: `<form><md-select [(ngModel)]="value"></md-select></form>`
})
class InvalidSelectInForm {
  value: any;
}


@Component({
  template: `
    <form [formGroup]="formGroup">
      <md-select placeholder="Food" formControlName="food">
        <md-option value="steak-0">Steak</md-option>
        <md-option value="pizza-1">Pizza</md-option>
      </md-select>
    </form>
  `
})
class SelectInsideFormGroup {
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;
  formControl = new FormControl('', Validators.required);
  formGroup = new FormGroup({
    food: this.formControl
  });
}


@Component({
  template: `
    <md-select placeholder="Food" [(value)]="selectedFood">
      <md-option *ngFor="let food of foods" [value]="food.value">
        {{ food.viewValue }}
      </md-option>
    </md-select>
  `
})
class BasicSelectWithoutForms {
  selectedFood: string | null;
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'sandwich-2', viewValue: 'Sandwich' },
  ];

  @ViewChild(MdSelect) select: MdSelect;
}

@Component({
  template: `
    <md-select placeholder="Food" [(value)]="selectedFood">
      <md-option *ngFor="let food of foods" [value]="food.value">
        {{ food.viewValue }}
      </md-option>
    </md-select>
  `
})
class BasicSelectWithoutFormsPreselected {
  selectedFood = 'pizza-1';
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
  ];

  @ViewChild(MdSelect) select: MdSelect;
}

@Component({
  template: `
    <md-select placeholder="Food" [(value)]="selectedFoods" multiple>
      <md-option *ngFor="let food of foods" [value]="food.value">
        {{ food.viewValue }}
      </md-option>
    </md-select>
  `
})
class BasicSelectWithoutFormsMultiple {
  selectedFoods: string[];
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'sandwich-2', viewValue: 'Sandwich' },
  ];

  @ViewChild(MdSelect) select: MdSelect;
}


@Component({
  selector: 'select-with-custom-trigger',
  template: `
    <md-select placeholder="Food" [formControl]="control" #select="mdSelect">
      <md-select-trigger>
        {{ select.selected?.viewValue.split('').reverse().join('') }}
      </md-select-trigger>
      <md-option *ngFor="let food of foods" [value]="food.value">
        {{ food.viewValue }}
      </md-option>
    </md-select>
  `
})
class SelectWithCustomTrigger {
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
  ];
  control = new FormControl();
}


@Component({
  selector: 'ng-model-compare-with',
  template: `
    <md-select [ngModel]="selectedFood" (ngModelChange)="setFoodByCopy($event)"
               [compareWith]="comparator">
      <md-option *ngFor="let food of foods" [value]="food">{{ food.viewValue }}</md-option>
    </md-select>
  `
})
class NgModelCompareWithSelect {
  foods: ({value: string, viewValue: string})[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];
  selectedFood: {value: string, viewValue: string} = { value: 'pizza-1', viewValue: 'Pizza' };
  comparator: ((f1: any, f2: any) => boolean)|null = this.compareByValue;

  @ViewChild(MdSelect) select: MdSelect;
  @ViewChildren(MdOption) options: QueryList<MdOption>;

  useCompareByValue() { this.comparator = this.compareByValue; }

  useCompareByReference() { this.comparator = this.compareByReference; }

  useNullComparator() { this.comparator = null; }

  compareByValue(f1: any, f2: any) { return f1 && f2 && f1.value === f2.value; }

  compareByReference(f1: any, f2: any) { return f1 === f2; }

  setFoodByCopy(newValue: {value: string, viewValue: string}) {
    this.selectedFood = extendObject({}, newValue);
  }
}
