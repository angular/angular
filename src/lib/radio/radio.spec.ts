import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {FormControl, FormsModule, NgModel, ReactiveFormsModule} from '@angular/forms';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {dispatchFakeEvent, FakeViewportRuler} from '@angular/cdk/testing';
import {RIPPLE_FADE_IN_DURATION, RIPPLE_FADE_OUT_DURATION} from '@angular/material/core';
import {MatRadioButton, MatRadioChange, MatRadioGroup, MatRadioModule} from './index';

describe('MatRadio', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatRadioModule, FormsModule, ReactiveFormsModule],
      declarations: [
        FocusableRadioButton,
        RadiosInsideRadioGroup,
        RadioGroupWithNgModel,
        RadioGroupWithFormControl,
        StandaloneRadioButtons,
        InterleavedRadioGroup,
        TranscludingWrapper
      ],
      providers: [
        {provide: ViewportRuler, useClass: FakeViewportRuler}
      ]
    });

    TestBed.compileComponents();
  }));

  describe('inside of a group', () => {
    let fixture: ComponentFixture<RadiosInsideRadioGroup>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let radioDebugElements: DebugElement[];
    let radioNativeElements: HTMLElement[];
    let radioLabelElements: HTMLLabelElement[];
    let radioInputElements: HTMLInputElement[];
    let groupInstance: MatRadioGroup;
    let radioInstances: MatRadioButton[];
    let testComponent: RadiosInsideRadioGroup;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(RadiosInsideRadioGroup);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      groupDebugElement = fixture.debugElement.query(By.directive(MatRadioGroup));
      groupNativeElement = groupDebugElement.nativeElement;
      groupInstance = groupDebugElement.injector.get<MatRadioGroup>(MatRadioGroup);

      radioDebugElements = fixture.debugElement.queryAll(By.directive(MatRadioButton));
      radioNativeElements = radioDebugElements.map(debugEl => debugEl.nativeElement);
      radioInstances = radioDebugElements.map(debugEl => debugEl.componentInstance);

      radioLabelElements = radioDebugElements
        .map(debugEl => debugEl.query(By.css('label')).nativeElement);
      radioInputElements = radioDebugElements
        .map(debugEl => debugEl.query(By.css('input')).nativeElement);
    }));

    it('should set individual radio names based on the group name', () => {
      expect(groupInstance.name).toBeTruthy();
      for (const radio of radioInstances) {
        expect(radio.name).toBe(groupInstance.name);
      }
    });

    it('should coerce the disabled binding on the radio group', () => {
      (groupInstance as any).disabled = '';
      fixture.detectChanges();

      radioLabelElements[0].click();
      fixture.detectChanges();

      expect(radioInstances[0].checked).toBe(false);
      expect(groupInstance.disabled).toBe(true);
    });

    it('should disable click interaction when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.detectChanges();

      radioLabelElements[0].click();
      fixture.detectChanges();

      expect(radioInstances[0].checked).toBe(false);
    });

    it('should set label position based on the group labelPosition', () => {
      testComponent.labelPos = 'before';
      fixture.detectChanges();

      for (const radio of radioInstances) {
        expect(radio.labelPosition).toBe('before');
      }

      testComponent.labelPos = 'after';
      fixture.detectChanges();

      for (const radio of radioInstances) {
        expect(radio.labelPosition).toBe('after');
      }
    });

    it('should disable each individual radio when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.detectChanges();

      for (const radio of radioInstances) {
        expect(radio.disabled).toBe(true);
      }
    });

    it('should set required to each radio button when the group is required', () => {
      testComponent.isGroupRequired = true;
      fixture.detectChanges();

      for (const radio of radioInstances) {
        expect(radio.required).toBe(true);
      }
    });

    it('should update the group value when one of the radios changes', () => {
      expect(groupInstance.value).toBeFalsy();

      radioInstances[0].checked = true;
      fixture.detectChanges();

      expect(groupInstance.value).toBe('fire');
      expect(groupInstance.selected).toBe(radioInstances[0]);
    });

    it('should update the group and radios when one of the radios is clicked', () => {
      expect(groupInstance.value).toBeFalsy();

      radioLabelElements[0].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('fire');
      expect(groupInstance.selected).toBe(radioInstances[0]);
      expect(radioInstances[0].checked).toBe(true);
      expect(radioInstances[1].checked).toBe(false);

      radioLabelElements[1].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('water');
      expect(groupInstance.selected).toBe(radioInstances[1]);
      expect(radioInstances[0].checked).toBe(false);
      expect(radioInstances[1].checked).toBe(true);
    });

    it('should check a radio upon interaction with the underlying native radio button', () => {
      radioInputElements[0].click();
      fixture.detectChanges();

      expect(radioInstances[0].checked).toBe(true);
      expect(groupInstance.value).toBe('fire');
      expect(groupInstance.selected).toBe(radioInstances[0]);
    });

    it('should emit a change event from radio buttons', () => {
      expect(radioInstances[0].checked).toBe(false);

      const spies = radioInstances
        .map((radio, index) => jasmine.createSpy(`onChangeSpy ${index} for ${radio.name}`));

      spies.forEach((spy, index) => radioInstances[index].change.subscribe(spy));

      radioLabelElements[0].click();
      fixture.detectChanges();

      expect(spies[0]).toHaveBeenCalled();

      radioLabelElements[1].click();
      fixture.detectChanges();

      // To match the native radio button behavior, the change event shouldn't
      // be triggered when the radio got unselected.
      expect(spies[0]).toHaveBeenCalledTimes(1);
      expect(spies[1]).toHaveBeenCalledTimes(1);
    });

    it(`should not emit a change event from the radio group when change group value
        programmatically`, () => {
      expect(groupInstance.value).toBeFalsy();

      const changeSpy = jasmine.createSpy('radio-group change listener');
      groupInstance.change.subscribe(changeSpy);

      radioLabelElements[0].click();
      fixture.detectChanges();

      expect(changeSpy).toHaveBeenCalledTimes(1);

      groupInstance.value = 'water';
      fixture.detectChanges();

      expect(changeSpy).toHaveBeenCalledTimes(1);
    });

    it('should show a ripple when focusing via the keyboard', fakeAsync(() => {
      expect(radioNativeElements[0].querySelectorAll('.mat-ripple-element').length)
          .toBe(0, 'Expected no ripples on init.');

      dispatchFakeEvent(radioInputElements[0], 'keydown');
      dispatchFakeEvent(radioInputElements[0], 'focus');

      tick(RIPPLE_FADE_IN_DURATION);

      expect(radioNativeElements[0].querySelectorAll('.mat-ripple-element').length)
          .toBe(1, 'Expected one ripple after keyboard focus.');

      dispatchFakeEvent(radioInputElements[0], 'blur');
      tick(RIPPLE_FADE_OUT_DURATION);

      expect(radioNativeElements[0].querySelectorAll('.mat-ripple-element').length)
          .toBe(0, 'Expected no ripples on blur.');
    }));

    it('should update the group and radios when updating the group value', () => {
      expect(groupInstance.value).toBeFalsy();

      testComponent.groupValue = 'fire';
      fixture.detectChanges();

      expect(groupInstance.value).toBe('fire');
      expect(groupInstance.selected).toBe(radioInstances[0]);
      expect(radioInstances[0].checked).toBe(true);
      expect(radioInstances[1].checked).toBe(false);

      testComponent.groupValue = 'water';
      fixture.detectChanges();

      expect(groupInstance.value).toBe('water');
      expect(groupInstance.selected).toBe(radioInstances[1]);
      expect(radioInstances[0].checked).toBe(false);
      expect(radioInstances[1].checked).toBe(true);
    });

    it('should deselect all of the checkboxes when the group value is cleared', () => {
      radioInstances[0].checked = true;

      expect(groupInstance.value).toBeTruthy();

      groupInstance.value = null;

      expect(radioInstances.every(radio => !radio.checked)).toBe(true);
    });

    it('should not show ripples on disabled radio buttons', () => {
      testComponent.isFirstDisabled = true;
      fixture.detectChanges();

      dispatchFakeEvent(radioLabelElements[0], 'mousedown');
      dispatchFakeEvent(radioLabelElements[0], 'mouseup');

      expect(radioNativeElements[0].querySelectorAll('.mat-ripple-element').length)
        .toBe(0, 'Expected a disabled radio button to not show ripples');

      testComponent.isFirstDisabled = false;
      fixture.detectChanges();

      dispatchFakeEvent(radioLabelElements[0], 'mousedown');
      dispatchFakeEvent(radioLabelElements[0], 'mouseup');

      expect(radioNativeElements[0].querySelectorAll('.mat-ripple-element').length)
        .toBe(1, 'Expected an enabled radio button to show ripples');
    });

    it('should not show ripples if matRippleDisabled input is set', () => {
      testComponent.disableRipple = true;
      fixture.detectChanges();

      for (const radioLabel of radioLabelElements) {
        dispatchFakeEvent(radioLabel, 'mousedown');
        dispatchFakeEvent(radioLabel, 'mouseup');

        expect(radioLabel.querySelectorAll('.mat-ripple-element').length).toBe(0);
      }

      testComponent.disableRipple = false;
      fixture.detectChanges();

      for (const radioLabel of radioLabelElements) {
        dispatchFakeEvent(radioLabel, 'mousedown');
        dispatchFakeEvent(radioLabel, 'mouseup');

        expect(radioLabel.querySelectorAll('.mat-ripple-element').length).toBe(1);
      }
    });

    it(`should update the group's selected radio to null when unchecking that radio
        programmatically`, () => {
      const changeSpy = jasmine.createSpy('radio-group change listener');
      groupInstance.change.subscribe(changeSpy);
      radioInstances[0].checked = true;

      fixture.detectChanges();

      expect(changeSpy).not.toHaveBeenCalled();
      expect(groupInstance.value).toBeTruthy();

      radioInstances[0].checked = false;

      fixture.detectChanges();

      expect(changeSpy).not.toHaveBeenCalled();
      expect(groupInstance.value).toBeFalsy();
      expect(radioInstances.every(radio => !radio.checked)).toBe(true);
      expect(groupInstance.selected).toBeNull();
    });

    it('should not fire a change event from the group when a radio checked state changes', () => {
      const changeSpy = jasmine.createSpy('radio-group change listener');
      groupInstance.change.subscribe(changeSpy);
      radioInstances[0].checked = true;

      fixture.detectChanges();

      expect(changeSpy).not.toHaveBeenCalled();
      expect(groupInstance.value).toBeTruthy();
      expect(groupInstance.value).toBe('fire');

      radioInstances[1].checked = true;

      fixture.detectChanges();

      expect(groupInstance.value).toBe('water');
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it(`should update checked status if changed value to radio group's value`, () => {
      const changeSpy = jasmine.createSpy('radio-group change listener');
      groupInstance.change.subscribe(changeSpy);
      groupInstance.value = 'apple';

      expect(changeSpy).not.toHaveBeenCalled();
      expect(groupInstance.value).toBe('apple');
      expect(groupInstance.selected).toBeFalsy('expect group selected to be null');
      expect(radioInstances[0].checked).toBeFalsy('should not select the first button');
      expect(radioInstances[1].checked).toBeFalsy('should not select the second button');
      expect(radioInstances[2].checked).toBeFalsy('should not select the third button');

      radioInstances[0].value = 'apple';

      fixture.detectChanges();

      expect(groupInstance.selected).toBe(
        radioInstances[0], 'expect group selected to be first button');
      expect(radioInstances[0].checked).toBeTruthy('expect group select the first button');
      expect(radioInstances[1].checked).toBeFalsy('should not select the second button');
      expect(radioInstances[2].checked).toBeFalsy('should not select the third button');
    });

    it('should apply class based on color attribute', () => {
      expect(radioNativeElements.every(radioEl => radioEl.classList.contains('mat-accent')))
        .toBe(true, 'Expected every radio element to use the accent color by default.');

      testComponent.color = 'primary';
      fixture.detectChanges();

      expect(radioNativeElements.every(radioEl => radioEl.classList.contains('mat-primary')))
        .toBe(true, 'Expected every radio element to use the primary color from the binding.');

      testComponent.color = 'warn';
      fixture.detectChanges();

      expect(radioNativeElements.every(radioEl => radioEl.classList.contains('mat-warn')))
        .toBe(true, 'Expected every radio element to use the primary color from the binding.');

      testComponent.color = null;
      fixture.detectChanges();

      expect(radioNativeElements.every(radioEl => radioEl.classList.contains('mat-accent')))
        .toBe(true, 'Expected every radio element to fallback to accent color if value is falsy.');
    });
  });

  describe('group with ngModel', () => {
    let fixture: ComponentFixture<RadioGroupWithNgModel>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let radioDebugElements: DebugElement[];
    let innerRadios: DebugElement[];
    let radioLabelElements: HTMLLabelElement[];
    let groupInstance: MatRadioGroup;
    let radioInstances: MatRadioButton[];
    let testComponent: RadioGroupWithNgModel;
    let groupNgModel: NgModel;

    beforeEach(() => {
      fixture = TestBed.createComponent(RadioGroupWithNgModel);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      groupDebugElement = fixture.debugElement.query(By.directive(MatRadioGroup));
      groupNativeElement = groupDebugElement.nativeElement;
      groupInstance = groupDebugElement.injector.get<MatRadioGroup>(MatRadioGroup);
      groupNgModel = groupDebugElement.injector.get<NgModel>(NgModel);

      radioDebugElements = fixture.debugElement.queryAll(By.directive(MatRadioButton));
      radioInstances = radioDebugElements.map(debugEl => debugEl.componentInstance);
      innerRadios = fixture.debugElement.queryAll(By.css('input[type="radio"]'));

      radioLabelElements = radioDebugElements
        .map(debugEl => debugEl.query(By.css('label')).nativeElement);
    });

    it('should set individual radio names based on the group name', () => {
      expect(groupInstance.name).toBeTruthy();
      for (const radio of radioInstances) {
        expect(radio.name).toBe(groupInstance.name);
      }

      groupInstance.name = 'new name';

      for (const radio of radioInstances) {
        expect(radio.name).toBe(groupInstance.name);
      }
    });

    it('should check the corresponding radio button on group value change', () => {
      expect(groupInstance.value).toBeFalsy();
      for (const radio of radioInstances) {
        expect(radio.checked).toBeFalsy();
      }

      groupInstance.value = 'vanilla';
      for (const radio of radioInstances) {
        expect(radio.checked).toBe(groupInstance.value === radio.value);
      }
      expect(groupInstance.selected!.value).toBe(groupInstance.value);
    });

    it('should have the correct control state initially and after interaction', () => {
      // The control should start off valid, pristine, and untouched.
      expect(groupNgModel.valid).toBe(true);
      expect(groupNgModel.pristine).toBe(true);
      expect(groupNgModel.touched).toBe(false);

      // After changing the value programmatically, the control should stay pristine
      // but remain untouched.
      radioInstances[1].checked = true;
      fixture.detectChanges();

      expect(groupNgModel.valid).toBe(true);
      expect(groupNgModel.pristine).toBe(true);
      expect(groupNgModel.touched).toBe(false);

      // After a user interaction occurs (such as a click), the control should become dirty and
      // now also be touched.
      radioLabelElements[2].click();
      fixture.detectChanges();

      expect(groupNgModel.valid).toBe(true);
      expect(groupNgModel.pristine).toBe(false);
      expect(groupNgModel.touched).toBe(true);
    });

    it('should write to the radio button based on ngModel', fakeAsync(() => {
      testComponent.modelValue = 'chocolate';

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(innerRadios[1].nativeElement.checked).toBe(true);
      expect(radioInstances[1].checked).toBe(true);
    }));

    it('should update the ngModel value when selecting a radio button', () => {
      dispatchFakeEvent(innerRadios[1].nativeElement, 'change');
      fixture.detectChanges();
      expect(testComponent.modelValue).toBe('chocolate');
    });

    it('should update the model before firing change event', () => {
      expect(testComponent.modelValue).toBeUndefined();
      expect(testComponent.lastEvent).toBeUndefined();

      dispatchFakeEvent(innerRadios[1].nativeElement, 'change');
      fixture.detectChanges();
      expect(testComponent.lastEvent.value).toBe('chocolate');

      dispatchFakeEvent(innerRadios[0].nativeElement, 'change');
      fixture.detectChanges();
      expect(testComponent.lastEvent.value).toBe('vanilla');
    });
  });

  describe('group with FormControl', () => {
    let fixture: ComponentFixture<RadioGroupWithFormControl>;
    let groupDebugElement: DebugElement;
    let groupInstance: MatRadioGroup;
    let testComponent: RadioGroupWithFormControl;

    beforeEach(() => {
      fixture = TestBed.createComponent(RadioGroupWithFormControl);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      groupDebugElement = fixture.debugElement.query(By.directive(MatRadioGroup));
      groupInstance = groupDebugElement.injector.get<MatRadioGroup>(MatRadioGroup);
    });

    it('should toggle the disabled state', () => {
      expect(groupInstance.disabled).toBeFalsy();

      testComponent.formControl.disable();
      fixture.detectChanges();

      expect(groupInstance.disabled).toBeTruthy();

      testComponent.formControl.enable();
      fixture.detectChanges();

      expect(groupInstance.disabled).toBeFalsy();
    });
  });

  describe('as standalone', () => {
    let fixture: ComponentFixture<StandaloneRadioButtons>;
    let radioDebugElements: DebugElement[];
    let seasonRadioInstances: MatRadioButton[];
    let weatherRadioInstances: MatRadioButton[];
    let fruitRadioInstances: MatRadioButton[];
    let fruitRadioNativeInputs: HTMLElement[];
    let testComponent: StandaloneRadioButtons;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandaloneRadioButtons);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      radioDebugElements = fixture.debugElement.queryAll(By.directive(MatRadioButton));
      seasonRadioInstances = radioDebugElements
          .filter(debugEl => debugEl.componentInstance.name == 'season')
          .map(debugEl => debugEl.componentInstance);
      weatherRadioInstances = radioDebugElements
          .filter(debugEl => debugEl.componentInstance.name == 'weather')
          .map(debugEl => debugEl.componentInstance);
      fruitRadioInstances = radioDebugElements
          .filter(debugEl => debugEl.componentInstance.name == 'fruit')
          .map(debugEl => debugEl.componentInstance);

      const fruitRadioNativeElements = radioDebugElements
          .filter(debugEl => debugEl.componentInstance.name == 'fruit')
          .map(debugEl => debugEl.nativeElement);

      fruitRadioNativeInputs = [];
      for (const element of fruitRadioNativeElements) {
        fruitRadioNativeInputs.push(<HTMLElement> element.querySelector('input'));
      }
    });

    it('should uniquely select radios by a name', () => {
      seasonRadioInstances[0].checked = true;
      weatherRadioInstances[1].checked = true;

      fixture.detectChanges();
      expect(seasonRadioInstances[0].checked).toBe(true);
      expect(seasonRadioInstances[1].checked).toBe(false);
      expect(seasonRadioInstances[2].checked).toBe(false);
      expect(weatherRadioInstances[0].checked).toBe(false);
      expect(weatherRadioInstances[1].checked).toBe(true);
      expect(weatherRadioInstances[2].checked).toBe(false);

      seasonRadioInstances[1].checked = true;
      fixture.detectChanges();
      expect(seasonRadioInstances[0].checked).toBe(false);
      expect(seasonRadioInstances[1].checked).toBe(true);
      expect(seasonRadioInstances[2].checked).toBe(false);
      expect(weatherRadioInstances[0].checked).toBe(false);
      expect(weatherRadioInstances[1].checked).toBe(true);
      expect(weatherRadioInstances[2].checked).toBe(false);

      weatherRadioInstances[2].checked = true;
      expect(seasonRadioInstances[0].checked).toBe(false);
      expect(seasonRadioInstances[1].checked).toBe(true);
      expect(seasonRadioInstances[2].checked).toBe(false);
      expect(weatherRadioInstances[0].checked).toBe(false);
      expect(weatherRadioInstances[1].checked).toBe(false);
      expect(weatherRadioInstances[2].checked).toBe(true);
    });

    it('should add required attribute to the underlying input element if defined', () => {
      const radioInstance = seasonRadioInstances[0];
      radioInstance.required = true;
      fixture.detectChanges();

      expect(radioInstance.required).toBe(true);
    });

    it('should add aria-label attribute to the underlying input element if defined', () => {
      expect(fruitRadioNativeInputs[0].getAttribute('aria-label')).toBe('Banana');
    });

    it('should not add aria-label attribute if not defined', () => {
      expect(fruitRadioNativeInputs[1].hasAttribute('aria-label')).toBeFalsy();
    });

    it('should change aria-label attribute if property is changed at runtime', () => {
      expect(fruitRadioNativeInputs[0].getAttribute('aria-label')).toBe('Banana');

      testComponent.ariaLabel = 'Pineapple';
      fixture.detectChanges();

      expect(fruitRadioNativeInputs[0].getAttribute('aria-label')).toBe('Pineapple');
    });

    it('should add aria-labelledby attribute to the underlying input element if defined', () => {
      expect(fruitRadioNativeInputs[0].getAttribute('aria-labelledby')).toBe('xyz');
    });

    it('should not add aria-labelledby attribute if not defined', () => {
      expect(fruitRadioNativeInputs[1].hasAttribute('aria-labelledby')).toBeFalsy();
    });

    it('should change aria-labelledby attribute if property is changed at runtime', () => {
      expect(fruitRadioNativeInputs[0].getAttribute('aria-labelledby')).toBe('xyz');

      testComponent.ariaLabelledby = 'uvw';
      fixture.detectChanges();

      expect(fruitRadioNativeInputs[0].getAttribute('aria-labelledby')).toBe('uvw');
    });

    it('should focus on underlying input element when focus() is called', () => {
      for (let i = 0; i < fruitRadioInstances.length; i++) {
        expect(document.activeElement).not.toBe(fruitRadioNativeInputs[i]);
        fruitRadioInstances[i].focus();
        fixture.detectChanges();

        expect(document.activeElement).toBe(fruitRadioNativeInputs[i]);
      }
    });

    it('should not add the "name" attribute if it is not passed in', () => {
      const radio = fixture.debugElement.nativeElement.querySelector('#nameless input');
      expect(radio.hasAttribute('name')).toBe(false);
    });

  });

  describe('with tabindex', () => {
    let fixture: ComponentFixture<FocusableRadioButton>;

    beforeEach(() => {
      fixture = TestBed.createComponent(FocusableRadioButton);
      fixture.detectChanges();
    });

    it('should forward focus to native input', () => {
      let radioButtonEl = fixture.debugElement.query(By.css('.mat-radio-button')).nativeElement;
      let inputEl = fixture.debugElement.query(By.css('.mat-radio-input')).nativeElement;

      radioButtonEl.focus();
      // Focus events don't always fire in tests, so we needc to fake it.
      dispatchFakeEvent(radioButtonEl, 'focus');
      fixture.detectChanges();

      expect(document.activeElement).toBe(inputEl);
    });
  });

  describe('group interspersed with other tags', () => {
    let fixture: ComponentFixture<InterleavedRadioGroup>;
    let groupDebugElement: DebugElement;
    let groupInstance: MatRadioGroup;
    let radioDebugElements: DebugElement[];
    let radioInstances: MatRadioButton[];

    beforeEach(async(() => {
      fixture = TestBed.createComponent(InterleavedRadioGroup);
      fixture.detectChanges();

      groupDebugElement = fixture.debugElement.query(By.directive(MatRadioGroup));
      groupInstance = groupDebugElement.injector.get<MatRadioGroup>(MatRadioGroup);
      radioDebugElements = fixture.debugElement.queryAll(By.directive(MatRadioButton));
      radioInstances = radioDebugElements.map(debugEl => debugEl.componentInstance);
    }));

    it('should initialize selection of radios based on model value', () => {
      expect(groupInstance.selected).toBe(radioInstances[2]);
    });
  });
});


@Component({
  template: `
  <mat-radio-group [disabled]="isGroupDisabled"
                  [labelPosition]="labelPos"
                  [required]="isGroupRequired"
                  [value]="groupValue"
                  name="test-name">
    <mat-radio-button value="fire" [disableRipple]="disableRipple" [disabled]="isFirstDisabled"
                     [color]="color">
      Charmander
    </mat-radio-button>
    <mat-radio-button value="water" [disableRipple]="disableRipple" [color]="color">
      Squirtle
    </mat-radio-button>
    <mat-radio-button value="leaf" [disableRipple]="disableRipple" [color]="color">
      Bulbasaur
    </mat-radio-button>
  </mat-radio-group>
  `
})
class RadiosInsideRadioGroup {
  labelPos: 'before' | 'after';
  isFirstDisabled: boolean = false;
  isGroupDisabled: boolean = false;
  isGroupRequired: boolean = false;
  groupValue: string | null = null;
  disableRipple: boolean = false;
  color: string | null;
}


@Component({
  template: `
    <mat-radio-button name="season" value="spring">Spring</mat-radio-button>
    <mat-radio-button name="season" value="summer">Summer</mat-radio-button>
    <mat-radio-button name="season" value="autum">Autumn</mat-radio-button>

    <mat-radio-button name="weather" value="warm">Spring</mat-radio-button>
    <mat-radio-button name="weather" value="hot">Summer</mat-radio-button>
    <mat-radio-button name="weather" value="cool">Autumn</mat-radio-button>

    <span id="xyz">Baby Banana</span>
    <mat-radio-button name="fruit"
                     value="banana"
                     [aria-label]="ariaLabel"
                     [aria-labelledby]="ariaLabelledby">
    </mat-radio-button>
    <mat-radio-button name="fruit" value="raspberry">Raspberry</mat-radio-button>
    <mat-radio-button id="nameless" value="no-name">No name</mat-radio-button>
  `
})
class StandaloneRadioButtons {
  ariaLabel: string = 'Banana';
  ariaLabelledby: string = 'xyz';
}


@Component({
  template: `
  <mat-radio-group [(ngModel)]="modelValue" (change)="lastEvent = $event">
    <mat-radio-button *ngFor="let option of options" [value]="option.value">
      {{option.label}}
    </mat-radio-button>
  </mat-radio-group>
  `
})
class RadioGroupWithNgModel {
  modelValue: string;
  options = [
    {label: 'Vanilla', value: 'vanilla'},
    {label: 'Chocolate', value: 'chocolate'},
    {label: 'Strawberry', value: 'strawberry'},
  ];
  lastEvent: MatRadioChange;
}

@Component({
  template: `
  <mat-radio-group [formControl]="formControl">
    <mat-radio-button value="1">One</mat-radio-button>
  </mat-radio-group>
  `
})
class RadioGroupWithFormControl {
  formControl = new FormControl();
}

@Component({
  template: `<mat-radio-button tabindex="-1"></mat-radio-button>`
})
class FocusableRadioButton {}

@Component({
  template: `
  <mat-radio-group name="group" [(ngModel)]="modelValue">
    <transcluding-wrapper *ngFor="let option of options">
      <mat-radio-button [value]="option.value">{{option.label}}</mat-radio-button>
    </transcluding-wrapper>
  </mat-radio-group>
  `
})
class InterleavedRadioGroup {
  modelValue = 'strawberry';
  options = [
    {label: 'Vanilla', value: 'vanilla'},
    {label: 'Chocolate', value: 'chocolate'},
    {label: 'Strawberry', value: 'strawberry'},
  ];
}

@Component({
  selector: 'transcluding-wrapper',
  template: `
    <div><ng-content></ng-content></div>
  `
})
class TranscludingWrapper {}
