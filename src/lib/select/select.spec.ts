import {Directionality} from '@angular/cdk/bidi';
import {DOWN_ARROW, END, ENTER, HOME, SPACE, TAB, UP_ARROW} from '@angular/cdk/keycodes';
import {OverlayContainer} from '@angular/cdk/overlay';
import {Platform} from '@angular/cdk/platform';
import {ScrollDispatcher, ViewportRuler} from '@angular/cdk/scrolling';
import {dispatchFakeEvent, dispatchKeyboardEvent, wrappedErrorMessage} from '@angular/cdk/testing';
import {
  ChangeDetectionStrategy,
  Component,
  DebugElement,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {async, ComponentFixture, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
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
import {
  extendObject,
  FloatPlaceholderType,
  MAT_PLACEHOLDER_GLOBAL_OPTIONS,
  MatOption,
  ErrorStateMatcher,
} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {map} from 'rxjs/operator/map';
import {Subject} from 'rxjs/Subject';
import {MatSelectModule} from './index';
import {MatSelect} from './select';
import {
  getMatSelectDynamicMultipleError,
  getMatSelectNonArrayValueError,
  getMatSelectNonFunctionValueError
} from './select-errors';

/** Duration of the select opening animation. */
const SELECT_OPEN_ANIMATION = 200;

/** Duration of the select closing animation and the timeout interval for the backdrop. */
const SELECT_CLOSE_ANIMATION = 500;


describe('MatSelect', () => {
  let overlayContainerElement: HTMLElement;
  let dir: {value: 'ltr'|'rtl'};
  let scrolledSubject = new Subject();
  let viewportRuler: ViewportRuler;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule
      ],
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
        CustomErrorBehaviorSelect,
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

    it('should open the panel when trigger is clicked', fakeAsync(() => {
      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      expect(fixture.componentInstance.select.panelOpen).toBe(true);
      expect(overlayContainerElement.textContent).toContain('Steak');
      expect(overlayContainerElement.textContent).toContain('Pizza');
      expect(overlayContainerElement.textContent).toContain('Tacos');
    }));

    it('should close the panel when an item is clicked', fakeAsync(() => {
      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;
      option.click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(overlayContainerElement.textContent).toEqual('');
      expect(fixture.componentInstance.select.panelOpen).toBe(false);
    }));

    it('should close the panel when a click occurs outside the panel', fakeAsync(() => {
      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      const backdrop =
          overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

      backdrop.click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(overlayContainerElement.textContent).toEqual('');
      expect(fixture.componentInstance.select.panelOpen).toBe(false);
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

    it('should close the panel when tabbing out', fakeAsync(() => {
      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);
      expect(fixture.componentInstance.select.panelOpen).toBe(true);

      dispatchKeyboardEvent(trigger, 'keydown', TAB);
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(fixture.componentInstance.select.panelOpen).toBe(false);
    }));

    it('should focus the first option when pressing HOME', fakeAsync(() => {
      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      const event = dispatchKeyboardEvent(trigger, 'keydown', HOME);
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.select._keyManager.activeItemIndex).toBe(0);
      expect(event.defaultPrevented).toBe(true);
    }));

    it('should focus the last option when pressing END', fakeAsync(() => {
      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      const event = dispatchKeyboardEvent(trigger, 'keydown', END);
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.select._keyManager.activeItemIndex).toBe(7);
      expect(event.defaultPrevented).toBe(true);
    }));

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

      const option = overlayContainerElement.querySelector('mat-option')!;
      const event = dispatchKeyboardEvent(option, 'keydown', SPACE);

      expect(event.defaultPrevented).toBe(true);
    });

    it('should prevent the default action when pressing ENTER on an option', () => {
      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('mat-option')!;
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
    let formField: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();
      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
      formField = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
    });

    it('should not float placeholder if no option is selected', () => {
      expect(formField.classList.contains('mat-form-field-should-float'))
          .toBe(false, 'placeholder should not be floating');
    });

    it('should focus the first option if no option is selected', fakeAsync(() => {
      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      expect(fixture.componentInstance.select._keyManager.activeItemIndex).toEqual(0);
    }));

    it('should select an option when it is clicked', fakeAsync(() => {
      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      let option = overlayContainerElement.querySelector('mat-option') as HTMLElement;
      option.click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      option = overlayContainerElement.querySelector('mat-option') as HTMLElement;

      expect(option.classList).toContain('mat-selected');
      expect(fixture.componentInstance.options.first.selected).toBe(true);
      expect(fixture.componentInstance.select.selected)
        .toBe(fixture.componentInstance.options.first);
    }));

    it('should deselect other options when one is selected', fakeAsync(() => {
      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      let options =
        overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;

      options[0].click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      options =
        overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList).not.toContain('mat-selected');
      expect(options[2].classList).not.toContain('mat-selected');

      const optionInstances = fixture.componentInstance.options.toArray();
      expect(optionInstances[1].selected).toBe(false);
      expect(optionInstances[2].selected).toBe(false);
    }));

    it('should deselect other options when one is programmatically selected', fakeAsync(() => {
      let control = fixture.componentInstance.control;
      let foods = fixture.componentInstance.foods;

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      let options =
        overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;

      options[0].click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      control.setValue(foods[1].value);
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      options = overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;

      expect(options[0].classList)
        .not.toContain('mat-selected', 'Expected first option to no longer be selected');
      expect(options[1].classList)
        .toContain('mat-selected', 'Expected second option to be selected');

      const optionInstances = fixture.componentInstance.options.toArray();

      expect(optionInstances[0].selected)
        .toBe(false, 'Expected first option to no longer be selected');
      expect(optionInstances[1].selected)
        .toBe(true, 'Expected second option to be selected');
    }));

    it('should remove selection if option has been removed', async(() => {
      let select = fixture.componentInstance.select;

      trigger.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        let firstOption = overlayContainerElement.querySelectorAll('mat-option')[0] as HTMLElement;

        firstOption.click();
        fixture.detectChanges();

        expect(select.selected).toBe(select.options.first, 'Expected first option to be selected.');

        fixture.componentInstance.foods = [];
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(select.selected)
            .toBeUndefined('Expected selection to be removed when option no longer exists.');
        });
      });
    }));

    it('should display the selected option in the trigger', fakeAsync(() => {
      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;
      option.click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      const value = fixture.debugElement.query(By.css('.mat-select-value')).nativeElement;

      expect(formField.classList.contains('mat-form-field-should-float'))
          .toBe(true, 'placeholder should be floating');
      expect(value.textContent).toContain('Steak');
    }));

    it('should focus the selected option if an option is selected', fakeAsync(() => {
      // must wait for initial writeValue promise to finish
      tick();

      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      // must wait for animation to finish
      fixture.detectChanges();
      expect(fixture.componentInstance.select._keyManager.activeItemIndex).toEqual(1);
    }));

    it('should select an option that was added after initialization', fakeAsync(() => {
      fixture.componentInstance.foods.push({viewValue: 'Potatoes', value: 'potatoes-8'});
      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      const options =
        overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[8].click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(trigger.textContent).toContain('Potatoes');
      expect(fixture.componentInstance.select.selected)
        .toBe(fixture.componentInstance.options.last);
    }));

    it('should not select disabled options', () => {
      trigger.click();
      fixture.detectChanges();

      const options =
        overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
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

      const disabledGroup = overlayContainerElement.querySelectorAll('mat-optgroup')[1];
      const options = disabledGroup.querySelectorAll('mat-option');

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
      fixture.detectChanges();
      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
    });

    it('should take an initial view value with reactive forms', fakeAsync(() => {
      fixture.componentInstance.control = new FormControl('pizza-1');
      fixture.detectChanges();

      const value = fixture.debugElement.query(By.css('.mat-select-value'));
      expect(value.nativeElement.textContent)
          .toContain('Pizza', `Expected trigger to be populated by the control's initial value.`);

      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      const options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList)
          .toContain('mat-selected',
              `Expected option with the control's initial value to be selected.`);
    }));

    it('should set the view value from the form', fakeAsync(() => {
      let value = fixture.debugElement.query(By.css('.mat-select-value'));
      expect(value.nativeElement.textContent.trim()).toBe('');

      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      value = fixture.debugElement.query(By.css('.mat-select-value'));
      expect(value.nativeElement.textContent)
          .toContain('Pizza', `Expected trigger to be populated by the control's new value.`);

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      const options =
        overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList)
        .toContain('mat-selected', `Expected option with the control's new value to be selected.`);
    }));

    it('should update the form value when the view changes', fakeAsync(() => {
      expect(fixture.componentInstance.control.value)
        .toEqual(null, `Expected the control's value to be empty initially.`);

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;
      option.click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(fixture.componentInstance.control.value)
        .toEqual('steak-0', `Expected control's value to be set to the new option.`);
    }));

    it('should clear the selection when a nonexistent option value is selected', fakeAsync(() => {
      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      fixture.componentInstance.control.setValue('gibberish');
      fixture.detectChanges();

      const value = fixture.debugElement.query(By.css('.mat-select-value'));
      expect(value.nativeElement.textContent.trim())
          .toBe('', `Expected trigger to be cleared when option value is not found.`);
      expect(trigger.textContent)
          .not.toContain('Pizza', `Expected trigger to be cleared when option value is not found.`);

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      const options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList)
          .not.toContain('mat-selected', `Expected option with the old value not to be selected.`);
    }));


    it('should clear the selection when the control is reset', fakeAsync(() => {
      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      fixture.componentInstance.control.reset();
      fixture.detectChanges();

      const value = fixture.debugElement.query(By.css('.mat-select-value'));
      expect(value.nativeElement.textContent.trim())
          .toBe('', `Expected trigger to be cleared when option value is not found.`);
      expect(trigger.textContent)
          .not.toContain('Pizza', `Expected trigger to be cleared when option value is not found.`);

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      const options =
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList)
          .not.toContain('mat-selected', `Expected option with the old value not to be selected.`);
    }));

    it('should set the control to touched when the select is touched', fakeAsync(() => {
      expect(fixture.componentInstance.control.touched)
        .toEqual(false, `Expected the control to start off as untouched.`);

      trigger.click();
      dispatchFakeEvent(trigger, 'blur');
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      expect(fixture.componentInstance.control.touched)
        .toEqual(false, `Expected the control to stay untouched when menu opened.`);

      const backdrop =
        overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();
      dispatchFakeEvent(trigger, 'blur');
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(fixture.componentInstance.control.touched)
        .toEqual(true, `Expected the control to be touched as soon as focus left the select.`);
    }));

    it('should not set touched when a disabled select is touched', () => {
      expect(fixture.componentInstance.control.touched)
        .toBe(false, 'Expected the control to start off as untouched.');

      fixture.componentInstance.control.disable();
      dispatchFakeEvent(trigger, 'blur');

      expect(fixture.componentInstance.control.touched)
        .toBe(false, 'Expected the control to stay untouched.');
    });

    it('should set the control to dirty when the select value changes in the DOM', fakeAsync(() => {
      expect(fixture.componentInstance.control.dirty)
        .toEqual(false, `Expected control to start out pristine.`);

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;
      option.click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(fixture.componentInstance.control.dirty)
        .toEqual(true, `Expected control to be dirty after value was changed by user.`);
    }));

    it('should not set the control to dirty when the value changes programmatically', () => {
      expect(fixture.componentInstance.control.dirty)
        .toEqual(false, `Expected control to start out pristine.`);

      fixture.componentInstance.control.setValue('pizza-1');

      expect(fixture.componentInstance.control.dirty)
        .toEqual(false, `Expected control to stay pristine after programmatic change.`);
    });


    it('should set an asterisk after the placeholder if the control is required', () => {
      let requiredMarker = fixture.debugElement.query(By.css('.mat-form-field-required-marker'));
      expect(requiredMarker)
        .toBeNull(`Expected placeholder not to have an asterisk, as control was not required.`);

      fixture.componentInstance.isRequired = true;
      fixture.detectChanges();

      requiredMarker = fixture.debugElement.query(By.css('.mat-form-field-required-marker'));
      expect(requiredMarker)
          .not.toBeNull(`Expected placeholder to have an asterisk, as control was required.`);
    });

    it('should be able to programmatically select a falsy option', fakeAsync(() => {
      fixture.destroy();

      const falsyFixture = TestBed.createComponent(FalsyValueSelect);

      falsyFixture.detectChanges();
      falsyFixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement.click();
      falsyFixture.componentInstance.control.setValue(0);
      falsyFixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      expect(falsyFixture.componentInstance.options.first.selected)
        .toBe(true, 'Expected first option to be selected');
      expect(overlayContainerElement.querySelectorAll('mat-option')[0].classList)
        .toContain('mat-selected', 'Expected first option to be selected');
    }));

  });

  describe('selection without Angular forms', () => {
    it('should set the value when options are clicked', fakeAsync(() => {
      const fixture = TestBed.createComponent(BasicSelectWithoutForms);

      fixture.detectChanges();
      expect(fixture.componentInstance.selectedFood).toBeFalsy();

      const trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      (overlayContainerElement.querySelector('mat-option') as HTMLElement).click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(fixture.componentInstance.selectedFood).toBe('steak-0');
      expect(fixture.componentInstance.select.value).toBe('steak-0');
      expect(trigger.textContent).toContain('Steak');

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      (overlayContainerElement.querySelectorAll('mat-option')[2] as HTMLElement).click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(fixture.componentInstance.selectedFood).toBe('sandwich-2');
      expect(fixture.componentInstance.select.value).toBe('sandwich-2');
      expect(trigger.textContent).toContain('Sandwich');
    }));

    it('should mark options as selected when the value is set', () => {
      const fixture = TestBed.createComponent(BasicSelectWithoutForms);

      fixture.detectChanges();
      fixture.componentInstance.selectedFood = 'sandwich-2';
      fixture.detectChanges();

      const trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
      expect(trigger.textContent).toContain('Sandwich');

      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelectorAll('mat-option')[2];

      expect(option.classList).toContain('mat-selected');
      expect(fixture.componentInstance.select.value).toBe('sandwich-2');
    });

    it('should reset the placeholder when a null value is set', fakeAsync(() => {
      const fixture = TestBed.createComponent(BasicSelectWithoutForms);

      fixture.detectChanges();
      expect(fixture.componentInstance.selectedFood).toBeFalsy();

      const trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;

      trigger.click();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      (overlayContainerElement.querySelector('mat-option') as HTMLElement).click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(fixture.componentInstance.selectedFood).toBe('steak-0');
      expect(fixture.componentInstance.select.value).toBe('steak-0');
      expect(trigger.textContent).toContain('Steak');

      fixture.componentInstance.selectedFood = null;
      fixture.detectChanges();

      expect(fixture.componentInstance.select.value).toBeNull();
      expect(trigger.textContent).not.toContain('Steak');
    }));

    it('should reflect the preselected value', async(() => {
      const fixture = TestBed.createComponent(BasicSelectWithoutFormsPreselected);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;

        fixture.detectChanges();
        expect(trigger.textContent).toContain('Pizza');

        trigger.click();
        fixture.detectChanges();

        const option = overlayContainerElement.querySelectorAll('mat-option')[1];

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
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;

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

    it('should restore focus to the host element', async(() => {
      const fixture = TestBed.createComponent(BasicSelectWithoutForms);

      fixture.detectChanges();
      fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        (overlayContainerElement.querySelector('mat-option') as HTMLElement).click();
        fixture.detectChanges();

        const select = fixture.debugElement.nativeElement.querySelector('mat-select');

        expect(document.activeElement).toBe(select, 'Expected trigger to be focused.');
      });
    }));

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

      expect(fixture.componentInstance.customAccessor.select.ngControl)
          .toBe(null, 'Expected mat-select NOT to inherit control from parent value accessor.');
      expect(fixture.componentInstance.customAccessor.writeValue).toHaveBeenCalled();
    });

  });

  describe('animations', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let trigger: HTMLElement;
    let formField: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();

      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
      formField = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
    }));

    it('should float the placeholder when the panel is open and unselected', fakeAsync(() => {
      expect(formField.classList.contains('mat-form-field-should-float'))
          .toBe(false, 'Expected placeholder to initially have a normal position.');

      fixture.componentInstance.select.open();
      tick();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      expect(formField.classList).toContain('mat-form-field-should-float',
          'Expected placeholder to animate up to floating position.');

      fixture.componentInstance.select.close();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(formField.classList).not.toContain('mat-form-field-should-float',
          'Expected placeholder to animate back down to normal position.');
    }));

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
    let formField: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();
      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
      select = fixture.debugElement.query(By.css('mat-select')).nativeElement;
      formField = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;
    });

    /**
     * Asserts that the given option is aligned with the trigger.
     * @param index The index of the option.
     * @param selectInstance Instance of the `mat-select` component to check against.
     */
    function checkTriggerAlignedWithOption(index: number, selectInstance =
      fixture.componentInstance.select): void {

      const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
      const triggerTop = trigger.getBoundingClientRect().top;
      const overlayTop = overlayPane.getBoundingClientRect().top;
      const options = overlayPane.querySelectorAll('mat-option');
      const optionTop = options[index].getBoundingClientRect().top;
      const triggerFontSize = parseInt(window.getComputedStyle(trigger)['font-size']);
      const triggerLineHeightEm = 1.125;

      // Extra trigger height beyond the font size caused by the fact that the line-height is
      // greater than 1em.
      const triggerExtraLineSpaceAbove = (1 - triggerLineHeightEm) * triggerFontSize / 2;
      const topDifference = Math.floor(optionTop) -
          Math.floor(triggerTop - triggerFontSize - triggerExtraLineSpaceAbove);

      // Expect the coordinates to be within a pixel of each other. We can't rely on comparing
      // the exact value, because different browsers report the various sizes with slight (< 1px)
      // deviations.
      expect(Math.abs(topDifference) < 2)
          .toBe(true, `Expected trigger to align with option ${index}.`);

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
        formField.style.position = 'fixed';
        formField.style.top = '285px';
        formField.style.left = '20px';
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

      it('should account for preceding label groups when aligning the option', async(() => {
        fixture.destroy();

        let groupFixture = TestBed.createComponent(SelectWithGroups);
        groupFixture.detectChanges();
        trigger = groupFixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
        select = groupFixture.debugElement.query(By.css('mat-select')).nativeElement;

        formField.style.position = 'fixed';
        formField.style.top = '200px';
        formField.style.left = '100px';

        // Select an option in the third group, which has a couple of group labels before it.
        groupFixture.componentInstance.control.setValue('vulpix-7');
        groupFixture.detectChanges();

        trigger.click();
        groupFixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .mat-select-panel')!;

        fixture.whenStable().then(() => {
          // The selected option should be scrolled to the center of the panel.
          // This will be its original offset from the scrollTop - half the panel height + half the
          // option height. 10 (option index + 3 group labels before it) * 48 (option height) =
          // 480px. 480 (offset from scrollTop) - 256/2 + 48/2 = 376px
          expect(Math.floor(scrollContainer.scrollTop))
              .toBe(376, `Expected overlay panel to be scrolled to center the selected option.`);

          checkTriggerAlignedWithOption(7, groupFixture.componentInstance.select);
        });
      }));
    });

    describe('limited space to open vertically', () => {
      beforeEach(() => {
        formField.style.position = 'fixed';
        formField.style.left = '20px';
      });

      it('should adjust position of centered option if there is little space above', async(() => {
        const selectMenuHeight = 256;
        const selectMenuViewportPadding = 8;
        const selectItemHeight = 48;
        const selectedIndex = 4;
        const fontSize = 16;
        const lineHeightEm = 1.125;
        const expectedExtraScroll = 5;

        // Trigger element height.
        const triggerHeight = fontSize * lineHeightEm;

        // Ideal space above selected item in order to center it.
        const idealSpaceAboveSelectedItem = (selectMenuHeight - selectItemHeight) / 2;

        // Actual space above selected item.
        const actualSpaceAboveSelectedItem = selectItemHeight * selectedIndex;

        // Ideal scroll position to center.
        const idealScrollTop = actualSpaceAboveSelectedItem - idealSpaceAboveSelectedItem;

        // Top-most select-position that allows for perfect centering.
        const topMostPositionForPerfectCentering =
            idealSpaceAboveSelectedItem + selectMenuViewportPadding +
            (selectItemHeight - triggerHeight) / 2;

        // Position of select relative to top edge of mat-form-field.
        const formFieldTopSpace =
            trigger.getBoundingClientRect().top - formField.getBoundingClientRect().top;

        const formFieldTop =
            topMostPositionForPerfectCentering - formFieldTopSpace - expectedExtraScroll;

        formField.style.top = `${formFieldTop}px`;

        // Select an option in the middle of the list
        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .mat-select-panel')!;

        fixture.whenStable().then(() => {
          expect(Math.ceil(scrollContainer.scrollTop))
              .toEqual(Math.ceil(idealScrollTop + 5),
                  `Expected panel to adjust scroll position to fit in viewport.`);

          checkTriggerAlignedWithOption(4);
        });
      }));

      it('should adjust position of centered option if there is little space below', async(() => {
        const selectMenuHeight = 256;
        const selectMenuViewportPadding = 8;
        const selectItemHeight = 48;
        const selectedIndex = 4;
        const fontSize = 16;
        const lineHeightEm = 1.125;
        const expectedExtraScroll = 5;

        // Trigger element height.
        const triggerHeight = fontSize * lineHeightEm;

        // Ideal space above selected item in order to center it.
        const idealSpaceAboveSelectedItem = (selectMenuHeight - selectItemHeight) / 2;

        // Actual space above selected item.
        const actualSpaceAboveSelectedItem = selectItemHeight * selectedIndex;

        // Ideal scroll position to center.
        const idealScrollTop = actualSpaceAboveSelectedItem - idealSpaceAboveSelectedItem;

        // Bottom-most select-position that allows for perfect centering.
        const bottomMostPositionForPerfectCentering =
            idealSpaceAboveSelectedItem + selectMenuViewportPadding +
            (selectItemHeight - triggerHeight) / 2;

        // Position of select relative to bottom edge of mat-form-field:
        const formFieldBottomSpace =
            formField.getBoundingClientRect().bottom - trigger.getBoundingClientRect().bottom;

        const formFieldBottom =
            bottomMostPositionForPerfectCentering - formFieldBottomSpace - expectedExtraScroll;

        // Push the select to a position with not quite enough space on the bottom to open
        // with the option completely centered (needs 113px at least: 256/2 - 48/2 + 9)
        formField.style.bottom = `${formFieldBottom}px`;

        // Select an option in the middle of the list
        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          trigger.click();
          fixture.detectChanges();

          const scrollContainer = document.querySelector('.cdk-overlay-pane .mat-select-panel')!;

          fixture.whenStable().then(() => {
            // Scroll should adjust by the difference between the bottom space available
            // (56px from the bottom of the screen - 8px padding = 48px)
            // and the height of the panel below the option (113px).
            // 113px - 48px = 75px difference. Original scrollTop 88px - 75px = 23px
            const difference = Math.ceil(scrollContainer.scrollTop) -
                Math.ceil(idealScrollTop - expectedExtraScroll);

            // Note that different browser/OS combinations report the different dimensions with
            // slight deviations (< 1px). We round the expectation and check that the values
            // are within a pixel of each other to avoid flakes.
            expect(Math.abs(difference) < 2)
                .toBe(true, `Expected panel to adjust scroll position to fit in viewport.`);

            checkTriggerAlignedWithOption(4);
          });
        });
      }));

      it('should fall back to "above" positioning if scroll adjustment will not help', () => {
        // Push the select to a position with not enough space on the bottom to open
        formField.style.bottom = '56px';
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

        const difference = Math.floor(overlayBottom) - Math.floor(triggerBottom);

        // Check that the values are within a pixel of each other. This avoids sub-pixel
        // deviations between OS and browser versions.
        expect(Math.abs(difference) < 2)
            .toEqual(true, `Expected trigger bottom to align with overlay bottom.`);

        expect(fixture.componentInstance.select._transformOrigin)
            .toContain(`bottom`, `Expected panel animation to originate at the bottom.`);
      });

      it('should fall back to "below" positioning if scroll adjustment will not help', () => {
        // Push the select to a position with not enough space on the top to open
        formField.style.top = '85px';

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
        formField.style.position = 'absolute';
        formField.style.top = '200px';
      });

      it('should stay within the viewport when overflowing on the left in ltr', fakeAsync(() => {
        formField.style.left = '-100px';
        trigger.click();
        tick(400);
        fixture.detectChanges();

        const panelLeft = document.querySelector('.mat-select-panel')!.getBoundingClientRect().left;

        expect(panelLeft).toBeGreaterThan(0,
            `Expected select panel to be inside the viewport in ltr.`);
      }));

      it('should stay within the viewport when overflowing on the left in rtl', fakeAsync(() => {
        dir.value = 'rtl';
        formField.style.left = '-100px';
        trigger.click();
        tick(400);
        fixture.detectChanges();

        const panelLeft = document.querySelector('.mat-select-panel')!.getBoundingClientRect().left;

        expect(panelLeft).toBeGreaterThan(0,
            `Expected select panel to be inside the viewport in rtl.`);
      }));

      it('should stay within the viewport when overflowing on the right in ltr', fakeAsync(() => {
        formField.style.right = '-100px';
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
        formField.style.right = '-100px';
        trigger.click();
        tick(400);
        fixture.detectChanges();

        const viewportRect = viewportRuler.getViewportRect().right;
        const panelRight = document.querySelector('.mat-select-panel')!
            .getBoundingClientRect().right;

        expect(viewportRect - panelRight).toBeGreaterThan(0,
            `Expected select panel to be inside the viewport in rtl.`);
      }));

      it('should keep the position within the viewport on repeat openings', fakeAsync(() => {
        formField.style.left = '-100px';
        trigger.click();
        fixture.detectChanges();
        tick(SELECT_OPEN_ANIMATION);

        let panelLeft = document.querySelector('.mat-select-panel')!.getBoundingClientRect().left;
        expect(panelLeft).toBeGreaterThan(0, `Expected select panel to be inside the viewport.`);

        fixture.componentInstance.select.close();
        fixture.detectChanges();
        tick(SELECT_CLOSE_ANIMATION);

        trigger.click();
        fixture.detectChanges();
        tick(SELECT_OPEN_ANIMATION);
        panelLeft = document.querySelector('.mat-select-panel')!.getBoundingClientRect().left;

        expect(panelLeft).toBeGreaterThan(0,
            `Expected select panel continue being inside the viewport.`);
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
        formField.style.marginLeft = '20px';
        formField.style.marginRight = '20px';
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
        const difference = Math.floor(overlayBottom) - Math.floor(triggerBottom);

        // Check that the values are within a pixel of each other. This avoids sub-pixel
        // deviations between OS and browser versions.
        expect(Math.abs(difference) < 2)
            .toEqual(true, `Expected trigger bottom to align with overlay bottom.`);
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
        formField.style.position = 'fixed';
        formField.style.left = '30px';
      });

      it('should align the trigger and the selected option on the x-axis in ltr', fakeAsync(() => {
        trigger.click();
        tick(400);
        fixture.detectChanges();

        const triggerLeft = trigger.getBoundingClientRect().left;
        const firstOptionLeft = document.querySelector('.cdk-overlay-pane mat-option')!
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
            document.querySelector('.cdk-overlay-pane mat-option')!.getBoundingClientRect().right;

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
        formField = multiFixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
        trigger = multiFixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
        select = multiFixture.debugElement.query(By.css('mat-select')).nativeElement;

        formField.style.position = 'fixed';
        formField.style.left = '60px';
      });

      it('should adjust for the checkbox in ltr', async(() => {
        trigger.click();
        multiFixture.detectChanges();

        multiFixture.whenStable().then(() => {
          const triggerLeft = trigger.getBoundingClientRect().left;
          const firstOptionLeft =
              document.querySelector('.cdk-overlay-pane mat-option')!.getBoundingClientRect().left;

          // 44px accounts for the checkbox size, margin and the panel's padding.
          expect(Math.floor(firstOptionLeft))
              .toEqual(Math.floor(triggerLeft - 44),
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
            document.querySelector('.cdk-overlay-pane mat-option')!.getBoundingClientRect().right;

        // 44px accounts for the checkbox size, margin and the panel's padding.
        expect(Math.floor(firstOptionRight))
            .toEqual(Math.floor(triggerRight + 44),
                `Expected trigger label to align along x-axis, accounting for the checkbox.`);
      }));
    });

    describe('x-axis positioning with groups', () => {
      let groupFixture: ComponentFixture<SelectWithGroups>;

      beforeEach(() => {
        groupFixture = TestBed.createComponent(SelectWithGroups);
        groupFixture.detectChanges();
        formField = groupFixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
        trigger = groupFixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
        select = groupFixture.debugElement.query(By.css('mat-select')).nativeElement;

        formField.style.position = 'fixed';
        formField.style.left = '60px';
      });

      it('should adjust for the group padding in ltr', fakeAsync(() => {
        groupFixture.componentInstance.control.setValue('oddish-1');
        groupFixture.detectChanges();

        trigger.click();
        groupFixture.detectChanges();

        const group = document.querySelector('.cdk-overlay-pane mat-optgroup')!;
        const triggerLeft = trigger.getBoundingClientRect().left;
        const selectedOptionLeft = group.querySelector('mat-option.mat-selected')!
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

        const group = document.querySelector('.cdk-overlay-pane mat-optgroup')!;
        const triggerRight = trigger.getBoundingClientRect().right;
        const selectedOptionRight = group.querySelector('mat-option.mat-selected')!
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

          const selected = document.querySelector('.cdk-overlay-pane mat-option.mat-selected')!;
          const selectedOptionLeft = selected.getBoundingClientRect().left;
          const triggerLeft = trigger.getBoundingClientRect().left;

          // 16px is the default option padding
          expect(Math.floor(selectedOptionLeft)).toEqual(Math.floor(triggerLeft - 16));
        }));

      it('should align the first option to the trigger, if nothing is selected', async(() => {
        // Push down the form field so there is space for the item to completely align.
        formField.style.top = '100px';

        const menuItemHeight = 48;
        const triggerFontSize = 16;
        const triggerLineHeightEm = 1.125;
        const triggerHeight = triggerFontSize * triggerLineHeightEm;

        trigger.click();
        groupFixture.detectChanges();

        fixture.whenStable().then(() => {
          const triggerTop = trigger.getBoundingClientRect().top;

          const option = overlayContainerElement.querySelector('.cdk-overlay-pane mat-option');
          const optionTop = option ? option.getBoundingClientRect().top : 0;

          // There appears to be a small rounding error on IE, so we verify that the value is close,
          // not exact.
          let platform = new Platform();
          if (platform.TRIDENT) {
            let difference =
                Math.abs(optionTop + (menuItemHeight - triggerHeight) / 2 - triggerTop);
            expect(difference)
                .toBeLessThan(0.1, 'Expected trigger to align with the first option.');
          } else {
            expect(Math.floor(optionTop + (menuItemHeight - triggerHeight) / 2))
                .toBe(Math.floor(triggerTop), 'Expected trigger to align with the first option.');
          }
        });
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
        select = fixture.debugElement.query(By.css('mat-select')).nativeElement;
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

      it('should not have aria-labelledby in the DOM if it`s not specified', async(() => {

        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(select.hasAttribute('aria-labelledby')).toBeFalsy();
        });
      }));

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
        select = plainTabindexFixture.debugElement.query(By.css('mat-select')).nativeElement;

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

      it('should be able to select options via the arrow keys on a closed select', fakeAsync(() => {
        const formControl = fixture.componentInstance.control;
        const options = fixture.componentInstance.options.toArray();

        expect(formControl.value).toBeFalsy('Expected no initial value.');

        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
        tick();

        expect(options[0].selected).toBe(true, 'Expected first option to be selected.');
        expect(formControl.value).toBe(options[0].value,
          'Expected value from first option to have been set on the model.');

        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
        tick();

        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
        tick();

        // Note that the third option is skipped, because it is disabled.
        expect(options[3].selected).toBe(true, 'Expected fourth option to be selected.');
        expect(formControl.value).toBe(options[3].value,
          'Expected value from fourth option to have been set on the model.');

        dispatchKeyboardEvent(select, 'keydown', UP_ARROW);
        tick();

        expect(options[1].selected).toBe(true, 'Expected second option to be selected.');
        expect(formControl.value).toBe(options[1].value,
          'Expected value from second option to have been set on the model.');
      }));

      it('should open the panel when pressing the arrow keys on a closed multiple select', () => {
        fixture.destroy();

        const multiFixture = TestBed.createComponent(MultiSelect);
        const instance = multiFixture.componentInstance;

        multiFixture.detectChanges();
        select = multiFixture.debugElement.query(By.css('mat-select')).nativeElement;

        const initialValue = instance.control.value;

        expect(instance.select.panelOpen).toBe(false, 'Expected panel to be closed.');

        const event = dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

        expect(instance.select.panelOpen).toBe(true, 'Expected panel to be open.');
        expect(instance.control.value).toBe(initialValue, 'Expected value to stay the same.');
        expect(event.defaultPrevented).toBe(true, 'Expected default to be prevented.');
      });

      it('should do nothing if the key manager did not change the active item', fakeAsync(() => {
        const formControl = fixture.componentInstance.control;

        expect(formControl.value).toBeNull('Expected form control value to be empty.');
        expect(formControl.pristine).toBe(true, 'Expected form control to be clean.');

        dispatchKeyboardEvent(select, 'keydown', 16); // Press a random key.
        tick();

        expect(formControl.value).toBeNull('Expected form control value to stay empty.');
        expect(formControl.pristine).toBe(true, 'Expected form control to stay clean.');
      }));

      it('should continue from the selected option when the value is set programmatically',
        fakeAsync(() => {
          const formControl = fixture.componentInstance.control;

          formControl.setValue('eggs-5');
          fixture.detectChanges();
          tick();

          dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
          tick();

          expect(formControl.value).toBe('pasta-6');
          expect(fixture.componentInstance.options.toArray()[6].selected).toBe(true);
        }));

      it('should not shift focus when the selected options are updated programmatically ' +
        'in a multi select', () => {
          fixture.destroy();

          const multiFixture = TestBed.createComponent(MultiSelect);

          multiFixture.detectChanges();
          select = multiFixture.debugElement.query(By.css('mat-select')).nativeElement;
          multiFixture.componentInstance.select.open();
          multiFixture.detectChanges();

          const options =
              overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;

          options[3].focus();
          expect(document.activeElement).toBe(options[3], 'Expected fourth option to be focused.');

          multiFixture.componentInstance.control.setValue(['steak-0', 'sushi-7']);
          multiFixture.detectChanges();

          expect(document.activeElement)
              .toBe(options[3], 'Expected fourth option to remain focused.');
        });

      it('should not cycle through the options if the control is disabled', fakeAsync(() => {
        const formControl = fixture.componentInstance.control;

        formControl.setValue('eggs-5');
        formControl.disable();

        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
        tick();

        expect(formControl.value).toBe('eggs-5', 'Expected value to remain unchaged.');
      }));

      it('should not wrap selection around after reaching the end of the options', fakeAsync(() => {
        const lastOption = fixture.componentInstance.options.last;

        fixture.componentInstance.options.forEach(() => {
          dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
          tick();
        });

        expect(lastOption.selected).toBe(true, 'Expected last option to be selected.');

        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
        tick();

        expect(lastOption.selected).toBe(true, 'Expected last option to stay selected.');
      }));

      it('should not open a multiple select when tabbing through', () => {
        fixture.destroy();

        const multiFixture = TestBed.createComponent(MultiSelect);

        multiFixture.detectChanges();
        select = multiFixture.debugElement.query(By.css('mat-select')).nativeElement;

        expect(multiFixture.componentInstance.select.panelOpen)
            .toBe(false, 'Expected panel to be closed initially.');

        dispatchKeyboardEvent(select, 'keydown', TAB);

        expect(multiFixture.componentInstance.select.panelOpen)
            .toBe(false, 'Expected panel to stay closed.');
      });

      it('should prevent the default action when pressing space', () => {
        const event = dispatchKeyboardEvent(select, 'keydown', SPACE);
        expect(event.defaultPrevented).toBe(true);
      });

      it('should consider the selection a result of a user action when closed', fakeAsync(() => {
        const option = fixture.componentInstance.options.first;
        const spy = jasmine.createSpy('option selection spy');
        const subscription = map.call(option.onSelectionChange, e => e.isUserInput).subscribe(spy);

        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
        tick();
        expect(spy).toHaveBeenCalledWith(true);

        subscription.unsubscribe();
      }));

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
        select = multiFixture.debugElement.query(By.css('mat-select')).nativeElement;

        expect(select.getAttribute('aria-multiselectable')).toBe('true');
      });

      it('should set `aria-multiselectable` false on single-selection instances', () => {
        expect(select.getAttribute('aria-multiselectable')).toBe('false');
      });

      it('should set aria-activedescendant only while the panel is open', fakeAsync(() => {
        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        const host = fixture.debugElement.query(By.css('mat-select')).nativeElement;

        expect(host.hasAttribute('aria-activedescendant'))
            .toBe(false, 'Expected no aria-activedescendant on init.');

        fixture.componentInstance.select.open();
        tick();
        fixture.detectChanges();
        tick(SELECT_OPEN_ANIMATION);

        const options = overlayContainerElement.querySelectorAll('mat-option');

        expect(host.getAttribute('aria-activedescendant'))
          .toBe(options[4].id, 'Expected aria-activedescendant to match the active option.');

        fixture.componentInstance.select.close();
        fixture.detectChanges();
        tick(SELECT_CLOSE_ANIMATION);

        expect(host.hasAttribute('aria-activedescendant'))
          .toBe(false, 'Expected no aria-activedescendant when closed.');
      }));

      it('should set aria-activedescendant based on the focused option', fakeAsync(() => {
        const host = fixture.debugElement.query(By.css('mat-select')).nativeElement;

        fixture.componentInstance.select.open();
        tick();
        fixture.detectChanges();
        tick(SELECT_OPEN_ANIMATION);

        const options = overlayContainerElement.querySelectorAll('mat-option');

        expect(host.getAttribute('aria-activedescendant')).toBe(options[0].id);

        [1, 2, 3].forEach(() => {
          dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
          tick();
          fixture.detectChanges();
        });

        expect(host.getAttribute('aria-activedescendant')).toBe(options[4].id);

        dispatchKeyboardEvent(host, 'keydown', UP_ARROW);
        tick();
        fixture.detectChanges();

        expect(host.getAttribute('aria-activedescendant')).toBe(options[3].id);
      }));

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
          overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      });

      it('should set the role of mat-option to option', () => {
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
        groups =
            overlayContainerElement.querySelectorAll('mat-optgroup') as NodeListOf<HTMLElement>;
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

      beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(ManySelects);
        fixture.detectChanges();
        triggers = fixture.debugElement.queryAll(By.css('.mat-select-trigger'));

        triggers[0].nativeElement.click();
        fixture.detectChanges();
        tick(SELECT_OPEN_ANIMATION);

        options =
            overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      }));

      it('should set aria-owns properly', fakeAsync(() => {
        const selects = fixture.debugElement.queryAll(By.css('mat-select'));

        expect(selects[0].nativeElement.getAttribute('aria-owns'))
            .toContain(options[0].id, `Expected aria-owns to contain IDs of its child options.`);
        expect(selects[0].nativeElement.getAttribute('aria-owns'))
            .toContain(options[1].id, `Expected aria-owns to contain IDs of its child options.`);

        const backdrop =
            overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
        backdrop.click();
        fixture.detectChanges();
        tick(SELECT_CLOSE_ANIMATION);

        triggers[1].nativeElement.click();
        fixture.detectChanges();
        tick(SELECT_OPEN_ANIMATION);

        options =
            overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
        expect(selects[1].nativeElement.getAttribute('aria-owns'))
            .toContain(options[0].id, `Expected aria-owns to contain IDs of its child options.`);
        expect(selects[1].nativeElement.getAttribute('aria-owns'))
            .toContain(options[1].id, `Expected aria-owns to contain IDs of its child options.`);

      }));

      it('should set the option id properly', fakeAsync(() => {
        let firstOptionID = options[0].id;

        expect(options[0].id)
            .toContain('mat-option', `Expected option ID to have the correct prefix.`);
        expect(options[0].id).not.toEqual(options[1].id, `Expected option IDs to be unique.`);

        const backdrop =
            overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
        backdrop.click();
        fixture.detectChanges();
        tick(SELECT_CLOSE_ANIMATION);

        triggers[1].nativeElement.click();
        fixture.detectChanges();
        tick(SELECT_OPEN_ANIMATION);

        options =
            overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
        expect(options[0].id)
            .toContain('mat-option', `Expected option ID to have the correct prefix.`);
        expect(options[0].id).not.toEqual(firstOptionID, `Expected option IDs to be unique.`);
        expect(options[0].id).not.toEqual(options[1].id, `Expected option IDs to be unique.`);
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

    it('should allow the user to customize the label', () => {
      const fixture = TestBed.createComponent(SelectWithCustomTrigger);
      fixture.detectChanges();

      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      const label = fixture.debugElement.query(By.css('.mat-select-value')).nativeElement;

      expect(label.textContent).toContain('azziP',
          'Expected the displayed text to be "Pizza" in reverse.');
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

      (overlayContainerElement.querySelector('mat-option') as HTMLElement).click();

      expect(fixture.componentInstance.changeListener).toHaveBeenCalled();
    });

    it('should not emit multiple change events for the same option', () => {
      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;

      option.click();
      option.click();

      expect(fixture.componentInstance.changeListener).toHaveBeenCalledTimes(1);
    });

    it('should only emit one event when pressing the arrow keys on a closed select',
      fakeAsync(() => {
        const select = fixture.debugElement.query(By.css('mat-select')).nativeElement;
        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
        tick();

        expect(fixture.componentInstance.changeListener).toHaveBeenCalledTimes(1);
      }));

  });

  describe('floatPlaceholder option', () => {
    let fixture: ComponentFixture<FloatPlaceholderSelect>;
    let formField: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(FloatPlaceholderSelect);
      fixture.detectChanges();
      formField = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
    });

    it('should be able to disable the floating placeholder', () => {
      fixture.componentInstance.floatPlaceholder = 'never';
      fixture.detectChanges();

      expect(formField.classList.contains('mat-form-field-can-float'))
          .toBe(false, 'Floating placeholder should be disabled');

      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      expect(formField.classList.contains('mat-form-field-can-float'))
          .toBe(false, 'Floating placeholder should be disabled');
    });

    it('should be able to always float the placeholder', () => {
      expect(fixture.componentInstance.control.value).toBeFalsy();

      fixture.componentInstance.floatPlaceholder = 'always';
      fixture.detectChanges();

      expect(formField.classList.contains('mat-form-field-can-float'))
          .toBe(true, 'Placeholder should be able to float');
      expect(formField.classList.contains('mat-form-field-should-float'))
          .toBe(true, 'Placeholder should be floating');
    });

    it ('should default to global floating placeholder type', () => {
      fixture.destroy();

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          MatFormFieldModule,
          MatSelectModule,
          ReactiveFormsModule,
          FormsModule,
          NoopAnimationsModule
        ],
        declarations: [
          FloatPlaceholderSelect
        ],
        providers: [{ provide: MAT_PLACEHOLDER_GLOBAL_OPTIONS, useValue: { float: 'always' } }]
      });

      fixture = TestBed.createComponent(FloatPlaceholderSelect);
      fixture.componentInstance.floatPlaceholder = null;
      fixture.detectChanges();
      formField = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;

      expect(formField.classList.contains('mat-form-field-can-float'))
          .toBe(true, 'Placeholder should be able to float');
      expect(formField.classList.contains('mat-form-field-should-float'))
          .toBe(true, 'Placeholder should be floating');
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

      const options = overlayContainerElement.querySelectorAll('mat-option') as
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

      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;

      option.click();
      fixture.detectChanges();

      expect(testInstance.control.value).toEqual(['steak-0']);

      option.click();
      fixture.detectChanges();

      expect(testInstance.control.value).toEqual([]);
    });

    it('should update the label', async(() => {
      trigger.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const options = overlayContainerElement.querySelectorAll('mat-option') as
            NodeListOf<HTMLElement>;

        options[0].click();
        options[2].click();
        options[5].click();
        fixture.detectChanges();

        expect(trigger.textContent).toContain('Steak, Tacos, Eggs');

        options[2].click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(trigger.textContent).toContain('Steak, Eggs');
        });
      });
    }));

    it('should be able to set the selected value by taking an array', () => {
      trigger.click();
      testInstance.control.setValue(['steak-0', 'eggs-5']);
      fixture.detectChanges();

      const optionNodes = overlayContainerElement.querySelectorAll('mat-option') as
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

      const options = overlayContainerElement.querySelectorAll('mat-option') as
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

      const options = overlayContainerElement.querySelectorAll('mat-option') as
          NodeListOf<HTMLElement>;

      options[0].click();
      options[1].click();
      fixture.detectChanges();

      expect(testInstance.select.panelOpen).toBe(true);
    });

    it('should sort the selected options based on their order in the panel', async(() => {
      trigger.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const options = overlayContainerElement.querySelectorAll('mat-option') as
            NodeListOf<HTMLElement>;

        options[2].click();
        options[0].click();
        options[1].click();
        fixture.detectChanges();

        expect(trigger.textContent).toContain('Steak, Pizza, Tacos');
        expect(fixture.componentInstance.control.value).toEqual(['steak-0', 'pizza-1', 'tacos-2']);
      });
    }));

    it('should sort the selected options in reverse in rtl', async(() => {
      dir.value = 'rtl';
      trigger.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const options = overlayContainerElement.querySelectorAll('mat-option') as
            NodeListOf<HTMLElement>;

        options[2].click();
        options[0].click();
        options[1].click();
        fixture.detectChanges();

        expect(trigger.textContent).toContain('Tacos, Pizza, Steak');
        expect(fixture.componentInstance.control.value).toEqual(['steak-0', 'pizza-1', 'tacos-2']);
      });
    }));

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
      }).toThrowError(wrappedErrorMessage(getMatSelectNonArrayValueError()));
    }));

    it('should throw an exception when trying to change multiple mode after init', async(() => {
      expect(() => {
        testInstance.select.multiple = false;
      }).toThrowError(wrappedErrorMessage(getMatSelectDynamicMultipleError()));
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

    beforeEach(async(() => {
      fixture = TestBed.createComponent(BasicSelectWithTheming);
      fixture.detectChanges();
    }));

    it('should transfer the theme to the select panel', () => {
      fixture.componentInstance.theme = 'warn';
      fixture.detectChanges();

      fixture.componentInstance.select.open();
      fixture.detectChanges();

      const panel = overlayContainerElement.querySelector('.mat-select-panel')! as HTMLElement;
      expect(panel.classList).toContain('mat-warn');
    });
  });

  describe('reset values', () => {
    let fixture: ComponentFixture<ResetValuesSelect>;
    let trigger: HTMLElement;
    let formField: HTMLElement;
    let options: NodeListOf<HTMLElement>;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(ResetValuesSelect);
      fixture.detectChanges();
      trigger = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
      formField = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;

      trigger.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        options = overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
        options[0].click();
        fixture.detectChanges();
      });
    }));

    it('should reset when an option with an undefined value is selected', fakeAsync(() => {
      options[4].click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(fixture.componentInstance.control.value).toBeUndefined();
      expect(fixture.componentInstance.select.selected).toBeFalsy();
      expect(formField.classList).not.toContain('mat-form-field-should-float');
      expect(trigger.textContent).not.toContain('Undefined');
    }));

    it('should reset when an option with a null value is selected', fakeAsync(() => {
      options[5].click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(fixture.componentInstance.control.value).toBeNull();
      expect(fixture.componentInstance.select.selected).toBeFalsy();
      expect(formField.classList).not.toContain('mat-form-field-should-float');
      expect(trigger.textContent).not.toContain('Null');
    }));

    it('should reset when a blank option is selected', fakeAsync(() => {
      options[6].click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(fixture.componentInstance.control.value).toBeUndefined();
      expect(fixture.componentInstance.select.selected).toBeFalsy();
      expect(formField.classList).not.toContain('mat-form-field-should-float');
      expect(trigger.textContent).not.toContain('None');
    }));

    it('should not reset when any other falsy option is selected', fakeAsync(() => {
      options[3].click();
      fixture.detectChanges();
      tick(SELECT_CLOSE_ANIMATION);

      expect(fixture.componentInstance.control.value).toBe(false);
      expect(fixture.componentInstance.select.selected).toBeTruthy();
      expect(formField.classList).toContain('mat-form-field-should-float');
      expect(trigger.textContent).toContain('Falsy');
    }));

    it('should not consider the reset values as selected when resetting the form control', () => {
      expect(formField.classList).toContain('mat-form-field-should-float');

      fixture.componentInstance.control.reset();
      fixture.detectChanges();

      expect(fixture.componentInstance.control.value).toBeNull();
      expect(fixture.componentInstance.select.selected).toBeFalsy();
      expect(formField.classList).not.toContain('mat-formf-field-should-float');
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
      select = fixture.debugElement.query(By.css('mat-select')).nativeElement;
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

    it('should be able to override the error matching behavior via an @Input', () => {
      fixture.destroy();

      const customErrorFixture = TestBed.createComponent(CustomErrorBehaviorSelect);
      const component = customErrorFixture.componentInstance;
      const matcher = jasmine.createSpy('error state matcher').and.returnValue(true);

      customErrorFixture.detectChanges();

      expect(component.control.invalid).toBe(false);
      expect(component.select.errorState).toBe(false);

      customErrorFixture.componentInstance.errorStateMatcher = { isErrorState: matcher };
      customErrorFixture.detectChanges();

      expect(component.select.errorState).toBe(true);
      expect(matcher).toHaveBeenCalled();
    });

    it('should be able to override the error matching behavior via the injection token', () => {
      const errorStateMatcher: ErrorStateMatcher = {
        isErrorState: jasmine.createSpy('error state matcher').and.returnValue(true)
      };

      fixture.destroy();

      TestBed.resetTestingModule().configureTestingModule({
        imports: [MatSelectModule, ReactiveFormsModule, FormsModule, NoopAnimationsModule],
        declarations: [SelectInsideFormGroup],
        providers: [{ provide: ErrorStateMatcher, useValue: errorStateMatcher }],
      });

      const errorFixture = TestBed.createComponent(SelectInsideFormGroup);
      const component = errorFixture.componentInstance;

      errorFixture.detectChanges();

      expect(component.select.errorState).toBe(true);
      expect(errorStateMatcher.isErrorState).toHaveBeenCalled();
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
        const selectedOption = instance.select.selected as MatOption;
        expect(selectedOption.value.value).toEqual('pizza-1');
      });

      it('should update when making a new selection', async(() => {
        instance.options.last._selectViaInteraction();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const selectedOption = instance.select.selected as MatOption;
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
        }).toThrowError(wrappedErrorMessage(getMatSelectNonFunctionValueError()));
      });
    });
  });

  describe('keyboard scrolling', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let host: HTMLElement;
    let panel: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(BasicSelect);

      fixture.componentInstance.foods = [];

      for (let i = 0; i < 30; i++) {
        fixture.componentInstance.foods.push({value: `value-${i}`, viewValue: `Option ${i}`});
      }

      fixture.detectChanges();
      fixture.componentInstance.select.open();
      fixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      host = fixture.debugElement.query(By.css('mat-select')).nativeElement;
      panel = overlayContainerElement.querySelector('.mat-select-panel')! as HTMLElement;
    }));

    it('should not scroll to options that are completely in the view', fakeAsync(() => {
      const initialScrollPosition = panel.scrollTop;

      [1, 2, 3].forEach(() => {
        dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
        tick();
        fixture.detectChanges();
      });

      expect(panel.scrollTop).toBe(initialScrollPosition, 'Expected scroll position not to change');
    }));

    it('should scroll down to the active option', fakeAsync(() => {
      for (let i = 0; i < 15; i++) {
        dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
        tick();
        fixture.detectChanges();
      }

      // <option index * height> - <panel height> = 16 * 48 - 256 = 512
      expect(panel.scrollTop).toBe(512, 'Expected scroll to be at the 16th option.');
    }));

    it('should scroll up to the active option', fakeAsync(() => {
      // Scroll to the bottom.
      for (let i = 0; i < fixture.componentInstance.foods.length; i++) {
        dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
        tick();
        fixture.detectChanges();
      }

      for (let i = 0; i < 20; i++) {
        dispatchKeyboardEvent(host, 'keydown', UP_ARROW);
        tick();
        fixture.detectChanges();
      }

      // <option index * height> = 9 * 48 = 432
      expect(panel.scrollTop).toBe(432, 'Expected scroll to be at the 9th option.');
    }));

    it('should skip option group labels', fakeAsync(() => {
      fixture.destroy();
      tick(SELECT_CLOSE_ANIMATION);

      const groupFixture = TestBed.createComponent(SelectWithGroups);

      groupFixture.detectChanges();
      groupFixture.componentInstance.select.open();
      groupFixture.detectChanges();
      tick(SELECT_OPEN_ANIMATION);

      host = groupFixture.debugElement.query(By.css('mat-select')).nativeElement;
      panel = overlayContainerElement.querySelector('.mat-select-panel')! as HTMLElement;

      for (let i = 0; i < 5; i++) {
        dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
        tick();
        groupFixture.detectChanges();
      }

      // Note that we press down 5 times, but it will skip
      // 3 options because the second group is disabled.
      // <(option index + group labels) * height> - <panel height> = (9 + 3) * 48 - 256 = 320
      expect(panel.scrollTop).toBe(320, 'Expected scroll to be at the 9th option.');
    }));
  });
});

@Component({
  selector: 'basic-select',
  template: `
    <div [style.height.px]="heightAbove"></div>
    <mat-form-field>
      <mat-select placeholder="Food" [formControl]="control" [required]="isRequired"
        [tabIndex]="tabIndexOverride" [aria-label]="ariaLabel" [aria-labelledby]="ariaLabelledby"
        [panelClass]="panelClass" [disableRipple]="disableRipple">
        <mat-option *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
          {{ food.viewValue }}
        </mat-option>
      </mat-select>
    </mat-form-field>
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

  @ViewChild(MatSelect) select: MatSelect;
  @ViewChildren(MatOption) options: QueryList<MatOption>;
}

@Component({
  selector: 'ng-model-select',
  template: `
    <mat-form-field>
      <mat-select placeholder="Food" ngModel [disabled]="isDisabled">
        <mat-option *ngFor="let food of foods"
                    [value]="food.value">{{ food.viewValue }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `
})
class NgModelSelect {
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];
  isDisabled: boolean;

  @ViewChild(MatSelect) select: MatSelect;
  @ViewChildren(MatOption) options: QueryList<MatOption>;
}

@Component({
  selector: 'many-selects',
  template: `
    <mat-form-field>
      <mat-select placeholder="First">
        <mat-option value="one">one</mat-option>
        <mat-option value="two">two</mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field>
      <mat-select placeholder="Second">
        <mat-option value="three">three</mat-option>
        <mat-option value="four">four</mat-option>
      </mat-select>
    </mat-form-field>
  `
})
class ManySelects {}

@Component({
  selector: 'ng-if-select',
  template: `
    <div *ngIf="isShowing">
      <mat-form-field>
        <mat-select placeholder="Food I want to eat right now" [formControl]="control">
          <mat-option *ngFor="let food of foods" [value]="food.value">
            {{ food.viewValue }}
          </mat-option>
        </mat-select>
      </mat-form-field>
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

  @ViewChild(MatSelect) select: MatSelect;
}

@Component({
  selector: 'select-with-change-event',
  template: `
    <mat-form-field>
      <mat-select (change)="changeListener($event)">
        <mat-option *ngFor="let food of foods" [value]="food">{{ food }}</mat-option>
      </mat-select>
    </mat-form-field>
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

  changeListener = jasmine.createSpy('MatSelect change listener');
}

@Component({
  selector: 'select-init-without-options',
  template: `
    <mat-form-field>
      <mat-select placeholder="Food I want to eat right now" [formControl]="control">
        <mat-option *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `
})
class SelectInitWithoutOptions {
  foods: any[];
  control = new FormControl('pizza-1');

  @ViewChild(MatSelect) select: MatSelect;
  @ViewChildren(MatOption) options: QueryList<MatOption>;

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
  template: `<mat-form-field><mat-select></mat-select></mat-form-field>`,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: CustomSelectAccessor,
    multi: true
  }]
})
class CustomSelectAccessor implements ControlValueAccessor {
  @ViewChild(MatSelect) select: MatSelect;

  writeValue: (value?: any) => void = () => {};
  registerOnChange: (changeFn?: (value: any) => void) => void = () => {};
  registerOnTouched: (touchedFn?: () => void) => void = () => {};
}

@Component({
  selector: 'comp-with-custom-select',
  template: `<custom-select-accessor [formControl]="ctrl"></custom-select-accessor>`,
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
    <mat-form-field>
      <mat-select [(ngModel)]="value"></mat-select>
    </mat-form-field>
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
    <mat-form-field>
      <mat-select placeholder="Food" [formControl]="control">
        <mat-option *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </mat-option>
      </mat-select>
    </mat-form-field>
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
    <mat-form-field>
      <mat-select placeholder="Food" [formControl]="control">
        <mat-option *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </mat-option>
      </mat-select>
    </mat-form-field>
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
    <mat-form-field [floatPlaceholder]="floatPlaceholder">
      <mat-select placeholder="Food I want to eat right now" [formControl]="control">
        <mat-option *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </mat-option>
      </mat-select>
    </mat-form-field>
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

  @ViewChild(MatSelect) select: MatSelect;
}

@Component({
  selector: 'multi-select',
  template: `
    <mat-form-field>
      <mat-select multiple placeholder="Food" [formControl]="control">
        <mat-option *ngFor="let food of foods"
                    [value]="food.value">{{ food.viewValue }}
        </mat-option>
      </mat-select>
    </mat-form-field>
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

  @ViewChild(MatSelect) select: MatSelect;
  @ViewChildren(MatOption) options: QueryList<MatOption>;
}

@Component({
  selector: 'select-with-plain-tabindex',
  template: `<mat-form-field><mat-select tabindex="5"></mat-select></mat-form-field>`
})
class SelectWithPlainTabindex { }

@Component({
  selector: 'select-early-sibling-access',
  template: `
    <mat-form-field>
      <mat-select #select="matSelect"></mat-select>
    </mat-form-field>
    <div *ngIf="select.selected"></div>
  `
})
class SelectEarlyAccessSibling { }

@Component({
  selector: 'basic-select-initially-hidden',
  template: `
    <mat-form-field>
      <mat-select [style.display]="isVisible ? 'block' : 'none'">
        <mat-option value="value">There are no other options</mat-option>
      </mat-select>
    </mat-form-field>
  `
})
class BasicSelectInitiallyHidden {
  isVisible = false;
}

@Component({
  selector: 'basic-select-no-placeholder',
  template: `
    <mat-form-field>
      <mat-select>
        <mat-option value="value">There are no other options</mat-option>
      </mat-select>
    </mat-form-field>
  `
})
class BasicSelectNoPlaceholder { }

@Component({
  selector: 'basic-select-with-theming',
  template: `
    <mat-form-field [color]="theme">
      <mat-select placeholder="Food">
        <mat-option value="steak-0">Steak</mat-option>
        <mat-option value="pizza-1">Pizza</mat-option>
      </mat-select>
    </mat-form-field>
  `
})
class BasicSelectWithTheming {
  @ViewChild(MatSelect) select: MatSelect;
  theme: string;
}


@Component({
  selector: 'reset-values-select',
  template: `
    <mat-form-field>
      <mat-select placeholder="Food" [formControl]="control">
        <mat-option *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </mat-option>
        <mat-option>None</mat-option>
      </mat-select>
    </mat-form-field>
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

  @ViewChild(MatSelect) select: MatSelect;
}

@Component({
  template: `
    <mat-form-field>
      <mat-select [formControl]="control">
        <mat-option *ngFor="let food of foods"
                    [value]="food.value">{{ food.viewValue }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `
})
class FalsyValueSelect {
  foods: any[] = [
    { value: 0, viewValue: 'Steak' },
    { value: 1, viewValue: 'Pizza' },
  ];
  control = new FormControl();
  @ViewChildren(MatOption) options: QueryList<MatOption>;
}


@Component({
  selector: 'select-with-groups',
  template: `
    <mat-form-field>
      <mat-select placeholder="Pokemon" [formControl]="control">
        <mat-optgroup *ngFor="let group of pokemonTypes" [label]="group.name"
          [disabled]="group.disabled">
          <mat-option *ngFor="let pokemon of group.pokemon" [value]="pokemon.value">
            {{ pokemon.viewValue }}
          </mat-option>
        </mat-optgroup>
        <mat-option value="mime-11">Mr. Mime</mat-option>
      </mat-select>
    </mat-form-field>
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

  @ViewChild(MatSelect) select: MatSelect;
  @ViewChildren(MatOption) options: QueryList<MatOption>;
}


@Component({
  template: `
    <form>
      <mat-form-field>
        <mat-select [(ngModel)]="value"></mat-select>
      </mat-form-field>
    </form>
  `
})
class InvalidSelectInForm {
  value: any;
}


@Component({
  template: `
    <form [formGroup]="formGroup">
      <mat-form-field>
        <mat-select placeholder="Food" formControlName="food">
          <mat-option value="steak-0">Steak</mat-option>
          <mat-option value="pizza-1">Pizza</mat-option>
        </mat-select>
      </mat-form-field>
    </form>
  `
})
class SelectInsideFormGroup {
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;
  @ViewChild(MatSelect) select: MatSelect;
  formControl = new FormControl('', Validators.required);
  formGroup = new FormGroup({
    food: this.formControl
  });
}


@Component({
  template: `
    <mat-form-field>
      <mat-select placeholder="Food" [(value)]="selectedFood">
        <mat-option *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `
})
class BasicSelectWithoutForms {
  selectedFood: string | null;
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'sandwich-2', viewValue: 'Sandwich' },
  ];

  @ViewChild(MatSelect) select: MatSelect;
}

@Component({
  template: `
    <mat-form-field>
      <mat-select placeholder="Food" [(value)]="selectedFood">
        <mat-option *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `
})
class BasicSelectWithoutFormsPreselected {
  selectedFood = 'pizza-1';
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
  ];

  @ViewChild(MatSelect) select: MatSelect;
}

@Component({
  template: `
    <mat-form-field>
      <mat-select placeholder="Food" [(value)]="selectedFoods" multiple>
        <mat-option *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `
})
class BasicSelectWithoutFormsMultiple {
  selectedFoods: string[];
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'sandwich-2', viewValue: 'Sandwich' },
  ];

  @ViewChild(MatSelect) select: MatSelect;
}


@Component({
  selector: 'select-with-custom-trigger',
  template: `
    <mat-form-field>
      <mat-select placeholder="Food" [formControl]="control" #select="matSelect">
        <mat-select-trigger>
          {{ select.selected?.viewValue.split('').reverse().join('') }}
        </mat-select-trigger>
        <mat-option *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </mat-option>
      </mat-select>
    </mat-form-field>
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
    <mat-form-field>
      <mat-select [ngModel]="selectedFood" (ngModelChange)="setFoodByCopy($event)"
                 [compareWith]="comparator">
        <mat-option *ngFor="let food of foods" [value]="food">{{ food.viewValue }}</mat-option>
      </mat-select>
    </mat-form-field>
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

  @ViewChild(MatSelect) select: MatSelect;
  @ViewChildren(MatOption) options: QueryList<MatOption>;

  useCompareByValue() { this.comparator = this.compareByValue; }

  useCompareByReference() { this.comparator = this.compareByReference; }

  useNullComparator() { this.comparator = null; }

  compareByValue(f1: any, f2: any) { return f1 && f2 && f1.value === f2.value; }

  compareByReference(f1: any, f2: any) { return f1 === f2; }

  setFoodByCopy(newValue: {value: string, viewValue: string}) {
    this.selectedFood = extendObject({}, newValue);
  }
}

@Component({
  template: `
    <mat-select placeholder="Food" [formControl]="control" [errorStateMatcher]="errorStateMatcher">
      <mat-option *ngFor="let food of foods" [value]="food.value">
        {{ food.viewValue }}
      </mat-option>
    </mat-select>
  `
})
class CustomErrorBehaviorSelect {
  @ViewChild(MatSelect) select: MatSelect;
  control = new FormControl();
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
  ];
  errorStateMatcher: ErrorStateMatcher;
}
